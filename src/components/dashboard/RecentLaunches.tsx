import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const LAUNCHES = [
  { sector: 4,  name: 'Barragem',      period: 'Jul/2026', value: 'R$ 612.000', status: 'Validado',   ok: true  },
  { sector: 8,  name: 'Monitoramento', period: 'Jul/2026', value: 'R$ 218.000', status: 'Em revisão', ok: false },
  { sector: 2,  name: 'Cavas',         period: 'Jun/2026', value: 'R$ 940.000', status: 'Validado',   ok: true  },
]

export default function RecentLaunches() {
  return (
    <div className="card col-span-7">
      <div className="flex items-center gap-1.5 mb-[18px]">
        <FileText size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Lançamentos recentes</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Categoria', 'Período', 'Valor real', 'Status'].map(col => (
              <th key={col} className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 pb-2.5 border-b border-[rgba(20,21,26,.08)]"
                style={{ textAlign: col === 'Status' ? 'right' : 'left' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LAUNCHES.map(({ sector, name, period, value, status, ok }, i) => (
            <tr key={i}>
              <td className="py-3 border-b border-[rgba(20,21,26,.08)]">
                <div className="flex items-center gap-2">
                  <span className="w-[22px] h-[22px] rounded-[7px] bg-[#f0eeec] inline-flex items-center justify-center text-[11px] font-bold text-c-text-2 font-mono shrink-0">
                    {sector}
                  </span>
                  <span className="text-[0.8125rem] font-medium text-c-text">{name}</span>
                </div>
              </td>
              <td className="py-3 px-2 border-b border-[rgba(20,21,26,.08)] font-mono text-[0.8125rem] text-accent-700">
                {period}
              </td>
              <td className="py-3 px-2 border-b border-[rgba(20,21,26,.08)] font-mono text-[0.8125rem] font-semibold text-c-text">
                {value}
              </td>
              <td className="py-3 border-b border-[rgba(20,21,26,.08)] text-right">
                <Badge variant={ok ? 'validado' : 'revisao'}>{status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
