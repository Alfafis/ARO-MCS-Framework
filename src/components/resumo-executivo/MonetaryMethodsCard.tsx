import { BarChart2 } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import type { MonetaryMethod } from '@/types/relatorio'

interface Props {
  methods:     MonetaryMethod[]
  baseLabel:   string
  horizonYears: number
  className?:  string
}

export default function MonetaryMethodsCard({ methods, baseLabel, horizonYears, className = '' }: Props) {
  const t = useT(resumoT)

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.monetaryTitle(baseLabel, horizonYears)}</span>
      </div>

      <div className="flex flex-col">
        {methods.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-baseline py-3 border-b border-c-line last:border-b-0"
          >
            <span className="text-[0.8125rem] text-c-text">{label}</span>
            <span className="font-mono text-[0.875rem] font-bold text-c-text whitespace-nowrap ml-4">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
