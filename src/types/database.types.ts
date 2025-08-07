export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      realtor_companies: {
        Row: {
          address: string | null
          business_license: string
          business_registration_number: string | null
          ceo_name: string | null
          company_name: string
          created_at: string | null
          id: string
          is_verified: boolean | null
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_license: string
          business_registration_number?: string | null
          ceo_name?: string | null
          company_name: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_license?: string
          business_registration_number?: string | null
          ceo_name?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          phone_number?: string
          updated_at?: string | null
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
          full_name: string
          id: string
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
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
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
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
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
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
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
      [_ in never]: never
    }
    Functions: {
      cancel_report: {
        Args: { p_report_id: string }
        Returns: {
          success: boolean
        }[]
      }
      create_property_report: {
        Args: {
          p_property_id: string
          p_reason: string
          p_description?: string
        }
        Returns: {
          id: string
          property_id: string
          reporter_id: string
          reason: string
          description: string
          status: string
          admin_response: string
          admin_id: string
          created_at: string
          updated_at: string
          resolved_at: string
        }[]
      }
      get_all_reports: {
        Args: { p_status?: string; p_page?: number; p_page_size?: number }
        Returns: {
          id: string
          property_id: string
          reporter_id: string
          reason: string
          description: string
          status: string
          admin_response: string
          admin_id: string
          created_at: string
          updated_at: string
          resolved_at: string
        }[]
      }
      get_property_detail_with_media: {
        Args: { property_id_param: string }
        Returns: Json
      }
      get_property_reports: {
        Args: { p_property_id: string }
        Returns: {
          id: string
          property_id: string
          reporter_id: string
          reason: string
          description: string
          status: string
          admin_response: string
          admin_id: string
          created_at: string
          updated_at: string
          resolved_at: string
        }[]
      }
      get_user_reports: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          property_id: string
          reporter_id: string
          reason: string
          description: string
          status: string
          admin_response: string
          admin_id: string
          created_at: string
          updated_at: string
          resolved_at: string
        }[]
      }
      has_user_reported_property: {
        Args: { p_property_id: string }
        Returns: {
          has_reported: boolean
        }[]
      }
      update_report_status: {
        Args: {
          p_report_id: string
          p_status: string
          p_admin_response?: string
        }
        Returns: {
          id: string
          property_id: string
          reporter_id: string
          reason: string
          description: string
          status: string
          admin_response: string
          admin_id: string
          created_at: string
          updated_at: string
          resolved_at: string
        }[]
      }
    }
    Enums: {
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
      document_type:
        | "PROPERTY_OWNERSHIP"
        | "BUSINESS_LICENSE"
        | "ID_CARD"
        | "CONTRACT"
        | "OTHER"
      media_type: "IMAGE" | "VIDEO"
      property_type: "APARTMENT" | "OFFICETEL" | "VILLA" | "HOUSE" | "STUDIO"
      region_type: "HUMPREYS" | "OSAN"
      report_reason:
        | "SPAM"
        | "FAKE_LISTING"
        | "INAPPROPRIATE_CONTENT"
        | "WRONG_INFORMATION"
        | "DUPLICATE"
        | "OTHER"
      status: "PENDING" | "REJECTED" | "ALLOWED"
      transaction_type: "SALE" | "JEONSE" | "MONTHLY_RENT"
      user_type: "REALTOR" | "TENANT" | "LANDLORD" | "ADMIN"
      verification_status: "PENDING" | "APPROVED" | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never