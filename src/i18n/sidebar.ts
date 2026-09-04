import type { Lang } from './LangContext'

export const sidebarT: Record<
  Lang,
  {
    overview: string
    costCategories: string
    simulation: string
    launches: string
    revisions: string
    clients: string
    projects: string
    projectTypes: string
    costCategoriesModule: string
    globalParams: string
    sectors: string
    remediation: string
    remediationTemplate: string
    expand: string
    collapse: string
    selectLang: string
    myProfile: string
    settings: string
    logout: string
    openProfile: string
    consultant: string
  }
> = {
  'pt-BR': {
    overview: 'Visão geral',
    costCategories: 'Categorias',
    simulation: 'Simulação',
    launches: 'Lançamentos',
    revisions: 'Revisões',
    clients: 'Clientes',
    projects: 'Projetos',
    projectTypes: 'Tipos de Projeto',
    costCategoriesModule: 'Categorias de Custo',
    globalParams: 'Parâmetros Globais',
    sectors: 'Setores',
    remediation: 'Remediação',
    remediationTemplate: 'Remediação',
    expand: 'Expandir menu lateral',
    collapse: 'Recolher menu lateral',
    selectLang: 'Selecionar idioma',
    myProfile: 'Meu perfil',
    settings: 'Configurações',
    logout: 'Sair',
    openProfile: 'Abrir menu do perfil',
    consultant: 'Consultor',
  },
  en: {
    overview: 'Overview',
    costCategories: 'Categories',
    simulation: 'Simulation',
    launches: 'Entries',
    revisions: 'Revisions',
    clients: 'Clients',
    projects: 'Projects',
    projectTypes: 'Project Types',
    costCategoriesModule: 'Cost Categories',
    globalParams: 'Global Parameters',
    sectors: 'Sectors',
    remediation: 'Remediation',
    remediationTemplate: 'Remediation',
    expand: 'Expand sidebar',
    collapse: 'Collapse sidebar',
    selectLang: 'Select language',
    myProfile: 'My profile',
    settings: 'Settings',
    logout: 'Sign out',
    openProfile: 'Open profile menu',
    consultant: 'Consultant',
  },
  es: {
    overview: 'Vista general',
    costCategories: 'Categorías',
    simulation: 'Simulación',
    launches: 'Lanzamientos',
    revisions: 'Revisiones',
    clients: 'Clientes',
    projects: 'Proyectos',
    projectTypes: 'Tipos de Proyecto',
    costCategoriesModule: 'Categorías de Costo',
    globalParams: 'Parámetros Globales',
    sectors: 'Sectores',
    remediation: 'Remediación',
    remediationTemplate: 'Remediación',
    expand: 'Expandir menú lateral',
    collapse: 'Contraer menú lateral',
    selectLang: 'Seleccionar idioma',
    myProfile: 'Mi perfil',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    openProfile: 'Abrir menú de perfil',
    consultant: 'Consultor',
  },
}
