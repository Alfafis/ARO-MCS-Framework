import { createContext } from 'react'
import type { HistoryRun, SimResult } from '@/types/simulacao'

export interface ProjectSimState {
  result: SimResult | null
  history: HistoryRun[]
  activeCategories: string[]
}

export interface SimulationContextValue {
  getSimState: (projetoId: string) => ProjectSimState
  loadSimState: (projetoId: string) => Promise<void>
  setSimulation: (projetoId: string, result: SimResult, categories: string[]) => Promise<void>
  previewResult: (projetoId: string, patch: Pick<SimResult, 'mean' | 'status'>) => void
}

export const SimulationContext = createContext<SimulationContextValue | null>(null)
