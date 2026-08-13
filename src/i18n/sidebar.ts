import type { Lang } from './LangContext'

export const sidebarT: Record<Lang, {
  overview:       string
  costCategories: string
  simulation:     string
  launches:       string
  revisions:      string
  clients:        string
  expand:         string
  collapse:       string
  selectLang:     string
  myProfile:      string
  settings:       string
  logout:         string
  openProfile:    string
  consultant:     string
}> = {
  'pt-BR': {
    overview:       'Visão geral',
    costCategories: 'Categorias de custo',
    simulation:     'Simulação',
    launches:       'Lançamentos',
    revisions:      'Revisões',
    clients:        'Clientes',
    expand:         'Expandir menu lateral',
    collapse:       'Recolher menu lateral',
    selectLang:     'Selecionar idioma',
    myProfile:      'Meu perfil',
    settings:       'Configurações',
    logout:         'Sair',
    openProfile:    'Abrir menu do perfil',
    consultant:     'Consultor',
  },
  'en': {
    overview:       'Overview',
    costCategories: 'Cost categories',
    simulation:     'Simulation',
    launches:       'Entries',
    revisions:      'Revisions',
    clients:        'Clients',
    expand:         'Expand sidebar',
    collapse:       'Collapse sidebar',
    selectLang:     'Select language',
    myProfile:      'My profile',
    settings:       'Settings',
    logout:         'Sign out',
    openProfile:    'Open profile menu',
    consultant:     'Consultant',
  },
  'es': {
    overview:       'Vista general',
    costCategories: 'Categorías de costo',
    simulation:     'Simulación',
    launches:       'Lanzamientos',
    revisions:      'Revisiones',
    clients:        'Clientes',
    expand:         'Expandir menú lateral',
    collapse:       'Contraer menú lateral',
    selectLang:     'Seleccionar idioma',
    myProfile:      'Mi perfil',
    settings:       'Configuración',
    logout:         'Cerrar sesión',
    openProfile:    'Abrir menú de perfil',
    consultant:     'Consultor',
  },
}
