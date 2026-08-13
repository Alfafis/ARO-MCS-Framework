import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { simulacaoT } from '@/i18n/simulacao'
import ParamsCard from '@/components/simulacao/ParamsCard'
import ResultCard from '@/components/simulacao/ResultCard'
import HistogramCard from '@/components/simulacao/HistogramCard'
import UncertaintyCard from '@/components/simulacao/UncertaintyCard'
import HistoryModal from '@/components/simulacao/HistoryModal'
import type { Distribution, HistoryRun, SimResult, UncertaintyLevel } from '@/types/simulacao'

const uid = () => Math.random().toString(36).slice(2)

function nowStr(months: string[]): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function shapeFor(dist: Distribution): number[] {
  if (dist === 'Triangular') return [12, 28, 50, 72, 90, 100, 84, 63, 40, 21, 10, 4]
  if (dist === 'Normal')     return [6,  18, 40, 66, 88, 100, 90, 68, 44, 20,  8, 3]
  return [52, 63, 71, 77, 81, 84, 82, 79, 75, 69, 63, 57]
}

function computeResult(dist: Distribution): Omit<SimResult, 'status'> {
  const shape = shapeFor(dist)
  const bars = shape.map(v => Math.max(4, Math.round(v * (0.85 + Math.random() * 0.32))))
  const mean = 38.5 + (Math.random() - 0.5) * 2.4
  const sd = 1.35 + (Math.random() - 0.5) * 0.5
  const p10 = mean - 1.28 * sd
  const p90 = mean + 1.28 * sd
  const ic95lo = mean - 1.96 * sd * 0.5
  const ic95hi = mean + 1.96 * sd * 0.5
  const minV = p10 - 0.4 - Math.random() * 0.8
  const maxV = p90 + 0.4 + Math.random() * 0.8
  const rangeNum = (sd / mean) * 100
  const uncertainty: UncertaintyLevel = rangeNum < 3 ? 'baixo' : rangeNum < 5 ? 'moderado' : 'alto'
  const fmt = (v: number) => `R$ ${v.toFixed(1).replace('.', ',')}M`
  const rng = (v: number) => v.toFixed(1).replace('.', ',')
  return {
    mean: fmt(mean), stddev: `R$ ${sd.toFixed(1).replace('.', ',')}M`,
    p10p90: `${rng(p10)}–${rng(p90)}M`, ic95: `${rng(ic95lo)}–${rng(ic95hi)}M`,
    min: fmt(minV), max: fmt(maxV), uncertainty, range: `±${rangeNum.toFixed(1)}%`,
    bars,
  }
}

const INITIAL_RESULT: SimResult = {
  mean: 'R$ 38,5M', stddev: 'R$ 1,4M', p10p90: '36,2–40,8M', ic95: '37,9–39,1M',
  min: 'R$ 35,6M', max: 'R$ 41,2M',
  uncertainty: 'moderado', range: '±3,6%', status: 'Concluída há 2 dias',
  bars: [12, 28, 50, 72, 90, 100, 84, 63, 40, 21, 10, 4],
}

const INITIAL_HISTORY: HistoryRun[] = [
  { id: uid(), date: '08 ago 2026, 14:22', dist: 'Triangular', iterations: '10.000', mean: 'R$ 38,5M', uncertainty: 'moderado' },
  { id: uid(), date: '05 ago 2026, 09:17', dist: 'Normal',     iterations: '50.000', mean: 'R$ 37,9M', uncertainty: 'baixo'    },
  { id: uid(), date: '22 jul 2026, 16:45', dist: 'Uniforme',   iterations: '10.000', mean: 'R$ 39,8M', uncertainty: 'alto'     },
  { id: uid(), date: '10 jul 2026, 11:03', dist: 'Triangular', iterations: '20.000', mean: 'R$ 38,1M', uncertainty: 'baixo'    },
]

export default function Simulacao() {
  const t = useT(simulacaoT)
  const [dist,        setDist]        = useState<Distribution>('Triangular')
  const [iterations,  setIterations]  = useState('10.000')
  const [running,     setRunning]     = useState(false)
  const [result,      setResult]      = useState<SimResult>(INITIAL_RESULT)
  const [history,     setHistory]     = useState<HistoryRun[]>(INITIAL_HISTORY)
  const [historyOpen, setHistoryOpen] = useState(false)

  const runSimulation = useCallback(() => {
    setRunning(true)
    setTimeout(() => {
      const next: SimResult = { ...computeResult(dist), status: t.justFinished }
      setResult(next)
      setHistory(prev => [
        { id: uid(), date: nowStr(t.months), dist, iterations, mean: next.mean, uncertainty: next.uncertainty },
        ...prev.slice(0, 3),
      ])
      setRunning(false)
    }, 1300)
  }, [dist, iterations, t])

  const loadHistoryRun = useCallback((run: HistoryRun) => {
    setResult(prev => ({ ...prev, mean: run.mean, status: `${t.runFrom} ${run.date}` }))
    setHistoryOpen(false)
  }, [t])

  return (
    <div className="flex flex-col h-full">

      <header className="flex items-start justify-between px-8 py-[22px] gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0eeec] text-c-text-2 text-xs font-semibold font-mono">Rev0</span>
          </div>
          <p className="text-[13px] text-c-text-2">{t.headerSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" onClick={() => setHistoryOpen(true)}>
            {t.seeHistory}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-8 pb-8 overflow-y-auto flex-1">
        <div className="grid grid-cols-[1fr_1.6fr] gap-4 items-start">
          <ParamsCard
            dist={dist}
            iterations={iterations}
            running={running}
            onDistChange={setDist}
            onIterationsChange={setIterations}
            onRun={runSimulation}
          />
          <div className="flex flex-col gap-4">
            <ResultCard result={result} />
            <HistogramCard result={result} iterations={iterations} />
            <UncertaintyCard />
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
