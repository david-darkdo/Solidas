import { supabase } from '../integrations/supabase/client';
import { trackCustomerActivity, calculateInterestScores } from './customer-intelligence';

export interface SystemEvent {
  id?: string;
  user_id: string | null;
  event_type: string;
  meta: Record<string, any>;
  created_at?: string;
}

export class CommunicationEventBus {
  private static instance: CommunicationEventBus;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): CommunicationEventBus {
    if (!CommunicationEventBus.instance) {
      CommunicationEventBus.instance = new CommunicationEventBus();
    }
    return CommunicationEventBus.instance;
  }

  /**
   * Subscribe to events in memory (for realtime app reactivity)
   */
  public subscribe(eventType: string, callback: (event: SystemEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        this.listeners.set(
          eventType,
          callbacks.filter((cb) => cb !== callback)
        );
      }
    };
  }

  /**
   * Publish an event globally to the bus
   * Saves to database event log, activity timeline, and triggers workflow automations.
   */
  public async publish(eventType: string, userId: string | null, meta: Record<string, any> = {}): Promise<void> {
    const event: SystemEvent = {
      user_id: userId,
      event_type: eventType,
      meta,
    };

    console.log(`[EventBus] Publishing event: ${eventType} for user: ${userId}`, meta);

    // 1. Log event in Supabase communication_events
    try {
      const { error: dbError } = await supabase
        .from('communication_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          meta,
        });
      if (dbError) console.error('[EventBus] Database event insert failed:', dbError);
    } catch (e) {
      console.error('[EventBus] Database event log exception:', e);
    }

    // 2. Log in Customer Activity Timeline (if user context is present)
    if (userId) {
      try {
        await trackCustomerActivity(userId, eventType, meta);
      } catch (e) {
        console.error('[EventBus] Activity tracking exception:', e);
      }

      // 3. Process Customer Intelligence calculation triggers
      try {
        if (eventType === 'product_viewed' || eventType === 'favorites_changed') {
          await calculateInterestScores(userId);
        }
      } catch (e) {
        console.error('[EventBus] Customer intelligence scoring exception:', e);
      }
    }

    // 4. Notify active in-memory listeners
    const callbacks = this.listeners.get(eventType) || [];
    const wildcards = this.listeners.get('*') || [];
    [...callbacks, ...wildcards].forEach((callback) => {
      try {
        callback(event);
      } catch (e) {
        console.error('[EventBus] Memory subscriber callback failed:', e);
      }
    });

    // 5. Trigger Automation Engine workflows asynchronously
    if (userId) {
      this.triggerWorkflows(eventType, userId, meta).catch((err) => {
        console.error('[EventBus] Workflow processing trigger failure:', err);
      });
    }
  }

  /**
   * Evaluates active automation triggers and enqueues template messages if matched
   */
  private async triggerWorkflows(eventType: string, userId: string, meta: Record<string, any>): Promise<void> {
    // 1. Fetch active workflows registered for this trigger event type
    const { data: workflows, error: wfError } = await supabase
      .from('automation_workflows' as any)
      .select(`
        id,
        name,
        automation_steps (
          id,
          step_number,
          action_type,
          template_id,
          wait_duration_seconds
        )
      `)
      .eq('trigger_type', eventType)
      .eq('is_active', true);

    if (wfError || !workflows) {
      if (wfError) console.error('[EventBus] Error fetching workflows:', wfError);
      return;
    }

    for (const wf of (workflows as any[])) {
      console.log(`[EventBus] Triggering workflow "${wf.name}" for user ${userId}`);

      // Check if user is already running this workflow
      const { data: activeRuns } = await supabase
        .from('automation_runs' as any)
        .select('id')
        .eq('workflow_id', wf.id)
        .eq('user_id', userId)
        .eq('status', 'RUNNING');

      if (activeRuns && activeRuns.length > 0) {
        console.log(`[EventBus] User ${userId} has an active run for "${wf.name}". Skipping start.`);
        continue;
      }

      // Sort steps
      const steps = Array.isArray(wf.automation_steps)
        ? [...wf.automation_steps].sort((a: any, b: any) => a.step_number - b.step_number)
        : [];

      if (steps.length === 0) continue;

      const firstStep = steps[0] as any;

      // Start the workflow run
      const { data: run, error: runError } = await supabase
        .from('automation_runs' as any)
        .insert({
          workflow_id: wf.id,
          user_id: userId,
          current_step_id: firstStep.id,
          status: 'RUNNING',
          next_run_at: new Date(Date.now() + firstStep.wait_duration_seconds * 1000).toISOString(),
          metadata: { ...meta, current_step_number: 1 },
        })
        .select()
        .single();

      if (runError) {
        console.error('[EventBus] Error creating automation run:', runError);
        continue;
      }

      // Queue step action immediately if wait duration is zero
      if (firstStep.wait_duration_seconds === 0) {
        await this.executeWorkflowStep((run as any)?.id, firstStep, userId);
      }
    }
  }

  /**
   * Executes a specific step of an automation run (e.g., enqueue template)
   */
  public async executeWorkflowStep(runId: string, step: any, userId: string): Promise<void> {
    if (step.action_type === 'send_template' && step.template_id) {
      // 1. Fetch user's preferences, channel consent, and profile contact info
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      const { data: preferences } = await supabase
        .from('communication_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) return;

      const { data: template } = await supabase
        .from('communication_templates')
        .select('*')
        .eq('id', step.template_id)
        .single();

      if (!template) return;

      // Determine template dispatch channels based on user consent preferences
      const channels = [];
      const consent = preferences || { receive_marketing: true, receive_transactional: true, per_event_channels: {} };
      
      if (consent.receive_marketing || consent.receive_transactional) {
        // Enqueue Email
        channels.push('email');

        // Check for active PWA push device token
        const { data: devices } = await supabase
          .from('communication_devices')
          .select('token')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (devices && devices.length > 0) {
          channels.push('push');
        }
      }

      // Enqueue to communication_queue for async processing
      for (const channel of channels) {
        const address = channel === 'email' 
          ? profile.email 
          : (await supabase.from('communication_devices').select('token').eq('user_id', userId).eq('is_active', true).limit(1).then((r: any) => r.data?.[0]?.token || ''));

        if (!address) continue;

        // Render template variables
        let renderedSubject = template.email_subject || '';
        let renderedBody = template.email_html || '';
        let renderedPushTitle = template.push_title || '';
        let renderedPushBody = template.push_body || '';

        const customerName = profile.full_name || 'Valued Customer';
        renderedSubject = renderedSubject.replace(/\{\{\s*customer_name\s*\}\}/g, customerName);
        renderedBody = renderedBody.replace(/\{\{\s*customer_name\s*\}\}/g, customerName);
        renderedPushTitle = renderedPushTitle.replace(/\{\{\s*customer_name\s*\}\}/g, customerName);
        renderedPushBody = renderedPushBody.replace(/\{\{\s*customer_name\s*\}\}/g, customerName);

        await supabase.from('communication_queue').insert({
          template_id: template.id,
          user_id: userId,
          channel_type: channel,
          recipient_address: address,
          subject: channel === 'email' ? renderedSubject : renderedPushTitle,
          body: channel === 'email' ? renderedBody : renderedPushBody,
          status: 'PENDING',
          scheduled_for: new Date().toISOString(),
        });
      }

      // Update run status to COMPLETED since it was a single-step workflow
      await (supabase as any)
        .from('automation_runs')
        .update({
          status: 'COMPLETED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', runId);
    }
  }
}

export const eventBus = CommunicationEventBus.getInstance();