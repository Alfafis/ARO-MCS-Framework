import type { Lang } from './LangContext'

export const relatorioClienteT: Record<Lang, {
  // Header
  portalPill:        string
  accessCodeBtn:     string
  copyLinkBtn:       string
  linkCopiedBtn:     string
  copyLinkPrompt:    string
  downloadPdfBtn:    string
  selectLang:        string
  // Report header
  reportTitle:       string
  reportRevisionCurrent: string
  reportSubtitleBase: string
  reportSubtitleSim: (iterations: string, distribution: string) => string
  // KPIs
  kpiAvgCost:        string
  kpiAvgCostSubDefault: string
  kpiAvgCostSubMC:   (status: string) => string
  kpiMinMaxRange:    string
  kpiMinMaxSubDefault: string
  kpiMinMaxSubIC:    (confLevel: number, ic95: string) => string
  kpiUpdatedValue:   string
  kpiUpdatedSub:     string
  kpiBaseProvision:  string
  kpiBaseSub:        string
  // Risk metrics labels
  riskMean:          string
  riskStddev:        string
  riskP80:           string
  riskExceedProb:    string
  icLabel:           (confLevel: number, value: string) => string
  // Access modal
  modalTitle:        string
  modalCodeLabel:    string
  modalCodePlaceholder: string
  modalCodeError:    string
  modalSubmit:       string
  // Toast
  pdfGenerating:     string
}> = {
  'pt-BR': {
    portalPill:        'Portal do cliente',
    accessCodeBtn:     'Código de acesso',
    copyLinkBtn:       'Copiar link',
    linkCopiedBtn:     'Link copiado!',
    copyLinkPrompt:    'Copie o link do relatório:',
    downloadPdfBtn:    'Baixar PDF',
    selectLang:        'Selecionar idioma',
    reportTitle:       'Relatório — Fechamento de Mina',
    reportRevisionCurrent: 'Vigente',
    reportSubtitleBase: 'Provisionamento financeiro NX Gold',
    reportSubtitleSim: (iterations, dist) => ` · Simulação Monte Carlo, ${iterations} iterações · Distribuição ${dist}`,
    kpiAvgCost:        'Custo médio',
    kpiAvgCostSubDefault: 'Monte Carlo · 10.000 iterações',
    kpiAvgCostSubMC:   (status) => `Monte Carlo · ${status}`,
    kpiMinMaxRange:    'Faixa min–max',
    kpiMinMaxSubDefault: 'Custo total, 8 categorias',
    kpiMinMaxSubIC:    (conf, ic) => `IC ${conf}%: ${ic}`,
    kpiUpdatedValue:   'Valor atualizado',
    kpiUpdatedSub:     'Custo total, valor atualizado',
    kpiBaseProvision:  'Provisão base',
    kpiBaseSub:        'Total com provisão de 20%',
    riskMean:          'Média',
    riskStddev:        'Desvio-padrão',
    riskP80:           'P80 (valor a 80%)',
    riskExceedProb:    'Prob. de excedência',
    icLabel:           (conf, v) => `IC ${conf}%: R$ ${v} M`,
    modalTitle:        'Acesse seu relatório',
    modalCodeLabel:    'Código de acesso',
    modalCodePlaceholder: 'Ex: NXGOLD-2024',
    modalCodeError:    'Código inválido ou expirado. Verifique e tente novamente.',
    modalSubmit:       'Acessar relatório',
    pdfGenerating:     'Gerando PDF…',
  },
  'en': {
    portalPill:        'Client portal',
    accessCodeBtn:     'Access code',
    copyLinkBtn:       'Copy link',
    linkCopiedBtn:     'Link copied!',
    copyLinkPrompt:    'Copy the report link:',
    downloadPdfBtn:    'Download PDF',
    selectLang:        'Select language',
    reportTitle:       'Report — Mine Closure',
    reportRevisionCurrent: 'Current',
    reportSubtitleBase: 'NX Gold financial provisioning',
    reportSubtitleSim: (iterations, dist) => ` · Monte Carlo simulation, ${iterations} iterations · ${dist} distribution`,
    kpiAvgCost:        'Average cost',
    kpiAvgCostSubDefault: 'Monte Carlo · 10,000 iterations',
    kpiAvgCostSubMC:   (status) => `Monte Carlo · ${status}`,
    kpiMinMaxRange:    'Min–max range',
    kpiMinMaxSubDefault: 'Total cost, 8 categories',
    kpiMinMaxSubIC:    (conf, ic) => `${conf}% CI: ${ic}`,
    kpiUpdatedValue:   'Updated value',
    kpiUpdatedSub:     'Total cost, updated value',
    kpiBaseProvision:  'Base provision',
    kpiBaseSub:        'Total with 20% provision',
    riskMean:          'Mean',
    riskStddev:        'Std. deviation',
    riskP80:           'P80 (value at 80%)',
    riskExceedProb:    'Exceedance probability',
    icLabel:           (conf, v) => `${conf}% CI: R$ ${v} M`,
    modalTitle:        'Access your report',
    modalCodeLabel:    'Access code',
    modalCodePlaceholder: 'e.g. NXGOLD-2024',
    modalCodeError:    'Invalid or expired code. Check and try again.',
    modalSubmit:       'Access report',
    pdfGenerating:     'Generating PDF…',
  },
  'es': {
    portalPill:        'Portal del cliente',
    accessCodeBtn:     'Código de acceso',
    copyLinkBtn:       'Copiar enlace',
    linkCopiedBtn:     '¡Enlace copiado!',
    copyLinkPrompt:    'Copie el enlace del informe:',
    downloadPdfBtn:    'Descargar PDF',
    selectLang:        'Seleccionar idioma',
    reportTitle:       'Informe — Cierre de Mina',
    reportRevisionCurrent: 'Vigente',
    reportSubtitleBase: 'Provisión financiera NX Gold',
    reportSubtitleSim: (iterations, dist) => ` · Simulación Monte Carlo, ${iterations} iteraciones · Distribución ${dist}`,
    kpiAvgCost:        'Costo promedio',
    kpiAvgCostSubDefault: 'Monte Carlo · 10.000 iteraciones',
    kpiAvgCostSubMC:   (status) => `Monte Carlo · ${status}`,
    kpiMinMaxRange:    'Rango mín–máx',
    kpiMinMaxSubDefault: 'Costo total, 8 categorías',
    kpiMinMaxSubIC:    (conf, ic) => `IC ${conf}%: ${ic}`,
    kpiUpdatedValue:   'Valor actualizado',
    kpiUpdatedSub:     'Costo total, valor actualizado',
    kpiBaseProvision:  'Provisión base',
    kpiBaseSub:        'Total con provisión del 20%',
    riskMean:          'Media',
    riskStddev:        'Desviación estándar',
    riskP80:           'P80 (valor al 80%)',
    riskExceedProb:    'Prob. de excedencia',
    icLabel:           (conf, v) => `IC ${conf}%: R$ ${v} M`,
    modalTitle:        'Acceda a su informe',
    modalCodeLabel:    'Código de acceso',
    modalCodePlaceholder: 'Ej: NXGOLD-2024',
    modalCodeError:    'Código inválido o expirado. Verifique e intente nuevamente.',
    modalSubmit:       'Acceder al informe',
    pdfGenerating:     'Generando PDF…',
  },
}
