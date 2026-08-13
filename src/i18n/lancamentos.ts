import type { Lang } from './LangContext'

export const lancamentosT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
  newEntry:         string
  kpiRealized:      string
  kpiValidated:     string
  kpiPending:       string
  searchPlaceholder: string
  filterAll:        string
  filterValidated:  string
  filterReview:     string
  filterPending:    string
  colCategory:      string
  colPeriod:        string
  colValue:         string
  colStatus:        string
  empty:            string
  noAttachment:     string
  statusValidated:  string
  statusReview:     string
  statusPending:    string
  actionValidate:   string
  actionReview:     string
  actionDelete:     string
  menuAriaLabel:    string
  // LancModal
  modalTitle:       string
  labelCategory:    string
  labelPeriod:      string
  labelValue:       string
  placeholderCategory: string
  placeholderPeriod:   string
  placeholderValue:    string
  cancel:           string
  add:              string
}> = {
  'pt-BR': {
    headerTitle:      'Lançamentos realizados',
    headerSubtitle:   'NX Gold · Fechamento de Mina — base do comparativo expectativa vs. realidade',
    newEntry:         'Novo lançamento',
    kpiRealized:      'Realizado em 2026',
    kpiValidated:     'Validados',
    kpiPending:       'Aguardando evidência',
    searchPlaceholder: 'Buscar por categoria...',
    filterAll:        'Todos',
    filterValidated:  'Validados',
    filterReview:     'Em revisão',
    filterPending:    'Pendente evidência',
    colCategory:      'Categoria',
    colPeriod:        'Período',
    colValue:         'Valor real',
    colStatus:        'Status',
    empty:            'Nenhum lançamento encontrado.',
    noAttachment:     'Sem anexo',
    statusValidated:  'Validado',
    statusReview:     'Em revisão',
    statusPending:    'Pendente evidência',
    actionValidate:   'Marcar como validado',
    actionReview:     'Marcar em revisão',
    actionDelete:     'Excluir lançamento',
    menuAriaLabel:    'Ações do lançamento',
    modalTitle:       'Novo lançamento',
    labelCategory:    'Categoria',
    labelPeriod:      'Período',
    labelValue:       'Valor real (R$)',
    placeholderCategory: 'Ex: Barragem',
    placeholderPeriod:   'Ex: Jul/2026',
    placeholderValue:    'Ex: 350.000',
    cancel:           'Cancelar',
    add:              'Adicionar',
  },
  'en': {
    headerTitle:      'Recorded entries',
    headerSubtitle:   'NX Gold · Mine Closure — basis for expected vs. actual comparison',
    newEntry:         'New entry',
    kpiRealized:      'Realized in 2026',
    kpiValidated:     'Validated',
    kpiPending:       'Awaiting evidence',
    searchPlaceholder: 'Search by category...',
    filterAll:        'All',
    filterValidated:  'Validated',
    filterReview:     'In review',
    filterPending:    'Pending evidence',
    colCategory:      'Category',
    colPeriod:        'Period',
    colValue:         'Actual value',
    colStatus:        'Status',
    empty:            'No entries found.',
    noAttachment:     'No attachment',
    statusValidated:  'Validated',
    statusReview:     'In review',
    statusPending:    'Pending evidence',
    actionValidate:   'Mark as validated',
    actionReview:     'Mark in review',
    actionDelete:     'Delete entry',
    menuAriaLabel:    'Entry actions',
    modalTitle:       'New entry',
    labelCategory:    'Category',
    labelPeriod:      'Period',
    labelValue:       'Actual value (R$)',
    placeholderCategory: 'e.g.: Dam',
    placeholderPeriod:   'e.g.: Jul/2026',
    placeholderValue:    'e.g.: 350,000',
    cancel:           'Cancel',
    add:              'Add',
  },
  'es': {
    headerTitle:      'Lanzamientos realizados',
    headerSubtitle:   'NX Gold · Cierre de Mina — base del comparativo expectativa vs. realidad',
    newEntry:         'Nuevo lanzamiento',
    kpiRealized:      'Realizado en 2026',
    kpiValidated:     'Validados',
    kpiPending:       'En espera de evidencia',
    searchPlaceholder: 'Buscar por categoría...',
    filterAll:        'Todos',
    filterValidated:  'Validados',
    filterReview:     'En revisión',
    filterPending:    'Evidencia pendiente',
    colCategory:      'Categoría',
    colPeriod:        'Período',
    colValue:         'Valor real',
    colStatus:        'Estado',
    empty:            'No se encontraron lanzamientos.',
    noAttachment:     'Sin anexo',
    statusValidated:  'Validado',
    statusReview:     'En revisión',
    statusPending:    'Evidencia pendiente',
    actionValidate:   'Marcar como validado',
    actionReview:     'Marcar en revisión',
    actionDelete:     'Eliminar lanzamiento',
    menuAriaLabel:    'Acciones del lanzamiento',
    modalTitle:       'Nuevo lanzamiento',
    labelCategory:    'Categoría',
    labelPeriod:      'Período',
    labelValue:       'Valor real (R$)',
    placeholderCategory: 'Ej: Presa',
    placeholderPeriod:   'Ej: Jul/2026',
    placeholderValue:    'Ej: 350.000',
    cancel:           'Cancelar',
    add:              'Agregar',
  },
}
