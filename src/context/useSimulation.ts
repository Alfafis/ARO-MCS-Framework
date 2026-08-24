import { useContext } from 'react'
import { SimulationContext, type SimulationContextValue } from './simulation-context'

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
