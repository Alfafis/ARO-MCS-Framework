import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const UPDATE_METHODS = [
  { label: 'Escalonamento (IPCA)',    value: 'R$ 55,2 M' },
  { label: 'Juros simples 10,75%',   value: 'R$ 84,2 M' },
  { label: 'Juros compostos 10,75%', value: 'R$ 112,6 M' },
  { label: 'Inflação constante 3,4%',value: 'R$ 56,7 M' },
]

export default function ConfidenceCard() {
  return (
    <div className="card col-span-4">
      <div className="flex items-center gap-1.5 mb-3.5">
        <Shield size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Confiabilidade e contingência</span>
      </div>

      <p className="text-[22px] font-bold text-c-text tracking-tight mb-3.5">Baixa incerteza</p>

      <div className="mb-1">
        <div className="relative h-1.5 rounded bg-[#ece9e6] mb-1.5">
          <div className="absolute h-full rounded bg-accent" style={{ left: '20%', right: '20%' }} />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[11px] text-c-text-2">IC 95%: R$ 37,9 M</span>
          <span className="font-mono text-[11px] text-c-text-2">R$ 39,1 M</span>
        </div>
      </div>

      <div className="h-px bg-[rgba(20,21,26,.08)] my-3.5" />

      <div className="flex justify-between items-start gap-2 mb-1">
        <div>
          <p className="text-[0.8125rem] font-semibold text-c-text mb-0.5">Contingência aplicada</p>
          <p className="text-[0.75rem] text-c-text-2">Síntese por Setor zero; por Atividade aplica 20%</p>
        </div>
        <Badge variant="line" className="whitespace-nowrap shrink-0">A decidir</Badge>
      </div>

      <div className="h-px bg-[rgba(20,21,26,.08)] my-3.5" />

      <p className="text-[0.8125rem] font-semibold text-c-text mb-2.5">Métodos de atualização</p>
      <div className="flex flex-col gap-1.5">
        {UPDATE_METHODS.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-baseline gap-2">
            <span className="text-[0.75rem] text-c-text-2">{label}</span>
            <span className="font-mono text-[0.75rem] font-semibold text-c-text whitespace-nowrap">{value}</span>
          </div>
        ))}
        <p className="text-[11px] text-c-text-2 mt-1">Método padrão a definir por projeto.</p>
      </div>
    </div>
  )
}
