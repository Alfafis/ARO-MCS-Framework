import type { Lang } from './LangContext'

export const categoriasT: Record<
  Lang,
  {
    headerTitle: string
    createCategoryBtn: string
    // CategoryBlock
    categoriesTitle: string
    emptyCategoriesMessage: string
    loadExampleBtn: (nome: string) => string
    fills: string
    collapseCategory: string
    expandCategory: string
    deleteCategory: string
    colItem: string
    colUnit: string
    colCostMin: string
    colCostMax: string
    colSource: string
    colSetores: string
    colFase: string
    colAno: string
    addItem: string
    deleteItem: string
    setoresTodos: string
    setoresNSelecionados: (n: number) => string
    fasePlaceholder: string
    fasePre: string
    faseExec: string
    fasePos: string
    anoInicioPh: string
    anoFimPh: string
    camposOpTitle: string
    camposOpColLabel: string
    camposOpColUnidade: string
    camposOpColValorRef: string
    camposOpColValor: string
    camposOpColStatus: string
    camposOpStatusPendente: string
    camposOpStatusPreenchido: string
    camposOpAdd: string
    camposOpRemove: string
    custoProvavelLabel: string
    custoProvavelPh: string
    custoProvavelHint: string
    custoProvavelOutOfRange: (moda: string, catMin: string, catMax: string, clamped: string) => string
    simModaClampedTitle: string
    simModaClampedBody: (moda: string, catMin: string, catMax: string, clamped: string) => string
    desembolsoToggle: string
    desembolsoLabel: (ano: number) => string
    desembolsoSum: string
    desembolsoTargetOk: string
    desembolsoMismatch: (diff: string) => string
    desembolsoClearAll: string
    simStatsTitle: string
    simDistNormal: (n: string) => string
    simDistTriangular: (n: string) => string
    simDistUniforme: (n: string) => string
    simStatsMean: string
    simStatsStddev: string
    simStatsP80: string
    simStatsIC: (conf: number) => string
    simStatsCV: string
  }
