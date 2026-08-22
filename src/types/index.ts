import type { Database } from '@/integrations/supabase/type'

export type { Database } from '@/integrations/supabase/type'
export type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/type'

type PublicTables = Database['public']['Tables']

export type PerfilRow              = PublicTables['perfis']['Row']
export type ClienteDbRow           = PublicTables['clientes']['Row']
export type ClienteDbInsert        = PublicTables['clientes']['Insert']
export type TipoProjetoRow         = PublicTables['tipos_projeto']['Row']
export type ProjetoDbRow           = PublicTables['projetos']['Row']
export type ProjetoDbInsert        = PublicTables['projetos']['Insert']
export type CategoriaCatalogoRow   = PublicTables['categorias_catalogo']['Row']
export type CategoriaProjetoRow    = PublicTables['categorias_projeto']['Row']
export type ItemCustoRow           = PublicTables['itens_custo']['Row']
export type CampoOperacionalRow    = PublicTables['campos_operacionais']['Row']
export type SimulacaoRow           = PublicTables['simulacoes']['Row']
export type RevisaoRow             = PublicTables['revisoes']['Row']
export type LancamentoRow          = PublicTables['lancamentos']['Row']

export type Papel = PerfilRow['papel']

// add_categoria/carregar_template_exemplo retornam jsonb — o gerador não
// enxerga a forma de jsonb_build_object/jsonb_agg, escrever à mão (ver
// skills/supabase.md do vault: "retorno precisa de mapa manual").
export interface AddCategoriaReturns {
  categoria: CategoriaProjetoRow
  catalogo:  CategoriaCatalogoRow
}

export interface CarregarTemplateExemploItem {
  categoria: CategoriaProjetoRow
  catalogo:  CategoriaCatalogoRow
  itens:     ItemCustoRow[]
}

// obter_relatorio_publico: quando não há simulação ainda, `simulacao` não
// vem `null` — vem um registro com todo campo `null` (to_jsonb de composite
// vazio em plpgsql). Checar `simulacao?.id` pra saber se existe de verdade,
// nunca truthiness do objeto inteiro.
export interface RelatorioPublicoReturns {
  projeto:    ProjetoDbRow
  cliente:    ClienteDbRow
  categorias: CarregarTemplateExemploItem[]
  simulacao:  SimulacaoRow
}
