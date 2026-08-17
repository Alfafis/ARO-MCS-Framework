import { useCallback, useState } from 'react'
import { X, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CustomSelect from '@/components/categorias/CustomSelect'
import ResultCard from './ResultCard'
import HistogramCard from './HistogramCard'
import { useT } from '@/i18n/LangContext'
import { simulacaoT } from '@/i18n/simulacao'
import type { Distribution, SimResult, UncertaintyLevel } from '@/types/simulacao'

const uid = () => Math.random().toString(36).slice(2)

const DIST_OPTIONS: Distribution[] = ['Triangular', 'Normal', 'Uniforme']

const CONF_OPTIONS = [
  { value: '95', label: '95%' },
  { value: '90', label: '90%' },
  { value: '80', label: '80%' },
]

function shapeFor(dist: Distribution): number[] {
  if (dist === 'Triangular') return [12, 28, 50, 72, 90, 100, 84, 63, 40, 21, 10, 4]
  if (dist === 'Normal')     return [6,  18, 40, 66, 88, 100, 90, 68, 44, 20,  8, 3]
  return [52, 63, 71, 77, 81, 84, 82, 79, 75, 69, 63, 57]
}

function computeResult(dist: Distribution): SimResult {
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
  const cv = sd / mean
  const rangeNum = cv * 100
  const uncertainty: UncertaintyLevel = rangeNum < 3 ? 'baixo' : rangeNum < 5 ? 'moderado' : 'alto'
  const fmt = (v: number) => `R$ ${v.toFixed(1).replace('.', ',')} M`
  const rng = (v: number) => v.toFixed(1).replace('.', ',')
  return {
    mean:      fmt(mean),
    stddev:    `R$ ${sd.toFixed(1).replace('.', ',')} M`,
    p10p90:    `R$ ${rng(p10)}–${rng(p90)} M`,
    ic95:      `${rng(ic95lo)}–${rng(ic95hi)}`,
    min:       fmt(minV),
    max:       fmt(maxV),
    uncertainty,
    range:     `±${rangeNum.toFixed(1)}%`,
    bars,
    status:    'Agora mesmo',
    cv,
  }
}

// suprime warning de uid não utilizado no futuro
void uid

interface Props {
  open:     boolean
  onClose:  () => void
  onResult: (result: SimResult) => void
}

export default function SimulacaoDrawer({ open, onClose, onResult }: Props) {
  const t = useT(simulacaoT)

  const [dist,       setDist]       = useState<Distribution>('Triangular')
  const [iterations, setIterations] = useState('10.000')
  const [confidence, setConfidence] = useState('95')
  const [openSel,    setOpenSel]    = useState<string | null>(null)
  const [running,    setRunning]    = useState(false)
  const [result,     setResult]     = useState<SimResult | null>(null)

  const CAT_OPTIONS = [
    { value: 'all',    label: t.catAll    },
    { value: 'custom', label: t.catCustom },
  ]
  const [cats, setCats] = useState('all')

  const runSimulation = useCallback(() => {
    setRunning(true)
    setTimeout(() => {
      const next = computeResult(dist)
      try { localStorage.setItem('aro_sim_result', JSON.stringify(next)) } catch {}
      setResult(next)
      onResult(next)
      setRunning(false)
    }, 1300)
  }, [dist, onResult])

  function toggle(id: string) {
    setOpenSel(prev => prev === id ? null : id)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         40,
          backgroundColor: 'rgba(20,21,26,0.25)',
          opacity:        open ? 1 : 0,
          pointerEvents:  open ? 'auto' : 'none',
          transition:     'opacity 240ms ease',
        }}
      />

      {/* Painel */}
      <div
        style={{
          position:   'fixed',
          top:        0,
          right:      0,
          bottom:     0,
          zIndex:     50,
          width:      480,
          maxWidth:   '100vw',
          background: '#fff',
          boxShadow:  '-8px 0 40px rgba(20,21,26,.12)',
          transform:  open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(.4,0,.2,1)',
          display:    'flex',
          flexDirection: 'column',
          overflow:   'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[18px] border-b border-[rgba(20,21,26,.08)] shrink-0">
          <div>
            <p className="text-[15px] font-bold text-c-text leading-tight">Simulação Monte Carlo</p>
            <p className="text-[12px] text-c-text-2 mt-0.5">Parâmetros e resultado</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[9px] text-c-text-2 hover:bg-[#f0eeec] transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Fechar simulação"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {/* Parâmetros */}
          <div className="card flex flex-col gap-4">
            <p className="text-[13px] font-semibold text-c-text">Parâmetros</p>

            {/* Distribuição */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.78125rem] font-semibold text-c-text-2">{t.statDist}</span>
              <div className="seg" role="group" aria-label={t.statDist}>
                {DIST_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`seg-opt${dist === opt ? ' active' : ''}`}
                    onClick={() => setDist(opt)}
                    aria-pressed={dist === opt}
                  >
                    {t.distLabels[opt]}
                  </button>
                ))}
              </div>
            </div>

            {/* Iterações */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="drawer-iterations">{t.iterCount}</Label>
              <Input
                id="drawer-iterations"
                variant="filled"
                value={iterations}
                onChange={e => setIterations(e.target.value)}
              />
            </div>

            {/* Categorias */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="drawer-cats">{t.categoriesIncluded}</Label>
              <CustomSelect
                id="drawer-cats"
                options={CAT_OPTIONS}
                value={cats}
                onChange={setCats}
                isOpen={openSel === 'cats'}
                onToggle={() => toggle('cats')}
              />
            </div>

            {/* Nível de confiança */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="drawer-conf">{t.confidenceLevel}</Label>
              <CustomSelect
                id="drawer-conf"
                options={CONF_OPTIONS}
                value={confidence}
                onChange={setConfidence}
                isOpen={openSel === 'conf'}
                onToggle={() => toggle('conf')}
              />
            </div>

            <p className="text-[0.8125rem] text-c-text-2 leading-relaxed m-0">
              {t.simDesc(iterations)}
            </p>

            <Button
              variant="primary"
              type="button"
              className="w-full py-3 justify-center text-sm"
              onClick={runSimulation}
              disabled={running}
              aria-busy={running}
            >
              {running ? (
                <>
                  {t.running}
                  <svg className="spinner" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <circle cx={12} cy={12} r={9} strokeOpacity={0.28} />
                    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
                  </svg>
                </>
              ) : (
                <>
                  {result ? 'Rodar novamente' : t.run}
                  <Play size={15} aria-hidden="true" />
                </>
              )}
            </Button>
          </div>

          {/* Resultado */}
          {result && (
            <>
              <ResultCard result={result} />
              <HistogramCard result={result} iterations={iterations} />
            </>
          )}

        </div>

        {/* Footer — só aparece após resultado */}
        {result && (
          <div className="px-6 py-4 border-t border-[rgba(20,21,26,.08)] shrink-0 bg-white">
            <p className="text-[12px] text-c-text-2 text-center">
              Resultado aplicado ao dashboard automaticamente.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
