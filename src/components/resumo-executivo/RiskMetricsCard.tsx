import { Shield } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import type { RiskMetric } from '@/types/relatorio'
import type { UncertaintyLevel } from '@/types/simulacao'

interface Props {
  metrics: RiskMetric[]
  cvLabel: string
  icLo: string
  icHi: string
  contingency: string
  uncertainty?: UncertaintyLevel
  className?: string
}

const UNCERTAINTY_COLOR: Record<UncertaintyLevel, string> = {
  baixo: 'text-success',
  moderado: 'text-yellow-600',
  alto: 'text-accent',
}

export default function RiskMetricsCard({
  metrics,
  cvLabel,
  icLo,
  icHi,
  contingency,
  uncertainty,
  className = '',
}: Props) {
  const t = useT(resumoT)

  const riskLabel = uncertainty === 'moderado' ? t.riskModerate : uncertainty === 'alto' ? t.riskHigh : t.riskLow

  const riskColor = uncertainty ? UNCERTAINTY_COLOR[uncertainty] : 'text-success'

  return (
    <div className={`card h-full ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-4">
        <Shield size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.riskMetricsTitle}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-[22px] font-bold ${riskColor}`}>{riskLabel}</span>
        <span className="text-[12px] text-c-text-2">{cvLabel}</span>
      </div>

      <div className="mb-1.5">
        <div className="relative h-1.5 rounded bg-[#ece9e6] mb-1.5">
          <div className="absolute h-full rounded bg-accent" style={{ left: '20%', right: '20%' }} />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[11px] text-c-text-2">{icLo}</span>
          <span className="font-mono text-[11px] text-c-text-2">{icHi}</span>
        </div>
      </div>

      <div className="h-px bg-c-line my-3" />

      <div className="flex flex-col gap-2">
        {metrics.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-baseline gap-2">
            <span className="text-[0.75rem] text-c-text-2">{label}</span>
            <span className="font-mono text-[0.8125rem] font-semibold text-c-text whitespace-nowrap">{value}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-c-line my-3" />

      <div className="flex justify-between items-baseline">
        <span className="text-[0.75rem] text-c-text-2">{t.contingencyLabel}</span>
        <span className="font-mono text-[0.8125rem] font-semibold text-c-text">{contingency}</span>
      </div>
    </div>
  )
}
