import type { Lang } from './LangContext'

export const resumoT: Record<Lang, {
  // Page header
  headerTitle:    string
  headerSubtitle: string
  exportPdf:      string
  runSimulation:  string
  // KPI labels
  avgCost:        string
  avgCostSub:     string
  minMaxRange:    string
  minMaxSub:      string
  updatedValue:   string
  updatedSub:     string
  baseProvision:  string
  baseSub:        string
  // MonetaryMethodsCard
  monetaryTitle:  string
  method1:        string
  method2:        string
  method3:        string
  method4:        string
  // AnnualDisbursementCard
  disbursementTitle: string
  yearPrefix:     string
  // FanChartCard
  fanTitle:       string
  fanDesc:        string
  // RisksCard
  risksTitle:     string
  risk1Title:     string
  risk1Desc:      string
  risk2Title:     string
  risk2Desc:      string
  risk3Title:     string
  risk3Desc:      string
  risk4Title:     string
  risk4Desc:      string
  // CostByCategoryTable
  costTableTitle: string
  colHash:        string
  colCategory:    string
  colMin:         string
  colMax:         string
  colUpdated:     string
  totalLabel:     string
  // RiskMetricsCard
  riskMetricsTitle: string
  riskLow:          string
  riskModerate:     string
  riskHigh:         string
  contingencyLabel: string
  metricMean:       string
  metricStddev:     string
  // RecentLaunches
  recentLaunches: string
  colPeriod:      string
  colValue:       string
  colStatus:      string
  statusValidated: string
  statusReview:    string
  // RevisionTimeline
  revTimeline:    string
  rev0Title:      string
  rev0Date:       string
  rev0Desc:       string
  rev1Title:      string
  rev1Date:       string
  rev1Desc:       string
  rev2Title:      string
  rev2Date:       string
  rev2Desc:       string
  revCurrent:     string
}> = {
  'pt-BR': {
    headerTitle:    'Resumo Executivo',
    headerSubtitle: 'NX Gold · Fechamento de Mina — Provisionamento VP rev0',
    exportPdf:      'Exportar PDF',
    runSimulation:  'Rodar simulação',
    avgCost:        'Custo médio',
    avgCostSub:     'Monte Carlo · 10.000 iterações',
    minMaxRange:    'Faixa min–max',
    minMaxSub:      'Custo total, 8 categorias',
    updatedValue:   'Valor atualizado 2023',
    updatedSub:     'Custo total, valor atualizado',
    baseProvision:  'Provisão base',
    baseSub:        'Valor presente antes de atualização',
    monetaryTitle:  'Métodos de atualização monetária (10 anos, sobre R$ 40,57 M)',
    method1:        'Juros simples — 10,75%/ano',
    method2:        'Juros compostos — 10,75%/ano',
    method3:        'Inflação constante — 3,4%/ano',
    method4:        'Escalonamento — IPCA variável 2024-2033',
    disbursementTitle: 'Desembolso projetado por ano — Total Geral',
    yearPrefix:     'ANO',
    fanTitle:       'Leque de confiança (fan chart) — desembolso acumulado por ano',
    fanDesc:        'Faixa estimada a partir do coeficiente de variação da simulação de Monte Carlo (4,97%) aplicado ao desembolso acumulado por ano — não é um cálculo de percentil (P10/P90) rodado independentemente para cada ano.',
    risksTitle:     'Riscos e pontos de atenção',
    risk1Title:     'Contingência divergente entre categorias',
    risk1Desc:      'A síntese por setor aplica 0% de contingência, enquanto a síntese por atividade aplica 20% sobre base equivalente — os dois totais não convergem.',
    risk2Title:     '"Investigação e remediação" fora do Total Geral',
    risk2Desc:      'Itens de grande porte (ex.: sistema de tratamento → R$ 15M; desmontagem da planta → R$ 4,5M) não estão somados no total — possível subestimação do passivo.',
    risk3Title:     'Nível de incerteza calculado é apertado demais',
    risk3Desc:      'O desvio-padrão vem só do range Min-Max de cada item — resulta em CV de ~5%, quando estimativas classe conceitual costumam ficar entre -30% e +50%.',
    risk4Title:     'Inversão de Min/Max corrigida na Rev1',
    risk4Desc:      'Item 8.1.1 ("Bloqueio de acessos") tinha Min e Max invertidos na rev0 — já corrigido, listado no changelog da timeline de revisões.',
    costTableTitle: 'Custo por categoria — 8 setores',
    colHash:        '#',
    colCategory:    'Categoria',
    colMin:         'Min',
    colMax:         'Max',
    colUpdated:     'Atualizado',
    totalLabel:     'Total geral',
    riskMetricsTitle: 'Métricas de risco',
    riskLow:          'Baixo',
    riskModerate:     'Moderado',
    riskHigh:         'Alto',
    contingencyLabel: 'Contingência aplicada',
    metricMean:       'Média',
    metricStddev:     'Desvio-padrão',
    recentLaunches:   'Lançamentos recentes',
    colPeriod:        'Período',
    colValue:         'Valor real',
    colStatus:        'Status',
    statusValidated:  'Validado',
    statusReview:     'Em revisão',
    revTimeline:      'Timeline de revisões',
    rev0Title:        'Rev0 — Versão inicial',
    rev0Date:         'Jan/2026',
    rev0Desc:         'Levantamento bottom-up dos 8 setores e primeira rodada de simulação Monte Carlo (10.000 iterações).',
    rev1Title:        'Rev1 — Atual',
    rev1Date:         'Abr/2026',
    rev1Desc:         'Incorporou "Investigação e remediação" (+R$ 19,5 M) ao total geral e corrigiu a inversão Min/Max do item 8.1.1.',
    rev2Title:        'Rev2 — Planejada',
    rev2Date:         'A definir',
    rev2Desc:         'Unificar o método de atualização monetária e fixar a contingência como campo único por projeto.',
    revCurrent:       'Vigente',
  },
  'en': {
    headerTitle:    'Executive Summary',
    headerSubtitle: 'NX Gold · Mine Closure — Financial Provisioning VP rev0',
    exportPdf:      'Export PDF',
    runSimulation:  'Run simulation',
    avgCost:        'Average cost',
    avgCostSub:     'Monte Carlo · 10,000 iterations',
    minMaxRange:    'Min–max range',
    minMaxSub:      'Total cost, 8 categories',
    updatedValue:   'Updated value 2023',
    updatedSub:     'Total cost, updated value',
    baseProvision:  'Base provision',
    baseSub:        'Present value before update',
    monetaryTitle:  'Monetary update methods (10 years, on R$ 40.57 M)',
    method1:        'Simple interest — 10.75%/yr',
    method2:        'Compound interest — 10.75%/yr',
    method3:        'Constant inflation — 3.4%/yr',
    method4:        'Escalation — variable IPCA 2024-2033',
    disbursementTitle: 'Projected disbursement by year — Grand Total',
    yearPrefix:     'YEAR',
    fanTitle:       'Confidence fan chart — cumulative disbursement by year',
    fanDesc:        'Range estimated from the Monte Carlo simulation coefficient of variation (4.97%) applied to cumulative disbursement by year — not an independent percentile (P10/P90) calculation per year.',
    risksTitle:     'Risks and points of attention',
    risk1Title:     'Divergent contingency between categories',
    risk1Desc:      'The sector summary applies 0% contingency, while the activity summary applies 20% on an equivalent base — the two totals do not converge.',
    risk2Title:     '"Investigation and remediation" outside the Grand Total',
    risk2Desc:      'Large items (e.g. treatment system → R$ 15M; plant dismantling → R$ 4.5M) are not included in the total — possible underestimation of the liability.',
    risk3Title:     'Calculated uncertainty level is too narrow',
    risk3Desc:      'The standard deviation comes only from the Min-Max range of each item — resulting in CV of ~5%, while conceptual-class estimates typically range from -30% to +50%.',
    risk4Title:     'Min/Max inversion corrected in Rev1',
    risk4Desc:      'Item 8.1.1 ("Access blocking") had inverted Min and Max in rev0 — already corrected, listed in the revision timeline changelog.',
    costTableTitle: 'Cost by category — 8 sectors',
    colHash:        '#',
    colCategory:    'Category',
    colMin:         'Min',
    colMax:         'Max',
    colUpdated:     'Updated',
    totalLabel:     'Grand total',
    riskMetricsTitle: 'Risk metrics',
    riskLow:          'Low',
    riskModerate:     'Moderate',
    riskHigh:         'High',
    contingencyLabel: 'Applied contingency',
    metricMean:       'Mean',
    metricStddev:     'Std. deviation',
    recentLaunches:   'Recent entries',
    colPeriod:        'Period',
    colValue:         'Actual value',
    colStatus:        'Status',
    statusValidated:  'Validated',
    statusReview:     'In review',
    revTimeline:      'Revision timeline',
    rev0Title:        'Rev0 — Initial version',
    rev0Date:         'Jan/2026',
    rev0Desc:         'Bottom-up survey of 8 sectors and first Monte Carlo simulation run (10,000 iterations).',
    rev1Title:        'Rev1 — Current',
    rev1Date:         'Apr/2026',
    rev1Desc:         'Added "Investigation and remediation" (+R$ 19.5 M) to the grand total and corrected the Min/Max inversion in item 8.1.1.',
    rev2Title:        'Rev2 — Planned',
    rev2Date:         'TBD',
    rev2Desc:         'Unify the monetary update method and set contingency as a single versioned field per project.',
    revCurrent:       'Current',
  },
  'es': {
    headerTitle:    'Resumen Ejecutivo',
    headerSubtitle: 'NX Gold · Cierre de Mina — Provisión financiera VP rev0',
    exportPdf:      'Exportar PDF',
    runSimulation:  'Ejecutar simulación',
    avgCost:        'Costo promedio',
    avgCostSub:     'Monte Carlo · 10.000 iteraciones',
    minMaxRange:    'Rango mín–máx',
    minMaxSub:      'Costo total, 8 categorías',
    updatedValue:   'Valor actualizado 2023',
    updatedSub:     'Costo total, valor actualizado',
    baseProvision:  'Provisión base',
    baseSub:        'Valor presente antes de actualización',
    monetaryTitle:  'Métodos de actualización monetaria (10 años, sobre R$ 40,57 M)',
    method1:        'Interés simple — 10,75%/año',
    method2:        'Interés compuesto — 10,75%/año',
    method3:        'Inflación constante — 3,4%/año',
    method4:        'Escalonamiento — IPCA variable 2024-2033',
    disbursementTitle: 'Desembolso proyectado por año — Total General',
    yearPrefix:     'AÑO',
    fanTitle:       'Abanico de confianza (fan chart) — desembolso acumulado por año',
    fanDesc:        'Rango estimado a partir del coeficiente de variación de la simulación de Monte Carlo (4,97%) aplicado al desembolso acumulado por año — no es un cálculo de percentil (P10/P90) ejecutado independientemente para cada año.',
    risksTitle:     'Riesgos y puntos de atención',
    risk1Title:     'Contingencia divergente entre categorías',
    risk1Desc:      'El resumen por sector aplica 0% de contingencia, mientras que el resumen por actividad aplica 20% sobre base equivalente — los dos totales no convergen.',
    risk2Title:     '"Investigación y remediación" fuera del Total General',
    risk2Desc:      'Ítems de gran envergadura (p. ej.: sistema de tratamiento → R$ 15M; desmontaje de planta → R$ 4,5M) no están sumados en el total — posible subestimación del pasivo.',
    risk3Title:     'Nivel de incertidumbre calculado demasiado estrecho',
    risk3Desc:      'La desviación estándar proviene solo del rango Mín-Máx de cada ítem — resulta en CV de ~5%, mientras que las estimaciones de clase conceptual suelen estar entre -30% y +50%.',
    risk4Title:     'Inversión de Mín/Máx corregida en Rev1',
    risk4Desc:      'El ítem 8.1.1 ("Bloqueo de accesos") tenía Mín y Máx invertidos en rev0 — ya corregido, listado en el registro de la línea de tiempo de revisiones.',
    costTableTitle: 'Costo por categoría — 8 sectores',
    colHash:        '#',
    colCategory:    'Categoría',
    colMin:         'Mín',
    colMax:         'Máx',
    colUpdated:     'Actualizado',
    totalLabel:     'Total general',
    riskMetricsTitle: 'Métricas de riesgo',
    riskLow:          'Bajo',
    riskModerate:     'Moderado',
    riskHigh:         'Alto',
    contingencyLabel: 'Contingencia aplicada',
    metricMean:       'Media',
    metricStddev:     'Desviación estándar',
    recentLaunches:   'Lanzamientos recientes',
    colPeriod:        'Período',
    colValue:         'Valor real',
    colStatus:        'Estado',
    statusValidated:  'Validado',
    statusReview:     'En revisión',
    revTimeline:      'Línea de tiempo de revisiones',
    rev0Title:        'Rev0 — Versión inicial',
    rev0Date:         'Ene/2026',
    rev0Desc:         'Levantamiento bottom-up de 8 sectores y primera ejecución de simulación Monte Carlo (10.000 iteraciones).',
    rev1Title:        'Rev1 — Actual',
    rev1Date:         'Abr/2026',
    rev1Desc:         'Incorporó "Investigación y remediación" (+R$ 19,5 M) al total general y corrigió la inversión Mín/Máx del ítem 8.1.1.',
    rev2Title:        'Rev2 — Planificada',
    rev2Date:         'A definir',
    rev2Desc:         'Unificar el método de actualización monetaria y fijar la contingencia como campo único versionado por proyecto.',
    revCurrent:       'Vigente',
  },
}
