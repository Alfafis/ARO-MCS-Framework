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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      campos_operacionais: {
        Row: {
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          id: string
          label: string
          status: string
          unidade: string | null
          valor: string | null
        }
        Insert: {
          atualizado_em?: string
          categoria_projeto_id: string
          criado_em?: string
          id?: string
          label: string
          status?: string
          unidade?: string | null
          valor?: string | null
        }
        Update: {
          atualizado_em?: string
          categoria_projeto_id?: string
          criado_em?: string
          id?: string
          label?: string
          status?: string
          unidade?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campos_operacionais_categoria_projeto_id_fkey"
            columns: ["categoria_projeto_id"]
            isOneToOne: false
            referencedRelation: "categorias_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_catalogo: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id?: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
      categorias_projeto: {
        Row: {
          catalogo_id: string
          criado_em: string
          id: string
          ordem: number
          preenche: string
          projeto_id: string
        }
        Insert: {
          catalogo_id: string
          criado_em?: string
          id?: string
          ordem?: number
          preenche?: string
          projeto_id: string
        }
        Update: {
          catalogo_id?: string
          criado_em?: string
          id?: string
          ordem?: number
          preenche?: string
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_projeto_catalogo_id_fkey"
            columns: ["catalogo_id"]
            isOneToOne: false
            referencedRelation: "categorias_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_projeto_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          criado_em: string
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      codigos_acesso: {
        Row: {
          atualizado_em: string
          codigo: string
          criado_em: string
          id: string
          projeto_id: string
        }
        Insert: {
          atualizado_em?: string
          codigo: string
          criado_em?: string
          id?: string
          projeto_id: string
        }
        Update: {
          atualizado_em?: string
          codigo?: string
          criado_em?: string
          id?: string
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "codigos_acesso_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_custo: {
        Row: {
          ano_previsto: string | null
          aplicabilidade: string | null
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          fonte: string | null
          id: string
          nome: string
          ordem: number
          unidade: string
        }
        Insert: {
          ano_previsto?: string | null
          aplicabilidade?: string | null
          atualizado_em?: string
          categoria_projeto_id: string
          criado_em?: string
          custo_max: number
          custo_min: number
          fonte?: string | null
          id?: string
          nome: string
          ordem?: number
          unidade: string
        }
        Update: {
          ano_previsto?: string | null
          aplicabilidade?: string | null
          atualizado_em?: string
          categoria_projeto_id?: string
          criado_em?: string
          custo_max?: number
          custo_min?: number
          fonte?: string | null
          id?: string
          nome?: string
          ordem?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_custo_categoria_projeto_id_fkey"
            columns: ["categoria_projeto_id"]
            isOneToOne: false
            referencedRelation: "categorias_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          anexo: string | null
          atualizado_em: string
          categoria: string
          criado_em: string
          id: string
          periodo: string
          projeto_id: string
          status: string
          valor: number
        }
        Insert: {
          anexo?: string | null
          atualizado_em?: string
          categoria: string
          criado_em?: string
          id?: string
          periodo: string
          projeto_id: string
          status?: string
          valor?: number
        }
        Update: {
          anexo?: string | null
          atualizado_em?: string
          categoria?: string
          criado_em?: string
          id?: string
          periodo?: string
          projeto_id?: string
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          criado_em: string
          id: string
          papel: string
        }
        Insert: {
          criado_em?: string
          id: string
          papel?: string
        }
        Update: {
          criado_em?: string
          id?: string
          papel?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          atualizado_em: string
          cliente_id: string
          contingencia_pct: number
          criado_em: string
          data_base: string
          id: string
          metodo_atualizacao: string
          moeda: string
          nome: string
          rev: string
          status: string
          tipo_projeto_id: string
        }
        Insert: {
          atualizado_em?: string
          cliente_id: string
          contingencia_pct?: number
          criado_em?: string
          data_base: string
          id?: string
          metodo_atualizacao?: string
          moeda?: string
          nome: string
          rev?: string
          status?: string
          tipo_projeto_id: string
        }
        Update: {
          atualizado_em?: string
          cliente_id?: string
          contingencia_pct?: number
          criado_em?: string
          data_base?: string
          id?: string
          metodo_atualizacao?: string
          moeda?: string
          nome?: string
          rev?: string
          status?: string
          tipo_projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_tipo_projeto_id_fkey"
            columns: ["tipo_projeto_id"]
            isOneToOne: false
            referencedRelation: "tipos_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      revisoes: {
        Row: {
          atualizado_em: string
          codigo: string
          criado_em: string
          hash: string | null
          id: string
          itens: string[]
          projeto_id: string
          publicado_em: string | null
          status: string
        }
        Insert: {
          atualizado_em?: string
          codigo: string
          criado_em?: string
          hash?: string | null
          id?: string
          itens?: string[]
          projeto_id: string
          publicado_em?: string | null
          status?: string
        }
        Update: {
          atualizado_em?: string
          codigo?: string
          criado_em?: string
          hash?: string | null
          id?: string
          itens?: string[]
          projeto_id?: string
          publicado_em?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "revisoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacoes: {
        Row: {
          active_categories: string[]
          confidence_level: number
          criado_em: string
          distribuicao: string
          id: string
          iteracoes: string
          projeto_id: string
          resultado: Json
        }
        Insert: {
          active_categories?: string[]
          confidence_level: number
          criado_em?: string
          distribuicao: string
          id?: string
          iteracoes: string
          projeto_id: string
          resultado: Json
        }
        Update: {
          active_categories?: string[]
          confidence_level?: number
          criado_em?: string
          distribuicao?: string
          id?: string
          iteracoes?: string
          projeto_id?: string
          resultado?: Json
        }
        Relationships: [
          {
            foreignKeyName: "simulacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_projeto: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_categoria: { Args: { p_projeto_id: string }; Returns: Json }
      add_item_custo: {
        Args: { p_categoria_projeto_id: string }
        Returns: {
          ano_previsto: string | null
          aplicabilidade: string | null
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          fonte: string | null
          id: string
          nome: string
          ordem: number
          unidade: string
        }
        SetofOptions: {
          from: "*"
          to: "itens_custo"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      arquivar_projeto: { Args: { p_id: string }; Returns: undefined }
      atualizar_status_lancamento: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      carregar_template_exemplo: {
        Args: { p_categorias: Json; p_projeto_id: string }
        Returns: Json
      }
      concluir_projeto: { Args: { p_id: string }; Returns: undefined }
      create_cliente: {
        Args: { p_nome: string }
        Returns: {
          criado_em: string
          id: string
          nome: string
        }
        SetofOptions: {
          from: "*"
          to: "clientes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_projeto: {
        Args: {
          p_cliente_id: string
          p_nome: string
          p_tipo_projeto_id: string
        }
        Returns: {
          atualizado_em: string
          cliente_id: string
          contingencia_pct: number
          criado_em: string
          data_base: string
          id: string
          metodo_atualizacao: string
          moeda: string
          nome: string
          rev: string
          status: string
          tipo_projeto_id: string
        }
        SetofOptions: {
          from: "*"
          to: "projetos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      criar_lancamento: {
        Args: {
          p_categoria: string
          p_periodo: string
          p_projeto_id: string
          p_valor: number
        }
        Returns: {
          anexo: string | null
          atualizado_em: string
          categoria: string
          criado_em: string
          id: string
          periodo: string
          projeto_id: string
          status: string
          valor: number
        }
        SetofOptions: {
          from: "*"
          to: "lancamentos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      criar_revisao_rascunho: {
        Args: { p_projeto_id: string }
        Returns: {
          atualizado_em: string
          codigo: string
          criado_em: string
          hash: string | null
          id: string
          itens: string[]
          projeto_id: string
          publicado_em: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "revisoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      definir_codigo_acesso: {
        Args: { p_codigo: string; p_projeto_id: string }
        Returns: string
      }
      find_or_create_categoria_catalogo: {
        Args: { p_nome: string }
        Returns: {
          id: string
          nome: string
        }
        SetofOptions: {
          from: "*"
          to: "categorias_catalogo"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      gerar_codigo_acesso: { Args: { p_projeto_id: string }; Returns: string }
      is_consultor: { Args: never; Returns: boolean }
      obter_codigo_acesso: { Args: { p_projeto_id: string }; Returns: string }
      obter_relatorio_publico: {
        Args: { p_codigo?: string; p_projeto_id: string }
        Returns: Json
      }
      publicar_revisao: {
        Args: { p_id: string; p_itens: string[] }
        Returns: {
          atualizado_em: string
          codigo: string
          criado_em: string
          hash: string | null
          id: string
          itens: string[]
          projeto_id: string
          publicado_em: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "revisoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_simulacao: {
        Args: {
          p_active_categories: string[]
          p_confidence_level: number
          p_distribuicao: string
          p_iteracoes: string
          p_projeto_id: string
          p_resultado: Json
        }
        Returns: {
          active_categories: string[]
          confidence_level: number
          criado_em: string
          distribuicao: string
          id: string
          iteracoes: string
          projeto_id: string
          resultado: Json
        }
        SetofOptions: {
          from: "*"
          to: "simulacoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_item_custo: { Args: { p_id: string }; Returns: undefined }
      remover_categoria_projeto: { Args: { p_id: string }; Returns: undefined }
      remover_lancamento: { Args: { p_id: string }; Returns: undefined }
      renomear_categoria_catalogo: {
        Args: { p_id: string; p_novo_nome: string }
        Returns: {
          id: string
          nome: string
        }
        SetofOptions: {
          from: "*"
          to: "categorias_catalogo"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      salvar_rascunho_revisao: {
        Args: { p_id: string; p_itens: string[] }
        Returns: {
          atualizado_em: string
          codigo: string
          criado_em: string
          hash: string | null
          id: string
          itens: string[]
          projeto_id: string
          publicado_em: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "revisoes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_categoria_preenche: {
        Args: { p_id: string; p_preenche: string }
        Returns: undefined
      }
      update_item_custo: {
        Args: { p_id: string; p_patch: Json }
        Returns: {
          ano_previsto: string | null
          aplicabilidade: string | null
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          fonte: string | null
          id: string
          nome: string
          ordem: number
          unidade: string
        }
        SetofOptions: {
          from: "*"
          to: "itens_custo"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
