import { BarChart2 } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'

export default function MonetaryMethodsCard() {
  const t = useT(resumoT)

  const METHODS = [
    { label: t.method1, value: 'R$ 84.172.705'  },
    { label: t.method2, value: 'R$ 112.613.519' },
    { label: t.method3, value: 'R$ 56.670.699'  },
    { label: t.method4, value: 'R$ 55.175.062'  },
  ]

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.monetaryTitle}</span>
      </div>

      <div className="flex flex-col">
        {METHODS.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-baseline py-3 border-b border-c-line last:border-b-0"
          >
            <span className="text-[0.8125rem] text-c-text">{label}</span>
            <span className="font-mono text-[0.875rem] font-bold text-c-text whitespace-nowrap ml-4">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
