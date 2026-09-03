import type { Lang } from './LangContext'

export const clientesT: Record<
  Lang,
  {
    // Lista de clientes (/clientes)
    clientsHeaderTitle: string
    clientsHeaderSubtitle: string
    newClient: string
    clientsBadge: (n: number) => string
    searchClientPlaceholder: string
    colClient: string
    colProjectsCount: string
    projectsCount: (n: number) => string
    emptyClients: string
    // NovoClienteModal
    newClientModalTitle: string
    labelClientName: string
    placeholderClientName: string
    createClient: string
    // Lista de projetos de um cliente (/clientes/:id)
    headerSubtitle: string
    newProject: string
    activesBadge: (n: number) => string
    searchPlaceholder: string
    filterAll: string
    filterActive: string
    filterWaiting: string
    filterDone: string
    colProject: string
    colStatus: string
    colRev: string
    colExpected: string
    colUpdated: string
    empty: string
    statusActive: string
    statusWaiting: string
    statusDone: string
    actionReport: string
    actionCopyLink: string
    actionGenerateCode: string
    actionCategories: string
    actionComplete: string
    actionArchive: string
    menuAriaLabel: string
    linkCopied: string
    backToClients: string
    // ClienteModal (Novo projeto)
    modalTitle: string
    labelClient: string
    labelProject: string
    labelProjectType: string
    helpProjectType: string
    placeholderProject: string
    cancel: string
    create: string
    justNow: string
    // Wizard de criação (/projetos/novo, /projetos/:id/config-inicial)
    wizardStep1Title: string
    wizardStep2Title: string
    avancar: string
    voltar: string
    pularPorAgora: string
    concluir: string
    // Lista global de projetos (/projetos)
    projetosHeaderTitle: string
    projetosHeaderSubtitle: string
    searchAllPlaceholder: string
    filterByClientAll: string
    filterByTypeAll: string
  }
