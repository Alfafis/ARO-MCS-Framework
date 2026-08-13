import { TrendingUp } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'

const FAN_DATA = [
  { low: 0,  band: 3  },
  { low: 0,  band: 6  },
  { low: 1,  band: 10 },
  { low: 2,  band: 16 },
  { low: 4,  band: 25 },
  { low: 8,  band: 38 },
  { low: 15, band: 52 },
  { low: 22, band: 65 },
  { low: 30, band: 75 },
  { low: 38, band: 82 },
]

const CHART_H = 150

export default function FanChartCard() {
  const t = useT(resumoT)

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5">
        <TrendingUp size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.fanTitle}</span>
      </div>

      <div className="grid grid-cols-10 gap-2.5">
        {FAN_DATA.map(({ low, band }, i) => {
          const dotCenter = low + band / 2
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="relative w-4" style={{ height: CHART_H }}>
                <div
                  className="absolute"
                  style={{ width: 16, top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', background: '#ece9e6', borderRadius: 8 }}
                />
                <div
                  className="absolute"
                  style={{ width: 16, left: '50%', transform: 'translateX(-50%)', bottom: `${low}%`, height: `${band}%`, background: 'var(--accent-100)', borderRadius: 8 }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-accent border-2 border-white"
                  style={{ bottom: `calc(${dotCenter}% - 7px)` }}
                />
              </div>
              <span className="text-[10px] text-c-text-2 mt-2 whitespace-nowrap">
                {t.yearPrefix.charAt(0) + t.yearPrefix.slice(1).toLowerCase()} {i + 1}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-c-text-2 mt-3 leading-relaxed">{t.fanDesc}</p>
    </div>
  )
}
