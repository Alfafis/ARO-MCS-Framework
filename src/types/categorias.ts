import type { Fase } from './setores'

export interface CategoryItem {
  id:     string
  name:   string
  unit:   string
  min:    string
  max:    string
  source: string

  // Modelagem estruturada (migration 20260824120000_setores_fase_ano.sql).
  // - aplicabilidadeSetores: array de IDs de `setores.id`. null = "todos os
  //   setores" (padrão da planilha para itens genéricos como Estudos e
  //   Monitoramento). Não usar array vazio — sempre null nesse caso.
  // - fase: fase do planejamento; null = "a definir".
  // - anoInicio / anoFim: range 1..20 dentro do horizonte do projeto.
  //   Iguais = ano único. Ambos null = ano não definido.
  aplicabilidadeSetores: number[] | null
  fase:                  Fase | null
  anoInicio:             number | null
  anoFim:                number | null

  // Legado (transitório) — mantidos nullable no banco durante rollout da
  // migration. Nova UI escreve nos campos estruturados acima; fallback só
  // renderiza esses até o backfill rodar.
  aplicabilidade: string
  anoPrevisto:    string

  // Detalhamento de desembolso por ano (`desembolso_item_ano` /
  // `desembolso_item_template_ano`). null = usa fallback uniforme entre
  // anoInicio..anoFim. Array vazio nunca — sempre null nesse caso.
  desembolsoPorAno: DesembolsoAno[] | null
}

// Um par (ano relativo do horizonte, valor). Ordenado por ano na leitura,
// sem duplicata (PK composta no banco).
export interface DesembolsoAno {
  ano:   number
  valor: number
}

// Nome/estrutura da categoria — compartilhado entre todos os projetos do sistema.
// Renomear aqui reflete em todo projeto que referencia este id.
export interface CategoriaCatalogo {
  id:   string
  nome: string
}

// Fato operacional preenchido pelo cliente (área, perímetro, quantidade de estruturas...) —
// formato diferente de CategoryItem: cliente informa fato bruto, não estima custo.
export interface CampoOperacional {
  id:       string
  label:    string
  valor:    string
  unidade:  string
  status:   'pendente' | 'preenchido'
}

// Shape do template (por categoria template, editável pelo admin em
// `/categorias-custo`). Difere de CampoOperacional (por-projeto): não tem
// `status` — template guarda o valor de referência default, não o preenchido.
// `valor_referencia` no banco (text) representa uma quantidade em unidades da
// planilha (ex: "1.643" m, "12,9" ha) e é copiado como padrão quando a
// categoria for herdada em um projeto.
export interface CampoOperacionalTemplate {
  id:              string
  label:           string
  unidade:         string
  valorReferencia: string
  ordem:           number
}

// Instância por projeto — referencia o catálogo pelo nome, mas itens/valores são
// exclusivos deste projeto. Editar um item aqui nunca afeta outro projeto.
// `camposOperacionaisTemplate` só é populado no modo template (admin em
// `/categorias-custo`); no modo projeto fica `undefined`. Foi optado por
// campo opcional em vez de shape separado pra manter `CategoryBlock` único.
export interface Category {
  id:         string
  catalogoId: string
  preenche:   'Consultor' | 'Cliente' | 'Ambos'
  expanded:   boolean
  justAdded:  boolean
  items:      CategoryItem[]
  camposOperacionais: CampoOperacional[]
  camposOperacionaisTemplate?: CampoOperacionalTemplate[]

  // Moda "pela experiência" — F18 da planilha original (`_Dados_Formulas_Planilha.md`).
  // Alimenta o parâmetro `mode` da Aro Simulação Triangular. null = fallback (min+max)/2.
  // Guardado como número puro (não string, diferente de min/max dos items)
  // porque é editado uma única vez com máscara BRL local, não em lista.
  custoProvavel: number | null
}
