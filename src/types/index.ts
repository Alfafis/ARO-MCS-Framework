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
export type ParametroGlobalRow     = PublicTables['parametros_globais']['Row']
export type ParametroAnualRow      = PublicTables['parametros_anuais']['Row']
export type CategoriaTemplateRow   = PublicTables['categorias_template']['Row']
export type ItemTemplateRow        = PublicTables['itens_template']['Row']
export type SetorRow               = PublicTables['setores']['Row']
export type DesembolsoItemAnoRow          = PublicTables['desembolso_item_ano']['Row']
export type DesembolsoItemTemplateAnoRow  = PublicTables['desembolso_item_template_ano']['Row']

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
  // itens_custo com embed do desembolso ano-a-ano quando existir
  itens:     (ItemCustoRow & { desembolso_item_ano?: DesembolsoItemAnoRow[] | null })[]
}

export interface TemplateAddCategoriaReturns {
  categoria: CategoriaTemplateRow
  catalogo:  CategoriaCatalogoRow
}

// obter_relatorio_publico: quando não há simulação ainda, `simulacao` não
// vem `null` — vem um registro com todo campo `null` (to_jsonb de composite
// vazio em plpgsql). Checar `simulacao?.id` pra saber se existe de verdade,
// nunca truthiness do objeto inteiro.
export interface RelatorioPublicoReturns {
  projeto:           ProjetoDbRow
  cliente:           ClienteDbRow
  categorias:        CarregarTemplateExemploItem[]
  simulacao:         SimulacaoRow
  parametrosGlobais: ParametroGlobalRow[]
  parametrosAnuais:  ParametroAnualRow[]
  setores:           SetorRow[]
}
