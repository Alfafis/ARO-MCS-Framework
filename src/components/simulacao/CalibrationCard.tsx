import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import { calibrarProvisao, type NivelRisco } from '@/lib/aroSimulacao'
import { formatMoedaCompact } from '@/lib/financeiro'
import type { SimResult } from '@/types/simulacao'

interface Props {
  result: SimResult | null
}

const BADGE_VARIANT: Record<NivelRisco, 'success' | 'warning' | 'danger'> = {
  Baixo: 'success',
  Médio: 'warning',
  Alto: 'danger',
}

export default function CalibrationCard({ result }: Props) {
  const t = useT(simulacaoT)

  // `p50Raw`/`p90Raw`/`p95Raw`/`cvar95Raw` podem faltar em SimResult
  // persistido antes desta feature existir — degrada em vez de mostrar NaN.
  if (!result || result.p50Raw == null || result.cvar95Raw == null) return null

  const cal = calibrarProvisao({
    cv: result.cv,
    p50: result.p50Raw,
    p90: result.p90Raw,
    p95: result.p95Raw,
    cvar95: result.cvar95Raw,
  })

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
          <ShieldCheck size={14} color="var(--accent)" aria-hidden="true" />
          <span>{t.calibrationTitle}</span>
        </div>
        <Badge variant={BADGE_VARIANT[cal.nivelRisco]}>{t.calibrationRisk[cal.nivelRisco]}</Badge>
      </div>
      <p className="text-[12px] text-c-text-2 leading-snug mb-4">{t.calibrationHint}</p>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-c-surface-2 rounded-[14px] px-4 py-3.5">
          <div className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 mb-1.5">
            {t.calibrationBase}
          </div>
          <div className="font-mono text-base font-bold text-c-text tracking-tight">
            {formatMoedaCompact(cal.provisaoBase)}
          </div>
        </div>
        <div className="bg-c-surface-2 rounded-[14px] px-4 py-3.5">
          <div className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 mb-1.5">
            {t.calibrationMargin}
          </div>
          <div className="font-mono text-base font-bold text-c-text tracking-tight">
            {(cal.margemSeguranca * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-accent-100 rounded-[14px] px-4 py-3.5">
          <div className="text-[11px] font-semibold tracking-widest uppercase text-accent-700 mb-1.5">
            {t.calibrationFinal}
          </div>
          <div className="font-mono text-base font-bold text-accent-700 tracking-tight">
            {formatMoedaCompact(cal.provisaoFinal)}
          </div>
        </div>
      </div>
    </div>
  )
}
