import type { Lang } from './LangContext'

export const simulacaoT: Record<Lang, {
  headerTitle:        string
  headerSubtitle:     string
  seeHistory:         string
  params:             string
  statDist:           string
  iterCount:          string
  categoriesIncluded: string
  confidenceLevel:    string
  catAll:             string
  catCustom:          string
  simDesc:            (n: string) => string
  running:            string
  run:                string
  lastResult:         string
  statMean:           string
  statStddev:         string
  uncertainty_low:    string
  uncertainty_mod:    string
  uncertainty_high:   string
  variationSuffix:    string
  histTitle:          (n: string) => string
  uncertaintyTitle:   string
  historyTitle:       string
  iterSuffix:         string
  unc_low:            string
  unc_mod:            string
  unc_high:           string
  justFinished:       string
  runFrom:            string
  noResultYet:        string
  months:             string[]
  distLabels:         Record<'Triangular' | 'Normal' | 'Uniforme', string>
  // Sensibilidade final MC Ano 10 (aba `Simulation` da planilha NX Gold)
  sensAno10Title:      (iter: string) => string
  sensAno10Base:       string
  sensAno10RangeInfo:  (min: number, max: number) => string
  sensAno10Mean:       string
  sensAno10Stddev:     string
  sensAno10P50:        string
  sensAno10P80:        string
  sensAno10P95:        string
  sensAno10CV:         string
  sensAno10ModeIpca:   string
  sensAno10ModeProv:   string
  sensAno10Empty:      string
  sensAno10FooterNote: string
}> = {
  'pt-BR': {
    headerTitle:        'Aro Simulação',
    headerSubtitle:     'Análise probabilística de custo de fechamento',
    seeHistory:         'Ver rodadas anteriores',
    params:             'Parâmetros',
    statDist:           'Distribuição estatística',
    iterCount:          'Número de iterações',
    categoriesIncluded: 'Categorias incluídas',
    confidenceLevel:    'Nível de confiança',
    catAll:             'Todas as 8 categorias',
    catCustom:          'Personalizar seleção',
    simDesc:            (n) => `A simulação gera ${n} cenários aleatórios combinando os custos mín/máx de cada item e apresenta a distribuição de probabilidade do custo total.`,
    running:            'Simulando…',
    run:                'Rodar simulação',
    lastResult:         'Resultado da última rodada',
    statMean:           'Média',
    statStddev:         'Desvio-padrão',
    uncertainty_low:    'Incerteza baixa',
    uncertainty_mod:    'Incerteza moderada',
    uncertainty_high:   'Incerteza alta',
    variationSuffix:    'de variação no intervalo de confiança de 95%.',
    histTitle:          (n) => `Distribuição de custo total (${n} iterações)`,
    uncertaintyTitle:   'Contribuição de incerteza por categoria',
    historyTitle:       'Rodadas anteriores',
    iterSuffix:         'iterações',
    unc_low:            'Baixa',
    unc_mod:            'Moderada',
    unc_high:           'Alta',
    justFinished:       'Concluída agora mesmo',
    runFrom:            'Rodada de',
    noResultYet:        'Nenhuma simulação rodada ainda. Configure os parâmetros e clique em Rodar simulação.',
    months:             ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
    distLabels:         { Triangular: 'Triangular', Normal: 'Normal', Uniforme: 'Uniforme' },
    sensAno10Title:      (iter) => `Sensibilidade final do Ano 10 (${iter} iterações)`,
    sensAno10Base:       'Valor base Ano 10',
    sensAno10RangeInfo:  (min, max) => `Taxa de escalação sorteada entre ${min}% e ${max}% por iteração`,
    sensAno10Mean:       'Média',
    sensAno10Stddev:     'σ',
    sensAno10P50:        'P50',
    sensAno10P80:        'P80',
    sensAno10P95:        'P95',
    sensAno10CV:         'CV',
    sensAno10ModeIpca:   'IPCA acumulado',
    sensAno10ModeProv:   'Com provisão (IPCA indisponível)',
    sensAno10Empty:      'Cadastre categorias com desembolso ano-a-ano para habilitar a sensibilidade final.',
    sensAno10FooterNote: 'Cada iteração sorteia uma taxa aleatória inteira dentro da faixa configurada e aplica o multiplicador (1 + taxa) sobre o valor do Ano 10 já corrigido por IPCA acumulado (ou provisão, se IPCA incompleto). Mede a incerteza de taxa final acima da incerteza de escopo já capturada pela Aro Simulação principal.',
  },
  'en': {
    headerTitle:        'Aro Simulação',
    headerSubtitle:     'Probabilistic closure cost analysis',
    seeHistory:         'See previous runs',
    params:             'Parameters',
    statDist:           'Statistical distribution',
    iterCount:          'Number of iterations',
    categoriesIncluded: 'Included categories',
    confidenceLevel:    'Confidence level',
    catAll:             'All 8 categories',
    catCustom:          'Custom selection',
    simDesc:            (n) => `The simulation generates ${n} random scenarios combining the min/max costs of each item and presents the probability distribution of the total cost.`,
    running:            'Running…',
    run:                'Run simulation',
    lastResult:         'Last run result',
    statMean:           'Mean',
    statStddev:         'Std. deviation',
    uncertainty_low:    'Low uncertainty',
    uncertainty_mod:    'Moderate uncertainty',
    uncertainty_high:   'High uncertainty',
    variationSuffix:    'of variation in the 95% confidence interval.',
    histTitle:          (n) => `Total cost distribution (${n} iterations)`,
    uncertaintyTitle:   'Uncertainty contribution by category',
    historyTitle:       'Previous runs',
    iterSuffix:         'iterations',
    unc_low:            'Low',
    unc_mod:            'Moderate',
    unc_high:           'High',
    justFinished:       'Just completed',
    runFrom:            'Run from',
    noResultYet:        'No simulation run yet. Configure the parameters and click Run simulation.',
    months:             ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    distLabels:         { Triangular: 'Triangular', Normal: 'Normal', Uniforme: 'Uniform' },
    sensAno10Title:      (iter) => `Year 10 final sensitivity (${iter} iterations)`,
    sensAno10Base:       'Year 10 base value',
    sensAno10RangeInfo:  (min, max) => `Escalation rate drawn between ${min}% and ${max}% per iteration`,
    sensAno10Mean:       'Mean',
    sensAno10Stddev:     'σ',
    sensAno10P50:        'P50',
    sensAno10P80:        'P80',
    sensAno10P95:        'P95',
    sensAno10CV:         'CV',
    sensAno10ModeIpca:   'Cumulative IPCA',
    sensAno10ModeProv:   'With provision (IPCA unavailable)',
    sensAno10Empty:      'Register categories with year-by-year disbursement to enable the final sensitivity.',
    sensAno10FooterNote: 'Each iteration draws a random integer rate within the configured range and applies the multiplier (1 + rate) on top of the Year 10 value already adjusted by cumulative IPCA (or provision, if IPCA is incomplete). It measures the final rate uncertainty on top of the scope uncertainty already captured by the main Aro Simulação.',
  },
  'es': {
    headerTitle:        'Aro Simulação',
    headerSubtitle:     'Análisis probabilístico de costo de cierre',
    seeHistory:         'Ver ejecuciones anteriores',
    params:             'Parámetros',
    statDist:           'Distribución estadística',
    iterCount:          'Número de iteraciones',
    categoriesIncluded: 'Categorías incluidas',
    confidenceLevel:    'Nivel de confianza',
    catAll:             'Todas las 8 categorías',
    catCustom:          'Selección personalizada',
    simDesc:            (n) => `La simulación genera ${n} escenarios aleatorios combinando los costos mín/máx de cada ítem y presenta la distribución de probabilidad del costo total.`,
    running:            'Simulando…',
    run:                'Ejecutar simulación',
    lastResult:         'Resultado de la última ejecución',
    statMean:           'Media',
    statStddev:         'Desviación estándar',
    uncertainty_low:    'Incertidumbre baja',
    uncertainty_mod:    'Incertidumbre moderada',
    uncertainty_high:   'Incertidumbre alta',
    variationSuffix:    'de variación en el intervalo de confianza del 95%.',
    histTitle:          (n) => `Distribución de costo total (${n} iteraciones)`,
    uncertaintyTitle:   'Contribución de incertidumbre por categoría',
    historyTitle:       'Ejecuciones anteriores',
    iterSuffix:         'iteraciones',
    unc_low:            'Baja',
    unc_mod:            'Moderada',
    unc_high:           'Alta',
    justFinished:       'Recién completada',
    runFrom:            'Ejecución del',
    noResultYet:        'Ninguna simulación ejecutada aún. Configure los parámetros y haga clic en Ejecutar simulación.',
    months:             ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
    distLabels:         { Triangular: 'Triangular', Normal: 'Normal', Uniforme: 'Uniforme' },
    sensAno10Title:      (iter) => `Sensibilidad final del Año 10 (${iter} iteraciones)`,
    sensAno10Base:       'Valor base Año 10',
    sensAno10RangeInfo:  (min, max) => `Tasa de escalación sorteada entre ${min}% y ${max}% por iteración`,
    sensAno10Mean:       'Media',
    sensAno10Stddev:     'σ',
    sensAno10P50:        'P50',
    sensAno10P80:        'P80',
    sensAno10P95:        'P95',
    sensAno10CV:         'CV',
    sensAno10ModeIpca:   'IPCA acumulado',
    sensAno10ModeProv:   'Con provisión (IPCA no disponible)',
    sensAno10Empty:      'Registre categorías con desembolso año a año para habilitar la sensibilidad final.',
    sensAno10FooterNote: 'Cada iteración sortea una tasa entera aleatoria dentro del rango configurado y aplica el multiplicador (1 + tasa) sobre el valor del Año 10 ya corregido por IPCA acumulado (o provisión, si IPCA está incompleto). Mide la incertidumbre de tasa final por encima de la incertidumbre de alcance ya capturada por la Aro Simulação principal.',
  },
}
