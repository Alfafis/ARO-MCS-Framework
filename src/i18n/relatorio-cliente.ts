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
  reportSubtitleBase: (clienteNome: string) => string
  reportSubtitleSim: (iterations: string, distribution: string) => string
  reportNotFoundTitle: string
  reportNotFoundBody:  string
  // KPIs
  kpiAvgCost:        string
  simPendingSub:     string
  kpiAvgCostSubMC:   (status: string) => string
  kpiMinMaxRange:    string
  kpiMinMaxSubIC:    (confLevel: number, ic95: string) => string
  kpiBaseProvision:  string
  kpiBaseSub:        (contingenciaPct: number) => string
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
    reportTitle:       'Relatório',
    reportRevisionCurrent: 'Vigente',
    reportSubtitleBase: (nome) => `Provisionamento financeiro ${nome}`,
    reportSubtitleSim: (iterations, dist) => ` · Aro Simulação, ${iterations} iterações · Distribuição ${dist}`,
    reportNotFoundTitle: 'Relatório não encontrado',
    reportNotFoundBody:  'O link usado não corresponde a nenhum projeto ativo. Verifique o link ou peça um novo à sua consultoria.',
    kpiAvgCost:        'Custo médio',
    simPendingSub:     'Sem simulação rodada ainda',
    kpiAvgCostSubMC:   (status) => `Aro Simulação · ${status}`,
    kpiMinMaxRange:    'Faixa min–max',
    kpiMinMaxSubIC:    (conf, ic) => `IC ${conf}%: ${ic}`,
    kpiBaseProvision:  'Provisão base',
    kpiBaseSub:        (pct) => `Total com provisão de ${pct}%`,
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
    reportTitle:       'Report',
    reportRevisionCurrent: 'Current',
    reportSubtitleBase: (nome) => `${nome} financial provisioning`,
    reportSubtitleSim: (iterations, dist) => ` · Aro Simulação, ${iterations} iterations · ${dist} distribution`,
    reportNotFoundTitle: 'Report not found',
    reportNotFoundBody:  'This link does not match any active project. Check the link or ask your consultant for a new one.',
    kpiAvgCost:        'Average cost',
    simPendingSub:     'No simulation run yet',
    kpiAvgCostSubMC:   (status) => `Aro Simulação · ${status}`,
    kpiMinMaxRange:    'Min–max range',
    kpiMinMaxSubIC:    (conf, ic) => `${conf}% CI: ${ic}`,
    kpiBaseProvision:  'Base provision',
    kpiBaseSub:        (pct) => `Total with ${pct}% provision`,
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
    reportTitle:       'Informe',
    reportRevisionCurrent: 'Vigente',
    reportSubtitleBase: (nome) => `Provisión financiera ${nome}`,
    reportSubtitleSim: (iterations, dist) => ` · Aro Simulação, ${iterations} iteraciones · Distribución ${dist}`,
    reportNotFoundTitle: 'Informe no encontrado',
    reportNotFoundBody:  'El enlace usado no corresponde a ningún proyecto activo. Verifique el enlace o pida uno nuevo a su consultoría.',
    kpiAvgCost:        'Costo promedio',
    simPendingSub:     'Sin simulación ejecutada aún',
    kpiAvgCostSubMC:   (status) => `Aro Simulação · ${status}`,
    kpiMinMaxRange:    'Rango mín–máx',
    kpiMinMaxSubIC:    (conf, ic) => `IC ${conf}%: ${ic}`,
    kpiBaseProvision:  'Provisión base',
    kpiBaseSub:        (pct) => `Total con provisión del ${pct}%`,
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