> = {
  'pt-BR': {
    headerTitle: 'Categorias',
    createCategoryBtn: '+ Criar categoria',
    categoriesTitle: 'Categorias de custo',
    emptyCategoriesMessage:
      'Nenhuma categoria cadastrada ainda. Comece do zero ou carregue um exemplo pra ganhar tempo.',
    loadExampleBtn: (nome) => `Carregar exemplo: ${nome}`,
    fills: 'Preenche:',
    collapseCategory: 'Recolher categoria',
    expandCategory: 'Expandir categoria',
    deleteCategory: 'Excluir categoria',
    colItem: 'Item',
    colUnit: 'Unidade',
    colCostMin: 'Custo Min',
    colCostMax: 'Custo Max',
    colSource: 'Fonte',
    colSetores: 'Setores',
    colFase: 'Fase',
    colAno: 'Ano (início→fim)',
    addItem: '+ Adicionar item',
    deleteItem: 'Excluir item',
    setoresTodos: 'Todos os setores',
    setoresNSelecionados: (n) => `${n} setor${n === 1 ? '' : 'es'}`,
    fasePlaceholder: 'A definir',
    fasePre: 'Pré-fechamento',
    faseExec: 'Fechamento',
    fasePos: 'Pós-fechamento',
    anoInicioPh: 'Ini',
    anoFimPh: 'Fim',
    camposOpTitle: 'Campos operacionais',
    camposOpColLabel: 'Campo',
    camposOpColUnidade: 'Unidade',
    camposOpColValorRef: 'Valor de referência',
    camposOpColValor: 'Valor',
    camposOpColStatus: 'Status',
    camposOpStatusPendente: 'Pendente',
    camposOpStatusPreenchido: 'Preenchido',
    camposOpAdd: '+ Adicionar campo',
    camposOpRemove: 'Excluir campo',
    custoProvavelLabel: 'Custo provável',
    custoProvavelPh: '(min + max) / 2',
    custoProvavelHint:
      'Moda "pela experiência" da categoria — alimenta a Triangular da Aro Simulação. Deixe vazio pra usar (min+max)/2.',
    custoProvavelOutOfRange: (moda, catMin, catMax, clamped) =>
      `${moda} está fora do range dos itens (${catMin} – ${catMax}). A Aro Simulação vai usar ${clamped} na Triangular — o pico da distribuição fica no extremo, média e P80 puxados pra lá. Ajuste os itens ou a moda pra evitar a distorção.`,
    simModaClampedTitle: 'Moda clampada — Triangular degenerada',
    simModaClampedBody: (moda, catMin, catMax, clamped) =>
      `A moda cadastrada (${moda}) está fora do range dos itens (${catMin} – ${catMax}); a simulação usou ${clamped}. Só a Triangular é afetada — o pico fica num extremo (mode = min ou max), média e P80 puxados pra esse lado. Normal e Uniforme não usam a moda por design.`,
    desembolsoToggle: 'Detalhar por ano',
    desembolsoLabel: (ano) => `Ano ${ano}`,
    desembolsoSum: 'Soma',
    desembolsoTargetOk: 'confere com Custo Max',
    desembolsoMismatch: (diff) => `difere do Custo Max em ${diff}`,
    desembolsoClearAll: 'Limpar todos',
    simStatsTitle: 'Estatísticas Aro Simulação',
    simDistNormal: (n) => `Normal (${n} iter.)`,
    simDistTriangular: (n) => `Triangular (${n} iter.)`,
    simDistUniforme: (n) => `Uniforme (${n} iter.)`,
    simStatsMean: 'Média',
    simStatsStddev: 'Desvio padrão',
    simStatsP80: 'P80',
    simStatsIC: (conf) => `IC ${conf}%`,
    simStatsCV: 'CV',
  },
  en: {
    headerTitle: 'Categories',
    createCategoryBtn: '+ Create category',
    categoriesTitle: 'Cost categories',
    emptyCategoriesMessage: 'No categories yet. Start from scratch or load an example to save time.',
    loadExampleBtn: (nome) => `Load example: ${nome}`,
    fills: 'Filled by:',
    collapseCategory: 'Collapse category',
    expandCategory: 'Expand category',
    deleteCategory: 'Delete category',
    colItem: 'Item',
    colUnit: 'Unit',
    colCostMin: 'Min Cost',
    colCostMax: 'Max Cost',
    colSource: 'Source',
    colSetores: 'Sectors',
    colFase: 'Phase',
    colAno: 'Year (start→end)',
    addItem: '+ Add item',
    deleteItem: 'Delete item',
    setoresTodos: 'All sectors',
    setoresNSelecionados: (n) => `${n} sector${n === 1 ? '' : 's'}`,
    fasePlaceholder: 'To define',
    fasePre: 'Pre-closure',
    faseExec: 'Closure',
    fasePos: 'Post-closure',
    anoInicioPh: 'Start',
    anoFimPh: 'End',
    camposOpTitle: 'Operational fields',
    camposOpColLabel: 'Field',
    camposOpColUnidade: 'Unit',
    camposOpColValorRef: 'Reference value',
    camposOpColValor: 'Value',
    camposOpColStatus: 'Status',
    camposOpStatusPendente: 'Pending',
    camposOpStatusPreenchido: 'Filled',
    camposOpAdd: '+ Add field',
    camposOpRemove: 'Delete field',
    custoProvavelOutOfRange: (moda, catMin, catMax, clamped) =>
      `${moda} is outside the items' range (${catMin} – ${catMax}). The Aro Simulação will use ${clamped} for Triangular — the distribution peak sits at the extreme, mean and P80 are pulled toward it. Adjust items or the mode to avoid the distortion.`,
    simModaClampedTitle: 'Mode clamped — degenerate Triangular',
    simModaClampedBody: (moda, catMin, catMax, clamped) =>
      `The configured mode (${moda}) is outside the items' range (${catMin} – ${catMax}); the simulation used ${clamped}. Only Triangular is affected — its peak lands on an extreme (mode = min or max), mean and P80 are pulled that way. Normal and Uniform do not use the mode by design.`,
    custoProvavelLabel: 'Most likely cost',
    custoProvavelPh: '(min + max) / 2',
    custoProvavelHint:
      'Category mode "from experience" — feeds Aro Simulação Triangular. Leave empty to use (min+max)/2.',
    desembolsoToggle: 'Break down by year',
    desembolsoLabel: (ano) => `Year ${ano}`,
    desembolsoSum: 'Sum',
    desembolsoTargetOk: 'matches Max Cost',
    desembolsoMismatch: (diff) => `differs from Max Cost by ${diff}`,
    desembolsoClearAll: 'Clear all',
    simStatsTitle: 'Aro Simulação statistics',
    simDistNormal: (n) => `Normal (${n} iter.)`,
    simDistTriangular: (n) => `Triangular (${n} iter.)`,
    simDistUniforme: (n) => `Uniform (${n} iter.)`,
    simStatsMean: 'Mean',
    simStatsStddev: 'Stddev',
    simStatsP80: 'P80',
    simStatsIC: (conf) => `${conf}% CI`,
    simStatsCV: 'CV',
  },
  es: {
    headerTitle: 'Categorías',
    createCategoryBtn: '+ Crear categoría',
    categoriesTitle: 'Categorías de costo',
    emptyCategoriesMessage: 'Todavía no hay categorías. Empieza de cero o carga un ejemplo para ganar tiempo.',
    loadExampleBtn: (nome) => `Cargar ejemplo: ${nome}`,
    fills: 'Completa:',
    collapseCategory: 'Contraer categoría',
    expandCategory: 'Expandir categoría',
    deleteCategory: 'Eliminar categoría',
    colItem: 'Ítem',
    colUnit: 'Unidad',
    colCostMin: 'Costo Mín',
    colCostMax: 'Costo Máx',
    colSource: 'Fuente',
    colSetores: 'Sectores',
    colFase: 'Fase',
    colAno: 'Año (inicio→fin)',
    addItem: '+ Agregar ítem',
    deleteItem: 'Eliminar ítem',
    setoresTodos: 'Todos los sectores',
    setoresNSelecionados: (n) => `${n} sector${n === 1 ? '' : 'es'}`,
    fasePlaceholder: 'A definir',
    fasePre: 'Pre-cierre',
    faseExec: 'Cierre',
    fasePos: 'Post-cierre',
    anoInicioPh: 'Ini',
    anoFimPh: 'Fin',
    camposOpTitle: 'Campos operativos',
    camposOpColLabel: 'Campo',
    camposOpColUnidade: 'Unidad',
    camposOpColValorRef: 'Valor de referencia',
    camposOpColValor: 'Valor',
    camposOpColStatus: 'Estado',
    camposOpStatusPendente: 'Pendiente',
    camposOpStatusPreenchido: 'Rellenado',
    camposOpAdd: '+ Agregar campo',
    camposOpRemove: 'Eliminar campo',
    custoProvavelOutOfRange: (moda, catMin, catMax, clamped) =>
      `${moda} está fuera del rango de los ítems (${catMin} – ${catMax}). La Aro Simulação usará ${clamped} en la Triangular — el pico queda en el extremo, media y P80 empujados hacia allá. Ajuste los ítems o la moda para evitar la distorsión.`,
    simModaClampedTitle: 'Moda clampada — Triangular degenerada',
    simModaClampedBody: (moda, catMin, catMax, clamped) =>
      `La moda configurada (${moda}) está fuera del rango de los ítems (${catMin} – ${catMax}); la simulación usó ${clamped}. Solo la Triangular es afectada — su pico queda en un extremo (mode = min o max), media y P80 empujados hacia ese lado. Normal y Uniforme no usan la moda por diseño.`,
    custoProvavelLabel: 'Costo probable',
    custoProvavelPh: '(min + max) / 2',
    custoProvavelHint:
      'Moda "por experiencia" de la categoría — alimenta la Triangular de la Aro Simulação. Vacío usa (min+max)/2.',
    desembolsoToggle: 'Detallar por año',
    desembolsoLabel: (ano) => `Año ${ano}`,
    desembolsoSum: 'Suma',
    desembolsoTargetOk: 'coincide con Costo Máx',
    desembolsoMismatch: (diff) => `difiere del Costo Máx en ${diff}`,
    desembolsoClearAll: 'Limpiar todos',
    simStatsTitle: 'Estadísticas Aro Simulação',
    simDistNormal: (n) => `Normal (${n} iter.)`,
    simDistTriangular: (n) => `Triangular (${n} iter.)`,
    simDistUniforme: (n) => `Uniforme (${n} iter.)`,
    simStatsMean: 'Media',
    simStatsStddev: 'Desviación estándar',
    simStatsP80: 'P80',
    simStatsIC: (conf) => `IC ${conf}%`,
    simStatsCV: 'CV',
  },
}
