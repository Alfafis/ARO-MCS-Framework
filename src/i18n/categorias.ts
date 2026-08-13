import type { Lang } from './LangContext'

export const categoriasT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
  saveDraft:        string
  saveAndContinue:  string
  // ProjectDataCard
  projectData:      string
  client:           string
  projectType:      string
  baseDate:         string
  currency:         string
  updateMethod:     string
  contingency:      string
  // tipo options
  tipoAro:          string
  tipoPlano:        string
  tipoProgressao:   string
  tipoCenarios:     string
  // metodo options
  metodoDef:        string
  metodoIpca:       string
  metodoSimples:    string
  metodoCompostos:  string
  metodoInflacao:   string
  // CategoryBlock
  categoriesTitle:  string
  newCategory:      string
  newCategoryBtn:   string
  fills:            string
  collapseCategory: string
  expandCategory:   string
  deleteCategory:   string
  colItem:          string
  colUnit:          string
  colCostMin:       string
  colCostMax:       string
  colSource:        string
  addItem:          string
  deleteItem:       string
}> = {
  'pt-BR': {
    headerTitle:      'Fechamento de Mina — ARO',
    headerSubtitle:   'NX Gold · Categorias de custo e itens',
    saveDraft:        'Salvar rascunho',
    saveAndContinue:  'Salvar e continuar',
    projectData:      'Dados do projeto',
    client:           'Cliente',
    projectType:      'Tipo de projeto',
    baseDate:         'Data-base',
    currency:         'Moeda',
    updateMethod:     'Método de atualização',
    contingency:      'Contingência aplicada',
    tipoAro:          'ARO — Fechamento de mina',
    tipoPlano:        'Plano de fechamento',
    tipoProgressao:   'Relatório de progressão',
    tipoCenarios:     'Estudo de cenários',
    metodoDef:        'A definir',
    metodoIpca:       'Escalonamento (IPCA)',
    metodoSimples:    'Juros simples 10,75%',
    metodoCompostos:  'Juros compostos 10,75%',
    metodoInflacao:   'Inflação constante 3,4%',
    categoriesTitle:  'Categorias de custo',
    newCategory:      '+ Nova categoria',
    newCategoryBtn:   '+ Nova categoria de custo',
    fills:            'Preenche:',
    collapseCategory: 'Recolher categoria',
    expandCategory:   'Expandir categoria',
    deleteCategory:   'Excluir categoria',
    colItem:          'Item',
    colUnit:          'Unidade',
    colCostMin:       'Custo Min',
    colCostMax:       'Custo Max',
    colSource:        'Fonte',
    addItem:          '+ Adicionar item',
    deleteItem:       'Excluir item',
  },
  'en': {
    headerTitle:      'Mine Closure — ARO',
    headerSubtitle:   'NX Gold · Cost categories and items',
    saveDraft:        'Save draft',
    saveAndContinue:  'Save and continue',
    projectData:      'Project data',
    client:           'Client',
    projectType:      'Project type',
    baseDate:         'Base date',
    currency:         'Currency',
    updateMethod:     'Update method',
    contingency:      'Applied contingency',
    tipoAro:          'ARO — Mine closure',
    tipoPlano:        'Closure plan',
    tipoProgressao:   'Progression report',
    tipoCenarios:     'Scenario study',
    metodoDef:        'To be defined',
    metodoIpca:       'Escalation (IPCA)',
    metodoSimples:    'Simple interest 10.75%',
    metodoCompostos:  'Compound interest 10.75%',
    metodoInflacao:   'Constant inflation 3.4%',
    categoriesTitle:  'Cost categories',
    newCategory:      '+ New category',
    newCategoryBtn:   '+ New cost category',
    fills:            'Filled by:',
    collapseCategory: 'Collapse category',
    expandCategory:   'Expand category',
    deleteCategory:   'Delete category',
    colItem:          'Item',
    colUnit:          'Unit',
    colCostMin:       'Min Cost',
    colCostMax:       'Max Cost',
    colSource:        'Source',
    addItem:          '+ Add item',
    deleteItem:       'Delete item',
  },
  'es': {
    headerTitle:      'Cierre de Mina — ARO',
    headerSubtitle:   'NX Gold · Categorías de costo e ítems',
    saveDraft:        'Guardar borrador',
    saveAndContinue:  'Guardar y continuar',
    projectData:      'Datos del proyecto',
    client:           'Cliente',
    projectType:      'Tipo de proyecto',
    baseDate:         'Fecha base',
    currency:         'Moneda',
    updateMethod:     'Método de actualización',
    contingency:      'Contingencia aplicada',
    tipoAro:          'ARO — Cierre de mina',
    tipoPlano:        'Plan de cierre',
    tipoProgressao:   'Informe de progresión',
    tipoCenarios:     'Estudio de escenarios',
    metodoDef:        'A definir',
    metodoIpca:       'Escalonamiento (IPCA)',
    metodoSimples:    'Interés simple 10,75%',
    metodoCompostos:  'Interés compuesto 10,75%',
    metodoInflacao:   'Inflación constante 3,4%',
    categoriesTitle:  'Categorías de costo',
    newCategory:      '+ Nueva categoría',
    newCategoryBtn:   '+ Nueva categoría de costo',
    fills:            'Completa:',
    collapseCategory: 'Contraer categoría',
    expandCategory:   'Expandir categoría',
    deleteCategory:   'Eliminar categoría',
    colItem:          'Ítem',
    colUnit:          'Unidad',
    colCostMin:       'Costo Mín',
    colCostMax:       'Costo Máx',
    colSource:        'Fuente',
    addItem:          '+ Agregar ítem',
    deleteItem:       'Eliminar ítem',
  },
}
