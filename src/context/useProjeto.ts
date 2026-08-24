import { useContext } from 'react'
import { ProjetoContext, type ProjetoContextValue } from './projeto-context'

export function useProjeto(): ProjetoContextValue {
  const ctx = useContext(ProjetoContext)
  if (!ctx) throw new Error('useProjeto must be used within ProjetoProvider')
  return ctx
}
