import { Calendar } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'
import type { DisbursementYear } from '@/types/relatorio'

interface Props {
  years: DisbursementYear[]
}

export default function AnnualDisbursementCard({ years }: Props) {
  const t = useT(resumoT)

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <Calendar size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.disbursementTitle}</span>
      </div>

      {/* Linha 1: Anos 1–5 */}
      <div className="grid grid-cols-5 gap-2">
        {years.slice(0, 5).map((year) => (
          <div key={year.label} className="bg-[#f6f5f3] rounded-[8px] p-2 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 mb-1">
              {year.label}
            </p>
            <p className="font-mono text-[0.75rem] font-bold text-c-text">{year.value}</p>
          </div>
        ))}
      </div>

      <div className="h-px bg-[rgba(20,21,26,.08)] my-2" />

      {/* Linha 2: Anos 6–10 */}
      <div className="grid grid-cols-5 gap-2">
        {years.slice(5).map((year) => (
          <div key={year.label} className="bg-[#f6f5f3] rounded-[8px] p-2 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 mb-1">
              {year.label}
            </p>
            <p className="font-mono text-[0.75rem] font-bold text-c-text">{year.value}</p>
          </div>
        ))}
      </div>

      <p className="text-[12.5px] text-c-text-2 mt-3 leading-relaxed">{t.disbursementDesc}</p>
    </div>
  )
}
