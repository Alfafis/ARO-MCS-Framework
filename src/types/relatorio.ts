export type PhaseCategory = 'pre' | 'closure' | 'post'

export interface CostCategory {
  rank: string
  name: string
  min: string
  max: string
  updated?: string
  phase?: PhaseCategory
}

export interface CostTotals {
  min: string
  max: string
  updated?: string
}

export interface MonetaryMethod {
  label: string
  value: string
}

export interface DisbursementYear {
  label: string
  value: string
  // Banda IPCA quando modo === 'ipca' e ancoragem completa (ADR-013, D15).
  // value = cenário midpoint; valueMin/valueMax = cenários IPCA min/max
  // por ano. Ausentes nos demais modos.
  valueMin?: string
  valueMax?: string
}

export interface DisbursementCategory {
  name: string
  values: (string | null)[]
  // Bandas paralelas — cada índice corresponde ao mesmo ano de `values`.
  // Só presentes quando o modo IPCA com bandas está ativo.
  valuesMin?: (string | null)[]
  valuesMax?: (string | null)[]
}

export interface FanPoint {
  label: string
  low: number // posição inferior em % (0–100)
  band: number // altura em % (0–100)
}

export interface RiskMetric {
  label: string
  value: string
}
