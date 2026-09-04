import type { Lang } from './LangContext'

export const resumoT: Record<
  Lang,
  {
    // Page header
    headerTitle: string
    exportPdf: string
    runSimulation: string
    // MonetaryMethodsCard
    monetaryTitle: (base: string, anos: number) => string
    method1: (pct: string) => string
    method2: (pct: string) => string
    method3: (pct: string) => string
    method4: (anoInicio: number | null) => string
    // AnnualDisbursementCard (componente ainda sem consumidor ligado — mantido pra não quebrar o arquivo)
    disbursementTitle: string
    yearPrefix: string
    // Toggle Agregado / Detalhado (view do card de desembolso ano-a-ano)
    viewLabel: string
    viewAggregated: string
    viewDetailed: string
    // Toggle Sem provisão / Com provisão X% / Com IPCA acumulado (modo do card de desembolso)
    modoLabel: string
    modoBase: string
    modoProvisaoTemplate: string
    modoIpca: string
    modoIpcaDisabledTitle: string
    // AncoragemBadge (card de desembolso ano-a-ano)
    ancoragemIncompleteLabel: (qtdAnos: number) => string
    ancoragemIncompleteTitle: (faltantes: string, anoInicio: number) => string
    ancoragemLabel: (anoInicio: number, anoFim: number, pct: string) => string
    ancoragemTitle: (fator: string, anoInicio: number, anoFim: number) => string
    // AnnualDisbursementDetailedCard (aba `9. Síntese Por Atividade` da planilha)
    disbursementDetailedTitle: string
    detailedActivityHeader: string
    detailedSubtotalLabel: (categoria: string) => string
    detailedContingencyLabel: (pct: number) => string
    detailedTotalPerYearLabel: string
    detailedIpcaMultiplierLabel: string
    detailedTotalWithIpcaLabel: string
    detailedFooterNote: string
    // FanChartCard (idem — sem consumidor ligado)
    fanTitle: string
    fanDesc: (cv: string) => string
    // CostByCategoryTable
    costTableTitle: (count: number) => string
    colHash: string
    colCategory: string
    colMin: string
    colMax: string
    colUpdated: string
    totalLabel: string
    // CostByCategoryTable — agrupamento por fase (groupByPhase, hoje sempre false nos consumidores reais,
    // mas o componente monta os rótulos incondicionalmente)
    phasePreLabel: string
    phasePreDesc: string
    phasePreYears: string
    phaseClosureLabel: string
    phaseClosureDesc: string
    phaseClosureYears: string
    phasePostLabel: string
    phasePostDesc: string
    phasePostYears: string
    // RiskMetricsCard
    riskMetricsTitle: string
    riskLow: string
    riskModerate: string
    riskHigh: string
    contingencyLabel: string
    // RevisionTimeline
    revTimeline: string
    revCurrent: string
    revDraftDesc: string
    revCurrentDesc: string
    revReplacedDesc: string
    revEmpty: string
  }
