import { BarChart2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/LangContext'
import { simulacaoT } from '@/i18n/simulacao'
import type { SimResult } from '@/types/simulacao'

interface Props {
  result: SimResult
}

export default function ResultCard({ result }: Props) {
  const t = useT(simulacaoT)

  const STATS = [
    { key: 'mean',   label: t.statMean   },
    { key: 'stddev', label: t.statStddev },
    { key: 'p10p90', label: 'P10–P90'   },
    { key: 'ic95',   label: 'IC 95%'    },
  ] as const

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
          <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
          <span>{t.lastResult}</span>
        </div>
        <Badge variant="status">{result.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {STATS.map(({ key, label }) => (
          <div key={key} className="bg-[#f6f5f3] rounded-[14px] px-4 py-3.5">
            <div className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 mb-1.5">{label}</div>
            <div className="font-mono text-base font-bold text-c-text tracking-tight">{result[key]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
