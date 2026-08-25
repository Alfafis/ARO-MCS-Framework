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

// Instância por projeto — referencia o catálogo pelo nome, mas itens/valores são
// exclusivos deste projeto. Editar um item aqui nunca afeta outro projeto.
export interface Category {
  id:         string
  catalogoId: string
  preenche:   'Consultor' | 'Cliente' | 'Ambos'
  expanded:   boolean
  justAdded:  boolean
  items:      CategoryItem[]
  camposOperacionais: CampoOperacional[]
}
