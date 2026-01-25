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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          email: string
          id: string
          is_super_admin: boolean | null
          password_hash: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_super_admin?: boolean | null
          password_hash: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean | null
          password_hash?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      housecare_request_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          housecare_request_id: string
          id: string
          photo_url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          housecare_request_id: string
          id?: string
          photo_url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          housecare_request_id?: string
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "housecare_request_photos_housecare_request_id_fkey"
            columns: ["housecare_request_id"]
            isOneToOne: false
            referencedRelation: "housecare_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      housecare_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          property_id: string | null
          realtor_company_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["housecare_status"]
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          property_id?: string | null
          realtor_company_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["housecare_status"]
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          property_id?: string | null
          realtor_company_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["housecare_status"]
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "housecare_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housecare_requests_realtor_company_id_fkey"
            columns: ["realtor_company_id"]
            isOneToOne: false
            referencedRelation: "realtor_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housecare_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housecare_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_admin_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          new_state: Json | null
          notes: string | null
          previous_state: Json | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          new_state?: Json | null
          notes?: string | null
          previous_state?: Json | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          new_state?: Json | null
          notes?: string | null
          previous_state?: Json | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ko: string | null
          parent_id: string | null
          requires_verification: boolean | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ko?: string | null
          parent_id?: string | null
          requires_verification?: boolean | null
          slug: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ko?: string | null
          parent_id?: string | null
          requires_verification?: boolean | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_chat_rooms: {
        Row: {
          buyer_id: string
          created_at: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          item_id: string
          last_message_at: string | null
          message_count: number | null
          seller_id: string
          status: Database["public"]["Enums"]["chat_room_status"] | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          item_id: string
          last_message_at?: string | null
          message_count?: number | null
          seller_id: string
          status?: Database["public"]["Enums"]["chat_room_status"] | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          item_id?: string
          last_message_at?: string | null
          message_count?: number | null
          seller_id?: string
          status?: Database["public"]["Enums"]["chat_room_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_chat_rooms_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_chat_rooms_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_chat_rooms_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_disputes: {
        Row: {
          actions_taken: Json | null
          admin_decision_deadline: string | null
          appeal_decided_at: string | null
          appeal_decided_by: string | null
          appeal_decision: string | null
          appeal_evidence: Json | null
          appeal_filed: boolean | null
          appeal_reason: string | null
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision: Database["public"]["Enums"]["dispute_decision"] | null
          decision_reason: string | null
          description: string
          desired_amount: number | null
          desired_outcome: string | null
          evidence: Json | null
          id: string
          initiator_id: string
          initiator_role: Database["public"]["Enums"]["reviewer_role"]
          peer_resolution_deadline: string | null
          reason: string
          refund_amount: number | null
          respondent_id: string
          stage: number | null
          status: Database["public"]["Enums"]["dispute_status"] | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          actions_taken?: Json | null
          admin_decision_deadline?: string | null
          appeal_decided_at?: string | null
          appeal_decided_by?: string | null
          appeal_decision?: string | null
          appeal_evidence?: Json | null
          appeal_filed?: boolean | null
          appeal_reason?: string | null
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision?: Database["public"]["Enums"]["dispute_decision"] | null
          decision_reason?: string | null
          description: string
          desired_amount?: number | null
          desired_outcome?: string | null
          evidence?: Json | null
          id?: string
          initiator_id: string
          initiator_role: Database["public"]["Enums"]["reviewer_role"]
          peer_resolution_deadline?: string | null
          reason: string
          refund_amount?: number | null
          respondent_id: string
          stage?: number | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          actions_taken?: Json | null
          admin_decision_deadline?: string | null
          appeal_decided_at?: string | null
          appeal_decided_by?: string | null
          appeal_decision?: string | null
          appeal_evidence?: Json | null
          appeal_filed?: boolean | null
          appeal_reason?: string | null
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision?: Database["public"]["Enums"]["dispute_decision"] | null
          decision_reason?: string | null
          description?: string
          desired_amount?: number | null
          desired_outcome?: string | null
          evidence?: Json | null
          id?: string
          initiator_id?: string
          initiator_role?: Database["public"]["Enums"]["reviewer_role"]
          peer_resolution_deadline?: string | null
          reason?: string
          refund_amount?: number | null
          respondent_id?: string
          stage?: number | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_disputes_appeal_decided_by_fkey"
            columns: ["appeal_decided_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "marketplace_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favorites: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_item_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_main: boolean | null
          item_id: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_main?: boolean | null
          item_id: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_main?: boolean | null
          item_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          approved_at: string | null
          category_id: string
          condition: Database["public"]["Enums"]["item_condition"]
          created_at: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          favorite_count: number | null
          id: string
          inquiry_count: number | null
          is_featured: boolean | null
          is_negotiable: boolean | null
          is_urgent: boolean | null
          location_type:
            | Database["public"]["Enums"]["marketplace_location"]
            | null
          meetup_location: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          price: number
          rejection_reason: string | null
          risk_score: number | null
          seller_id: string
          shipping_available: boolean | null
          sold_at: string | null
          status: Database["public"]["Enums"]["item_status"] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          approved_at?: string | null
          category_id: string
          condition: Database["public"]["Enums"]["item_condition"]
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          favorite_count?: number | null
          id?: string
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          location_type?:
            | Database["public"]["Enums"]["marketplace_location"]
            | null
          meetup_location?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          price: number
          rejection_reason?: string | null
          risk_score?: number | null
          seller_id: string
          shipping_available?: boolean | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          approved_at?: string | null
          category_id?: string
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          favorite_count?: number | null
          id?: string
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          location_type?:
            | Database["public"]["Enums"]["marketplace_location"]
            | null
          meetup_location?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          price?: number
          rejection_reason?: string | null
          risk_score?: number | null
          seller_id?: string
          shipping_available?: boolean | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_items_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_messages: {
        Row: {
          chat_room_id: string
          content: string | null
          created_at: string | null
          flag_reason: string | null
          hidden_by: string | null
          id: string
          is_flagged: boolean | null
          is_hidden: boolean | null
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["chat_message_type"] | null
          offer_amount: number | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          chat_room_id: string
          content?: string | null
          created_at?: string | null
          flag_reason?: string | null
          hidden_by?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["chat_message_type"] | null
          offer_amount?: number | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          chat_room_id?: string
          content?: string | null
          created_at?: string | null
          flag_reason?: string | null
          hidden_by?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["chat_message_type"] | null
          offer_amount?: number | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "marketplace_chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_messages_hidden_by_fkey"
            columns: ["hidden_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_moderation_rules: {
        Row: {
          action: string
          condition_logic: string | null
          conditions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          false_positive_count: number | null
          hit_count: number | null
          id: string
          name: string
          notification_type: string | null
          priority: number | null
          risk_score_impact: number | null
          updated_at: string | null
        }
        Insert: {
          action: string
          condition_logic?: string | null
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          false_positive_count?: number | null
          hit_count?: number | null
          id?: string
          name: string
          notification_type?: string | null
          priority?: number | null
          risk_score_impact?: number | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          condition_logic?: string | null
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          false_positive_count?: number | null
          hit_count?: number | null
          id?: string
          name?: string
          notification_type?: string | null
          priority?: number | null
          risk_score_impact?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_moderation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reports: {
        Row: {
          action_taken: Database["public"]["Enums"]["report_action"] | null
          assigned_to: string | null
          auto_flagged: boolean | null
          category: Database["public"]["Enums"]["marketplace_report_category"]
          created_at: string | null
          description: string | null
          duplicate_of: string | null
          evidence_urls: Json | null
          id: string
          is_duplicate: boolean | null
          priority: Database["public"]["Enums"]["report_priority"] | null
          reporter_id: string
          reporter_type: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          subcategory: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
          updated_at: string | null
        }
        Insert: {
          action_taken?: Database["public"]["Enums"]["report_action"] | null
          assigned_to?: string | null
          auto_flagged?: boolean | null
          category: Database["public"]["Enums"]["marketplace_report_category"]
          created_at?: string | null
          description?: string | null
          duplicate_of?: string | null
          evidence_urls?: Json | null
          id?: string
          is_duplicate?: boolean | null
          priority?: Database["public"]["Enums"]["report_priority"] | null
          reporter_id: string
          reporter_type?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          subcategory?: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
          updated_at?: string | null
        }
        Update: {
          action_taken?: Database["public"]["Enums"]["report_action"] | null
          assigned_to?: string | null
          auto_flagged?: boolean | null
          category?: Database["public"]["Enums"]["marketplace_report_category"]
          created_at?: string | null
          description?: string | null
          duplicate_of?: string | null
          evidence_urls?: Json | null
          id?: string
          is_duplicate?: boolean | null
          priority?: Database["public"]["Enums"]["report_priority"] | null
          reporter_id?: string
          reporter_type?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          subcategory?: string | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reports_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "marketplace_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          hidden_reason: string | null
          id: string
          is_hidden: boolean | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          reviewer_role: Database["public"]["Enums"]["reviewer_role"]
          transaction_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean | null
          rating: number
          reviewee_id: string
          reviewer_id: string
          reviewer_role: Database["public"]["Enums"]["reviewer_role"]
          transaction_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean | null
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          reviewer_role?: Database["public"]["Enums"]["reviewer_role"]
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "marketplace_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          buyer_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          chat_room_id: string | null
          completed_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"] | null
          dispute_id: string | null
          fee_percentage: number | null
          final_price: number
          has_dispute: boolean | null
          id: string
          item_id: string
          listing_price: number
          meetup_location: string | null
          meetup_time: string | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          platform_fee: number | null
          seller_id: string
          shipped_at: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chat_room_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?:
            | Database["public"]["Enums"]["delivery_method"]
            | null
          dispute_id?: string | null
          fee_percentage?: number | null
          final_price: number
          has_dispute?: boolean | null
          id?: string
          item_id: string
          listing_price: number
          meetup_location?: string | null
          meetup_time?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          platform_fee?: number | null
          seller_id: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          chat_room_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?:
            | Database["public"]["Enums"]["delivery_method"]
            | null
          dispute_id?: string | null
          fee_percentage?: number | null
          final_price?: number
          has_dispute?: boolean | null
          id?: string
          item_id?: string
          listing_price?: number
          meetup_location?: string | null
          meetup_time?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          platform_fee?: number | null
          seller_id?: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "marketplace_chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_user_profiles: {
        Row: {
          avg_response_time: number | null
          buyer_rating: number | null
          can_buy: boolean | null
          can_message: boolean | null
          can_sell: boolean | null
          cancelled_transactions: number | null
          completed_transactions: number | null
          created_at: string | null
          is_verified_seller: boolean | null
          last_listing_at: string | null
          last_purchase_at: string | null
          last_warning_at: string | null
          marketplace_status:
            | Database["public"]["Enums"]["marketplace_user_status"]
            | null
          report_count: number | null
          response_rate: number | null
          restricted_until: string | null
          restriction_reason: string | null
          risk_score: number | null
          seller_rating: number | null
          total_purchases: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verified_at: string | null
          warning_count: number | null
        }
        Insert: {
          avg_response_time?: number | null
          buyer_rating?: number | null
          can_buy?: boolean | null
          can_message?: boolean | null
          can_sell?: boolean | null
          cancelled_transactions?: number | null
          completed_transactions?: number | null
          created_at?: string | null
          is_verified_seller?: boolean | null
          last_listing_at?: string | null
          last_purchase_at?: string | null
          last_warning_at?: string | null
          marketplace_status?:
            | Database["public"]["Enums"]["marketplace_user_status"]
            | null
          report_count?: number | null
          response_rate?: number | null
          restricted_until?: string | null
          restriction_reason?: string | null
          risk_score?: number | null
          seller_rating?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          verified_at?: string | null
          warning_count?: number | null
        }
        Update: {
          avg_response_time?: number | null
          buyer_rating?: number | null
          can_buy?: boolean | null
          can_message?: boolean | null
          can_sell?: boolean | null
          cancelled_transactions?: number | null
          completed_transactions?: number | null
          created_at?: string | null
          is_verified_seller?: boolean | null
          last_listing_at?: string | null
          last_purchase_at?: string | null
          last_warning_at?: string | null
          marketplace_status?:
            | Database["public"]["Enums"]["marketplace_user_status"]
            | null
          report_count?: number | null
          response_rate?: number | null
          restricted_until?: string | null
          restriction_reason?: string | null
          risk_score?: number | null
          seller_rating?: number | null
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          verified_at?: string | null
          warning_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_warnings: {
        Row: {
          acknowledged_at: string | null
          created_at: string | null
          evidence_notes: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          issued_at: string | null
          issued_by: string
          message: string
          related_chat_id: string | null
          related_item_id: string | null
          related_report_id: string | null
          severity: Database["public"]["Enums"]["warning_severity"]
          type: Database["public"]["Enums"]["warning_type"]
          user_id: string
          user_response: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string | null
          evidence_notes?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_at?: string | null
          issued_by: string
          message: string
          related_chat_id?: string | null
          related_item_id?: string | null
          related_report_id?: string | null
          severity: Database["public"]["Enums"]["warning_severity"]
          type: Database["public"]["Enums"]["warning_type"]
          user_id: string
          user_response?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string | null
          evidence_notes?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_at?: string | null
          issued_by?: string
          message?: string
          related_chat_id?: string | null
          related_item_id?: string | null
          related_report_id?: string | null
          severity?: Database["public"]["Enums"]["warning_severity"]
          type?: Database["public"]["Enums"]["warning_type"]
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_warnings_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_warnings_related_chat_id_fkey"
            columns: ["related_chat_id"]
            isOneToOne: false
            referencedRelation: "marketplace_chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_warnings_related_item_id_fkey"
            columns: ["related_item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_warnings_related_report_id_fkey"
            columns: ["related_report_id"]
            isOneToOne: false
            referencedRelation: "marketplace_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: Json | null
          approval_date: string | null
          bathroom_count: number | null
          contact_info: string | null
          created_at: string | null
          creator_realtor_id: string | null
          current_floor: number | null
          deposit: number | null
          description: string | null
          detail_address: string | null
          direction: Database["public"]["Enums"]["direction_type"] | null
          floor_number: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_furnished: boolean | null
          is_negotiable: boolean | null
          jibun_address: string | null
          kakao_id: string | null
          landlord_email: string | null
          landlord_id: string | null
          landlord_kakao_id: string | null
          landlord_name: string | null
          landlord_notes: string | null
          landlord_phone: string | null
          landlord_whatsapp: string | null
          latitude: number | null
          longitude: number | null
          management_fee: number | null
          monthly_rent: number | null
          move_in_date: string | null
          nearby_facilities: Json | null
          owner_id: string
          parking_spaces: string | null
          pets_allowed: boolean | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          realtor_company_id: string | null
          region: Database["public"]["Enums"]["region_type"] | null
          road_address: string
          room_count: number | null
          sido: string | null
          sigungu: string | null
          size_info: number
          status: Database["public"]["Enums"]["verification_status"] | null
          thumbnail_url: string | null
          title: string
          total_floors: number | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          view_count: number | null
          whatsapp_number: string | null
          zonecode: string | null
        }
        Insert: {
          amenities?: Json | null
          approval_date?: string | null
          bathroom_count?: number | null
          contact_info?: string | null
          created_at?: string | null
          creator_realtor_id?: string | null
          current_floor?: number | null
          deposit?: number | null
          description?: string | null
          detail_address?: string | null
          direction?: Database["public"]["Enums"]["direction_type"] | null
          floor_number?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_furnished?: boolean | null
          is_negotiable?: boolean | null
          jibun_address?: string | null
          kakao_id?: string | null
          landlord_email?: string | null
          landlord_id?: string | null
          landlord_kakao_id?: string | null
          landlord_name?: string | null
          landlord_notes?: string | null
          landlord_phone?: string | null
          landlord_whatsapp?: string | null
          latitude?: number | null
          longitude?: number | null
          management_fee?: number | null
          monthly_rent?: number | null
          move_in_date?: string | null
          nearby_facilities?: Json | null
          owner_id: string
          parking_spaces?: string | null
          pets_allowed?: boolean | null
          price?: number
          property_type: Database["public"]["Enums"]["property_type"]
          realtor_company_id?: string | null
          region?: Database["public"]["Enums"]["region_type"] | null
          road_address: string
          room_count?: number | null
          sido?: string | null
          sigungu?: string | null
          size_info: number
          status?: Database["public"]["Enums"]["verification_status"] | null
          thumbnail_url?: string | null
          title: string
          total_floors?: number | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          view_count?: number | null
          whatsapp_number?: string | null
          zonecode?: string | null
        }
        Update: {
          amenities?: Json | null
          approval_date?: string | null
          bathroom_count?: number | null
          contact_info?: string | null
          created_at?: string | null
          creator_realtor_id?: string | null
          current_floor?: number | null
          deposit?: number | null
          description?: string | null
          detail_address?: string | null
          direction?: Database["public"]["Enums"]["direction_type"] | null
          floor_number?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_furnished?: boolean | null
          is_negotiable?: boolean | null
          jibun_address?: string | null
          kakao_id?: string | null
          landlord_email?: string | null
          landlord_id?: string | null
          landlord_kakao_id?: string | null
          landlord_name?: string | null
          landlord_notes?: string | null
          landlord_phone?: string | null
          landlord_whatsapp?: string | null
          latitude?: number | null
          longitude?: number | null
          management_fee?: number | null
          monthly_rent?: number | null
          move_in_date?: string | null
          nearby_facilities?: Json | null
          owner_id?: string
          parking_spaces?: string | null
          pets_allowed?: boolean | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          realtor_company_id?: string | null
          region?: Database["public"]["Enums"]["region_type"] | null
          road_address?: string
          room_count?: number | null
          sido?: string | null
          sigungu?: string | null
          size_info?: number
          status?: Database["public"]["Enums"]["verification_status"] | null
          thumbnail_url?: string | null
          title?: string
          total_floors?: number | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          view_count?: number | null
          whatsapp_number?: string | null
          zonecode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_creator_realtor_id_fkey"
            columns: ["creator_realtor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_realtor_company_id_fkey"
            columns: ["realtor_company_id"]
            isOneToOne: false
            referencedRelation: "realtor_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          file_size: number | null
          id: string
          property_id: string
          rejection_reason: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          file_size?: number | null
          id?: string
          property_id: string
          rejection_reason?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          document_url?: string
          file_size?: number | null
          id?: string
          property_id?: string
          rejection_reason?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_housecare_users: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          property_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_housecare_users_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_housecare_users_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_housecare_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          file_name: string | null
          file_size: number | null
          id: string
          is_main_image: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          property_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_main_image?: boolean | null
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          property_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_main_image?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          property_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          property_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          property_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_requests: {
        Row: {
          address: string
          address_detail: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_contact: string
        }
        Insert: {
          address: string
          address_detail?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_contact: string
        }
        Update: {
          address?: string
          address_detail?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_contact?: string
        }
        Relationships: []
      }
      realtor_companies: {
        Row: {
          address: string | null
          business_license: string | null
          business_registration_number: string | null
          ceo_name: string | null
          company_name: string
          created_at: string | null
          id: string
          is_verified: boolean | null
          phone_number: string
          rejection_reason: string | null
          representative_name: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          business_license?: string | null
          business_registration_number?: string | null
          ceo_name?: string | null
          company_name: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          phone_number: string
          rejection_reason?: string | null
          representative_name?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          business_license?: string | null
          business_registration_number?: string | null
          ceo_name?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          phone_number?: string
          rejection_reason?: string | null
          representative_name?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      role_upgrade_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          business_license_url: string | null
          company_address: string | null
          company_name: string | null
          company_phone: string | null
          company_registration_number: string | null
          created_at: string | null
          documents: Json | null
          full_name: string | null
          id: string
          id_card_url: string | null
          realtor_license_url: string | null
          realtor_registration_number: string | null
          rejection_reason: string | null
          reviewed_by: string | null
          status: string
          target_role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          business_license_url?: string | null
          company_address?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_registration_number?: string | null
          created_at?: string | null
          documents?: Json | null
          full_name?: string | null
          id?: string
          id_card_url?: string | null
          realtor_license_url?: string | null
          realtor_registration_number?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: string
          target_role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          business_license_url?: string | null
          company_address?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_registration_number?: string | null
          created_at?: string | null
          documents?: Json | null
          full_name?: string | null
          id?: string
          id_card_url?: string | null
          realtor_license_url?: string | null
          realtor_registration_number?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: string
          target_role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_upgrade_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_upgrade_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_cleanup_queue: {
        Row: {
          bucket_name: string
          deleted_at: string | null
          error_message: string | null
          file_path: string
          id: string
          processed_at: string | null
          retry_count: number | null
          source_column: string
          source_table: string
          status: string | null
        }
        Insert: {
          bucket_name: string
          deleted_at?: string | null
          error_message?: string | null
          file_path: string
          id?: string
          processed_at?: string | null
          retry_count?: number | null
          source_column: string
          source_table: string
          status?: string | null
        }
        Update: {
          bucket_name?: string
          deleted_at?: string | null
          error_message?: string | null
          file_path?: string
          id?: string
          processed_at?: string | null
          retry_count?: number | null
          source_column?: string
          source_table?: string
          status?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verification_documents: {
        Row: {
          created_at: string | null
          document_name: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          file_size: number | null
          id: string
          rejection_reason: string | null
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          file_size?: number | null
          id?: string
          rejection_reason?: string | null
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          document_url?: string
          file_size?: number | null
          id?: string
          rejection_reason?: string | null
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_verification_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          id_card_url: string | null
          is_active: boolean | null
          kakao_id: string | null
          last_login_at: string | null
          phone_number: string | null
          profile_image_url: string | null
          properties_count: number | null
          realtor_company_id: string | null
          realtor_license_url: string | null
          realtor_registration_number: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          username: string
          verified_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          id_card_url?: string | null
          is_active?: boolean | null
          kakao_id?: string | null
          last_login_at?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          properties_count?: number | null
          realtor_company_id?: string | null
          realtor_license_url?: string | null
          realtor_registration_number?: string | null
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          username: string
          verified_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          id_card_url?: string | null
          is_active?: boolean | null
          kakao_id?: string | null
          last_login_at?: string | null
          phone_number?: string | null
          profile_image_url?: string | null
          properties_count?: number | null
          realtor_company_id?: string | null
          realtor_license_url?: string | null
          realtor_registration_number?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          username?: string
          verified_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_realtor_company"
            columns: ["realtor_company_id"]
            isOneToOne: false
            referencedRelation: "realtor_companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      storage_cleanup_status: {
        Row: {
          count: number | null
          newest_entry: string | null
          oldest_entry: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_role_upgrade_request: {
        Args: { p_admin_id: string; p_notes?: string; p_request_id: string }
        Returns: boolean
      }
      cancel_report: {
        Args: { p_report_id: string }
        Returns: {
          success: boolean
        }[]
      }
      check_role_upgrade_eligibility: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      create_property_report: {
        Args: {
          p_description?: string
          p_property_id: string
          p_reason: string
        }
        Returns: {
          admin_id: string
          admin_response: string
          created_at: string
          description: string
          id: string
          property_id: string
          reason: string
          reporter_id: string
          resolved_at: string
          status: string
          updated_at: string
        }[]
      }
      extract_storage_path: {
        Args: { url: string }
        Returns: {
          bucket_name: string
          file_path: string
        }[]
      }
      get_all_reports: {
        Args: { p_page?: number; p_page_size?: number; p_status?: string }
        Returns: {
          admin_id: string
          admin_response: string
          created_at: string
          description: string
          id: string
          property_id: string
          reason: string
          reporter_id: string
          resolved_at: string
          status: string
          updated_at: string
        }[]
      }
      get_property_detail_with_media: {
        Args: { property_id_param: string }
        Returns: Json
      }
      get_property_reports: {
        Args: { p_property_id: string }
        Returns: {
          admin_id: string
          admin_response: string
          created_at: string
          description: string
          id: string
          property_id: string
          reason: string
          reporter_id: string
          resolved_at: string
          status: string
          updated_at: string
        }[]
      }
      get_user_reports: {
        Args: never
        Returns: {
          admin_id: string
          admin_response: string
          created_at: string
          description: string
          id: string
          property_id: string
          reason: string
          reporter_id: string
          resolved_at: string
          status: string
          updated_at: string
        }[]
      }
      has_user_reported_property: {
        Args: { p_property_id: string }
        Returns: {
          has_reported: boolean
        }[]
      }
      is_admin_api_request: { Args: never; Returns: boolean }
      queue_storage_file_for_deletion: {
        Args: { p_source_column: string; p_source_table: string; p_url: string }
        Returns: undefined
      }
      reject_role_upgrade_request: {
        Args: {
          p_admin_id: string
          p_notes?: string
          p_reason: string
          p_request_id: string
        }
        Returns: boolean
      }
      update_report_status: {
        Args: {
          p_admin_response?: string
          p_report_id: string
          p_status: string
        }
        Returns: {
          admin_id: string
          admin_response: string
          created_at: string
          description: string
          id: string
          property_id: string
          reason: string
          reporter_id: string
          resolved_at: string
          status: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      chat_message_type: "TEXT" | "IMAGE" | "LOCATION" | "OFFER" | "SYSTEM"
      chat_room_status: "ACTIVE" | "ARCHIVED" | "BLOCKED"
      delivery_method: "MEETUP" | "SHIPPING" | "PICKUP"
      direction:
        | "SOUTH"
        | "NORTH"
        | "EAST"
        | "WEST"
        | "SOUTHEAST"
        | "SOUTHWEST"
        | "NORTHEAST"
        | "NORTHWEST"
      direction_type:
        | "SOUTH"
        | "NORTH"
        | "EAST"
        | "WEST"
        | "SOUTHEAST"
        | "SOUTHWEST"
        | "NORTHEAST"
        | "NORTHWEST"
      dispute_decision: "BUYER_WINS" | "SELLER_WINS" | "SPLIT" | "DISMISSED"
      dispute_status:
        | "OPEN"
        | "PEER_RESOLUTION"
        | "ADMIN_REVIEW"
        | "DECIDED"
        | "APPEALED"
        | "CLOSED"
      document_type:
        | "PROPERTY_OWNERSHIP"
        | "BUSINESS_LICENSE"
        | "ID_CARD"
        | "CONTRACT"
        | "OTHER"
      housecare_status:
        | "PENDING"
        | "IN_REVIEW"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
      item_condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR"
      item_status:
        | "DRAFT"
        | "PENDING"
        | "ACTIVE"
        | "SOLD"
        | "RESERVED"
        | "HIDDEN"
        | "DELETED"
      marketplace_location: "HUMPREYS" | "OSAN" | "BOTH"
      marketplace_report_category:
        | "FRAUD"
        | "COUNTERFEIT"
        | "PROHIBITED"
        | "HARASSMENT"
        | "SPAM"
        | "MISREPRESENTATION"
        | "NO_SHOW"
        | "PRICE_GOUGING"
        | "SAFETY_CONCERN"
        | "COPYRIGHT"
        | "OTHER"
      marketplace_user_status: "ACTIVE" | "RESTRICTED" | "SUSPENDED" | "BANNED"
      media_type: "IMAGE" | "VIDEO"
      moderation_status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED"
      payment_method: "CASH" | "TRANSFER" | "ESCROW" | "EXTERNAL"
      property_type: "APARTMENT" | "OFFICETEL" | "VILLA" | "HOUSE" | "STUDIO"
      region_type: "HUMPREYS" | "OSAN"
      report_action:
        | "NONE"
        | "WARNING"
        | "CONTENT_REMOVED"
        | "USER_RESTRICTED"
        | "USER_SUSPENDED"
        | "USER_BANNED"
        | "REFUND_ISSUED"
      report_priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      report_reason:
        | "SPAM"
        | "FAKE_LISTING"
        | "INAPPROPRIATE_CONTENT"
        | "WRONG_INFORMATION"
        | "DUPLICATE"
        | "OTHER"
      report_status:
        | "PENDING"
        | "IN_REVIEW"
        | "RESOLVED"
        | "DISMISSED"
        | "ESCALATED"
      report_target_type: "ITEM" | "USER" | "CHAT" | "TRANSACTION" | "REVIEW"
      reviewer_role: "BUYER" | "SELLER"
      status: "PENDING" | "REJECTED" | "ALLOWED"
      transaction_status:
        | "INITIATED"
        | "AGREED"
        | "PAYMENT_PENDING"
        | "PAID"
        | "SHIPPED"
        | "DELIVERED"
        | "COMPLETED"
        | "CANCELLED"
        | "DISPUTED"
        | "REFUNDED"
      transaction_type: "SALE" | "JEONSE" | "MONTHLY_RENT"
      user_type: "REALTOR" | "TENANT" | "LANDLORD" | "ADMIN"
      verification_status: "PENDING" | "APPROVED" | "REJECTED"
      warning_severity: "MILD" | "MODERATE" | "SEVERE"
      warning_type:
        | "POLICY_VIOLATION"
        | "BEHAVIOR"
        | "CONTENT"
        | "FRAUD_RISK"
        | "SPAM"
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
  public: {
    Enums: {
      chat_message_type: ["TEXT", "IMAGE", "LOCATION", "OFFER", "SYSTEM"],
      chat_room_status: ["ACTIVE", "ARCHIVED", "BLOCKED"],
      delivery_method: ["MEETUP", "SHIPPING", "PICKUP"],
      direction: [
        "SOUTH",
        "NORTH",
        "EAST",
        "WEST",
        "SOUTHEAST",
        "SOUTHWEST",
        "NORTHEAST",
        "NORTHWEST",
      ],
      direction_type: [
        "SOUTH",
        "NORTH",
        "EAST",
        "WEST",
        "SOUTHEAST",
        "SOUTHWEST",
        "NORTHEAST",
        "NORTHWEST",
      ],
      dispute_decision: ["BUYER_WINS", "SELLER_WINS", "SPLIT", "DISMISSED"],
      dispute_status: [
        "OPEN",
        "PEER_RESOLUTION",
        "ADMIN_REVIEW",
        "DECIDED",
        "APPEALED",
        "CLOSED",
      ],
      document_type: [
        "PROPERTY_OWNERSHIP",
        "BUSINESS_LICENSE",
        "ID_CARD",
        "CONTRACT",
        "OTHER",
      ],
      housecare_status: [
        "PENDING",
        "IN_REVIEW",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      item_condition: ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"],
      item_status: [
        "DRAFT",
        "PENDING",
        "ACTIVE",
        "SOLD",
        "RESERVED",
        "HIDDEN",
        "DELETED",
      ],
      marketplace_location: ["HUMPREYS", "OSAN", "BOTH"],
      marketplace_report_category: [
        "FRAUD",
        "COUNTERFEIT",
        "PROHIBITED",
        "HARASSMENT",
        "SPAM",
        "MISREPRESENTATION",
        "NO_SHOW",
        "PRICE_GOUGING",
        "SAFETY_CONCERN",
        "COPYRIGHT",
        "OTHER",
      ],
      marketplace_user_status: ["ACTIVE", "RESTRICTED", "SUSPENDED", "BANNED"],
      media_type: ["IMAGE", "VIDEO"],
      moderation_status: ["PENDING", "APPROVED", "REJECTED", "FLAGGED"],
      payment_method: ["CASH", "TRANSFER", "ESCROW", "EXTERNAL"],
      property_type: ["APARTMENT", "OFFICETEL", "VILLA", "HOUSE", "STUDIO"],
      region_type: ["HUMPREYS", "OSAN"],
      report_action: [
        "NONE",
        "WARNING",
        "CONTENT_REMOVED",
        "USER_RESTRICTED",
        "USER_SUSPENDED",
        "USER_BANNED",
        "REFUND_ISSUED",
      ],
      report_priority: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      report_reason: [
        "SPAM",
        "FAKE_LISTING",
        "INAPPROPRIATE_CONTENT",
        "WRONG_INFORMATION",
        "DUPLICATE",
        "OTHER",
      ],
      report_status: [
        "PENDING",
        "IN_REVIEW",
        "RESOLVED",
        "DISMISSED",
        "ESCALATED",
      ],
      report_target_type: ["ITEM", "USER", "CHAT", "TRANSACTION", "REVIEW"],
      reviewer_role: ["BUYER", "SELLER"],
      status: ["PENDING", "REJECTED", "ALLOWED"],
      transaction_status: [
        "INITIATED",
        "AGREED",
        "PAYMENT_PENDING",
        "PAID",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
        "REFUNDED",
      ],
      transaction_type: ["SALE", "JEONSE", "MONTHLY_RENT"],
      user_type: ["REALTOR", "TENANT", "LANDLORD", "ADMIN"],
      verification_status: ["PENDING", "APPROVED", "REJECTED"],
      warning_severity: ["MILD", "MODERATE", "SEVERE"],
      warning_type: [
        "POLICY_VIOLATION",
        "BEHAVIOR",
        "CONTENT",
        "FRAUD_RISK",
        "SPAM",
      ],
    },
  },
} as const

