import type { Lang } from './LangContext'

export const clientesT: Record<Lang, {
  headerTitle:       string
  headerSubtitle:    string
  newProject:        string
  activesBadge:      (n: number) => string
  searchPlaceholder: string
  filterAll:         string
  filterActive:      string
  filterWaiting:     string
  filterDone:        string
  colProject:        string
  colStatus:         string
  colRev:            string
  colExpected:       string
  colUpdated:        string
  empty:             string
  statusActive:      string
  statusWaiting:     string
  statusDone:        string
  actionCategories:  string
  actionComplete:    string
  actionArchive:     string
  menuAriaLabel:     string
  // ClienteModal
  modalTitle:        string
  labelClient:       string
  labelProject:      string
  labelExpected:     string
  placeholderClient:  string
  placeholderProject: string
  placeholderExpected: string
  cancel:            string
  create:            string
  justNow:           string
}> = {
  'pt-BR': {
    headerTitle:       'Clientes e projetos',
    headerSubtitle:    'Todos os projetos de provisionamento de ARO em andamento',
    newProject:        '+ Novo projeto',
    activesBadge:      (n) => `${n} ativos`,
    searchPlaceholder: 'Buscar por cliente ou projeto...',
    filterAll:         'Todos',
    filterActive:      'Em andamento',
    filterWaiting:     'Aguardando cliente',
    filterDone:        'Concluídos',
    colProject:        'CLIENTE / PROJETO',
    colStatus:         'STATUS',
    colRev:            'REV. ATUAL',
    colExpected:       'ESPERADO',
    colUpdated:        'ÚLTIMA ATUALIZAÇÃO',
    empty:             'Nenhum projeto encontrado.',
    statusActive:      'Em andamento',
    statusWaiting:     'Aguardando cliente',
    statusDone:        'Concluído',
    actionCategories:  'Ver categorias de custo',
    actionComplete:    'Marcar como concluído',
    actionArchive:     'Arquivar projeto',
    menuAriaLabel:     'Ações do projeto',
    modalTitle:        'Novo projeto',
    labelClient:       'Cliente',
    labelProject:      'Nome do projeto',
    labelExpected:     'Custo esperado (R$ M)',
    placeholderClient:  'Ex: NX Gold',
    placeholderProject: 'Ex: Fechamento de Mina — ARO',
    placeholderExpected: 'Ex: 38,5',
    cancel:            'Cancelar',
    create:            'Criar projeto',
    justNow:           'agora mesmo',
  },
  'en': {
    headerTitle:       'Clients and projects',
    headerSubtitle:    'All ARO provisioning projects in progress',
    newProject:        '+ New project',
    activesBadge:      (n) => `${n} active`,
    searchPlaceholder: 'Search by client or project...',
    filterAll:         'All',
    filterActive:      'In progress',
    filterWaiting:     'Awaiting client',
    filterDone:        'Completed',
    colProject:        'CLIENT / PROJECT',
    colStatus:         'STATUS',
    colRev:            'CURRENT REV.',
    colExpected:       'EXPECTED',
    colUpdated:        'LAST UPDATE',
    empty:             'No projects found.',
    statusActive:      'In progress',
    statusWaiting:     'Awaiting client',
    statusDone:        'Completed',
    actionCategories:  'View cost categories',
    actionComplete:    'Mark as completed',
    actionArchive:     'Archive project',
    menuAriaLabel:     'Project actions',
    modalTitle:        'New project',
    labelClient:       'Client',
    labelProject:      'Project name',
    labelExpected:     'Expected cost (R$ M)',
    placeholderClient:  'e.g.: NX Gold',
    placeholderProject: 'e.g.: Mine Closure — ARO',
    placeholderExpected: 'e.g.: 38.5',
    cancel:            'Cancel',
    create:            'Create project',
    justNow:           'just now',
  },
  'es': {
    headerTitle:       'Clientes y proyectos',
    headerSubtitle:    'Todos los proyectos de provisión ARO en curso',
    newProject:        '+ Nuevo proyecto',
    activesBadge:      (n) => `${n} activos`,
    searchPlaceholder: 'Buscar por cliente o proyecto...',
    filterAll:         'Todos',
    filterActive:      'En curso',
    filterWaiting:     'En espera del cliente',
    filterDone:        'Completados',
    colProject:        'CLIENTE / PROYECTO',
    colStatus:         'ESTADO',
    colRev:            'REV. ACTUAL',
    colExpected:       'ESPERADO',
    colUpdated:        'ÚLTIMA ACTUALIZACIÓN',
    empty:             'No se encontraron proyectos.',
    statusActive:      'En curso',
    statusWaiting:     'En espera del cliente',
    statusDone:        'Completado',
    actionCategories:  'Ver categorías de costo',
    actionComplete:    'Marcar como completado',
    actionArchive:     'Archivar proyecto',
    menuAriaLabel:     'Acciones del proyecto',
    modalTitle:        'Nuevo proyecto',
    labelClient:       'Cliente',
    labelProject:      'Nombre del proyecto',
    labelExpected:     'Costo esperado (R$ M)',
    placeholderClient:  'Ej: NX Gold',
    placeholderProject: 'Ej: Cierre de Mina — ARO',
    placeholderExpected: 'Ej: 38,5',
    cancel:            'Cancelar',
    create:            'Crear proyecto',
    justNow:           'ahora mismo',
  },
}
