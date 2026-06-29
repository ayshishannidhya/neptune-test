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
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number
          branch_id: string
          created_at: string
          customer_id: string
          id: string
          is_active: boolean
          mode_of_operation: Database["public"]["Enums"]["mode_of_operation"]
          opened_at: string
          updated_at: string
        }
        Insert: {
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"]
          balance?: number
          branch_id: string
          created_at?: string
          customer_id: string
          id?: string
          is_active?: boolean
          mode_of_operation?: Database["public"]["Enums"]["mode_of_operation"]
          opened_at?: string
          updated_at?: string
        }
        Update: {
          account_number?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number
          branch_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_active?: boolean
          mode_of_operation?: Database["public"]["Enums"]["mode_of_operation"]
          opened_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          ifsc: string
          manager: string | null
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          ifsc: string
          manager?: string | null
          name: string
          state: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          ifsc?: string
          manager?: string | null
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_details: {
        Row: {
          alternate_email: string | null
          alternate_mobile_number: string | null
          city: string
          communication_address: string
          country: string
          created_at: string
          customer_id: string
          email: string
          id: string
          landmark: string | null
          mobile_number: string
          permanent_address: string
          state: string
          updated_at: string
          zip: string
        }
        Insert: {
          alternate_email?: string | null
          alternate_mobile_number?: string | null
          city: string
          communication_address: string
          country?: string
          created_at?: string
          customer_id: string
          email: string
          id?: string
          landmark?: string | null
          mobile_number: string
          permanent_address: string
          state: string
          updated_at?: string
          zip: string
        }
        Update: {
          alternate_email?: string | null
          alternate_mobile_number?: string | null
          city?: string
          communication_address?: string
          country?: string
          created_at?: string
          customer_id?: string
          email?: string
          id?: string
          landmark?: string | null
          mobile_number?: string
          permanent_address?: string
          state?: string
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_details_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_interest_rate: number
          category: Database["public"]["Enums"]["category"]
          citizen: string
          created_at: string
          date_of_birth: string
          father_name: string
          first_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          is_active: boolean
          is_blocked: boolean
          is_deleted: boolean
          last_name: string
          marital_status: Database["public"]["Enums"]["marital_status"]
          middle_name: string | null
          mother_name: string
          occupation: Database["public"]["Enums"]["occupation"]
          profile_id: string
          religion: Database["public"]["Enums"]["religion"]
          salary: number | null
          spouse_name: string | null
          updated_at: string
        }
        Insert: {
          account_interest_rate?: number
          category: Database["public"]["Enums"]["category"]
          citizen?: string
          created_at?: string
          date_of_birth: string
          father_name: string
          first_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          is_active?: boolean
          is_blocked?: boolean
          is_deleted?: boolean
          last_name: string
          marital_status: Database["public"]["Enums"]["marital_status"]
          middle_name?: string | null
          mother_name: string
          occupation: Database["public"]["Enums"]["occupation"]
          profile_id: string
          religion: Database["public"]["Enums"]["religion"]
          salary?: number | null
          spouse_name?: string | null
          updated_at?: string
        }
        Update: {
          account_interest_rate?: number
          category?: Database["public"]["Enums"]["category"]
          citizen?: string
          created_at?: string
          date_of_birth?: string
          father_name?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          is_active?: boolean
          is_blocked?: boolean
          is_deleted?: boolean
          last_name?: string
          marital_status?: Database["public"]["Enums"]["marital_status"]
          middle_name?: string | null
          mother_name?: string
          occupation?: Database["public"]["Enums"]["occupation"]
          profile_id?: string
          religion?: Database["public"]["Enums"]["religion"]
          salary?: number | null
          spouse_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kyc: {
        Row: {
          aadhaar_number: string | null
          created_at: string
          customer_id: string
          document_url: string | null
          id: string
          is_verified: boolean
          pan_number: string | null
          remarks: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          created_at?: string
          customer_id: string
          document_url?: string | null
          id?: string
          is_verified?: boolean
          pan_number?: string | null
          remarks?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          created_at?: string
          customer_id?: string
          document_url?: string | null
          id?: string
          is_verified?: boolean
          pan_number?: string | null
          remarks?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      nominees: {
        Row: {
          address: string | null
          created_at: string
          customer_id: string
          date_of_birth: string | null
          id: string
          mobile_number: string | null
          name: string
          relationship: Database["public"]["Enums"]["relationship"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_id: string
          date_of_birth?: string | null
          id?: string
          mobile_number?: string | null
          name: string
          relationship: Database["public"]["Enums"]["relationship"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_id?: string
          date_of_birth?: string | null
          id?: string
          mobile_number?: string | null
          name?: string
          relationship?: Database["public"]["Enums"]["relationship"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nominees_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      otps: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          identifier: string
          purpose: Database["public"]["Enums"]["otp_purpose"]
          user_id: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          identifier: string
          purpose: Database["public"]["Enums"]["otp_purpose"]
          user_id?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          purpose?: Database["public"]["Enums"]["otp_purpose"]
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number | null
          counterparty_account: string | null
          created_at: string
          description: string | null
          id: string
          medium: Database["public"]["Enums"]["transaction_medium"]
          mode: Database["public"]["Enums"]["transaction_mode"]
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          txn_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          account_id: string
          amount: number
          balance_after?: number | null
          counterparty_account?: string | null
          created_at?: string
          description?: string | null
          id?: string
          medium?: Database["public"]["Enums"]["transaction_medium"]
          mode: Database["public"]["Enums"]["transaction_mode"]
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          txn_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number | null
          counterparty_account?: string | null
          created_at?: string
          description?: string | null
          id?: string
          medium?: Database["public"]["Enums"]["transaction_medium"]
          mode?: Database["public"]["Enums"]["transaction_mode"]
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          txn_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_deposit: {
        Args: {
          _account_id: string
          _amount: number
          _description: string
          _medium: Database["public"]["Enums"]["transaction_medium"]
        }
        Returns: {
          account_id: string
          amount: number
          balance_after: number | null
          counterparty_account: string | null
          created_at: string
          description: string | null
          id: string
          medium: Database["public"]["Enums"]["transaction_medium"]
          mode: Database["public"]["Enums"]["transaction_mode"]
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          txn_type: Database["public"]["Enums"]["transaction_type"]
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_open_account: {
        Args: {
          p_account_type: Database["public"]["Enums"]["account_type"]
          p_branch_id: string
          p_initial_deposit?: number
        }
        Returns: {
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number
          branch_id: string
          created_at: string
          customer_id: string
          id: string
          is_active: boolean
          mode_of_operation: Database["public"]["Enums"]["mode_of_operation"]
          opened_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_transfer: {
        Args: {
          _amount: number
          _description: string
          _dest_account_number: string
          _medium: Database["public"]["Enums"]["transaction_medium"]
          _source_account_id: string
        }
        Returns: {
          account_id: string
          amount: number
          balance_after: number | null
          counterparty_account: string | null
          created_at: string
          description: string | null
          id: string
          medium: Database["public"]["Enums"]["transaction_medium"]
          mode: Database["public"]["Enums"]["transaction_mode"]
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          txn_type: Database["public"]["Enums"]["transaction_type"]
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_withdraw: {
        Args: {
          _account_id: string
          _amount: number
          _description: string
          _medium: Database["public"]["Enums"]["transaction_medium"]
        }
        Returns: {
          account_id: string
          amount: number
          balance_after: number | null
          counterparty_account: string | null
          created_at: string
          description: string | null
          id: string
          medium: Database["public"]["Enums"]["transaction_medium"]
          mode: Database["public"]["Enums"]["transaction_mode"]
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          txn_type: Database["public"]["Enums"]["transaction_type"]
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_type:
        | "SAVINGS"
        | "CURRENT"
        | "SALARY"
        | "FIXED_DEPOSIT"
        | "RECURRING_DEPOSIT"
      app_role: "admin" | "employee" | "user"
      category: "GENERAL" | "OBC" | "SC" | "ST" | "OTHER"
      gender: "MALE" | "FEMALE" | "OTHER"
      marital_status: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED"
      mode_of_operation:
        | "SINGLE"
        | "JOINT"
        | "EITHER_OR_SURVIVOR"
        | "FORMER_OR_SURVIVOR"
      occupation:
        | "SALARIED"
        | "SELF_EMPLOYED"
        | "BUSINESS"
        | "STUDENT"
        | "RETIRED"
        | "HOMEMAKER"
        | "UNEMPLOYED"
        | "OTHER"
      otp_purpose: "LOGIN" | "TRANSFER" | "KYC" | "REGISTRATION"
      relationship: "SPOUSE" | "PARENT" | "SIBLING" | "CHILD" | "OTHER"
      religion:
        | "HINDU"
        | "MUSLIM"
        | "CHRISTIAN"
        | "SIKH"
        | "BUDDHIST"
        | "JAIN"
        | "OTHER"
      transaction_medium:
        | "CASH"
        | "CHEQUE"
        | "ONLINE"
        | "CARD"
        | "UPI"
        | "NEFT"
        | "RTGS"
        | "IMPS"
      transaction_mode: "CREDIT" | "DEBIT"
      transaction_status: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED"
      transaction_type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER"
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
      account_type: [
        "SAVINGS",
        "CURRENT",
        "SALARY",
        "FIXED_DEPOSIT",
        "RECURRING_DEPOSIT",
      ],
      app_role: ["admin", "employee", "user"],
      category: ["GENERAL", "OBC", "SC", "ST", "OTHER"],
      gender: ["MALE", "FEMALE", "OTHER"],
      marital_status: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
      mode_of_operation: [
        "SINGLE",
        "JOINT",
        "EITHER_OR_SURVIVOR",
        "FORMER_OR_SURVIVOR",
      ],
      occupation: [
        "SALARIED",
        "SELF_EMPLOYED",
        "BUSINESS",
        "STUDENT",
        "RETIRED",
        "HOMEMAKER",
        "UNEMPLOYED",
        "OTHER",
      ],
      otp_purpose: ["LOGIN", "TRANSFER", "KYC", "REGISTRATION"],
      relationship: ["SPOUSE", "PARENT", "SIBLING", "CHILD", "OTHER"],
      religion: [
        "HINDU",
        "MUSLIM",
        "CHRISTIAN",
        "SIKH",
        "BUDDHIST",
        "JAIN",
        "OTHER",
      ],
      transaction_medium: [
        "CASH",
        "CHEQUE",
        "ONLINE",
        "CARD",
        "UPI",
        "NEFT",
        "RTGS",
        "IMPS",
      ],
      transaction_mode: ["CREDIT", "DEBIT"],
      transaction_status: ["PENDING", "SUCCESS", "FAILED", "REVERSED"],
      transaction_type: ["DEPOSIT", "WITHDRAWAL", "TRANSFER"],
    },
  },
} as const
