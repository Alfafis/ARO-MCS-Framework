import type { Distribution } from '@/types/simulacao'
import type { Category, CategoriaCatalogo } from '@/types/categorias'
import { parseMoedaBR } from '@/lib/financeiro'

export interface CategoryParam {
  name: string
  min:  number
  mode: number
  max:  number
}

// Deriva os parâmetros da simulação a partir dos itens cadastrados em Categorias.
// mode vem de `categoria.custoProvavel` (moda "pela experiência" — F18 da planilha
// NX Gold, ver `_Dados_Formulas_Planilha.md`). Fallback pra ponto médio (min+max)/2
// quando null. Se o valor informado estiver fora de [min, max], clamp — a
// Triangular exige min ≤ mode ≤ max, e o consultor pode ter editado items depois
// de definir a moda.
// Nome vem do catálogo (compartilhado) — valores vêm só dos itens deste projeto.
// `fatorAncoragem` multiplica min/mode/max uniformemente (default 1 = no-op).
// Aplicado APÓS o clamp de mode em [min, max] usando os valores base — assim o
// invariante da Triangular (min <= mode <= max) é preservado no escalamento.
export function categoryParamsFromCategorias(categorias: Category[], catalogo: CategoriaCatalogo[], fatorAncoragem: number = 1): CategoryParam[] {
  return categorias
    .map(cat => {
      let min = 0, max = 0
      for (const item of cat.items) {
        min += parseMoedaBR(item.min)
        max += parseMoedaBR(item.max)
      }
      const nome    = catalogo.find(c => c.id === cat.catalogoId)?.nome ?? '—'
      const midMode = (min + max) / 2
      const rawMode = cat.custoProvavel ?? midMode
      const mode    = Math.max(min, Math.min(max, rawMode))
      return {
        name: nome,
        min:  min  * fatorAncoragem,
        max:  max  * fatorAncoragem,
        mode: mode * fatorAncoragem,
      }
    })
    .filter(c => c.min > 0 || c.max > 0)
}

export const MIN_ITERATIONS = 100
export const MAX_ITERATIONS = 100_000

export function parseIterationsNumber(input: string): number {
  const n = parseInt(input.replace(/\D/g, ''), 10)
  if (!Number.isFinite(n) || n <= 0) return MIN_ITERATIONS
  return Math.min(MAX_ITERATIONS, Math.max(MIN_ITERATIONS, n))
}

export function clampIterations(input: string): string {
  return parseIterationsNumber(input).toLocaleString('pt-BR')
}

export function maskIterations(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 6)
  if (!digits) return ''
  const n = Math.min(MAX_ITERATIONS, parseInt(digits, 10))
  return n.toLocaleString('pt-BR')
}

// Analytical stddev per category based on distribution type
export function categoryStddev(cat: CategoryParam, dist: Distribution): number {
  if (dist === 'Normal' || dist === 'Uniforme') {
    return (cat.max - cat.min) / Math.sqrt(12)
  }
  // Triangular: σ = sqrt((a²+b²+c²-ab-ac-bc)/18)
  const { min: a, mode: b, max: c } = cat
  return Math.sqrt((a*a + b*b + c*c - a*b - a*c - b*c) / 18)
}

// Analytical mean per category based on distribution type
export function categoryMean(cat: CategoryParam, dist: Distribution): number {
  if (dist === 'Triangular') return (cat.min + cat.mode + cat.max) / 3
  return (cat.min + cat.max) / 2
}

function sampleTriangular(min: number, mode: number, max: number): number {
  const u  = Math.random()
  const fc = (mode - min) / (max - min)
  if (u < fc) return min + Math.sqrt(u * (max - min) * (mode - min))
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode))
}

function sampleNormal(min: number, max: number): number {
  const mean = (min + max) / 2
  const sd   = (max - min) / Math.sqrt(12)
  const u1   = Math.random() || 1e-10
  const u2   = Math.random()
  const z    = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return Math.max(min, Math.min(max, mean + z * sd))
}

