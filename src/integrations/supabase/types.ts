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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          siret: string | null
          tva_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          siret?: string | null
          tva_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          siret?: string | null
          tva_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string | null
          ape_code: string | null
          bank_name: string | null
          bic: string | null
          capital: string | null
          city: string | null
          created_at: string | null
          email: string | null
          iban: string | null
          id: string
          invoice_prefix: string | null
          legal_form: string | null
          logo_url: string | null
          name: string
          payment_delay: number | null
          phone: string | null
          postal_code: string | null
          quote_prefix: string | null
          rcs: string | null
          siret: string | null
          tax_rate: number | null
          tva_number: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          ape_code?: string | null
          bank_name?: string | null
          bic?: string | null
          capital?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          invoice_prefix?: string | null
          legal_form?: string | null
          logo_url?: string | null
          name?: string
          payment_delay?: number | null
          phone?: string | null
          postal_code?: string | null
          quote_prefix?: string | null
          rcs?: string | null
          siret?: string | null
          tax_rate?: number | null
          tva_number?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          ape_code?: string | null
          bank_name?: string | null
          bic?: string | null
          capital?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          invoice_prefix?: string | null
          legal_form?: string | null
          logo_url?: string | null
          name?: string
          payment_delay?: number | null
          phone?: string | null
          postal_code?: string | null
          quote_prefix?: string | null
          rcs?: string | null
          siret?: string | null
          tax_rate?: number | null
          tva_number?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          items: Json
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number
          title: string | null
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          items?: Json
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          title?: string | null
          total?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          title?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string | null
          features: string | null
          hosting: string | null
          id: string
          issue_date: string
          items: Json
          maintenance: string | null
          notes: string | null
          payment_terms: string | null
          quote_number: string
          revisions: string | null
          show_subtotal: boolean | null
          show_total: boolean
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          support: string | null
          tax: number
          timeline: string | null
          total: number
          updated_at: string | null
          user_id: string
          valid_until: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          features?: string | null
          hosting?: string | null
          id?: string
          issue_date?: string
          items?: Json
          maintenance?: string | null
          notes?: string | null
          payment_terms?: string | null
          quote_number: string
          revisions?: string | null
          show_subtotal?: boolean | null
          show_total?: boolean
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          support?: string | null
          tax?: number
          timeline?: string | null
          total?: number
          updated_at?: string | null
          user_id: string
          valid_until: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          features?: string | null
          hosting?: string | null
          id?: string
          issue_date?: string
          items?: Json
          maintenance?: string | null
          notes?: string | null
          payment_terms?: string | null
          quote_number?: string
          revisions?: string | null
          show_subtotal?: boolean | null
          show_total?: boolean
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          support?: string | null
          tax?: number
          timeline?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          client_name: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          invoice_id: string | null
          invoice_number: string | null
          payment_method: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_name?: string | null
          created_at?: string | null
          date?: string
          description: string
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          payment_method?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_name?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          payment_method?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      invoice_status: "non_reglee" | "reglement_en_cours" | "reglee"
      quote_status: "en_attente" | "accepte" | "refuse" | "expire"
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
      invoice_status: ["non_reglee", "reglement_en_cours", "reglee"],
      quote_status: ["en_attente", "accepte", "refuse", "expire"],
    },
  },
} as const
