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
}

export interface HistoryRun {
  id: string
  date: string
  dist: Distribution
  iterations: string
  mean: string
  uncertainty: UncertaintyLevel
}
