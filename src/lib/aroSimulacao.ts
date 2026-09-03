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

// RB-03 (metodologia ARO-MCS Framework): mínimo de 10.000 iterações por
// execução. Piso de UI e piso de engine são o mesmo valor de propósito — não
// dá pra confiar só na máscara do campo, porque nem todo call site passa
// pelo input do usuário (ex.: CategoryAroSimStatsCard chama a engine direto
// com N fixo). O piso real fica em `runAroSimulacao`, este aqui é o piso do
// campo de texto.
export const MIN_ITERATIONS = 10_000
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

// Analytical stddev per category based on distribution type — precisa bater
// com o que `sampleNormal`/`sampleTriangular`/`sampleUniform` de fato
// simulam, senão `UncertaintyCard` mostra incerteza analítica divergente do
// resultado da simulação.
export function categoryStddev(cat: CategoryParam, dist: Distribution): number {
  if (dist === 'Uniforme') return (cat.max - cat.min) / Math.sqrt(12)
  if (dist === 'Normal')   return (cat.max - cat.min) / 6 // PERT 3-sigma, ver sampleNormal
  // Triangular: σ = sqrt((a²+b²+c²-ab-ac-bc)/18)
  const { min: a, mode: b, max: c } = cat
  return Math.sqrt((a*a + b*b + c*c - a*b - a*c - b*c) / 18)
}

// Analytical mean per category based on distribution type
export function categoryMean(cat: CategoryParam, dist: Distribution): number {
  if (dist === 'Triangular') return (cat.min + cat.mode + cat.max) / 3
  if (dist === 'Normal')     return (cat.min + 4 * cat.mode + cat.max) / 6 // PERT, ver sampleNormal
  return (cat.min + cat.max) / 2
}

// PRNG determinístico (mulberry32) — substitui Math.random() pra permitir
// reprodutibilidade via seed (RB-04: "cada execução deve ser associada a
// uma Semente do PRNG, garantindo que os mesmos inputs reproduzam os mesmos
// outputs"). Sem seed, Math.random() nunca reproduz a mesma simulação duas
// vezes — impossível de auditar ou testar (T-01/T-06 da metodologia).
type Rng = () => number

function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Seed de 32 bits derivada de Math.random() só pra quando o chamador não
// passa uma seed explícita — mantém comportamento "aleatório de verdade"
// por padrão, mas ainda registrável/reproduzível a partir daqui em diante.
function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}

function sampleTriangular(min: number, mode: number, max: number, rng: Rng): number {
  const u  = rng()
  const fc = (mode - min) / (max - min)
  if (u < fc) return min + Math.sqrt(u * (max - min) * (mode - min))
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode))
}

// Método dos momentos a partir dos 3 pontos (Cmin, Cprov, Cmax), convenção
// PERT/Beta (AACE/PMI para three-point estimating): μ pondera o valor mais
// provável 4x mais que os extremos (em vez de ignorá-lo, como a aproximação
// anterior fazia — `(min+max)/2` não usava `mode` nenhum), σ usa a regra dos
// 3-sigma (faixa [min,max] cobre ~99,7% da massa). O documento de
// metodologia cita "método dos momentos" sem publicar a fórmula exata;
// PERT é a convenção padrão da indústria pra derivar Normal de 3 pontos e é
// a mais defensável na ausência da fórmula original.
function sampleNormal(cat: CategoryParam, rng: Rng): number {
  const { min, mode, max } = cat
  const mean = (min + 4 * mode + max) / 6
  const sd   = (max - min) / 6
  const u1   = rng() || 1e-10
  const u2   = rng()
  const z    = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return Math.max(min, Math.min(max, mean + z * sd))
}

function sampleUniform(min: number, max: number, rng: Rng): number {
  return min + rng() * (max - min)
}

export interface MCResult {
  mean:        number
  stddev:      number
  p5:          number
  p10:         number
  p25:         number
  p75:         number
  p80:         number
  p90:         number
  p95:         number
  p99:         number
  icLo:        number
  icHi:        number
  minVal:      number
  maxVal:      number
  cv:          number
  exceedProb:  number
  bars:        number[]
  // Value at Risk / Conditional Value at Risk a 95% — RB da metodologia
  // ARO-MCS Framework §6.3. VaR_95 = P95 (perda máxima esperada a 95% de
  // confiança); CVaR_95 = média da cauda que excede o VaR (Expected
  // Shortfall, captura risco de cauda além do percentil sozinho).
  var95:       number
  cvar95:      number
  // Seed do PRNG usada nesta execução — sempre presente, gerada
  // internamente quando o chamador não passa uma (RB-04: reprodutibilidade
  // exige registrar a semente, não só o resultado).
  seed:        number
  // RB-03: convergência dinâmica em blocos de 1.000 iterações,
  // Δμ < 0,001% entre blocos consecutivos, mínimo MIN_ITERATIONS.
  // `converged=false` quando o teto MAX_ITERATIONS foi atingido antes de
  // convergir — sinal de que a distribuição de entrada é muito dispersa
  // pro critério de tolerância, não um bug.
  converged:   boolean
  iterationsRun: number
}

