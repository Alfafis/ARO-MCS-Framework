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
  bars:             number[]
  status:           string
  cv:               number
  confidenceLevel:  number
  p80:              string
  exceedProb:       string
  iterations:       string
  distribution:     Distribution
  var95:            string
  cvar95:           string
  seed:             number
  converged:        boolean
}

export interface HistoryRun {
  id: string
  date: string
  dist: Distribution
  iterations: string
  mean: string
  uncertainty: UncertaintyLevel
}
