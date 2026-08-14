import { BarChart2 } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'
import type { CostCategory, CostTotals } from '@/types/relatorio'

interface Props {
  categories: CostCategory[]
  totals: CostTotals
  className?: string
}

export default function CostByCategoryTable({ categories, totals, className = '' }: Props) {
  const t = useT(resumoT)

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.costTableTitle}</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {([t.colHash, t.colCategory, t.colMin, t.colMax, t.colUpdated] as const).map(col => (
              <th
                key={col}
                className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 pb-2.5 border-b border-c-line"
                style={{ textAlign: col === t.colHash || col === t.colCategory ? 'left' : 'right' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(({ rank, name, min, max, updated }) => (
            <tr key={rank}>
              <td className="py-2.5 border-b border-c-line font-mono text-[11px] text-c-text-2 pr-2 w-8">{rank}</td>
              <td className="py-2.5 border-b border-c-line text-[0.8125rem] text-c-text">{name}</td>
              <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] text-c-text-2 text-right">{min}</td>
              <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] text-c-text-2 text-right">{max}</td>
              <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] font-semibold text-c-text text-right">{updated}</td>
            </tr>
          ))}
          <tr>
            <td className="pt-3 border-t-2 border-c-line" />
            <td className="pt-3 border-t-2 border-c-line text-[0.8125rem] font-bold text-c-text">{t.totalLabel}</td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">{totals.min}</td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">{totals.max}</td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">{totals.updated}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
