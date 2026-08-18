import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSimulation } from '@/context/SimulationContext'
import { FileText } from 'lucide-react'
import ClientSelector from '@/components/layout/ClientSelector'
import { useClient } from '@/context/ClientContext'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { simulacaoT } from '@/i18n/simulacao'
import ParamsCard from '@/components/simulacao/ParamsCard'
import ResultCard from '@/components/simulacao/ResultCard'
import HistogramCard from '@/components/simulacao/HistogramCard'
import UncertaintyCard from '@/components/simulacao/UncertaintyCard'
import HistoryModal from '@/components/simulacao/HistoryModal'
import { runMonteCarlo, ALL_CATEGORY_NAMES } from '@/lib/monteCarlo'
import type { Distribution, HistoryRun, SimResult, UncertaintyLevel } from '@/types/simulacao'

const uid = () => Math.random().toString(36).slice(2)

function nowStr(months: string[]): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function parseIterations(s: string): number {
  return parseInt(s.replace(/\./g, '').replace(',', ''), 10) || 10_000
}

function computeResult(dist: Distribution, n: number, activeCategories: Set<string>, confidence: number): Omit<SimResult, 'status' | 'iterations' | 'distribution'> {
  const mc  = runMonteCarlo(dist, n, activeCategories, confidence)
  const toM = (v: number) => v / 1_000_000
  const fmt = (v: number) => `R$ ${toM(v).toFixed(1).replace('.', ',')}M`
  const rng = (v: number) => toM(v).toFixed(1).replace('.', ',')
  const rangeNum    = mc.cv * 100
  const uncertainty: UncertaintyLevel = rangeNum < 3 ? 'baixo' : rangeNum < 5 ? 'moderado' : 'alto'
  return {
    mean:           fmt(mc.mean),
    stddev:         `R$ ${toM(mc.stddev).toFixed(1).replace('.', ',')}M`,
    p10p90:         `${rng(mc.p10)}–${rng(mc.p90)}M`,
    ic95:           `${rng(mc.icLo)}–${rng(mc.icHi)}M`,
    min:            fmt(mc.minVal),
    max:            fmt(mc.maxVal),
    uncertainty,
    range:           `±${rangeNum.toFixed(1)}%`,
    bars:            mc.bars,
    cv:              mc.cv,
    confidenceLevel: confidence,
    p80:             fmt(mc.p80),
    exceedProb:      `${(mc.exceedProb * 100).toFixed(2).replace('.', ',')}%`,
  }
}


export default function Simulacao() {
  const t = useT(simulacaoT)
  const navigate = useNavigate()
  const { clients, selectedClient, setSelectedClient } = useClient()
  const { simResult: ctxResult, setSimulation } = useSimulation()
  const [dist,             setDist]             = useState<Distribution>('Triangular')
  const [iterations,       setIterations]       = useState('10.000')
  const [confidence,       setConfidence]       = useState('95')
  const [running,          setRunning]          = useState(false)
  const [result,           setResult]           = useState<SimResult | null>(ctxResult)
  const [history,          setHistory]          = useState<HistoryRun[]>([])
  const [historyOpen,      setHistoryOpen]      = useState(false)
  const [hasRun,           setHasRun]           = useState(ctxResult !== null)
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(ALL_CATEGORY_NAMES))

  const runSimulation = useCallback(() => {
    setRunning(true)
    setTimeout(() => {
      const n    = parseIterations(iterations)
      const conf = parseInt(confidence, 10) || 95
      const next: SimResult = {
        ...computeResult(dist, n, activeCategories, conf),
        status:       t.justFinished,
        iterations,
        distribution: dist,
      }
      setSimulation(next, [...activeCategories])
      setResult(next)
      setHistory(prev => [
        { id: uid(), date: nowStr(t.months), dist, iterations, mean: next.mean, uncertainty: next.uncertainty },
        ...prev.slice(0, 3),
      ])
      setHasRun(true)
      setRunning(false)
    }, 1300)
  }, [dist, iterations, confidence, activeCategories, t])

  const loadHistoryRun = useCallback((run: HistoryRun) => {
    setResult(prev => prev ? { ...prev, mean: run.mean, status: `${t.runFrom} ${run.date}` } : null)
    setHistoryOpen(false)
  }, [t])

  return (
    <div className="flex flex-col h-full">

      <header className="flex items-start justify-between px-4 sm:px-8 py-4 sm:py-[22px] gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0eeec] text-c-text-2 text-xs font-semibold font-mono">Rev0</span>
          </div>
          <ClientSelector options={clients} value={selectedClient} onChange={setSelectedClient} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" onClick={() => setHistoryOpen(true)}>
            {t.seeHistory}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4 items-start">
          <ParamsCard
            dist={dist}
            iterations={iterations}
            confidence={confidence}
            running={running}
            onDistChange={setDist}
            onIterationsChange={setIterations}
            onConfidenceChange={setConfidence}
            onRun={runSimulation}
            onCategoriesChange={setActiveCategories}
          />
          <div className="flex flex-col gap-4">
            <ResultCard result={result} />
            <HistogramCard result={result} iterations={iterations} />
            <UncertaintyCard result={result} dist={dist} activeCategories={activeCategories} />
            {hasRun && (
              <div className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-accent-100 flex items-center justify-center shrink-0">
                    <FileText size={15} color="var(--accent)" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-c-text leading-tight">Simulação aplicada ao relatório</p>
                    <p className="text-[12px] text-c-text-2 mt-0.5">Visualize o resultado do ponto de vista do cliente.</p>
                  </div>
                </div>
                <Button variant="primary" onClick={() => navigate(`/relatorio/${selectedClient}`)}>
                  Ver relatório
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {historyOpen && (
        <HistoryModal
          history={history}
          onSelect={loadHistoryRun}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  )
}
