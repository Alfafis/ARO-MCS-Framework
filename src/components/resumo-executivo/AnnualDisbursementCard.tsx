import { Calendar } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import type { DisbursementYear, DisbursementCategory } from '@/types/relatorio'

interface Props {
  years: DisbursementYear[]
  categories?: DisbursementCategory[]
}

const COL_TEMPLATE = '150px repeat(10, 1fr)'

export default function AnnualDisbursementCard({ years, categories }: Props) {
  const t = useT(resumoT)

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <Calendar size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.disbursementTitle}</span>
      </div>

      {categories ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[740px]" style={{ gridTemplateColumns: COL_TEMPLATE }}>
            {/* Header */}
            <div />
            {years.map((y) => (
              <div key={y.label} className="text-center pb-2.5">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2">{y.label}</span>
              </div>
            ))}

            {/* Category rows */}
            {categories.flatMap((cat, ci) => [
              <div key={`n${ci}`} className="py-[5px] pr-3 flex items-center border-t border-[rgba(20,21,26,.06)]">
                <span className="text-[12px] text-c-text-2 leading-tight">{cat.name}</span>
              </div>,
              ...cat.values.map((val, yi) => (
                <div
                  key={`v${ci}-${yi}`}
                  className="py-[5px] flex items-center justify-center border-t border-[rgba(20,21,26,.06)]"
                >
                  {val != null ? (
                    <span className="font-mono text-[0.72rem] font-bold text-c-text">{val}</span>
                  ) : (
                    <span className="text-[0.8rem] text-c-text-2/25">—</span>
                  )}
                </div>
              )),
            ])}

            {/* Divider */}
            <div style={{ gridColumn: '1 / -1' }} className="h-px bg-[rgba(20,21,26,.12)] my-1" />

            {/* Total row */}
            <div className="py-[5px] pr-3 flex items-center">
              <span className="text-[12px] font-semibold text-c-text">{t.totalLabel}</span>
            </div>
            {years.map((y) => (
              <div key={`t${y.label}`} className="py-[5px] flex items-center justify-center">
                <span className="font-mono text-[0.72rem] font-bold text-c-text">{y.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-2">
            {years.slice(0, 5).map((year) => (
              <div key={year.label} className="bg-[#f6f5f3] rounded-[8px] p-2 text-center">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 mb-1">{year.label}</p>
                <p className="font-mono text-[0.75rem] font-bold text-c-text">{year.value}</p>
              </div>
            ))}
          </div>
          <div className="h-px bg-[rgba(20,21,26,.08)] my-2" />
          <div className="grid grid-cols-5 gap-2">
            {years.slice(5).map((year) => (
              <div key={year.label} className="bg-[#f6f5f3] rounded-[8px] p-2 text-center">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 mb-1">{year.label}</p>
                <p className="font-mono text-[0.75rem] font-bold text-c-text">{year.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
