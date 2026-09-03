import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'

const LAUNCHES = [
  { sector: 4, name: 'Barragem', period: 'Jul/2026', value: 'R$ 612.000', ok: true },
  { sector: 8, name: 'Monitoramento', period: 'Jul/2026', value: 'R$ 218.000', ok: false },
  { sector: 2, name: 'Cavas', period: 'Jun/2026', value: 'R$ 940.000', ok: true },
]

export default function RecentLaunches() {
  const t = useT(resumoT)

  return (
    <div className="card col-span-7">
      <div className="flex items-center gap-1.5 mb-[18px]">
        <FileText size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.recentLaunches}</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {[t.colCategory, t.colPeriod, t.colValue, t.colStatus].map((col) => (
              <th
                key={col}
                className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 pb-2.5 border-b border-[rgba(20,21,26,.08)]"
                style={{ textAlign: col === t.colStatus ? 'right' : 'left' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LAUNCHES.map(({ sector, name, period, value, ok }, i) => (
            <tr key={i}>
              <td className="py-3 border-b border-[rgba(20,21,26,.08)]">
                <div className="flex items-center gap-2">
                  <span className="w-[22px] h-[22px] rounded-[7px] bg-[#f0eeec] inline-flex items-center justify-center text-[11px] font-bold text-c-text-2 font-mono shrink-0">
                    {sector}
                  </span>
                  <span className="text-[0.8125rem] font-medium text-c-text">{name}</span>
                </div>
              </td>
              <td className="py-3 px-2 border-b border-[rgba(20,21,26,.08)] font-mono text-[0.8125rem] text-c-text-2">
                {period}
              </td>
              <td className="py-3 px-2 border-b border-[rgba(20,21,26,.08)] font-mono text-[0.8125rem] font-semibold text-c-text">
                {value}
              </td>
              <td className="py-3 border-b border-[rgba(20,21,26,.08)] text-right">
                <Badge variant={ok ? 'validado' : 'revisao'}>{ok ? t.statusValidated : t.statusReview}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
