import { Shield } from 'lucide-react'

const METRICS = [
  { label: 'Média',                       value: 'R$ 32.383.330' },
  { label: 'Desvio-padrão',               value: 'R$ 1.609.055'  },
  { label: 'P(x > 80%)',                  value: 'R$ 33.751.817' },
  { label: 'Prob. de excedência (x>80%)', value: '25,19%'        },
]

export default function RiskMetricsCard() {
  return (
    <div className="card col-span-5">
      <div className="flex items-center gap-1.5 mb-4">
        <Shield size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Métricas de risco</span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-[22px] font-bold text-success">Baixo</span>
        <span className="text-[12px] text-c-text-2">CV = 4,97%</span>
      </div>

      <div className="mb-1.5">
        <div className="relative h-1.5 rounded bg-[#ece9e6] mb-1.5">
          <div className="absolute h-full rounded bg-accent" style={{ left: '20%', right: '20%' }} />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[11px] text-c-text-2">IC 95%: R$ 32,35 M</span>
          <span className="font-mono text-[11px] text-c-text-2">R$ 32,41 M</span>
        </div>
      </div>

      <div className="h-px bg-c-line my-3" />

      <div className="flex flex-col gap-2">
        {METRICS.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-baseline gap-2">
            <span className="text-[0.75rem] text-c-text-2">{label}</span>
            <span className="font-mono text-[0.8125rem] font-semibold text-c-text whitespace-nowrap">{value}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-c-line my-3" />

      <div className="flex justify-between items-baseline">
        <span className="text-[0.75rem] text-c-text-2">Contingência aplicada</span>
        <span className="font-mono text-[0.8125rem] font-semibold text-c-text">0%</span>
      </div>
    </div>
  )
}
