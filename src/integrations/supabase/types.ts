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
      chatbot_configs: {
        Row: {
          bot_name: string
          connection_status: string | null
          created_at: string
          evo_instance_id: string | null
          evo_token: string | null
          evolution_phone: string | null
          id: string
          instance_id_captured: string | null
          instance_name: string | null
          is_active: boolean | null
          last_status_check: string | null
          phone_connected: string | null
          phone_number: string | null
          qr_completed: boolean | null
          real_instance_id: string | null
          service_type: string
          tone: string
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          bot_name: string
          connection_status?: string | null
          created_at?: string
          evo_instance_id?: string | null
          evo_token?: string | null
          evolution_phone?: string | null
          id?: string
          instance_id_captured?: string | null
          instance_name?: string | null
          is_active?: boolean | null
          last_status_check?: string | null
          phone_connected?: string | null
          phone_number?: string | null
          qr_completed?: boolean | null
          real_instance_id?: string | null
          service_type: string
          tone: string
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          bot_name?: string
          connection_status?: string | null
          created_at?: string
          evo_instance_id?: string | null
          evo_token?: string | null
          evolution_phone?: string | null
          id?: string
          instance_id_captured?: string | null
          instance_name?: string | null
          is_active?: boolean | null
          last_status_check?: string | null
          phone_connected?: string | null
          phone_number?: string | null
          qr_completed?: boolean | null
          real_instance_id?: string | null
          service_type?: string
          tone?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          last_message_at: string | null
          status: string | null
          unread_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          unread_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          unread_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          API_EVO: string | null
          created_at: string
          email: string | null
          id: number
          telefone: string
          updated_at: string
          user_id: string
          user_nome: string
        }
        Insert: {
          API_EVO?: string | null
          created_at?: string
          email?: string | null
          id?: number
          telefone: string
          updated_at?: string
          user_id: string
          user_nome: string
        }
        Update: {
          API_EVO?: string | null
          created_at?: string
          email?: string | null
          id?: number
          telefone?: string
          updated_at?: string
          user_id?: string
          user_nome?: string
        }
        Relationships: []
      }
      consulta: {
        Row: {
          created_at: string
          email: string | null
          horario: string
          id: number
          id_evento: string | null
          nome_cliente: string
          profissional: string | null
          protocolo: string
          telefone: string
          tipo_atendimento: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          horario: string
          id?: number
          id_evento?: string | null
          nome_cliente: string
          profissional?: string | null
          protocolo: string
          telefone: string
          tipo_atendimento: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          horario?: string
          id?: number
          id_evento?: string | null
          nome_cliente?: string
          profissional?: string | null
          protocolo?: string
          telefone?: string
          tipo_atendimento?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          is_blocked: boolean | null
          last_interaction: string | null
          name: string
          notes: string | null
          phone: string
          tags: string[] | null
          updated_at: string
          user_id: string
          whatsapp_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_blocked?: boolean | null
          last_interaction?: string | null
          name: string
          notes?: string | null
          phone: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
          whatsapp_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_blocked?: boolean | null
          last_interaction?: string | null
          name?: string
          notes?: string | null
          phone?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          whatsapp_id?: string | null
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          ativo: boolean | null
          bot_message: string
          created_at: string
          id: number
          Instance_ID: string | null
          message_type: string | null
          telefone: string
          updated_at: string
          user_id: string | null
          user_message: string
        }
        Insert: {
          ativo?: boolean | null
          bot_message: string
          created_at?: string
          id?: number
          Instance_ID?: string | null
          message_type?: string | null
          telefone: string
          updated_at?: string
          user_id?: string | null
          user_message: string
        }
        Update: {
          ativo?: boolean | null
          bot_message?: string
          created_at?: string
          id?: number
          Instance_ID?: string | null
          message_type?: string | null
          telefone?: string
          updated_at?: string
          user_id?: string | null
          user_message?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          contact_id: string
          content: string
          created_at: string
          direction: string
          id: string
          message_type: string | null
          metadata: Json | null
          status: string | null
          user_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          chat_id: string
          contact_id: string
          content: string
          created_at?: string
          direction: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          status?: string | null
          user_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          chat_id?: string
          contact_id?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          status?: string | null
          user_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          area: string | null
          company: string | null
          connection_status: string | null
          created_at: string | null
          email: string | null
          id: string
          instance_id: string | null
          instance_name: string | null
          name: string | null
          qr_code_required: boolean | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          area?: string | null
          company?: string | null
          connection_status?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          instance_id?: string | null
          instance_name?: string | null
          name?: string | null
          qr_code_required?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          area?: string | null
          company?: string | null
          connection_status?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instance_id?: string | null
          instance_name?: string | null
          name?: string | null
          qr_code_required?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
