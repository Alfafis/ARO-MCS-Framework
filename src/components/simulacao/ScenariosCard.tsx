import { GitBranch } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import { formatMoedaCompact } from '@/lib/financeiro'
import type { SimResult } from '@/types/simulacao'

interface Props {
  result: SimResult | null
}

export default function ScenariosCard({ result }: Props) {
  const t = useT(simulacaoT)

  // `scenarios` pode faltar em SimResult persistido antes desta feature
  // existir — degrada pro estado "sem card" em vez de quebrar.
  if (!result || !result.scenarios) return null

  const { otimista, moderado, pessimista, estresse } = result.scenarios
  const ROWS = [
    { label: t.scenarioOtimista, value: otimista },
    { label: t.scenarioModerado, value: moderado },
    { label: t.scenarioPessimista, value: pessimista },
    { label: t.scenarioEstresse, value: estresse },
  ]

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4 text-sm font-semibold text-c-text">
        <GitBranch size={14} color="var(--accent)" aria-hidden="true" />
        <span>{t.scenariosTitle}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ROWS.map(({ label, value }) => (
          <div key={label} className="bg-[#f6f5f3] rounded-[14px] px-4 py-3.5">
            <div className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 mb-1.5">{label}</div>
            <div className="font-mono text-base font-bold text-c-text tracking-tight">{formatMoedaCompact(value)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
