import type { Lang } from './LangContext'

export const parametrosGlobaisT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    parametroInflacao: string
    parametroCambio: string
    parametroSelic: string
    fonteBcb: string
    fonteManual: string
    naoConfigurado: string
    atualizarDaApi: string
    atualizadoToast: string
    atualizarErroToast: string
    buscarErroToast: string
    valorInvalidoToast: string
    colAno: string
    colMinPct: string
    colMaxPct: string
    atualizarAnoAtualTitle: string
    atualizarProjecaoFocusTitle: string
    verAnosAnteriores: string
    ocultarAnosAnteriores: string
    anosAnterioresHeader: string
  }
> = {
  'pt-BR': {
    headerTitle: 'Parâmetros Globais',
    headerSubtitle: 'Usados no cálculo de atualização financeira de todos os projetos.',
    parametroInflacao: 'Inflação (IPCA 12 meses)',
    parametroCambio: 'Câmbio (USD/BRL)',
    parametroSelic: 'Selic (taxa básica de juros)',
    fonteBcb: 'Banco Central',
    fonteManual: 'Manual',
    naoConfigurado: 'Não configurado',
    atualizarDaApi: 'Atualizar da API',
    atualizadoToast: 'Parâmetro atualizado.',
    atualizarErroToast: 'Não foi possível salvar o parâmetro.',
    buscarErroToast: 'Não foi possível buscar da API — tente novamente ou edite manualmente.',
    valorInvalidoToast: 'Valor inválido.',
    colAno: 'Ano',
    colMinPct: 'Mín %',
    colMaxPct: 'Máx %',
    atualizarAnoAtualTitle: 'Atualizar ano atual da API',
    atualizarProjecaoFocusTitle: 'Preencher projeção do Boletim Focus (consenso de mercado, próximos anos)',
    verAnosAnteriores: 'Ver anos anteriores',
    ocultarAnosAnteriores: 'Ocultar anos anteriores',
    anosAnterioresHeader: 'Anos anteriores',
  },
  en: {
    headerTitle: 'Global Parameters',
    headerSubtitle: 'Used in the financial escalation calculation for all projects.',
    parametroInflacao: 'Inflation (12-month CPI)',
    parametroCambio: 'Exchange rate (USD/BRL)',
    parametroSelic: 'Selic (base interest rate)',
    fonteBcb: 'Central Bank',
    fonteManual: 'Manual',
    naoConfigurado: 'Not configured',
    atualizarDaApi: 'Update from API',
    atualizadoToast: 'Parameter updated.',
    atualizarErroToast: 'Could not save the parameter.',
    buscarErroToast: 'Could not fetch from the API — try again or edit manually.',
    valorInvalidoToast: 'Invalid value.',
    colAno: 'Year',
    colMinPct: 'Min %',
    colMaxPct: 'Max %',
    atualizarAnoAtualTitle: 'Update current year from API',
    atualizarProjecaoFocusTitle: 'Fill projection from Boletim Focus (market consensus, next years)',
    verAnosAnteriores: 'Show previous years',
    ocultarAnosAnteriores: 'Hide previous years',
    anosAnterioresHeader: 'Previous years',
  },
  es: {
    headerTitle: 'Parámetros Globales',
    headerSubtitle: 'Usados en el cálculo de actualización financiera de todos los proyectos.',
    parametroInflacao: 'Inflación (IPCA 12 meses)',
    parametroCambio: 'Cambio (USD/BRL)',
    parametroSelic: 'Selic (tasa básica de interés)',
    fonteBcb: 'Banco Central',
    fonteManual: 'Manual',
    naoConfigurado: 'No configurado',
    atualizarDaApi: 'Actualizar de la API',
    atualizadoToast: 'Parámetro actualizado.',
    atualizarErroToast: 'No se pudo guardar el parámetro.',
    buscarErroToast: 'No se pudo buscar de la API — intenta de nuevo o edita manualmente.',
    valorInvalidoToast: 'Valor inválido.',
    colAno: 'Año',
    colMinPct: 'Mín %',
    colMaxPct: 'Máx %',
    atualizarAnoAtualTitle: 'Actualizar año actual de la API',
    atualizarProjecaoFocusTitle: 'Rellenar proyección del Boletim Focus (consenso de mercado, próximos años)',
    verAnosAnteriores: 'Ver años anteriores',
    ocultarAnosAnteriores: 'Ocultar años anteriores',
    anosAnterioresHeader: 'Años anteriores',
  },
}
