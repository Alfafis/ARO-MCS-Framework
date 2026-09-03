import type { RiskDriver, ScenarioSet } from '@/lib/aroSimulacao'

export type Distribution = 'Triangular' | 'Normal' | 'Uniforme'
export type UncertaintyLevel = 'baixo' | 'moderado' | 'alto'

export interface SimResult {
  mean: string
  stddev: string
  p10p90: string
  ic95: string
  min: string
  max: string
  uncertainty: UncertaintyLevel
  range: string
  bars: number[]
  status: string
  cv: number
  confidenceLevel: number
  p80: string
  exceedProb: string
  iterations: string
  distribution: Distribution
  var95: string
  cvar95: string
  seed: number
  converged: boolean
  // Campos crus (não formatados) pra Engine 5 (calibrarProvisao), Engine 6
  // (Direcionadores de Risco) e §9 (Cenários determinísticos) — ver
  // CalibrationInput em lib/aroSimulacao.ts.
  p50Raw: number
  p90Raw: number
  p95Raw: number
  cvar95Raw: number
  scenarios: ScenarioSet
  riskDrivers: RiskDriver[]
}

export interface HistoryRun {
  id: string
  date: string
  dist: Distribution
  iterations: string
  mean: string
  uncertainty: UncertaintyLevel
}