> = {
  'pt-BR': {
    clientsHeaderTitle: 'Clientes',
    clientsHeaderSubtitle: 'Todos os clientes da consultoria',
    newClient: '+ Novo cliente',
    clientsBadge: (n) => `${n} clientes`,
    searchClientPlaceholder: 'Buscar por cliente...',
    colClient: 'CLIENTE',
    colProjectsCount: 'PROJETOS',
    projectsCount: (n) => (n === 1 ? '1 projeto' : `${n} projetos`),
    emptyClients: 'Nenhum cliente encontrado.',
    newClientModalTitle: 'Novo cliente',
    labelClientName: 'Nome do cliente',
    placeholderClientName: 'Ex: Mineradora São João',
    createClient: 'Criar cliente',
    headerSubtitle: 'Projetos de provisionamento deste cliente',
    newProject: '+ Novo projeto',
    activesBadge: (n) => `${n} ativos`,
    searchPlaceholder: 'Buscar por projeto...',
    filterAll: 'Todos',
    filterActive: 'Em andamento',
    filterWaiting: 'Aguardando cliente',
    filterDone: 'Concluídos',
    colProject: 'PROJETO',
    colStatus: 'STATUS',
    colRev: 'REV. ATUAL',
    colExpected: 'ESPERADO',
    colUpdated: 'ÚLTIMA ATUALIZAÇÃO',
    empty: 'Nenhum projeto encontrado.',
    statusActive: 'Em andamento',
    statusWaiting: 'Aguardando cliente',
    statusDone: 'Concluído',
    actionReport: 'Ver relatório do cliente',
    actionCopyLink: 'Copiar link do relatório',
    actionGenerateCode: 'Código de acesso',
    actionCategories: 'Ver categorias de custo',
    actionComplete: 'Marcar como concluído',
    actionArchive: 'Arquivar projeto',
    menuAriaLabel: 'Ações do projeto',
    linkCopied: 'Link copiado!',
    backToClients: '← Clientes',
    modalTitle: 'Novo projeto',
    labelClient: 'Cliente',
    labelProject: 'Nome do projeto',
    labelProjectType: 'Tipo de projeto',
    helpProjectType: 'Categorias de custo nascem em branco — dá pra carregar um exemplo depois, na tela de Categorias.',
    placeholderProject: 'Nome do projeto',
    cancel: 'Cancelar',
    create: 'Criar projeto',
    justNow: 'agora mesmo',
    wizardStep1Title: 'Novo projeto — Identificação',
    wizardStep2Title: 'Novo projeto — Configuração financeira',
    avancar: 'Avançar',
    voltar: '← Voltar',
    pularPorAgora: 'Pular por agora',
    concluir: 'Concluir',
    projetosHeaderTitle: 'Projetos',
    projetosHeaderSubtitle: 'Todos os projetos de todos os clientes',
    searchAllPlaceholder: 'Buscar por projeto ou cliente...',
    filterByClientAll: 'Todos os clientes',
    filterByTypeAll: 'Todos os tipos',
  },
  en: {
    clientsHeaderTitle: 'Clients',
    clientsHeaderSubtitle: 'All consulting clients',
    newClient: '+ New client',
    clientsBadge: (n) => `${n} clients`,
    searchClientPlaceholder: 'Search by client...',
    colClient: 'CLIENT',
    colProjectsCount: 'PROJECTS',
    projectsCount: (n) => (n === 1 ? '1 project' : `${n} projects`),
    emptyClients: 'No clients found.',
    newClientModalTitle: 'New client',
    labelClientName: 'Client name',
    placeholderClientName: 'e.g.: Sao Joao Mining',
    createClient: 'Create client',
    headerSubtitle: "This client's provisioning projects",
    newProject: '+ New project',
    activesBadge: (n) => `${n} active`,
    searchPlaceholder: 'Search by project...',
    filterAll: 'All',
    filterActive: 'In progress',
    filterWaiting: 'Awaiting client',
    filterDone: 'Completed',
    colProject: 'PROJECT',
    colStatus: 'STATUS',
    colRev: 'CURRENT REV.',
    colExpected: 'EXPECTED',
    colUpdated: 'LAST UPDATE',
    empty: 'No projects found.',
    statusActive: 'In progress',
    statusWaiting: 'Awaiting client',
    statusDone: 'Completed',
    actionReport: 'View client report',
    actionCopyLink: 'Copy report link',
    actionGenerateCode: 'Access code',
    actionCategories: 'View cost categories',
    actionComplete: 'Mark as completed',
    actionArchive: 'Archive project',
    menuAriaLabel: 'Project actions',
    linkCopied: 'Link copied!',
    backToClients: '← Clients',
    modalTitle: 'New project',
    labelClient: 'Client',
    labelProject: 'Project name',
    labelProjectType: 'Project type',
    helpProjectType: 'Cost categories start blank — you can load an example later, in the Categories screen.',
    placeholderProject: 'Project name',
    cancel: 'Cancel',
    create: 'Create project',
    justNow: 'just now',
    wizardStep1Title: 'New project — Identification',
    wizardStep2Title: 'New project — Financial configuration',
    avancar: 'Continue',
    voltar: '← Back',
    pularPorAgora: 'Skip for now',
    concluir: 'Finish',
    projetosHeaderTitle: 'Projects',
    projetosHeaderSubtitle: 'All projects across all clients',
    searchAllPlaceholder: 'Search by project or client...',
    filterByClientAll: 'All clients',
    filterByTypeAll: 'All types',
  },
  es: {
    clientsHeaderTitle: 'Clientes',
    clientsHeaderSubtitle: 'Todos los clientes de la consultoría',
    newClient: '+ Nuevo cliente',
    clientsBadge: (n) => `${n} clientes`,
    searchClientPlaceholder: 'Buscar por cliente...',
    colClient: 'CLIENTE',
    colProjectsCount: 'PROYECTOS',
    projectsCount: (n) => (n === 1 ? '1 proyecto' : `${n} proyectos`),
    emptyClients: 'No se encontraron clientes.',
    newClientModalTitle: 'Nuevo cliente',
    labelClientName: 'Nombre del cliente',
    placeholderClientName: 'Ej: Minera San Juan',
    createClient: 'Crear cliente',
    headerSubtitle: 'Proyectos de provisión de este cliente',
    newProject: '+ Nuevo proyecto',
    activesBadge: (n) => `${n} activos`,
    searchPlaceholder: 'Buscar por proyecto...',
    filterAll: 'Todos',
    filterActive: 'En curso',
    filterWaiting: 'En espera del cliente',
    filterDone: 'Completados',
    colProject: 'PROYECTO',
    colStatus: 'ESTADO',
    colRev: 'REV. ACTUAL',
    colExpected: 'ESPERADO',
    colUpdated: 'ÚLTIMA ACTUALIZACIÓN',
    empty: 'No se encontraron proyectos.',
    statusActive: 'En curso',
    statusWaiting: 'En espera del cliente',
    statusDone: 'Completado',
    actionReport: 'Ver informe del cliente',
    actionCopyLink: 'Copiar enlace del informe',
    actionGenerateCode: 'Código de acceso',
    actionCategories: 'Ver categorías de costo',
    actionComplete: 'Marcar como completado',
    actionArchive: 'Archivar proyecto',
    menuAriaLabel: 'Acciones del proyecto',
    linkCopied: '¡Enlace copiado!',
    backToClients: '← Clientes',
    modalTitle: 'Nuevo proyecto',
    labelClient: 'Cliente',
    labelProject: 'Nombre del proyecto',
    labelProjectType: 'Tipo de proyecto',
    helpProjectType:
      'Las categorías de costo empiezan en blanco — puedes cargar un ejemplo después, en la pantalla de Categorías.',
    placeholderProject: 'Nombre del proyecto',
    cancel: 'Cancelar',
    create: 'Crear proyecto',
    justNow: 'ahora mismo',
    wizardStep1Title: 'Nuevo proyecto — Identificación',
    wizardStep2Title: 'Nuevo proyecto — Configuración financiera',
    avancar: 'Continuar',
    voltar: '← Volver',
    pularPorAgora: 'Omitir por ahora',
    concluir: 'Finalizar',
    projetosHeaderTitle: 'Proyectos',
    projetosHeaderSubtitle: 'Todos los proyectos de todos los clientes',
    searchAllPlaceholder: 'Buscar por proyecto o cliente...',
    filterByClientAll: 'Todos los clientes',
    filterByTypeAll: 'Todos los tipos',
  },
}
