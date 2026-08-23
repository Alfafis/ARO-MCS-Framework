import type { Lang } from './LangContext'

export const resumoT: Record<Lang, {
  // Page header
  headerTitle:    string
  exportPdf:      string
  runSimulation:  string
  // MonetaryMethodsCard
  monetaryTitle:  (base: string) => string
  method1:        (pct: string) => string
  method2:        (pct: string) => string
  method3:        (pct: string) => string
  method4:        (anoInicio: number | null) => string
  // AnnualDisbursementCard (componente ainda sem consumidor ligado — mantido pra não quebrar o arquivo)
  disbursementTitle: string
  yearPrefix:     string
  // FanChartCard (idem — sem consumidor ligado)
  fanTitle:       string
  fanDesc:        (cv: string) => string
  // CostByCategoryTable
  costTableTitle: (count: number) => string
  colHash:        string
  colCategory:    string
  colMin:         string
  colMax:         string
  colUpdated:     string
  totalLabel:     string
  // CostByCategoryTable — agrupamento por fase (groupByPhase, hoje sempre false nos consumidores reais,
  // mas o componente monta os rótulos incondicionalmente)
  phasePreLabel:       string
  phasePreDesc:        string
  phasePreYears:       string
  phaseClosureLabel:   string
  phaseClosureDesc:    string
  phaseClosureYears:   string
  phasePostLabel:      string
  phasePostDesc:       string
  phasePostYears:      string
  // RiskMetricsCard
  riskMetricsTitle: string
  riskLow:          string
  riskModerate:     string
  riskHigh:         string
  contingencyLabel: string
  // RecentLaunches (componente ainda sem consumidor ligado — mantido pra não quebrar o arquivo)
  recentLaunches: string
  colPeriod:      string
  colValue:       string
  colStatus:      string
  statusValidated: string
  statusReview:    string
  // RevisionTimeline
  revTimeline:      string
  revCurrent:       string
  revDraftDesc:     string
  revCurrentDesc:   string
  revReplacedDesc:  string
  revEmpty:         string
}> = {
  'pt-BR': {
    headerTitle:    'Resumo Executivo',
    exportPdf:      'Exportar PDF',
    runSimulation:  'Rodar simulação',
    monetaryTitle:  (base) => `Métodos de atualização monetária (10 anos, sobre ${base})`,
    method1:        (pct) => `Juros simples — ${pct}%/ano`,
    method2:        (pct) => `Juros compostos — ${pct}%/ano`,
    method3:        (pct) => `Inflação constante — ${pct}%/ano`,
    method4:        (ano) => ano !== null ? `Escalonamento — IPCA variável ${ano}-${ano + 9}` : 'Escalonamento — IPCA variável', // +9 = HORIZON_YEARS-1 (lib/financeiro.ts)
    disbursementTitle: 'Desembolso projetado por ano — Total Geral',
    yearPrefix:     'ANO',
    fanTitle:       'Leque de confiança (fan chart) — desembolso acumulado por ano',
    fanDesc:        cv => `Faixa estimada a partir do coeficiente de variação da simulação de Monte Carlo (${cv}%) aplicado ao desembolso acumulado por ano — não é um cálculo de percentil (P10/P90) rodado independentemente para cada ano.`,
    costTableTitle: (count) => `Custo por categoria — ${count} setores`,
    colHash:        '#',
    colCategory:    'Categoria',
    colMin:         'Min',
    colMax:         'Max',
    colUpdated:     'Atualizado',
    totalLabel:     'Total geral',
    phasePreLabel:      'Pré-Fechamento',
    phasePreDesc:       'Estudos + Cavas',
    phasePreYears:      'Anos 1–4',
    phaseClosureLabel:  'Fechamento',
    phaseClosureDesc:   'Pilhas, Barragens, Planta, Áreas, Demolição',
    phaseClosureYears:  'Anos 5–6',
    phasePostLabel:     'Pós-Fechamento',
    phasePostDesc:      'Monitoramento',
    phasePostYears:     'Anos 7–10',
    riskMetricsTitle: 'Métricas de risco',
    riskLow:          'Baixo',
    riskModerate:     'Moderado',
    riskHigh:         'Alto',
    contingencyLabel: 'Contingência aplicada',
    recentLaunches:   'Lançamentos recentes',
    colPeriod:        'Período',
    colValue:         'Valor real',
    colStatus:        'Status',
    statusValidated:  'Validado',
    statusReview:     'Em revisão',
    revTimeline:      'Timeline de revisões',
    revCurrent:       'Vigente',
    revDraftDesc:     'Revisão em elaboração, ainda não publicada.',
    revCurrentDesc:   'Revisão vigente deste projeto.',
    revReplacedDesc:  'Revisão substituída por uma versão mais recente.',
    revEmpty:         'Nenhuma revisão criada ainda.',
  },
  'en': {
    headerTitle:    'Executive Summary',
    exportPdf:      'Export PDF',
    runSimulation:  'Run simulation',
    monetaryTitle:  (base) => `Monetary update methods (10 years, on ${base})`,
    method1:        (pct) => `Simple interest — ${pct}%/yr`,
    method2:        (pct) => `Compound interest — ${pct}%/yr`,
    method3:        (pct) => `Constant inflation — ${pct}%/yr`,
    method4:        (ano) => ano !== null ? `Escalation — variable IPCA ${ano}-${ano + 9}` : 'Escalation — variable IPCA',
    disbursementTitle: 'Projected disbursement by year — Grand Total',
    yearPrefix:     'YEAR',
    fanTitle:       'Confidence fan chart — cumulative disbursement by year',
    fanDesc:        cv => `Range estimated from the Monte Carlo simulation coefficient of variation (${cv}%) applied to cumulative disbursement by year — not an independent percentile (P10/P90) calculation per year.`,
    costTableTitle: (count) => `Cost by category — ${count} sectors`,
    colHash:        '#',
    colCategory:    'Category',
    colMin:         'Min',
    colMax:         'Max',
    colUpdated:     'Updated',
    totalLabel:     'Grand total',
    phasePreLabel:      'Pre-Closure',
    phasePreDesc:       'Studies + Cavas',
    phasePreYears:      'Years 1–4',
    phaseClosureLabel:  'Closure',
    phaseClosureDesc:   'Piles, Dams, Plant, Support Areas, Demolition',
    phaseClosureYears:  'Years 5–6',
    phasePostLabel:     'Post-Closure',
    phasePostDesc:      'Monitoring',
    phasePostYears:     'Years 7–10',
    riskMetricsTitle: 'Risk metrics',
    riskLow:          'Low',
    riskModerate:     'Moderate',
    riskHigh:         'High',
    contingencyLabel: 'Applied contingency',
    recentLaunches:   'Recent entries',
    colPeriod:        'Period',
    colValue:         'Actual value',
    colStatus:        'Status',
    statusValidated:  'Validated',
    statusReview:     'In review',
    revTimeline:      'Revision timeline',
    revCurrent:       'Current',
    revDraftDesc:     'Revision in progress, not yet published.',
    revCurrentDesc:   'Current revision of this project.',
    revReplacedDesc:  'Revision replaced by a more recent version.',
    revEmpty:         'No revision created yet.',
  },
  'es': {
    headerTitle:    'Resumen Ejecutivo',
    exportPdf:      'Exportar PDF',
    runSimulation:  'Ejecutar simulación',
    monetaryTitle:  (base) => `Métodos de actualización monetaria (10 años, sobre ${base})`,
    method1:        (pct) => `Interés simple — ${pct}%/año`,
    method2:        (pct) => `Interés compuesto — ${pct}%/año`,
    method3:        (pct) => `Inflación constante — ${pct}%/año`,
    method4:        (ano) => ano !== null ? `Escalonamiento — IPCA variable ${ano}-${ano + 9}` : 'Escalonamiento — IPCA variable',
    disbursementTitle: 'Desembolso proyectado por año — Total General',
    yearPrefix:     'AÑO',
    fanTitle:       'Abanico de confianza (fan chart) — desembolso acumulado por año',
    fanDesc:        cv => `Rango estimado a partir del coeficiente de variación de la simulación de Monte Carlo (${cv}%) aplicado al desembolso acumulado por año — no es un cálculo de percentil (P10/P90) ejecutado independientemente para cada año.`,
    costTableTitle: (count) => `Costo por categoría — ${count} sectores`,
    colHash:        '#',
    colCategory:    'Categoría',
    colMin:         'Mín',
    colMax:         'Máx',
    colUpdated:     'Actualizado',
    totalLabel:     'Total general',
    phasePreLabel:      'Pre-Cierre',
    phasePreDesc:       'Estudios + Cavas',
    phasePreYears:      'Años 1–4',
    phaseClosureLabel:  'Cierre',
    phaseClosureDesc:   'Pilas, Represas, Planta, Áreas de Apoyo, Demolición',
    phaseClosureYears:  'Años 5–6',
    phasePostLabel:     'Post-Cierre',
    phasePostDesc:      'Monitoreo',
    phasePostYears:     'Años 7–10',
    riskMetricsTitle: 'Métricas de riesgo',
    riskLow:          'Bajo',
    riskModerate:     'Moderado',
    riskHigh:         'Alto',
    contingencyLabel: 'Contingencia aplicada',
    recentLaunches:   'Lanzamientos recientes',
    colPeriod:        'Período',
    colValue:         'Valor real',
    colStatus:        'Estado',
    statusValidated:  'Validado',
    statusReview:     'En revisión',
    revTimeline:      'Línea de tiempo de revisiones',
    revCurrent:       'Vigente',
    revDraftDesc:     'Revisión en elaboración, aún no publicada.',
    revCurrentDesc:   'Revisión vigente de este proyecto.',
    revReplacedDesc:  'Revisión sustituida por una versión más reciente.',
    revEmpty:         'Todavía no hay ninguna revisión creada.',
  },
}
