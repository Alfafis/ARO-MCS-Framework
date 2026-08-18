import { BarChart2 } from 'lucide-react'
import { MOCK_DISBURSEMENT_VALUES } from '@/data/relatorio-mock'

const LABELS = Array.from({ length: 10 }, (_, i) => `Ano ${i + 1}`)

const RAW_VALUES = [0, 471_700, 314_500, 1_520_000, 4_420_000, 14_910_000, 3_150_000, 3_150_000, 3_150_000, 3_150_000]
const MAX_VALUE  = Math.max(...RAW_VALUES)

function fmtShort(v: number) {
  if (v === 0) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
  return `${(v / 1_000).toFixed(0)}k`
}

export default function DisbursementChart() {
  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Desembolso anual previsto</span>
      </div>

      <div className="flex items-end gap-1.5 h-[120px]">
        {RAW_VALUES.map((val, i) => {
          const pct = MAX_VALUE > 0 ? (val / MAX_VALUE) * 100 : 0
          const isPeak = val === MAX_VALUE
          return (
            <div key={i} className="flex flex-col items-center flex-1 gap-1 h-full justify-end">
              <span className="text-[10px] font-mono font-semibold text-c-text-2 leading-none">
                {fmtShort(val)}
              </span>
              <div
                className="w-full rounded-[4px] transition-all"
                style={{
                  height:     `${Math.max(pct, val > 0 ? 3 : 0)}%`,
                  background: isPeak ? 'var(--accent)' : 'rgba(236,48,19,0.18)',
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-1.5 mt-1.5">
        {LABELS.map((label, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] font-semibold tracking-widest uppercase text-c-text-2">
              {label.replace('Ano ', '')}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-c-text-2 mt-3">
        Total previsto: {MOCK_DISBURSEMENT_VALUES.filter(v => v !== 'R$ 0').join(' · ')}
      </p>
    </div>
  )
}
