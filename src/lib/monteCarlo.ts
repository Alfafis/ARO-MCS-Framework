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
// mode = ponto médio min/max — sem um campo "mais provável" capturado por item ainda,
// é a melhor aproximação disponível (ver docs/simulacao.md).
// Nome vem do catálogo (compartilhado) — valores vêm só dos itens deste projeto.
export function categoryParamsFromCategorias(categorias: Category[], catalogo: CategoriaCatalogo[]): CategoryParam[] {
  return categorias
    .map(cat => {
      let min = 0, max = 0
      for (const item of cat.items) {
        min += parseMoedaBR(item.min)
        max += parseMoedaBR(item.max)
      }
      const nome = catalogo.find(c => c.id === cat.catalogoId)?.nome ?? '—'
      return { name: nome, min, max, mode: (min + max) / 2 }
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
