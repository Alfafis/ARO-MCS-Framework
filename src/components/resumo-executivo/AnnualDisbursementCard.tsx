import { Calendar } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'

const VALUES = ['R$ 0', '471,7k', '314,5k', '1,52M', '4,42M', '14,91M', '3,15M', '3,15M', '3,15M', '3,15M']

export default function AnnualDisbursementCard() {
  const t = useT(resumoT)

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <Calendar size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.disbursementTitle}</span>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {VALUES.map((value, i) => (
          <div key={i} className="bg-[#f6f5f3] rounded-[8px] p-2 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 mb-1">
              {t.yearPrefix} {i + 1}
            </p>
            <p className="font-mono text-[0.75rem] font-bold text-c-text">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-[12.5px] text-c-text-2 mt-3 leading-relaxed">{t.disbursementDesc}</p>
    </div>
  )
}
