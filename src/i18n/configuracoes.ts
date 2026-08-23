import type { Lang } from './LangContext'

export const configuracoesT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
  tiposSectionTitle: string
  tiposSectionHint:  string
  placeholderNovoTipo: string
  addTipo:          string
  deleteTipo:       string
  createdToast:     string
  renameSavedToast: string
  renameErrorToast: string
  createErrorToast: string
  deleteErrorToast: string
  emptyNomeError:   string
  parametrosSectionTitle: string
  parametrosSectionHint:  string
  parametroInflacao: string
  parametroCambio:   string
  parametroSelic:    string
  fonteBcb:          string
  fonteManual:       string
  naoConfigurado:    string
  atualizarDaApi:    string
  atualizadoToast:   string
  atualizarErroToast: string
  buscarErroToast:   string
  valorInvalidoToast: string
}> = {
  'pt-BR': {
    headerTitle:      'Configurações',
    headerSubtitle:   'Ajustes administrativos do sistema.',
    tiposSectionTitle: 'Tipos de projeto',
    tiposSectionHint:  'Usados ao criar um projeto novo e no filtro da lista de projetos.',
    placeholderNovoTipo: 'Nome do novo tipo',
    addTipo:          'Adicionar',
    deleteTipo:       'Remover tipo',
    createdToast:     'Tipo criado.',
    renameSavedToast: 'Tipo atualizado.',
    renameErrorToast: 'Não foi possível renomear.',
    createErrorToast: 'Não foi possível criar o tipo.',
    deleteErrorToast: 'Não foi possível remover.',
    emptyNomeError:   'Nome não pode ser vazio.',
    parametrosSectionTitle: 'Parâmetros globais',
    parametrosSectionHint:  'Usados no cálculo de atualização financeira de todos os projetos.',
    parametroInflacao: 'Inflação (IPCA 12 meses)',
    parametroCambio:   'Câmbio (USD/BRL)',
    parametroSelic:    'Selic (meta vigente)',
    fonteBcb:          'Banco Central',
    fonteManual:       'Manual',
    naoConfigurado:    'Não configurado',
    atualizarDaApi:    'Atualizar da API',
    atualizadoToast:   'Parâmetro atualizado.',
    atualizarErroToast: 'Não foi possível salvar o parâmetro.',
    buscarErroToast:   'Não foi possível buscar da API — tente novamente ou edite manualmente.',
    valorInvalidoToast: 'Valor inválido.',
  },
  'en': {
    headerTitle:      'Settings',
    headerSubtitle:   'Administrative system settings.',
    tiposSectionTitle: 'Project types',
    tiposSectionHint:  'Used when creating a new project and in the projects list filter.',
    placeholderNovoTipo: 'New type name',
    addTipo:          'Add',
    deleteTipo:       'Remove type',
    createdToast:     'Type created.',
    renameSavedToast: 'Type updated.',
    renameErrorToast: 'Could not rename.',
    createErrorToast: 'Could not create the type.',
    deleteErrorToast: 'Could not remove.',
    emptyNomeError:   'Name cannot be empty.',
    parametrosSectionTitle: 'Global parameters',
    parametrosSectionHint:  'Used in the financial escalation calculation for all projects.',
    parametroInflacao: 'Inflation (12-month CPI)',
    parametroCambio:   'Exchange rate (USD/BRL)',
    parametroSelic:    'Base interest rate',
    fonteBcb:          'Central Bank',
    fonteManual:       'Manual',
    naoConfigurado:    'Not configured',
    atualizarDaApi:    'Update from API',
    atualizadoToast:   'Parameter updated.',
    atualizarErroToast: 'Could not save the parameter.',
    buscarErroToast:   'Could not fetch from the API — try again or edit manually.',
    valorInvalidoToast: 'Invalid value.',
  },
  'es': {
    headerTitle:      'Configuración',
    headerSubtitle:   'Ajustes administrativos del sistema.',
    tiposSectionTitle: 'Tipos de proyecto',
    tiposSectionHint:  'Usados al crear un proyecto nuevo y en el filtro de la lista de proyectos.',
    placeholderNovoTipo: 'Nombre del nuevo tipo',
    addTipo:          'Agregar',
    deleteTipo:       'Quitar tipo',
    createdToast:     'Tipo creado.',
    renameSavedToast: 'Tipo actualizado.',
    renameErrorToast: 'No se pudo renombrar.',
    createErrorToast: 'No se pudo crear el tipo.',
    deleteErrorToast: 'No se pudo quitar.',
    emptyNomeError:   'El nombre no puede estar vacío.',
    parametrosSectionTitle: 'Parámetros globales',
    parametrosSectionHint:  'Usados en el cálculo de actualización financiera de todos los proyectos.',
    parametroInflacao: 'Inflación (IPCA 12 meses)',
    parametroCambio:   'Cambio (USD/BRL)',
    parametroSelic:    'Selic (meta vigente)',
    fonteBcb:          'Banco Central',
    fonteManual:       'Manual',
    naoConfigurado:    'No configurado',
    atualizarDaApi:    'Actualizar de la API',
    atualizadoToast:   'Parámetro actualizado.',
    atualizarErroToast: 'No se pudo guardar el parámetro.',
    buscarErroToast:   'No se pudo buscar de la API — intenta de nuevo o edita manualmente.',
    valorInvalidoToast: 'Valor inválido.',
  },
}
