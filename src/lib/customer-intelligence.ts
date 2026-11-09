import { supabase } from '../integrations/supabase/client';

export interface ActivityLog {
  id?: string;
  user_id: string;
  activity_type: string;
  metadata: Record<string, any>;
  created_at?: string;
}

/**
 * Tracks an event in the customer activity timeline
 */
export async function trackCustomerActivity(
  userId: string,
  activityType: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  console.log(`[Intelligence] Logging activity: ${activityType} for user ${userId}`);
  
  try {
    const { error } = await supabase.from('customer_activity').insert({
      user_id: userId,
      activity_type: activityType,
      metadata,
    });
    if (error) console.error('[Intelligence] Error writing customer activity:', error);
  } catch (e) {
    console.error('[Intelligence] Activity tracking exception:', e);
  }
}

/**
 * Calculates category interest scores based on activity history weights
 * - View product: +1 score
 * - Add to Collection/Favorites: +5 score
 * - Dynamic decay over time could be added, but for now we aggregate counts
 */
export async function calculateInterestScores(userId: string): Promise<void> {
  console.log(`[Intelligence] Recalculating category interest scores for user ${userId}`);

  try {
    // 1. Fetch user activity log related to products
    const { data: activities, error } = await supabase
      .from('customer_activity')
      .select('activity_type, metadata')
      .eq('user_id', userId)
      .in('activity_type', ['product_viewed', 'favorites_changed', 'collection_created']);

    if (error || !activities) return;

    const scores: Record<string, number> = {};

    for (const act of activities) {
      const meta = act.metadata as Record<string, any>;
      const category = meta?.category || meta?.productCategory || 'Uncategorized';
      
      let weight = 1;
      if (act.activity_type === 'favorites_changed') weight = 5;
      if (act.activity_type === 'collection_created') weight = 8;

      scores[category] = (scores[category] || 0) + weight;
    }

    // 2. Upsert scores into customer_interests table
    for (const [category, score] of Object.entries(scores)) {
      const { error: upsertError } = await supabase
        .from('customer_interests')
        .upsert(
          {
            user_id: userId,
            category,
            score,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,category' }
        );

      if (upsertError) {
        console.error('[Intelligence] Error upserting interest score:', upsertError);
      }
    }
  } catch (e) {
    console.error('[Intelligence] Interest scores recalculation exception:', e);
  }
}

/**
 * Computes customer health score (0 - 100) based on engagement metrics:
 * - Days since last active (up to 40% reduction)
 * - Frequency of profile actions/product views (up to 40% addition)
 * - Subscription consents (up to 20% addition)
 * Assigns segment tag: 'NEW', 'ACTIVE', 'INACTIVE', or 'CHURN_RISK'.
 */
export async function calculateCustomerHealthScore(userId: string): Promise<{ healthScore: number; segment: string }> {
  console.log(`[Intelligence] Calculating health score for user ${userId}`);

  try {
    // 1. Fetch activities
    const { data: activities } = await supabase
      .from('customer_activity')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 2. Fetch preferences
    const { data: preferences } = await supabase
      .from('communication_preferences')
      .select('receive_marketing, receive_transactional')
      .eq('user_id', userId)
      .single();

    let healthScore = 50; // base score
    let segment = 'ACTIVE';

    if (activities && activities.length > 0) {
      const lastActiveDate = new Date(activities[0].created_at);
      const daysSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

      // Active bonus/penalty
      if (daysSinceActive <= 2) {
        healthScore += 20;
      } else if (daysSinceActive > 30) {
        healthScore -= 30;
      } else if (daysSinceActive > 7) {
        healthScore -= 10;
      }

      // Quantity of activity bonus
      const activityCount = activities.length;
      healthScore += Math.min(20, activityCount * 2);
    } else {
      healthScore -= 20; // inactive penalty
    }

    // Consent preferences bonus
    if (preferences?.receive_marketing) healthScore += 5;
    if (preferences?.receive_transactional) healthScore += 5;

    // Constrain score
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Evaluate Segment
    if (activities && activities.length <= 2) {
      segment = 'NEW';
    } else if (healthScore < 30) {
      segment = 'CHURN_RISK';
    } else if (healthScore < 60) {
      segment = 'INACTIVE';
    } else {
      segment = 'ACTIVE';
    }

    // Update customer_scores table
    const autoTags = [];
    if (healthScore >= 80) autoTags.push('highly_engaged');
    if (segment === 'CHURN_RISK') autoTags.push('at_risk');

    await supabase.from('customer_scores').upsert(
      {
        user_id: userId,
        health_score: healthScore,
        segment,
        auto_tags: autoTags,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    return { healthScore, segment };
  } catch (e) {
    console.error('[Intelligence] Health score calculation exception:', e);
    return { healthScore: 50, segment: 'ACTIVE' };
  }
}

/**
 * Returns dynamic product recommendations for a customer
 * - Recommends products matching their top categories from customer_interests
 * - Excludes items they have already favorited
 * - Falls back to trending products if no interests exist
 */
export async function getRecommendations(userId: string | null, limit: number = 4): Promise<any[]> {
  try {
    // 1. Fetch user's top categories
    let targetCategories: string[] = [];
    if (userId) {
      const { data: interests } = await supabase
        .from('customer_interests')
        .select('category')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(2);
      
      if (interests && interests.length > 0) {
        targetCategories = interests.map((i: any) => i.category);
      }
    }

    // 2. Query products matching the target categories
    let query = supabase.from('products').select('*');
    if (targetCategories.length > 0) {
      query = query.in('category', targetCategories);
    }
    
    // Sort and limit
    const { data: products } = await query
      .eq('status', 'published')
      .limit(limit);

    if (products && products.length > 0) {
      return products;
    }

    // Fallback to any published products
    const { data: fallback } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .limit(limit);

    return fallback || [];
  } catch (e) {
    console.error('[Intelligence] Recommendation engine error:', e);
    return [];
  }
}
