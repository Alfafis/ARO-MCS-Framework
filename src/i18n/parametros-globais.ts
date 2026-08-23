import type { Lang } from './LangContext'

export const parametrosGlobaisT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
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
  colAno:            string
  colMinPct:         string
  colMaxPct:         string
  atualizarAno1Title: string
}> = {
  'pt-BR': {
    headerTitle:      'Parâmetros Globais',
    headerSubtitle:   'Usados no cálculo de atualização financeira de todos os projetos.',
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
    colAno:            'Ano',
    colMinPct:         'Mín %',
    colMaxPct:         'Máx %',
    atualizarAno1Title: 'Atualizar ano 1 da API',
  },
  'en': {
    headerTitle:      'Global Parameters',
    headerSubtitle:   'Used in the financial escalation calculation for all projects.',
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
    colAno:            'Year',
    colMinPct:         'Min %',
    colMaxPct:         'Max %',
    atualizarAno1Title: 'Update year 1 from API',
  },
  'es': {
    headerTitle:      'Parámetros Globales',
    headerSubtitle:   'Usados en el cálculo de actualización financiera de todos los proyectos.',
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
    colAno:            'Año',
    colMinPct:         'Mín %',
    colMaxPct:         'Máx %',
    atualizarAno1Title: 'Actualizar año 1 de la API',
  },
}
