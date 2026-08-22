export interface CategoryItem {
  id: string
  name: string
  unit: string
  min: string
  max: string
  source: string
  aplicabilidade: string
  anoPrevisto: string
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
