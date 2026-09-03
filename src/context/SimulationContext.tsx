import { useCallback, useState, type ReactNode } from 'react'
import type { HistoryRun, SimResult } from '@/types/simulacao'
import { supabase } from '@/integrations/supabase/client'
import { formatDateTime } from '@/lib/utils'
import type { SimulacaoRow } from '@/types'
import type { Json } from '@/integrations/supabase/type'
import { SimulationContext, type ProjectSimState } from './simulation-context'

const EMPTY_STATE: ProjectSimState = { result: null, history: [], activeCategories: [] }

function mapRowToHistoryRun(row: SimulacaoRow): HistoryRun {
  const resultado = row.resultado as unknown as SimResult
  return {
    id: row.id,
    date: formatDateTime(row.criado_em),
    dist: row.distribuicao as HistoryRun['dist'],
    iterations: row.iteracoes,
    mean: resultado.mean,
    uncertainty: resultado.uncertainty,
  }
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, ProjectSimState>>({})

  const getSimState = useCallback(
    (projetoId: string): ProjectSimState => {
      return states[projetoId] ?? EMPTY_STATE
    },
    [states]
  )

  // Últimas 4 rodadas — mesma janela que o mock mostrava (atual + 3 no
  // histórico), só que agora sem descartar o resto: fica tudo no banco
  // (Revisões auditáveis é a proposta do próprio produto), só a UI limita.
  const loadSimState = useCallback(async (projetoId: string) => {
    const { data, error } = await supabase
      .from('simulacoes')
      .select('*')
      .eq('projeto_id', projetoId)
      .order('criado_em', { ascending: false })
      .limit(4)
    if (error || !data || data.length === 0) return
    const [latest] = data
    setStates((prev) => ({
      ...prev,
      [projetoId]: {
        result: latest.resultado as unknown as SimResult,
        activeCategories: latest.active_categories,
        history: data.map(mapRowToHistoryRun),
      },
    }))
  }, [])

  const setSimulation = useCallback(async (projetoId: string, result: SimResult, categories: string[]) => {
    const { data, error } = await supabase.rpc('registrar_simulacao', {
      p_projeto_id: projetoId,
      p_distribuicao: result.distribution,
      p_iteracoes: result.iterations,
      p_confidence_level: result.confidenceLevel,
      p_active_categories: categories,
      // SimResult é totalmente serializável (só string/number/union), mas não tem index
      // signature — TS não prova estruturalmente que bate com Json (mesmo padrão de cast
      // já usado na leitura, `resultado as unknown as SimResult`, só que no sentido inverso).
      p_resultado: result as unknown as Json,
    })
    if (error || !data) throw error ?? new Error('Falha ao registrar simulação')
    setStates((prev) => {
      const prevState = prev[projetoId] ?? EMPTY_STATE
      return {
        ...prev,
        [projetoId]: {
          result,
          activeCategories: categories,
          history: [mapRowToHistoryRun(data), ...prevState.history.slice(0, 3)],
        },
      }
    })
  }, [])

  // Carrega uma rodada anterior como preview do resultado atual — não conta como nova
  // rodada (não empurra pro histórico), só troca média/status exibidos.
  const previewResult = useCallback((projetoId: string, patch: Pick<SimResult, 'mean' | 'status'>) => {
    setStates((prev) => {
      const prevState = prev[projetoId]
      if (!prevState?.result) return prev
      return { ...prev, [projetoId]: { ...prevState, result: { ...prevState.result, ...patch } } }
    })
  }, [])

  return (
    <SimulationContext.Provider value={{ getSimState, loadSimState, setSimulation, previewResult }}>
      {children}
    </SimulationContext.Provider>
  )
}
