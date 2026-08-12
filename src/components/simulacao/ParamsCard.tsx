import { useEffect, useRef, useState } from 'react'
import { Play, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CustomSelect from '@/components/categorias/CustomSelect'
import type { Distribution } from '@/types/simulacao'

const DIST_OPTIONS: Distribution[] = ['Triangular', 'Normal', 'Uniforme']

const CAT_OPTIONS = [
  { value: 'all',    label: 'Todas as 8 categorias' },
  { value: 'custom', label: 'Personalizar seleção' },
]

const CONF_OPTIONS = [
  { value: '95', label: '95%' },
  { value: '90', label: '90%' },
  { value: '80', label: '80%' },
]

interface Props {
  dist: Distribution
  iterations: string
  running: boolean
  onDistChange: (d: Distribution) => void
  onIterationsChange: (v: string) => void
  onRun: () => void
}

export default function ParamsCard({ dist, iterations, running, onDistChange, onIterationsChange, onRun }: Props) {
  const [cats,       setCats]       = useState('all')
  const [confidence, setConfidence] = useState('95')
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpenSelect(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function toggle(id: string) {
    setOpenSelect(prev => prev === id ? null : id)
  }

  return (
    <div className="card flex flex-col gap-5" ref={ref}>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
        <SlidersHorizontal size={14} color="var(--accent)" aria-hidden="true" />
        <span>Parâmetros</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[0.78125rem] font-semibold text-c-text-2">Distribuição estatística</span>
        <div className="seg" role="group" aria-label="Distribuição estatística">
          {DIST_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              className={`seg-opt${dist === opt ? ' active' : ''}`}
              onClick={() => onDistChange(opt)}
              aria-pressed={dist === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="iterations">Número de iterações</Label>
        <Input
          id="iterations"
          variant="filled"
          value={iterations}
          onChange={e => onIterationsChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sim-cats">Categorias incluídas</Label>
        <CustomSelect
          id="sim-cats"
          options={CAT_OPTIONS}
          value={cats}
          onChange={setCats}
          isOpen={openSelect === 'cats'}
          onToggle={() => toggle('cats')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sim-conf">Nível de confiança</Label>
        <CustomSelect
          id="sim-conf"
          options={CONF_OPTIONS}
          value={confidence}
          onChange={setConfidence}
          isOpen={openSelect === 'conf'}
          onToggle={() => toggle('conf')}
        />
      </div>

      <p className="text-[0.8125rem] text-c-text-2 leading-relaxed m-0">
        A simulação gera {iterations} cenários aleatórios combinando os custos mín/máx
        de cada item e apresenta a distribuição de probabilidade do custo total.
      </p>

      <Button
        variant="primary"
        type="button"
        className="w-full py-3 justify-center text-sm"
        onClick={onRun}
        disabled={running}
        aria-busy={running}
      >
        {running ? (
          <>
            Simulando…
            <svg className="spinner" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <circle cx={12} cy={12} r={9} strokeOpacity={0.28} />
              <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" />
            </svg>
          </>
        ) : (
          <>
            Rodar simulação
            <Play size={15} aria-hidden="true" />
          </>
        )}
      </Button>
    </div>
  )
}
