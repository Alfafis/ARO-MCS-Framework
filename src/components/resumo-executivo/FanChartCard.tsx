import { TrendingUp } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import type { FanPoint } from '@/types/relatorio'

const CHART_H = 150

interface Props {
  data: FanPoint[]
  cv: string
}

export default function FanChartCard({ data, cv }: Props) {
  const t = useT(resumoT)

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5">
        <TrendingUp size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.fanTitle}</span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-10 gap-2.5 min-w-[420px]">
          {data.map(({ label, low, band }) => {
            const dotCenter = low + band / 2
            return (
              <div key={label} className="flex flex-col items-center">
                <div className="relative w-4" style={{ height: CHART_H }}>
                  <div
                    className="absolute"
                    style={{
                      width: 16,
                      top: 0,
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--c-track)',
                      borderRadius: 8,
                    }}
                  />
                  <div
                    className="absolute"
                    style={{
                      width: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bottom: `${low}%`,
                      height: `${band}%`,
                      background: 'var(--accent-100)',
                      borderRadius: 8,
                    }}
                  />
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-accent border-2 border-white"
                    style={{ bottom: `calc(${dotCenter}% - 7px)` }}
                  />
                </div>
                <span className="text-[10px] text-c-text-2 mt-2 whitespace-nowrap">{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-[11px] text-c-text-2 mt-3 leading-relaxed">{t.fanDesc(cv)}</p>
    </div>
  )
}