function sampleUniform(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export interface MCResult {
  mean:        number
  stddev:      number
  p10:         number
  p90:         number
  p80:         number
  icLo:        number
  icHi:        number
  minVal:      number
  maxVal:      number
  cv:          number
  exceedProb:  number
  bars:        number[]
}

// Thin wrapper para rodar MC de UMA categoria só — usado pelo card de
// estatísticas MC no CategoryBlock. Semanticamente equivalente a
// runMonteCarlo com activeCategories = {param.name}, mas com nome
// explícito pra o call-site ficar legível.
export function mcForOneCategory(
  dist:       Distribution,
  iterations: number,
  param:      CategoryParam,
  confidence = 95,
): MCResult {
  return runMonteCarlo(dist, iterations, [param], new Set([param.name]), confidence)
}

export function runMonteCarlo(
  dist:             Distribution,
  iterations:       number,
  categoryParams:   CategoryParam[],
  activeCategories: Set<string>,
  confidence = 95,
): MCResult {
  const cats = categoryParams.filter(c => activeCategories.has(c.name))
  const n    = Math.max(100, Math.min(100_000, iterations))
  const results = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    let total = 0
    for (const cat of cats) {
      if (dist === 'Triangular')   total += sampleTriangular(cat.min, cat.mode, cat.max)
      else if (dist === 'Normal')  total += sampleNormal(cat.min, cat.max)
      else                         total += sampleUniform(cat.min, cat.max)
    }
    results[i] = total
  }

  results.sort()

  let sum = 0
  for (let i = 0; i < n; i++) sum += results[i]
  const mean = sum / n

  let sumSq = 0
  for (let i = 0; i < n; i++) sumSq += (results[i] - mean) ** 2
  const stddev = Math.sqrt(sumSq / n)

  const p10  = results[Math.floor(n * 0.10)]
  const p90  = results[Math.floor(n * 0.90)]
  const p80  = results[Math.floor(n * 0.80)]
  const half = (1 - confidence / 100) / 2
  const icLo = results[Math.floor(n * half)]
  const icHi = results[Math.floor(n * (1 - half))]
  const minVal = results[0]
  const maxVal = results[n - 1]
  const cv     = stddev / mean

  // P(X > soma das modas) — probabilidade de ultrapassar o custo-base mais provável
  const modeSum = cats.reduce((s, c) => s + c.mode, 0)
  let lo = 0, hi = n
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (results[mid] <= modeSum) lo = mid + 1
    else hi = mid
  }
  const exceedProb = (n - lo) / n

  const range   = maxVal - minVal || 1
  const binSize = range / 12
  const bins    = new Array<number>(12).fill(0)
  for (let i = 0; i < n; i++) {
    const idx = Math.min(11, Math.floor((results[i] - minVal) / binSize))
    bins[idx]++
  }
  const maxBin = Math.max(...bins)
  const bars   = bins.map(b => Math.max(2, Math.round((b / maxBin) * 100)))

  return { mean, stddev, p10, p90, p80, icLo, icHi, minVal, maxVal, cv, exceedProb, bars }
}

// Sensibilidade final do Ano 10 — replica a aba `Simulation` da planilha NX
// Gold (`_Dados_Formulas_Planilha.md` §Etapa 6). Toma o valor base do Ano 10
// (já anchado + provisão + IPCA acumulado, calculado por `computeDesembolsoMatrix`
// no modo `ipca` ou `provisao`) e roda 10.000 iterações sorteando uma taxa
// aleatória entre `taxaMinPct` e `taxaMaxPct` (1..10 na planilha) — cada
// iteração multiplica o base por `(1 + taxa/100)`, gerando a distribuição do
// valor sob incerteza da taxa de escalação final.
//
// Fórmula equivalente à planilha (linhas 4..10003 da aba Simulation):
//   O2 = RANDBETWEEN(taxaMinPct, taxaMaxPct)
//   P2 = O2 / 100
//   M4 = baseAno10 * (1 + P2)
//
// Retorna média, σ, percentis P10/P50/P80/P90/P95, CV, min/max e histograma
// de 12 bins (mesmo shape do `runMonteCarlo` pra reusar o HistogramCard).
export interface MCSensibilidadeAno10Result {
  base:   number
  mean:   number
  stddev: number
  p10:    number
  p50:    number
  p80:    number
  p90:    number
  p95:    number
  minVal: number
  maxVal: number
  cv:     number
  bars:   number[]
  taxaMinPct: number
  taxaMaxPct: number
  iterations: number
}

export function mcSensibilidadeAno10(
  baseAno10:  number,
  iterations = 10_000,
  taxaMinPct = 1,
  taxaMaxPct = 10,
): MCSensibilidadeAno10Result {
  const n = Math.max(100, Math.min(100_000, iterations))
  const results = new Float64Array(n)

  // RANDBETWEEN(a,b) da planilha é inteiro inclusivo entre a e b.
  // Reproduz-se com Math.floor(Math.random() * (b-a+1)) + a.
  const spanInclusive = taxaMaxPct - taxaMinPct + 1
  for (let i = 0; i < n; i++) {
    const taxaInt = Math.floor(Math.random() * spanInclusive) + taxaMinPct
    results[i] = baseAno10 * (1 + taxaInt / 100)
  }

  results.sort()

  let sum = 0
  for (let i = 0; i < n; i++) sum += results[i]
  const mean = sum / n

  let sumSq = 0
  for (let i = 0; i < n; i++) sumSq += (results[i] - mean) ** 2
  const stddev = Math.sqrt(sumSq / n)

  const p10  = results[Math.floor(n * 0.10)]
  const p50  = results[Math.floor(n * 0.50)]
  const p80  = results[Math.floor(n * 0.80)]
  const p90  = results[Math.floor(n * 0.90)]
  const p95  = results[Math.floor(n * 0.95)]
  const minVal = results[0]
  const maxVal = results[n - 1]
  const cv     = mean > 0 ? stddev / mean : 0

  const range   = maxVal - minVal || 1
  const binSize = range / 12
  const bins    = new Array<number>(12).fill(0)
  for (let i = 0; i < n; i++) {
    const idx = Math.min(11, Math.floor((results[i] - minVal) / binSize))
    bins[idx]++
  }
  const maxBin = Math.max(...bins)
  const bars   = bins.map(b => Math.max(2, Math.round((b / maxBin) * 100)))

  return {
    base: baseAno10,
    mean, stddev, p10, p50, p80, p90, p95, minVal, maxVal, cv, bars,
    taxaMinPct, taxaMaxPct, iterations: n,
  }
}
