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
      campos_operacionais: {
        Row: {
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          formula: string | null
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
          formula?: string | null
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
          formula?: string | null
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
      campos_operacionais_template: {
        Row: {
          categoria_template_id: string
          criado_em: string
          formula: string | null
          id: string
          label: string
          ordem: number
          unidade: string | null
          valor_referencia: string | null
        }
        Insert: {
          categoria_template_id: string
          criado_em?: string
          formula?: string | null
          id?: string
          label: string
          ordem?: number
          unidade?: string | null
          valor_referencia?: string | null
        }
        Update: {
          categoria_template_id?: string
          criado_em?: string
          formula?: string | null
          id?: string
          label?: string
          ordem?: number
          unidade?: string | null
          valor_referencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campos_operacionais_template_categoria_template_id_fkey"
            columns: ["categoria_template_id"]
            isOneToOne: false
            referencedRelation: "categorias_template"
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
          custo_provavel: number | null
          id: string
          ordem: number
          preenche: string
          projeto_id: string
        }
        Insert: {
          catalogo_id: string
          criado_em?: string
          custo_provavel?: number | null
          id?: string
          ordem?: number
          preenche?: string
          projeto_id: string
        }
        Update: {
          catalogo_id?: string
          criado_em?: string
          custo_provavel?: number | null
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
      categorias_remediacao: {
        Row: {
          area_ha: number | null
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
          ordem: number
          projeto_id: string
        }
        Insert: {
          area_ha?: number | null
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          projeto_id: string
        }
        Update: {
          area_ha?: number | null
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_remediacao_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_template: {
        Row: {
          catalogo_id: string
          criado_em: string
          custo_provavel: number | null
          id: string
          ordem: number
          preenche: string
          tipo_projeto_id: string
        }
        Insert: {
          catalogo_id: string
          criado_em?: string
          custo_provavel?: number | null
          id?: string
          ordem?: number
          preenche?: string
          tipo_projeto_id: string
        }
        Update: {
          catalogo_id?: string
          criado_em?: string
          custo_provavel?: number | null
          id?: string
          ordem?: number
          preenche?: string
          tipo_projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_template_catalogo_id_fkey"
            columns: ["catalogo_id"]
            isOneToOne: false
            referencedRelation: "categorias_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_template_tipo_projeto_id_fkey"
            columns: ["tipo_projeto_id"]
            isOneToOne: false
            referencedRelation: "tipos_projeto"
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
      desembolso_item_ano: {
        Row: {
          ano: number
          item_id: string
          valor: number
        }
        Insert: {
          ano: number
          item_id: string
          valor: number
        }
        Update: {
          ano?: number
          item_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "desembolso_item_ano_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_custo"
            referencedColumns: ["id"]
          },
        ]
      }
      desembolso_item_template_ano: {
        Row: {
          ano: number
          item_template_id: string
          valor: number
        }
        Insert: {
          ano: number
          item_template_id: string
          valor: number
        }
        Update: {
          ano?: number
          item_template_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "desembolso_item_template_ano_item_template_id_fkey"
            columns: ["item_template_id"]
            isOneToOne: false
            referencedRelation: "itens_template"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_custo: {
        Row: {
          ano_fim: number | null
          ano_inicio: number | null
          ano_previsto: string | null
          aplicabilidade: string | null
          aplicabilidade_setores: number[] | null
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          custo_unitario_max: number | null
          custo_unitario_min: number | null
          fase: string | null
          fonte: string | null
          formula_quantidade: string | null
          id: string
          nome: string
          ordem: number
          unidade: string
        }
        Insert: {
          ano_fim?: number | null
          ano_inicio?: number | null
          ano_previsto?: string | null
          aplicabilidade?: string | null
          aplicabilidade_setores?: number[] | null
          atualizado_em?: string
          categoria_projeto_id: string
          criado_em?: string
          custo_max: number
          custo_min: number
          custo_unitario_max?: number | null
          custo_unitario_min?: number | null
          fase?: string | null
          fonte?: string | null
          formula_quantidade?: string | null
          id?: string
          nome: string
          ordem?: number
          unidade: string
        }
        Update: {
          ano_fim?: number | null
          ano_inicio?: number | null
          ano_previsto?: string | null
          aplicabilidade?: string | null
          aplicabilidade_setores?: number[] | null
          atualizado_em?: string
          categoria_projeto_id?: string
          criado_em?: string
          custo_max?: number
          custo_min?: number
          custo_unitario_max?: number | null
          custo_unitario_min?: number | null
          fase?: string | null
          fonte?: string | null
          formula_quantidade?: string | null
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
      itens_remediacao: {
        Row: {
          atualizado_em: string
          categoria_id: string
          criado_em: string
          custo_unit_max: number
          custo_unit_min: number
          descricao: string
          fonte: string | null
          id: string
          ordem: number
          quantidade: number
          unidade: string
        }
        Insert: {
          atualizado_em?: string
          categoria_id: string
          criado_em?: string
          custo_unit_max?: number
          custo_unit_min?: number
          descricao: string
          fonte?: string | null
          id?: string
          ordem?: number
          quantidade?: number
          unidade: string
        }
        Update: {
          atualizado_em?: string
          categoria_id?: string
          criado_em?: string
          custo_unit_max?: number
          custo_unit_min?: number
          descricao?: string
          fonte?: string | null
          id?: string
          ordem?: number
          quantidade?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_remediacao_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_remediacao"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_template: {
        Row: {
          ano_fim: number | null
          ano_inicio: number | null
          ano_previsto: string | null
          aplicabilidade: string | null
          aplicabilidade_setores: number[] | null
          atualizado_em: string
          categoria_template_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          custo_unitario_max: number | null
          custo_unitario_min: number | null
          fase: string | null
          fonte: string | null
          formula_quantidade: string | null
          id: string
          nome: string
          ordem: number
          unidade: string
        }
        Insert: {
          ano_fim?: number | null
          ano_inicio?: number | null
          ano_previsto?: string | null
          aplicabilidade?: string | null
          aplicabilidade_setores?: number[] | null
          atualizado_em?: string
          categoria_template_id: string
          criado_em?: string
          custo_max: number
          custo_min: number
          custo_unitario_max?: number | null
          custo_unitario_min?: number | null
          fase?: string | null
          fonte?: string | null
          formula_quantidade?: string | null
          id?: string
          nome: string
          ordem?: number
          unidade: string
        }
        Update: {
          ano_fim?: number | null
          ano_inicio?: number | null
          ano_previsto?: string | null
          aplicabilidade?: string | null
          aplicabilidade_setores?: number[] | null
          atualizado_em?: string
          categoria_template_id?: string
          criado_em?: string
          custo_max?: number
          custo_min?: number
          custo_unitario_max?: number | null
          custo_unitario_min?: number | null
          fase?: string | null
          fonte?: string | null
          formula_quantidade?: string | null
          id?: string
          nome?: string
          ordem?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_template_categoria_template_id_fkey"
            columns: ["categoria_template_id"]
            isOneToOne: false
            referencedRelation: "categorias_template"
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
      parametros_anuais: {
        Row: {
          ano: number
          atualizado_em: string
          atualizado_por: string | null
          chave: string
          fonte: string
          valor_max: number | null
          valor_min: number | null
        }
        Insert: {
          ano: number
          atualizado_em?: string
          atualizado_por?: string | null
          chave: string
          fonte?: string
          valor_max?: number | null
          valor_min?: number | null
        }
        Update: {
          ano?: number
          atualizado_em?: string
          atualizado_por?: string | null
          chave?: string
          fonte?: string
          valor_max?: number | null
          valor_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parametros_anuais_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      parametros_globais: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          chave: string
          fonte: string
          serie_bcb: number | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          chave: string
          fonte?: string
          serie_bcb?: number | null
          valor: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          chave?: string
          fonte?: string
          serie_bcb?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "parametros_globais_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          criado_em: string
          foto_url: string | null
          id: string
          nome: string | null
          papel: string
          profissao: string | null
          telefone: string | null
        }
        Insert: {
          criado_em?: string
          foto_url?: string | null
          id: string
          nome?: string | null
          papel?: string
          profissao?: string | null
          telefone?: string | null
        }
        Update: {
          criado_em?: string
          foto_url?: string | null
          id?: string
          nome?: string | null
          papel?: string
          profissao?: string | null
          telefone?: string | null
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
          horizonte_anos: number
          id: string
          metodo_atualizacao: string
          moeda: string
          nome: string
          remediacao_habilitada: boolean
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
          horizonte_anos?: number
          id?: string
          metodo_atualizacao?: string
          moeda?: string
          nome: string
          remediacao_habilitada?: boolean
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
          horizonte_anos?: number
          id?: string
          metodo_atualizacao?: string
          moeda?: string
          nome?: string
          remediacao_habilitada?: boolean
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
          incluir_remediacao: boolean
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
          incluir_remediacao?: boolean
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
          incluir_remediacao?: boolean
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
      setores: {
        Row: {
          criado_em: string
          id: number
          nome: string
        }
        Insert: {
          criado_em?: string
          id: number
          nome: string
        }
        Update: {
          criado_em?: string
          id?: number
          nome?: string
        }
        Relationships: []
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
          ano_fim: number | null
          ano_inicio: number | null
          ano_previsto: string | null
          aplicabilidade: string | null
          aplicabilidade_setores: number[] | null
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          custo_unitario_max: number | null
          custo_unitario_min: number | null
          fase: string | null
          fonte: string | null
          formula_quantidade: string | null
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
      atualizar_config_financeira: {
        Args: {
          p_contingencia_pct: number
          p_data_base: string
          p_horizonte_anos: number
          p_metodo_atualizacao: string
          p_moeda: string
          p_projeto_id: string
        }
        Returns: {
          atualizado_em: string
          cliente_id: string
          contingencia_pct: number
          criado_em: string
          data_base: string
          horizonte_anos: number
          id: string
          metodo_atualizacao: string
          moeda: string
          nome: string
          remediacao_habilitada: boolean
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
      atualizar_foto_perfil: {
        Args: { p_foto_url: string }
        Returns: undefined
      }
      atualizar_meu_perfil: {
        Args: { p_nome: string; p_profissao: string; p_telefone: string }
        Returns: {
          criado_em: string
          foto_url: string | null
          id: string
          nome: string | null
          papel: string
          profissao: string | null
          telefone: string | null
        }
        SetofOptions: {
          from: "*"
          to: "perfis"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      atualizar_parametro_anual: {
        Args: {
          p_ano: number
          p_chave: string
          p_fonte?: string
          p_valor_max: number
          p_valor_min: number
        }
        Returns: {
          ano: number
          atualizado_em: string
          atualizado_por: string | null
          chave: string
          fonte: string
          valor_max: number | null
          valor_min: number | null
        }
        SetofOptions: {
          from: "*"
          to: "parametros_anuais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      atualizar_parametro_global: {
        Args: {
          p_chave: string
          p_fonte: string
          p_serie_bcb?: number
          p_valor: number
        }
        Returns: {
          atualizado_em: string
          atualizado_por: string | null
          chave: string
          fonte: string
          serie_bcb: number | null
          valor: number
        }
        SetofOptions: {
          from: "*"
          to: "parametros_globais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      atualizar_status_lancamento: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      carregar_remediacao_padrao: {
        Args: { p_projeto_id: string }
        Returns: undefined
      }
      carregar_template_exemplo: {
        Args: { p_projeto_id: string; p_tipo_projeto_id: string }
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
          horizonte_anos: number
          id: string
          metodo_atualizacao: string
          moeda: string
          nome: string
          remediacao_habilitada: boolean
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
          incluir_remediacao: boolean
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
      criar_tipo_projeto: {
        Args: { p_nome: string }
        Returns: {
          id: string
          nome: string
        }
        SetofOptions: {
          from: "*"
          to: "tipos_projeto"
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
      obter_relatorio_publico_remediacao: {
        Args: { p_projeto_id: string }
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
          incluir_remediacao: boolean
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
      remover_tipo_projeto: { Args: { p_id: string }; Returns: undefined }
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
      renomear_tipo_projeto: {
        Args: { p_id: string; p_novo_nome: string }
        Returns: {
          id: string
          nome: string
        }
        SetofOptions: {
          from: "*"
          to: "tipos_projeto"
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
          incluir_remediacao: boolean
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
      template_add_categoria: {
        Args: { p_tipo_projeto_id: string }
        Returns: Json
      }
      template_add_item: {
        Args: { p_categoria_template_id: string }
        Returns: {
          ano_fim: number | null
          ano_inicio: number | null
          ano_previsto: string | null
          aplicabilidade: string | null
          aplicabilidade_setores: number[] | null
          atualizado_em: string
          categoria_template_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          custo_unitario_max: number | null
          custo_unitario_min: number | null
          fase: string | null
          fonte: string | null
          formula_quantidade: string | null
          id: string
          nome: string
          ordem: number
          unidade: string
        }
        SetofOptions: {
          from: "*"
          to: "itens_template"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      template_remove_categoria: { Args: { p_id: string }; Returns: undefined }
      template_remove_item: { Args: { p_id: string }; Returns: undefined }
      template_update_categoria_custo_provavel: {
        Args: { p_categoria_template_id: string; p_valor: number }
        Returns: undefined
      }
      template_update_categoria_preenche: {
        Args: { p_id: string; p_preenche: string }
        Returns: undefined
      }
      template_update_item: {
        Args: { p_id: string; p_patch: Json }
        Returns: {
          ano_fim: number | null
          ano_inicio: number | null
          ano_previsto: string | null
          aplicabilidade: string | null
          aplicabilidade_setores: number[] | null
          atualizado_em: string
          categoria_template_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          custo_unitario_max: number | null
          custo_unitario_min: number | null
          fase: string | null
          fonte: string | null
          formula_quantidade: string | null
          id: string
          nome: string
          ordem: number
          unidade: string
        }
        SetofOptions: {
          from: "*"
          to: "itens_template"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      template_update_item_desembolso: {
        Args: { p_item_template_id: string; p_valores: Json }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_categoria_custo_provavel: {
        Args: { p_categoria_id: string; p_valor: number }
        Returns: undefined
      }
      update_categoria_preenche: {
        Args: { p_id: string; p_preenche: string }
        Returns: undefined
      }
      update_item_custo: {
        Args: { p_id: string; p_patch: Json }
        Returns: {
          ano_fim: number | null
          ano_inicio: number | null
          ano_previsto: string | null
          aplicabilidade: string | null
          aplicabilidade_setores: number[] | null
          atualizado_em: string
          categoria_projeto_id: string
          criado_em: string
          custo_max: number
          custo_min: number
          custo_unitario_max: number | null
          custo_unitario_min: number | null
          fase: string | null
          fonte: string | null
          formula_quantidade: string | null
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
      update_item_desembolso: {
        Args: { p_item_id: string; p_valores: Json }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
