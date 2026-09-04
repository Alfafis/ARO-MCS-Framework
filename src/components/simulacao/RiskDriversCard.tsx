import { Crosshair } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import type { SimResult } from '@/types/simulacao'

interface Props {
  result: SimResult | null
}

export default function RiskDriversCard({ result }: Props) {
  const t = useT(simulacaoT)

  // `riskDrivers` pode faltar em SimResult persistido antes desta feature
  // existir — degrada pro estado "sem dado" em vez de quebrar.
  if (!result || !result.riskDrivers) return null

  const drivers = result.riskDrivers
  const maxAbs = Math.max(...drivers.map((d) => Math.abs(d.correlation)), 1e-9)

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-1.5 text-sm font-semibold text-c-text">
        <Crosshair size={14} color="var(--accent)" aria-hidden="true" />
        <span>{t.riskDriversTitle}</span>
      </div>
      <p className="text-[12px] text-c-text-2 leading-snug mb-4">{t.riskDriversHint}</p>

      {drivers.length < 2 ? (
        <p className="text-[0.8125rem] text-c-text-2 leading-relaxed">{t.riskDriversEmpty}</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {drivers.map(({ name, correlation }) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-[0.8125rem] text-c-text w-[38%] shrink-0 truncate">{name}</span>
              <div className="flex-1 h-2 rounded-full bg-c-surface-2-hover overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(2, (Math.abs(correlation) / maxAbs) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[0.8125rem] font-bold text-c-text w-[52px] text-right shrink-0">
                {correlation >= 0 ? '+' : ''}
                {correlation.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