// Thin wrapper para rodar a Aro Simulação de UMA categoria só — usado pelo card de
// estatísticas Aro Simulação no CategoryBlock. Semanticamente equivalente a
// runAroSimulacao com activeCategories = {param.name}, mas com nome
// explícito pra o call-site ficar legível.
export function aroSimForOneCategory(
  dist:       Distribution,
  iterations: number,
  param:      CategoryParam,
  confidence = 95,
): MCResult {
  return runAroSimulacao(dist, iterations, [param], new Set([param.name]), confidence)
}

const BLOCO_SIZE     = 1_000
const CONVERGENCE_EPSILON = 0.00001 // 0,001% (RB-03)

export function runAroSimulacao(
  dist:             Distribution,
  iterations:       number,
  categoryParams:   CategoryParam[],
  activeCategories: Set<string>,
  confidence = 95,
  seed?:            number,
): MCResult {
  const cats = categoryParams.filter(c => activeCategories.has(c.name))
  const seedUsed = seed ?? randomSeed()
  const rng = mulberry32(seedUsed)

  // RB-03: mínimo MIN_ITERATIONS (10.000), teto MAX_ITERATIONS (100.000).
  // Roda em blocos de 1.000, checando convergência da média móvel a cada
  // bloco completo — só pode parar antes do teto depois de bater o mínimo
  // E convergir. Buffer pré-alocado no teto máximo; `filled` marca até onde
  // está preenchido de fato.
  const minIterations = Math.max(MIN_ITERATIONS, Math.min(MAX_ITERATIONS, iterations))
  const results = new Float64Array(MAX_ITERATIONS)
  let filled = 0
  let runningSum = 0
  let mediaBlocoAnterior: number | null = null
  let converged = false

  while (filled < MAX_ITERATIONS) {
    const blockEnd = Math.min(filled + BLOCO_SIZE, MAX_ITERATIONS)
    for (; filled < blockEnd; filled++) {
      let total = 0
      for (const cat of cats) {
        if (dist === 'Triangular')   total += sampleTriangular(cat.min, cat.mode, cat.max, rng)
        else if (dist === 'Normal')  total += sampleNormal(cat, rng)
        else                         total += sampleUniform(cat.min, cat.max, rng)
      }
      results[filled] = total
      runningSum += total
    }

    const mediaAtual = runningSum / filled
    if (mediaBlocoAnterior !== null) {
      const deltaMu = Math.abs((mediaAtual - mediaBlocoAnterior) / mediaBlocoAnterior)
      if (filled >= minIterations && deltaMu < CONVERGENCE_EPSILON) {
        converged = true
        mediaBlocoAnterior = mediaAtual
        break
      }
    }
    mediaBlocoAnterior = mediaAtual
  }

  const n = filled
  const sorted = results.subarray(0, n)
  sorted.sort()

  let sum = 0
  for (let i = 0; i < n; i++) sum += sorted[i]
  const mean = sum / n

  let sumSq = 0
  for (let i = 0; i < n; i++) sumSq += (sorted[i] - mean) ** 2
  const stddev = Math.sqrt(sumSq / n)

  const pct = (p: number) => sorted[Math.min(n - 1, Math.floor(n * p))]
  const p5  = pct(0.05)
  const p10 = pct(0.10)
  const p25 = pct(0.25)
  const p75 = pct(0.75)
  const p80 = pct(0.80)
  const p90 = pct(0.90)
  const p95 = pct(0.95)
  const p99 = pct(0.99)
  const half = (1 - confidence / 100) / 2
  const icLo = pct(half)
  const icHi = pct(1 - half)
  const minVal = sorted[0]
  const maxVal = sorted[n - 1]
  const cv     = stddev / mean

  // VaR_95 = P95 (perda máxima esperada a 95% de confiança). CVaR_95 =
  // média dos cenários que excedem o VaR (Expected Shortfall / tail risk).
  const var95 = p95
  let tailSum = 0, tailCount = 0
  for (let i = 0; i < n; i++) {
    if (sorted[i] > var95) { tailSum += sorted[i]; tailCount++ }
  }
  const cvar95 = tailCount > 0 ? tailSum / tailCount : var95

  // P(X > soma das modas) — probabilidade de ultrapassar o custo-base mais provável
  const modeSum = cats.reduce((s, c) => s + c.mode, 0)
  let lo = 0, hi = n
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (sorted[mid] <= modeSum) lo = mid + 1
    else hi = mid
  }
  const exceedProb = (n - lo) / n

  const range   = maxVal - minVal || 1
  const binSize = range / 12
  const bins    = new Array<number>(12).fill(0)
  for (let i = 0; i < n; i++) {
    const idx = Math.min(11, Math.floor((sorted[i] - minVal) / binSize))
    bins[idx]++
  }
  const maxBin = Math.max(...bins)
  const bars   = bins.map(b => Math.max(2, Math.round((b / maxBin) * 100)))

  return {
    mean, stddev, p5, p10, p25, p75, p80, p90, p95, p99, icLo, icHi,
    minVal, maxVal, cv, exceedProb, bars, var95, cvar95,
    seed: seedUsed, converged, iterationsRun: n,
  }
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
// de 12 bins (mesmo shape do `runAroSimulacao` pra reusar o HistogramCard).
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

export function aroSimSensibilidadeAno10(
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
