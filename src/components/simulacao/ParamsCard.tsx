import { useEffect, useRef, useState } from 'react'
import { Check, Play, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import CustomSelect from '@/components/categorias/CustomSelect'
import type { Distribution } from '@/types/simulacao'
import { clampIterations, maskIterations } from '@/lib/aroSimulacao'

const DIST_OPTIONS: Distribution[] = ['Triangular', 'Normal', 'Uniforme']

const CONF_OPTIONS = [
  { value: '95', label: '95%' },
  { value: '90', label: '90%' },
  { value: '80', label: '80%' },
]

interface Props {
  dist:               Distribution
  iterations:         string
  confidence:         string
  running:            boolean
  disabled?:          boolean
  categoryNames:      string[]
  onDistChange:       (d: Distribution) => void
  onIterationsChange: (v: string) => void
  onConfidenceChange: (v: string) => void
  onRun:              () => void
  onCategoriesChange: (cats: Set<string>) => void
}

export default function ParamsCard({ dist, iterations, confidence, running, disabled, categoryNames, onDistChange, onIterationsChange, onConfidenceChange, onRun, onCategoriesChange }: Props) {
  const t = useT(simulacaoT)

  const CAT_OPTIONS = [
    { value: 'all',    label: t.catAll    },
    { value: 'custom', label: t.catCustom },
  ]

  const [cats,         setCats]         = useState('all')
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(categoryNames))
  const [openSelect,   setOpenSelect]   = useState<string | null>(null)

  function toggleCat(cat: string) {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat) && next.size > 1) next.delete(cat)
      else next.add(cat)
      return next
    })
  }
  useEffect(() => {
    onCategoriesChange(cats === 'all' ? new Set(categoryNames) : new Set(selectedCats))
  }, [cats, selectedCats, categoryNames, onCategoriesChange])

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
        <span>{t.params}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[0.78125rem] font-semibold text-c-text-2">{t.statDist}</span>
        <div className="seg" role="group" aria-label={t.statDist}>
          {DIST_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              className={`seg-opt${dist === opt ? ' active' : ''}`}
              onClick={() => onDistChange(opt)}
              aria-pressed={dist === opt}
            >
              {t.distLabels[opt]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="iterations">{t.iterCount}</Label>
        <Input
          id="iterations"
          variant="filled"
          inputMode="numeric"
          value={iterations}
          onChange={e => onIterationsChange(maskIterations(e.target.value))}
          onBlur={e => onIterationsChange(clampIterations(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sim-cats">{t.categoriesIncluded}</Label>
        <CustomSelect id="sim-cats" options={CAT_OPTIONS} value={cats} onChange={setCats}
          isOpen={openSelect === 'cats'} onToggle={() => toggle('cats')} />
        {cats === 'custom' && (
          <div className="flex flex-col gap-0.5 mt-1 pl-1">
            {categoryNames.map(cat => {
              const checked = selectedCats.has(cat)
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className="flex items-center gap-2.5 py-[5px] text-left bg-transparent border-0 cursor-pointer rounded-[6px] hover:bg-[#f6f5f3] px-1.5 transition-colors duration-150"
                >
                  <div className={`w-[15px] h-[15px] rounded-[4px] flex items-center justify-center shrink-0 transition-colors duration-150 ${checked ? 'bg-accent' : 'bg-[#e4e1de]'}`}>
                    {checked && <Check size={9} strokeWidth={3} color="white" aria-hidden="true" />}
                  </div>
                  <span className={`text-[12.5px] leading-tight transition-colors duration-150 ${checked ? 'text-c-text' : 'text-c-text-2'}`}>
                    {cat}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sim-conf">{t.confidenceLevel}</Label>
        <CustomSelect id="sim-conf" options={CONF_OPTIONS} value={confidence} onChange={onConfidenceChange}
          isOpen={openSelect === 'conf'} onToggle={() => toggle('conf')} />
      </div>

      <p className="text-[0.8125rem] text-c-text-2 leading-relaxed m-0">{t.simDesc(iterations)}</p>

      <Button
        variant="primary"
        type="button"
        className="w-full py-3 justify-center text-sm"
        onClick={onRun}
        disabled={running || disabled}
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
            {t.run}
            <Play size={15} aria-hidden="true" />
          </>
        )}
      </Button>
    </div>
  )
}
