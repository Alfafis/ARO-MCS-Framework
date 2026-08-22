import type { Lang } from './LangContext'

export const categoriasT: Record<Lang, {
  headerTitle:      string
  createCategoryBtn: string
  // CategoryBlock
  categoriesTitle:  string
  emptyCategoriesMessage: string
  loadExampleBtn:   (nome: string) => string
  fills:            string
  collapseCategory: string
  expandCategory:   string
  deleteCategory:   string
  colItem:          string
  colUnit:          string
  colCostMin:       string
  colCostMax:       string
  colSource:        string
  colAplicabilidade: string
  colAno:           string
  addItem:          string
  deleteItem:       string
}> = {
  'pt-BR': {
    headerTitle:      'Categorias',
    createCategoryBtn: '+ Criar categoria',
    categoriesTitle:  'Categorias de custo',
    emptyCategoriesMessage: 'Nenhuma categoria cadastrada ainda. Comece do zero ou carregue um exemplo pra ganhar tempo.',
    loadExampleBtn:   (nome) => `Carregar exemplo: ${nome}`,
    fills:            'Preenche:',
    collapseCategory: 'Recolher categoria',
    expandCategory:   'Expandir categoria',
    deleteCategory:   'Excluir categoria',
    colItem:          'Item',
    colUnit:          'Unidade',
    colCostMin:       'Custo Min',
    colCostMax:       'Custo Max',
    colSource:        'Fonte',
    colAplicabilidade: 'Aplicabilidade',
    colAno:           'Ano previsto',
    addItem:          '+ Adicionar item',
    deleteItem:       'Excluir item',
  },
  'en': {
    headerTitle:      'Categories',
    createCategoryBtn: '+ Create category',
    categoriesTitle:  'Cost categories',
    emptyCategoriesMessage: 'No categories yet. Start from scratch or load an example to save time.',
    loadExampleBtn:   (nome) => `Load example: ${nome}`,
    fills:            'Filled by:',
    collapseCategory: 'Collapse category',
    expandCategory:   'Expand category',
    deleteCategory:   'Delete category',
    colItem:          'Item',
    colUnit:          'Unit',
    colCostMin:       'Min Cost',
    colCostMax:       'Max Cost',
    colSource:        'Source',
    colAplicabilidade: 'Applicability',
    colAno:           'Expected year',
    addItem:          '+ Add item',
    deleteItem:       'Delete item',
  },
  'es': {
    headerTitle:      'Categorías',
    createCategoryBtn: '+ Crear categoría',
    categoriesTitle:  'Categorías de costo',
    emptyCategoriesMessage: 'Todavía no hay categorías. Empieza de cero o carga un ejemplo para ganar tiempo.',
    loadExampleBtn:   (nome) => `Cargar ejemplo: ${nome}`,
    fills:            'Completa:',
    collapseCategory: 'Contraer categoría',
    expandCategory:   'Expandir categoría',
    deleteCategory:   'Eliminar categoría',
    colItem:          'Ítem',
    colUnit:          'Unidad',
    colCostMin:       'Costo Mín',
    colCostMax:       'Costo Máx',
    colSource:        'Fuente',
    colAplicabilidade: 'Aplicabilidad',
    colAno:           'Año previsto',
    addItem:          '+ Agregar ítem',
    deleteItem:       'Eliminar ítem',
  },
}
