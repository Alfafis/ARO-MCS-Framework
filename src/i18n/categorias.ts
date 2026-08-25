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
  colSetores:       string
  colFase:          string
  colAno:           string
  addItem:          string
  deleteItem:       string
  setoresTodos:     string
  setoresNSelecionados: (n: number) => string
  fasePlaceholder:  string
  fasePre:          string
  faseExec:         string
  fasePos:          string
  anoInicioPh:      string
  anoFimPh:         string
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
    colSetores:       'Setores',
    colFase:          'Fase',
    colAno:           'Ano (início→fim)',
    addItem:          '+ Adicionar item',
    deleteItem:       'Excluir item',
    setoresTodos:     'Todos os setores',
    setoresNSelecionados: (n) => `${n} setor${n === 1 ? '' : 'es'}`,
    fasePlaceholder:  'A definir',
    fasePre:          'Pré-fechamento',
    faseExec:         'Fechamento',
    fasePos:          'Pós-fechamento',
    anoInicioPh:      'Ini',
    anoFimPh:         'Fim',
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
    colSetores:       'Sectors',
    colFase:          'Phase',
    colAno:           'Year (start→end)',
    addItem:          '+ Add item',
    deleteItem:       'Delete item',
    setoresTodos:     'All sectors',
    setoresNSelecionados: (n) => `${n} sector${n === 1 ? '' : 's'}`,
    fasePlaceholder:  'To define',
    fasePre:          'Pre-closure',
    faseExec:         'Closure',
    fasePos:          'Post-closure',
    anoInicioPh:      'Start',
    anoFimPh:         'End',
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
    colSetores:       'Sectores',
    colFase:          'Fase',
    colAno:           'Año (inicio→fin)',
    addItem:          '+ Agregar ítem',
    deleteItem:       'Eliminar ítem',
    setoresTodos:     'Todos los sectores',
    setoresNSelecionados: (n) => `${n} sector${n === 1 ? '' : 'es'}`,
    fasePlaceholder:  'A definir',
    fasePre:          'Pre-cierre',
    faseExec:         'Cierre',
    fasePos:          'Post-cierre',
    anoInicioPh:      'Ini',
    anoFimPh:         'Fin',
  },
}
