import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { SimResult } from '@/types/simulacao'
import { ALL_CATEGORY_NAMES } from '@/lib/monteCarlo'

interface SimulationState {
  simResult:        SimResult | null
  activeCategories: string[]
  setSimulation:    (result: SimResult, categories: string[]) => void
}

const SimulationContext = createContext<SimulationState | null>(null)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [simResult,        setSimResult]        = useState<SimResult | null>(null)
  const [activeCategories, setActiveCategories] = useState<string[]>(ALL_CATEGORY_NAMES)

  const setSimulation = useCallback((result: SimResult, categories: string[]) => {
    setSimResult(result)
    setActiveCategories(categories)
  }, [])

  return (
    <SimulationContext.Provider value={{ simResult, activeCategories, setSimulation }}>
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
