export interface CategoryItem {
  id: string
  name: string
  unit: string
  min: string
  max: string
  source: string
}

export interface Category {
  id: string
  name: string
  preenche: 'Consultor' | 'Ambos'
  expanded: boolean
  justAdded: boolean
  items: CategoryItem[]
}
