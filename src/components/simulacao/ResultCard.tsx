import { BarChart2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import type { SimResult } from '@/types/simulacao'

interface Props {
  result: SimResult | null
}

export default function ResultCard({ result }: Props) {
  const t = useT(simulacaoT)

  const icLabel = result ? `IC ${result.confidenceLevel}%` : 'IC 95%'

  const STATS = [
    { key: 'mean', label: t.statMean },
    { key: 'stddev', label: t.statStddev },
    { key: 'p10p90', label: 'P10–P90' },
    { key: 'ic95', label: icLabel },
    { key: 'var95', label: t.statVar95 },
    { key: 'cvar95', label: t.statCvar95 },
  ] as const

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
          <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
          <span>{t.lastResult}</span>
        </div>
        {result && <Badge variant="status">{result.status}</Badge>}
      </div>

      {result ? (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            {STATS.map(({ key, label }) => (
              <div key={key} className="bg-c-surface-2 rounded-[14px] px-4 py-3.5">
                <div className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 mb-1.5">{label}</div>
                <div className="font-mono text-base font-bold text-c-text tracking-tight">{result[key]}</div>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-c-text-2 mt-3 font-mono">{t.seedFooter(result.seed, result.converged)}</p>
        </>
      ) : (
        <p className="text-[0.8125rem] text-c-text-2 leading-relaxed">{t.noResultYet}</p>
      )}
    </div>
  )
}
