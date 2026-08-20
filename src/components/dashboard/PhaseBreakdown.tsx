import { Layers } from 'lucide-react'
import { MOCK_PHASES, type PhaseKey } from '@/data/relatorio-mock'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'

const TOTAL = MOCK_PHASES.reduce((acc, p) => acc + p.value, 0)

function fmtM(v: number) {
  return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')} M`
}

function fmtPct(v: number) {
  return `${v.toFixed(1).replace('.', ',')}%`
}

interface Props {
  className?: string
}

export default function PhaseBreakdown({ className = '' }: Props) {
  const t = useT(resumoT)

  const LABELS: Record<PhaseKey, { name: string; description: string; years?: string }> = {
    pre:       { name: t.phasePreLabel,       description: t.phasePreDesc,       years: t.phasePreYears       },
    closure:   { name: t.phaseClosureLabel,   description: t.phaseClosureDesc,   years: t.phaseClosureYears   },
    post:      { name: t.phasePostLabel,      description: t.phasePostDesc,      years: t.phasePostYears      },
    provision: { name: t.phaseProvisionLabel, description: t.phaseProvisionDesc },
  }

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-5">
        <Layers size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.phaseTitle}</span>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_PHASES.map(({ key, value }) => {
          const { name, description, years } = LABELS[key]
          const pct = (value / TOTAL) * 100
          return (
            <div key={key}>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-[0.8125rem] font-semibold text-c-text">{name}</span>
                <span className="font-mono text-[0.875rem] font-bold text-c-text">{fmtM(value)}</span>
              </div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-c-text-2">{description}</span>
                  {years && (
                    <span className="text-[10px] font-semibold text-accent bg-accent/10 rounded-full px-2 py-0.5 leading-none">
                      {years}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-c-text-2">{fmtPct(pct)}</span>
              </div>
              <div className="h-[6px] rounded-[4px] bg-[#f0eeec] overflow-hidden">
                <div
                  className="h-full rounded-[4px]"
                  style={{ width: `${pct}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between items-baseline pt-4 mt-4 border-t border-c-line">
        <span className="text-[0.8125rem] font-bold text-c-text">{t.totalLabel}</span>
        <span className="font-mono text-[0.875rem] font-bold text-c-text">{fmtM(TOTAL)}</span>
      </div>
    </div>
  )
}