> = {
  'pt-BR': {
    headerTitle: 'Resumo Executivo',
    exportPdf: 'Exportar PDF',
    runSimulation: 'Rodar simulação',
    monetaryTitle: (base, anos) => `Métodos de atualização monetária (${anos} anos, sobre ${base})`,
    method1: (pct) => `Juros simples — ${pct}%/ano`,
    method2: (pct) => `Juros compostos — ${pct}%/ano`,
    method3: (pct) => `Inflação constante — ${pct}%/ano`,
    method4: (ano) =>
      ano !== null ? `Escalonamento — IPCA variável ${ano}-${ano + 9}` : 'Escalonamento — IPCA variável', // +9 = HORIZON_YEARS-1 (lib/financeiro.ts)
    disbursementTitle: 'Desembolso projetado por ano — Total Geral',
    yearPrefix: 'ANO',
    viewLabel: 'Visão:',
    viewAggregated: 'Agregado por categoria',
    viewDetailed: 'Detalhado por atividade',
    modoLabel: 'Modo:',
    modoBase: 'Sem provisão',
    modoProvisaoTemplate: 'Com provisão {pct}%',
    modoIpca: 'Com IPCA acumulado',
    modoIpcaDisabledTitle: 'IPCA anual não configurado em Parâmetros Globais',
    ancoragemIncompleteLabel: (qtdAnos) => `⚠ ancoragem incompleta (${qtdAnos} ano${qtdAnos === 1 ? '' : 's'} sem IPCA)`,
    ancoragemIncompleteTitle: (faltantes, anoInicio) =>
      `Anos sem IPCA em parâmetros anuais: ${faltantes}. Sem ancoragem — valores em base ${anoInicio}.`,
    ancoragemLabel: (anoInicio, anoFim, pct) => `ancoragem ${anoInicio}→${anoFim} (+${pct}%)`,
    ancoragemTitle: (fator, anoInicio, anoFim) =>
      `Valores multiplicados por ${fator} (IPCA acumulado ${anoInicio}–${anoFim}).`,
    disbursementDetailedTitle: 'Detalhamento por atividade — item × ano',
    detailedActivityHeader: 'Atividade',
    detailedSubtotalLabel: (categoria) => `Subtotal ${categoria}`,
    detailedContingencyLabel: (pct) => `Contingência ${pct}%`,
    detailedTotalPerYearLabel: 'Total por ano (base + contingência)',
    detailedIpcaMultiplierLabel: 'Multiplicador IPCA acumulado',
    detailedTotalWithIpcaLabel: 'Total corrigido por IPCA',
    detailedFooterNote:
      'Cada linha representa um item de custo distribuído ano a ano. A linha de contingência aplica o percentual configurado sobre a soma dos itens por ano; o total agrega itens + contingência. No modo IPCA, o multiplicador acumulado e o total corrigido aparecem nas duas linhas finais.',
    fanTitle: 'Leque de confiança (fan chart) — desembolso acumulado por ano',
    fanDesc: (cv) =>
      `Faixa estimada a partir do coeficiente de variação da Aro Simulação (${cv}%) aplicado ao desembolso acumulado por ano — não é um cálculo de percentil (P10/P90) rodado independentemente para cada ano.`,
    costTableTitle: (count) => `Custo por categoria — ${count} setores`,
    colHash: '#',
    colCategory: 'Categoria',
    colMin: 'Min',
    colMax: 'Max',
    colUpdated: 'Atualizado',
    totalLabel: 'Total geral',
    phasePreLabel: 'Pré-Fechamento',
    phasePreDesc: 'Estudos + Cavas',
    phasePreYears: 'Anos 1–4',
    phaseClosureLabel: 'Fechamento',
    phaseClosureDesc: 'Pilhas, Barragens, Planta, Áreas, Demolição',
    phaseClosureYears: 'Anos 5–6',
    phasePostLabel: 'Pós-Fechamento',
    phasePostDesc: 'Monitoramento',
    phasePostYears: 'Anos 7–10',
    riskMetricsTitle: 'Métricas de risco',
    riskLow: 'Baixo',
    riskModerate: 'Moderado',
    riskHigh: 'Alto',
    contingencyLabel: 'Contingência aplicada',
    revTimeline: 'Timeline de revisões',
    revCurrent: 'Vigente',
    revDraftDesc: 'Revisão em elaboração, ainda não publicada.',
    revCurrentDesc: 'Revisão vigente deste projeto.',
    revReplacedDesc: 'Revisão substituída por uma versão mais recente.',
    revEmpty: 'Nenhuma revisão criada ainda.',
  },
  en: {
    headerTitle: 'Executive Summary',
    exportPdf: 'Export PDF',
    runSimulation: 'Run simulation',
    monetaryTitle: (base, anos) => `Monetary update methods (${anos} years, on ${base})`,
    method1: (pct) => `Simple interest — ${pct}%/yr`,
    method2: (pct) => `Compound interest — ${pct}%/yr`,
    method3: (pct) => `Constant inflation — ${pct}%/yr`,
    method4: (ano) => (ano !== null ? `Escalation — variable IPCA ${ano}-${ano + 9}` : 'Escalation — variable IPCA'),
    disbursementTitle: 'Projected disbursement by year — Grand Total',
    yearPrefix: 'YEAR',
    viewLabel: 'View:',
    viewAggregated: 'Aggregated by category',
    viewDetailed: 'Detailed by activity',
    modoLabel: 'Mode:',
    modoBase: 'No provision',
    modoProvisaoTemplate: 'With {pct}% provision',
    modoIpca: 'With accumulated CPI',
    modoIpcaDisabledTitle: 'Annual CPI not configured in Global Parameters',
    ancoragemIncompleteLabel: (qtdAnos) => `⚠ incomplete anchoring (${qtdAnos} year${qtdAnos === 1 ? '' : 's'} without CPI)`,
    ancoragemIncompleteTitle: (faltantes, anoInicio) =>
      `Years without CPI in annual parameters: ${faltantes}. No anchoring — values at base ${anoInicio}.`,
    ancoragemLabel: (anoInicio, anoFim, pct) => `anchoring ${anoInicio}→${anoFim} (+${pct}%)`,
    ancoragemTitle: (fator, anoInicio, anoFim) =>
      `Values multiplied by ${fator} (accumulated CPI ${anoInicio}–${anoFim}).`,
    disbursementDetailedTitle: 'Detail by activity — item × year',
    detailedActivityHeader: 'Activity',
    detailedSubtotalLabel: (categoria) => `Subtotal ${categoria}`,
    detailedContingencyLabel: (pct) => `Contingency ${pct}%`,
    detailedTotalPerYearLabel: 'Total per year (base + contingency)',
    detailedIpcaMultiplierLabel: 'Cumulative IPCA multiplier',
    detailedTotalWithIpcaLabel: 'Total adjusted by IPCA',
    detailedFooterNote:
      'Each row represents a cost item distributed year by year. The contingency row applies the configured percentage to the item sum per year; the total aggregates items + contingency. In IPCA mode, the cumulative multiplier and the adjusted total appear in the final two rows.',
    fanTitle: 'Confidence fan chart — cumulative disbursement by year',
    fanDesc: (cv) =>
      `Range estimated from the Aro Simulação coefficient of variation (${cv}%) applied to cumulative disbursement by year — not an independent percentile (P10/P90) calculation per year.`,
    costTableTitle: (count) => `Cost by category — ${count} sectors`,
    colHash: '#',
    colCategory: 'Category',
    colMin: 'Min',
    colMax: 'Max',
    colUpdated: 'Updated',
    totalLabel: 'Grand total',
    phasePreLabel: 'Pre-Closure',
    phasePreDesc: 'Studies + Cavas',
    phasePreYears: 'Years 1–4',
    phaseClosureLabel: 'Closure',
    phaseClosureDesc: 'Piles, Dams, Plant, Support Areas, Demolition',
    phaseClosureYears: 'Years 5–6',
    phasePostLabel: 'Post-Closure',
    phasePostDesc: 'Monitoring',
    phasePostYears: 'Years 7–10',
    riskMetricsTitle: 'Risk metrics',
    riskLow: 'Low',
    riskModerate: 'Moderate',
    riskHigh: 'High',
    contingencyLabel: 'Applied contingency',
    revTimeline: 'Revision timeline',
    revCurrent: 'Current',
    revDraftDesc: 'Revision in progress, not yet published.',
    revCurrentDesc: 'Current revision of this project.',
    revReplacedDesc: 'Revision replaced by a more recent version.',
    revEmpty: 'No revision created yet.',
  },
  es: {
    headerTitle: 'Resumen Ejecutivo',
    exportPdf: 'Exportar PDF',
    runSimulation: 'Ejecutar simulación',
    monetaryTitle: (base, anos) => `Métodos de actualización monetaria (${anos} años, sobre ${base})`,
    method1: (pct) => `Interés simple — ${pct}%/año`,
    method2: (pct) => `Interés compuesto — ${pct}%/año`,
    method3: (pct) => `Inflación constante — ${pct}%/año`,
    method4: (ano) =>
      ano !== null ? `Escalonamiento — IPCA variable ${ano}-${ano + 9}` : 'Escalonamiento — IPCA variable',
    disbursementTitle: 'Desembolso proyectado por año — Total General',
    yearPrefix: 'AÑO',
    viewLabel: 'Vista:',
    viewAggregated: 'Agregado por categoría',
    viewDetailed: 'Detallado por actividad',
    modoLabel: 'Modo:',
    modoBase: 'Sin provisión',
    modoProvisaoTemplate: 'Con provisión {pct}%',
    modoIpca: 'Con IPC acumulado',
    modoIpcaDisabledTitle: 'IPC anual no configurado en Parámetros Globales',
    ancoragemIncompleteLabel: (qtdAnos) => `⚠ anclaje incompleto (${qtdAnos} año${qtdAnos === 1 ? '' : 's'} sin IPC)`,
    ancoragemIncompleteTitle: (faltantes, anoInicio) =>
      `Años sin IPC en parámetros anuales: ${faltantes}. Sin anclaje — valores en base ${anoInicio}.`,
    ancoragemLabel: (anoInicio, anoFim, pct) => `anclaje ${anoInicio}→${anoFim} (+${pct}%)`,
    ancoragemTitle: (fator, anoInicio, anoFim) =>
      `Valores multiplicados por ${fator} (IPC acumulado ${anoInicio}–${anoFim}).`,
    disbursementDetailedTitle: 'Detalle por actividad — ítem × año',
    detailedActivityHeader: 'Actividad',
    detailedSubtotalLabel: (categoria) => `Subtotal ${categoria}`,
    detailedContingencyLabel: (pct) => `Contingencia ${pct}%`,
    detailedTotalPerYearLabel: 'Total por año (base + contingencia)',
    detailedIpcaMultiplierLabel: 'Multiplicador IPCA acumulado',
    detailedTotalWithIpcaLabel: 'Total corregido por IPCA',
    detailedFooterNote:
      'Cada fila representa un ítem de costo distribuido año a año. La fila de contingencia aplica el porcentaje configurado sobre la suma de los ítems por año; el total agrega ítems + contingencia. En el modo IPCA, el multiplicador acumulado y el total ajustado aparecen en las dos filas finales.',
    fanTitle: 'Abanico de confianza (fan chart) — desembolso acumulado por año',
    fanDesc: (cv) =>
      `Rango estimado a partir del coeficiente de variación de la Aro Simulação (${cv}%) aplicado al desembolso acumulado por año — no es un cálculo de percentil (P10/P90) ejecutado independientemente para cada año.`,
    costTableTitle: (count) => `Costo por categoría — ${count} sectores`,
    colHash: '#',
    colCategory: 'Categoría',
    colMin: 'Mín',
    colMax: 'Máx',
    colUpdated: 'Actualizado',
    totalLabel: 'Total general',
    phasePreLabel: 'Pre-Cierre',
    phasePreDesc: 'Estudios + Cavas',
    phasePreYears: 'Años 1–4',
    phaseClosureLabel: 'Cierre',
    phaseClosureDesc: 'Pilas, Represas, Planta, Áreas de Apoyo, Demolición',
    phaseClosureYears: 'Años 5–6',
    phasePostLabel: 'Post-Cierre',
    phasePostDesc: 'Monitoreo',
    phasePostYears: 'Años 7–10',
    riskMetricsTitle: 'Métricas de riesgo',
    riskLow: 'Bajo',
    riskModerate: 'Moderado',
    riskHigh: 'Alto',
    contingencyLabel: 'Contingencia aplicada',
    revTimeline: 'Línea de tiempo de revisiones',
    revCurrent: 'Vigente',
    revDraftDesc: 'Revisión en elaboración, aún no publicada.',
    revCurrentDesc: 'Revisión vigente de este proyecto.',
    revReplacedDesc: 'Revisión sustituida por una versión más reciente.',
    revEmpty: 'Todavía no hay ninguna revisión creada.',
  },
}
