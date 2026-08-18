import { Layers } from 'lucide-react'
import { MOCK_PHASES } from '@/data/relatorio-mock'

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
  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-5">
        <Layers size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Custo por fase de fechamento</span>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_PHASES.map(({ name, description, value }) => {
          const pct = (value / TOTAL) * 100
          return (
            <div key={name}>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-[0.8125rem] font-semibold text-c-text">{name}</span>
                <span className="font-mono text-[0.875rem] font-bold text-c-text">{fmtM(value)}</span>
              </div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] text-c-text-2">{description}</span>
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
        <span className="text-[0.8125rem] font-bold text-c-text">Total</span>
        <span className="font-mono text-[0.875rem] font-bold text-c-text">{fmtM(TOTAL)}</span>
      </div>
    </div>
  )
}
