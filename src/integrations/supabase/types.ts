export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          dependency_chain_id: string | null
          error_log: Json | null
          execution_time_ms: number | null
          id: string
          job_dependency: Database["public"]["Enums"]["ai_job_type"] | null
          job_type: Database["public"]["Enums"]["ai_job_type"]
          parent_job_id: string | null
          payload: Json | null
          product_id: string
          result: Json | null
          retry_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ai_job_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dependency_chain_id?: string | null
          error_log?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_dependency?: Database["public"]["Enums"]["ai_job_type"] | null
          job_type: Database["public"]["Enums"]["ai_job_type"]
          parent_job_id?: string | null
          payload?: Json | null
          product_id: string
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_job_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dependency_chain_id?: string | null
          error_log?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_dependency?: Database["public"]["Enums"]["ai_job_type"] | null
          job_type?: Database["public"]["Enums"]["ai_job_type"]
          parent_job_id?: string | null
          payload?: Json | null
          product_id?: string
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ai_job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_jobs_parent_job_id_fkey"
            columns: ["parent_job_id"]
            isOneToOne: false
            referencedRelation: "ai_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_jobs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_templates: {
        Row: {
          brand_override: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description_prompt: string | null
          faq_prompt: string | null
          id: string
          installation_context_id: string | null
          installed_prompt: string | null
          is_active: boolean | null
          key: string | null
          name: string | null
          priority: number | null
          product_type_id: string | null
          prompt_text: string | null
          purpose: string | null
          seo_prompt: string | null
          studio_prompt: string | null
          subcategory_id: string | null
          understanding_prompt: string | null
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          brand_override?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description_prompt?: string | null
          faq_prompt?: string | null
          id?: string
          installation_context_id?: string | null
          installed_prompt?: string | null
          is_active?: boolean | null
          key?: string | null
          name?: string | null
          priority?: number | null
          product_type_id?: string | null
          prompt_text?: string | null
          purpose?: string | null
          seo_prompt?: string | null
          studio_prompt?: string | null
          subcategory_id?: string | null
          understanding_prompt?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          brand_override?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description_prompt?: string | null
          faq_prompt?: string | null
          id?: string
          installation_context_id?: string | null
          installed_prompt?: string | null
          is_active?: boolean | null
          key?: string | null
          name?: string | null
          priority?: number | null
          product_type_id?: string | null
          prompt_text?: string | null
          purpose?: string | null
          seo_prompt?: string | null
          studio_prompt?: string | null
          subcategory_id?: string | null
          understanding_prompt?: string | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompt_templates_installation_context_id_fkey"
            columns: ["installation_context_id"]
            isOneToOne: false
            referencedRelation: "installation_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompt_templates_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompt_templates_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_templates_history: {
        Row: {
          brand_override: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description_prompt: string | null
          faq_prompt: string | null
          id: string
          installation_context_id: string | null
          installed_prompt: string | null
          is_active: boolean | null
          key: string | null
          name: string | null
          priority: number | null
          product_type_id: string | null
          prompt_text: string | null
          purpose: string | null
          seo_prompt: string | null
          studio_prompt: string | null
          subcategory_id: string | null
          template_id: string | null
          understanding_prompt: string | null
          version: number | null
        }
        Insert: {
          brand_override?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description_prompt?: string | null
          faq_prompt?: string | null
          id?: string
          installation_context_id?: string | null
          installed_prompt?: string | null
          is_active?: boolean | null
          key?: string | null
          name?: string | null
          priority?: number | null
          product_type_id?: string | null
          prompt_text?: string | null
          purpose?: string | null
          seo_prompt?: string | null
          studio_prompt?: string | null
          subcategory_id?: string | null
          template_id?: string | null
          understanding_prompt?: string | null
          version?: number | null
        }
        Update: {
          brand_override?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description_prompt?: string | null
          faq_prompt?: string | null
          id?: string
          installation_context_id?: string | null
          installed_prompt?: string | null
          is_active?: boolean | null
          key?: string | null
          name?: string | null
          priority?: number | null
          product_type_id?: string | null
          prompt_text?: string | null
          purpose?: string | null
          seo_prompt?: string | null
          studio_prompt?: string | null
          subcategory_id?: string | null
          template_id?: string | null
          understanding_prompt?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_templates_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          active_ai_provider: string | null
          bing_site_verification: string | null
          company_address: string | null
          company_email: string | null
          created_at: string
          facebook_url: string | null
          gemini_image_model: string | null
          gemini_llm_model: string | null
          gemini_use_vertex: boolean | null
          google_site_verification: string | null
          id: string
          instagram_url: string | null
          last_provider_call_success: boolean | null
          last_provider_error: string | null
          map_url: string | null
          openai_image_model: string | null
          openai_image_size: string | null
          openai_llm_model: string | null
          sales_whatsapp: string | null
          support_whatsapp: string | null
          tiktok_url: string | null
          updated_at: string
        }
        Insert: {
          active_ai_provider?: string | null
          bing_site_verification?: string | null
          company_address?: string | null
          company_email?: string | null
          created_at?: string
          facebook_url?: string | null
          gemini_image_model?: string | null
          gemini_llm_model?: string | null
          gemini_use_vertex?: boolean | null
          google_site_verification?: string | null
          id?: string
          instagram_url?: string | null
          last_provider_call_success?: boolean | null
          last_provider_error?: string | null
          map_url?: string | null
          openai_image_model?: string | null
          openai_image_size?: string | null
          openai_llm_model?: string | null
          sales_whatsapp?: string | null
          support_whatsapp?: string | null
          tiktok_url?: string | null
          updated_at?: string
        }
        Update: {
          active_ai_provider?: string | null
          bing_site_verification?: string | null
          company_address?: string | null
          company_email?: string | null
          created_at?: string
          facebook_url?: string | null
          gemini_image_model?: string | null
          gemini_llm_model?: string | null
          gemini_use_vertex?: boolean | null
          google_site_verification?: string | null
          id?: string
          instagram_url?: string | null
          last_provider_call_success?: boolean | null
          last_provider_error?: string | null
          map_url?: string | null
          openai_image_model?: string | null
          openai_image_size?: string | null
          openai_llm_model?: string | null
          sales_whatsapp?: string | null
          support_whatsapp?: string | null
          tiktok_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          name: string
          slug: string
          sort_order: number
          type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          slug: string
          sort_order?: number
          type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          slug?: string
          sort_order?: number
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          added_at: string
          collection_id: string
          delivery_preference: string | null
          id: string
          installation_location: string | null
          installation_required: string | null
          product_id: string
          project_notes: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          added_at?: string
          collection_id: string
          delivery_preference?: string | null
          id?: string
          installation_location?: string | null
          installation_required?: string | null
          product_id: string
          project_notes?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          added_at?: string
          collection_id?: string
          delivery_preference?: string | null
          id?: string
          installation_location?: string | null
          installation_required?: string | null
          product_id?: string
          project_notes?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          inquiry_status: Database["public"]["Enums"]["inquiry_pipeline_status"]
          internal_notes: string | null
          is_locked: boolean | null
          name: string
          parent_collection_id: string | null
          project_name: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string
          version: number | null
          whatsapp_sent: boolean
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          inquiry_status?: Database["public"]["Enums"]["inquiry_pipeline_status"]
          internal_notes?: string | null
          is_locked?: boolean | null
          name: string
          parent_collection_id?: string | null
          project_name?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          version?: number | null
          whatsapp_sent?: boolean
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          inquiry_status?: Database["public"]["Enums"]["inquiry_pipeline_status"]
          internal_notes?: string | null
          is_locked?: boolean | null
          name?: string
          parent_collection_id?: string | null
          project_name?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          version?: number | null
          whatsapp_sent?: boolean
        }
        Relationships: []
      }
      communication_assets: {
        Row: {
          alt_text: string | null
          asset_type: string
          campaign_id: string | null
          created_at: string
          id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          asset_type: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          asset_type?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "communication_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_campaigns: {
        Row: {
          ai_generated: boolean | null
          ai_generation_metadata: Json | null
          approval_notes: string | null
          approved_by: string | null
          banner_url: string | null
          body: string
          channel_types: string[] | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          requested_review_by: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["email_campaign_status"]
          subject: string
          target_segment: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_generation_metadata?: Json | null
          approval_notes?: string | null
          approved_by?: string | null
          banner_url?: string | null
          body?: string
          channel_types?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          requested_review_by?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["email_campaign_status"]
          subject: string
          target_segment?: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_generation_metadata?: Json | null
          approval_notes?: string | null
          approved_by?: string | null
          banner_url?: string | null
          body?: string
          channel_types?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          requested_review_by?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["email_campaign_status"]
          subject?: string
          target_segment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_campaigns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_campaigns_requested_review_by_fkey"
            columns: ["requested_review_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_delivery_logs: {
        Row: {
          campaign_id: string
          channel_type: string | null
          device_token: string | null
          error: string | null
          id: string
          processing_time_ms: number | null
          recipient_email: string | null
          sent_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          channel_type?: string | null
          device_token?: string | null
          error?: string | null
          id?: string
          processing_time_ms?: number | null
          recipient_email?: string | null
          sent_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          channel_type?: string | null
          device_token?: string | null
          error?: string | null
          id?: string
          processing_time_ms?: number | null
          recipient_email?: string | null
          sent_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "communication_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string
          id: string
          is_active: boolean
          os_version: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string
          id?: string
          is_active?: boolean
          os_version?: string | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string
          id?: string
          is_active?: boolean
          os_version?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          meta: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          meta?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          meta?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_preferences: {
        Row: {
          per_event_channels: Json
          receive_marketing: boolean
          receive_transactional: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          per_event_channels?: Json
          receive_marketing?: boolean
          receive_transactional?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          per_event_channels?: Json
          receive_marketing?: boolean
          receive_transactional?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_queue: {
        Row: {
          body: string | null
          campaign_id: string | null
          channel_type: string
          created_at: string
          error_log: string | null
          id: string
          max_retries: number
          recipient_address: string | null
          retry_count: number
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          campaign_id?: string | null
          channel_type: string
          created_at?: string
          error_log?: string | null
          id?: string
          max_retries?: number
          recipient_address?: string | null
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          campaign_id?: string | null
          channel_type?: string
          created_at?: string
          error_log?: string | null
          id?: string
          max_retries?: number
          recipient_address?: string | null
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "communication_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          ai_generation_metadata: Json
          created_at: string
          description: string | null
          email_html: string | null
          email_subject: string | null
          id: string
          name: string
          push_body: string | null
          push_title: string | null
          updated_at: string
          variables: Json
        }
        Insert: {
          ai_generation_metadata?: Json
          created_at?: string
          description?: string | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          name: string
          push_body?: string | null
          push_title?: string | null
          updated_at?: string
          variables?: Json
        }
        Update: {
          ai_generation_metadata?: Json
          created_at?: string
          description?: string | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          name?: string
          push_body?: string | null
          push_title?: string | null
          updated_at?: string
          variables?: Json
        }
        Relationships: []
      }
      communication_templates_history: {
        Row: {
          created_at: string
          created_by: string | null
          email_html: string | null
          email_subject: string | null
          id: string
          push_body: string | null
          push_title: string | null
          template_id: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          push_body?: string | null
          push_title?: string | null
          template_id: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email_html?: string | null
          email_subject?: string | null
          id?: string
          push_body?: string | null
          push_title?: string | null
          template_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_templates_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_interests: {
        Row: {
          category: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          admin_id: string | null
          created_at: string
          customer_id: string
          id: string
          note: string
          note_type: Database["public"]["Enums"]["customer_note_type"]
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          note: string
          note_type?: Database["public"]["Enums"]["customer_note_type"]
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
          note_type?: Database["public"]["Enums"]["customer_note_type"]
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_scores: {
        Row: {
          auto_tags: string[]
          health_score: number
          manual_tags: string[]
          segment: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_tags?: string[]
          health_score?: number
          manual_tags?: string[]
          segment?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_tags?: string[]
          health_score?: number
          manual_tags?: string[]
          segment?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string
          custom_ai_prompt_override: string | null
          id: string
          is_archived: boolean
          name: string
          slug: string
          sort_order: number
          subcategory_id: string
        }
        Insert: {
          created_at?: string
          custom_ai_prompt_override?: string | null
          id?: string
          is_archived?: boolean
          name: string
          slug: string
          sort_order?: number
          subcategory_id: string
        }
        Update: {
          created_at?: string
          custom_ai_prompt_override?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          slug?: string
          sort_order?: number
          subcategory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_groups_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          product_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          product_id: string
          snapshot: Json
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "generation_versions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_videos: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          order_index: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      installation_contexts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["product_asset_type"]
          asset_url: string
          created_at: string
          generated_by_ai: boolean
          generation_version: number
          id: string
          is_primary: boolean
          metadata: Json | null
          product_id: string
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["product_asset_type"]
          asset_url: string
          created_at?: string
          generated_by_ai?: boolean
          generation_version?: number
          id?: string
          is_primary?: boolean
          metadata?: Json | null
          product_id: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["product_asset_type"]
          asset_url?: string
          created_at?: string
          generated_by_ai?: boolean
          generation_version?: number
          id?: string
          is_primary?: boolean
          metadata?: Json | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          code_prefix: string
          created_at: string
          id: string
          installation_context_id: string
          is_archived: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          code_prefix: string
          created_at?: string
          id?: string
          installation_context_id: string
          is_archived?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          code_prefix?: string
          created_at?: string
          id?: string
          installation_context_id?: string
          is_archived?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_types_installation_context_id_fkey"
            columns: ["installation_context_id"]
            isOneToOne: false
            referencedRelation: "installation_contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_understanding: {
        Row: {
          confidence_score: number | null
          created_at: string
          detected_architectural_use: string | null
          detected_color: string | null
          detected_customer_intent: string | null
          detected_design_language: string | null
          detected_environment: string | null
          detected_finish: string | null
          detected_indoor_outdoor: string | null
          detected_installation_area: string | null
          detected_installation_context: string | null
          detected_keywords: string[] | null
          detected_luxury_level: string | null
          detected_material: string | null
          detected_pattern: string | null
          detected_product_type: string | null
          detected_related_categories: string[] | null
          detected_search_keywords: string[] | null
          detected_shape: string | null
          detected_style: string | null
          detected_surface_types: string[] | null
          detected_tags: string[] | null
          detected_texture: string | null
          detected_visual_characteristics: string[] | null
          id: string
          product_id: string
          provider: string
          quality_validation_result: Json | null
          raw_ai_response: Json | null
          recommendation_result: Json | null
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detected_architectural_use?: string | null
          detected_color?: string | null
          detected_customer_intent?: string | null
          detected_design_language?: string | null
          detected_environment?: string | null
          detected_finish?: string | null
          detected_indoor_outdoor?: string | null
          detected_installation_area?: string | null
          detected_installation_context?: string | null
          detected_keywords?: string[] | null
          detected_luxury_level?: string | null
          detected_material?: string | null
          detected_pattern?: string | null
          detected_product_type?: string | null
          detected_related_categories?: string[] | null
          detected_search_keywords?: string[] | null
          detected_shape?: string | null
          detected_style?: string | null
          detected_surface_types?: string[] | null
          detected_tags?: string[] | null
          detected_texture?: string | null
          detected_visual_characteristics?: string[] | null
          id?: string
          product_id: string
          provider?: string
          quality_validation_result?: Json | null
          raw_ai_response?: Json | null
          recommendation_result?: Json | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detected_architectural_use?: string | null
          detected_color?: string | null
          detected_customer_intent?: string | null
          detected_design_language?: string | null
          detected_environment?: string | null
          detected_finish?: string | null
          detected_indoor_outdoor?: string | null
          detected_installation_area?: string | null
          detected_installation_context?: string | null
          detected_keywords?: string[] | null
          detected_luxury_level?: string | null
          detected_material?: string | null
          detected_pattern?: string | null
          detected_product_type?: string | null
          detected_related_categories?: string[] | null
          detected_search_keywords?: string[] | null
          detected_shape?: string | null
          detected_style?: string | null
          detected_surface_types?: string[] | null
          detected_tags?: string[] | null
          detected_texture?: string | null
          detected_visual_characteristics?: string[] | null
          id?: string
          product_id?: string
          provider?: string
          quality_validation_result?: Json | null
          raw_ai_response?: Json | null
          recommendation_result?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_understanding_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          view_timestamp: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          view_timestamp?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          view_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ai_status: Database["public"]["Enums"]["ai_asset_status"]
          ai_understanding: Json | null
          alt_text: string | null
          app_keywords: string[] | null
          app_search_keywords: string[] | null
          brand: string | null
          canonical_slug: string | null
          category_id: string | null
          code: string
          color: string | null
          created_at: string
          deleted_at: string | null
          error_log: Json | null
          family_id: string | null
          faq: Json | null
          featured_feed: boolean
          featured_homepage: boolean
          finish: string | null
          finish_name: string | null
          generated_description: string | null
          generated_installed_image: string | null
          generated_studio_image: string | null
          generation_hash: string | null
          generation_version: number
          hidden: boolean
          id: string
          image_caption: string | null
          image_filename: string | null
          image_mode: Database["public"]["Enums"]["product_image_mode"]
          image_title: string | null
          image_url: string | null
          installation_context_id: string | null
          is_ai_processing: boolean
          is_published: boolean
          last_processed_at: string | null
          master_document: Json | null
          material: string | null
          name: string
          price: number
          processing_state: Database["public"]["Enums"]["product_processing_state"]
          production_name: string | null
          retry_count: number
          seo_description: string | null
          seo_description_manual: boolean | null
          seo_keywords: string[] | null
          seo_keywords_manual: boolean | null
          seo_title: string | null
          seo_title_manual: boolean | null
          short_description: string | null
          similar_product_ids: string[]
          size: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number
          structured_data: Json | null
          subcategory_id: string | null
          type_id: string | null
          updated_at: string
        }
        Insert: {
          ai_status?: Database["public"]["Enums"]["ai_asset_status"]
          ai_understanding?: Json | null
          alt_text?: string | null
          app_keywords?: string[] | null
          app_search_keywords?: string[] | null
          brand?: string | null
          canonical_slug?: string | null
          category_id?: string | null
          code: string
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          error_log?: Json | null
          family_id?: string | null
          faq?: Json | null
          featured_feed?: boolean
          featured_homepage?: boolean
          finish?: string | null
          finish_name?: string | null
          generated_description?: string | null
          generated_installed_image?: string | null
          generated_studio_image?: string | null
          generation_hash?: string | null
          generation_version?: number
          hidden?: boolean
          id?: string
          image_caption?: string | null
          image_filename?: string | null
          image_mode?: Database["public"]["Enums"]["product_image_mode"]
          image_title?: string | null
          image_url?: string | null
          installation_context_id?: string | null
          is_ai_processing?: boolean
          is_published?: boolean
          last_processed_at?: string | null
          master_document?: Json | null
          material?: string | null
          name: string
          price?: number
          processing_state?: Database["public"]["Enums"]["product_processing_state"]
          production_name?: string | null
          retry_count?: number
          seo_description?: string | null
          seo_description_manual?: boolean | null
          seo_keywords?: string[] | null
          seo_keywords_manual?: boolean | null
          seo_title?: string | null
          seo_title_manual?: boolean | null
          short_description?: string | null
          similar_product_ids?: string[]
          size?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          structured_data?: Json | null
          subcategory_id?: string | null
          type_id?: string | null
          updated_at?: string
        }
        Update: {
          ai_status?: Database["public"]["Enums"]["ai_asset_status"]
          ai_understanding?: Json | null
          alt_text?: string | null
          app_keywords?: string[] | null
          app_search_keywords?: string[] | null
          brand?: string | null
          canonical_slug?: string | null
          category_id?: string | null
          code?: string
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          error_log?: Json | null
          family_id?: string | null
          faq?: Json | null
          featured_feed?: boolean
          featured_homepage?: boolean
          finish?: string | null
          finish_name?: string | null
          generated_description?: string | null
          generated_installed_image?: string | null
          generated_studio_image?: string | null
          generation_hash?: string | null
          generation_version?: number
          hidden?: boolean
          id?: string
          image_caption?: string | null
          image_filename?: string | null
          image_mode?: Database["public"]["Enums"]["product_image_mode"]
          image_title?: string | null
          image_url?: string | null
          installation_context_id?: string | null
          is_ai_processing?: boolean
          is_published?: boolean
          last_processed_at?: string | null
          master_document?: Json | null
          material?: string | null
          name?: string
          price?: number
          processing_state?: Database["public"]["Enums"]["product_processing_state"]
          production_name?: string | null
          retry_count?: number
          seo_description?: string | null
          seo_description_manual?: boolean | null
          seo_keywords?: string[] | null
          seo_keywords_manual?: boolean | null
          seo_title?: string | null
          seo_title_manual?: boolean | null
          short_description?: string | null
          similar_product_ids?: string[]
          size?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          structured_data?: Json | null
          subcategory_id?: string | null
          type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_installation_context_id_fkey"
            columns: ["installation_context_id"]
            isOneToOne: false
            referencedRelation: "installation_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          tags: string[]
          vip_status: boolean
        }
        Insert: {
          auth_id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          tags?: string[]
          vip_status?: boolean
        }
        Update: {
          auth_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          tags?: string[]
          vip_status?: boolean
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          created_at: string | null
          id: string
          new_path: string
          old_path: string
          status_code: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_path: string
          old_path: string
          status_code?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_path?: string
          old_path?: string
          status_code?: number | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_index: {
        Row: {
          combined_search_text: string
          master_document: Json
          normalized_size: string | null
          product_id: string
          search_aliases: string[]
          search_vector: unknown
          updated_at: string
        }
        Insert: {
          combined_search_text?: string
          master_document?: Json
          normalized_size?: string | null
          product_id: string
          search_aliases?: string[]
          search_vector?: unknown
          updated_at?: string
        }
        Update: {
          combined_search_text?: string
          master_document?: Json
          normalized_size?: string | null
          product_id?: string
          search_aliases?: string[]
          search_vector?: unknown
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_index_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_archived: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_features: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_name: string
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_inquiries: {
        Row: {
          assigned_admin_id: string | null
          collection_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          inquiry_status: Database["public"]["Enums"]["inquiry_pipeline_status"]
          internal_notes: string | null
          last_contacted_at: string | null
          status: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          assigned_admin_id?: string | null
          collection_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          inquiry_status?: Database["public"]["Enums"]["inquiry_pipeline_status"]
          internal_notes?: string | null
          last_contacted_at?: string | null
          status?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          assigned_admin_id?: string | null
          collection_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          inquiry_status?: Database["public"]["Enums"]["inquiry_pipeline_status"]
          internal_notes?: string | null
          last_contacted_at?: string | null
          status?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_inquiries_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_product_hash: {
        Args: {
          _category_id: string
          _finish: string
          _manufacturer: string
          _size: string
          _type_id: string
        }
        Returns: string
      }
      enqueue_ai_pipeline: { Args: { _product_id: string }; Returns: undefined }
      generate_product_code: { Args: { _type_id: string }; Returns: string }
      generate_size_aliases: { Args: { _size: string }; Returns: string[] }
      get_my_roles: { Args: never; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      rebuild_search_index: {
        Args: { _product_id: string }
        Returns: undefined
      }
      recompute_similar_products: {
        Args: { _product_id: string }
        Returns: undefined
      }
      retry_ai_job: { Args: { _job_id: string }; Returns: undefined }
      search_products: {
        Args: { _limit?: number; _q: string }
        Returns: {
          product_id: string
          rank: number
        }[]
      }
    }
    Enums: {
      account_status: "ACTIVE" | "SUSPENDED" | "BLOCKED"
      ai_asset_status: "idle" | "queued" | "processing" | "ready" | "failed"
      ai_job_status: "pending" | "processing" | "success" | "failed" | "retry"
      ai_job_type:
        | "understanding"
        | "search_index"
        | "seo"
        | "description"
        | "image_generation"
        | "faq_generation"
      app_role: "admin" | "user" | "customer" | "super_admin"
      customer_note_type: "GENERAL" | "SALES" | "SUPPORT" | "VIP" | "FOLLOW_UP"
      email_campaign_status:
        | "DRAFT"
        | "READY"
        | "SENDING"
        | "SENT"
        | "FAILED"
        | "ARCHIVED"
      inquiry_pipeline_status:
        | "NEW"
        | "CONTACTED"
        | "NEGOTIATING"
        | "QUOTED"
        | "CLOSED"
        | "LOST"
      product_asset_type: "original" | "studio" | "installed" | "gallery"
      product_image_mode: "manual" | "ai" | "hybrid"
      product_processing_state:
        | "draft"
        | "pending"
        | "processing"
        | "completed"
        | "error"
        | "archived"
      product_status: "draft" | "review" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["ACTIVE", "SUSPENDED", "BLOCKED"],
      ai_asset_status: ["idle", "queued", "processing", "ready", "failed"],
      ai_job_status: ["pending", "processing", "success", "failed", "retry"],
      ai_job_type: [
        "understanding",
        "search_index",
        "seo",
        "description",
        "image_generation",
        "faq_generation",
      ],
      app_role: ["admin", "user", "customer", "super_admin"],
      customer_note_type: ["GENERAL", "SALES", "SUPPORT", "VIP", "FOLLOW_UP"],
      email_campaign_status: [
        "DRAFT",
        "READY",
        "SENDING",
        "SENT",
        "FAILED",
        "ARCHIVED",
      ],
      inquiry_pipeline_status: [
        "NEW",
        "CONTACTED",
        "NEGOTIATING",
        "QUOTED",
        "CLOSED",
        "LOST",
      ],
      product_asset_type: ["original", "studio", "installed", "gallery"],
      product_image_mode: ["manual", "ai", "hybrid"],
      product_processing_state: [
        "draft",
        "pending",
        "processing",
        "completed",
        "error",
        "archived",
      ],
      product_status: ["draft", "review", "published", "archived"],
    },
  },
} as const
