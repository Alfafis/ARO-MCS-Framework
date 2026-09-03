import { Fragment } from 'react'
import { BarChart2 } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import type { CostCategory, CostTotals, PhaseCategory } from '@/types/relatorio'

interface Props {
  categories: CostCategory[]
  totals: CostTotals
  className?: string
  groupByPhase?: boolean
}

const PHASE_ORDER: PhaseCategory[] = ['pre', 'closure', 'post']

export default function CostByCategoryTable({ categories, totals, className = '', groupByPhase = true }: Props) {
  const t = useT(resumoT)

  const PHASE_LABELS: Record<PhaseCategory, { name: string; desc: string; years: string }> = {
    pre: { name: t.phasePreLabel, desc: t.phasePreDesc, years: t.phasePreYears },
    closure: { name: t.phaseClosureLabel, desc: t.phaseClosureDesc, years: t.phaseClosureYears },
    post: { name: t.phasePostLabel, desc: t.phasePostDesc, years: t.phasePostYears },
  }

  const grouped = groupByPhase
    ? PHASE_ORDER.map((phase) => ({
        phase: phase as PhaseCategory | null,
        items: categories.filter((c) => c.phase === phase),
      })).filter((g) => g.items.length > 0)
    : [{ phase: null, items: categories }]

  const cols = groupByPhase
    ? ([t.colHash, t.colCategory, t.colMin, t.colMax, t.colUpdated] as const)
    : ([t.colHash, t.colCategory, t.colMin, t.colMax] as const)

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.costTableTitle(categories.length)}</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {cols.map((col) => (
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
          {grouped.map(({ phase, items }, groupIdx) => (
            <Fragment key={phase ?? 'flat'}>
              {phase && (
                <tr>
                  <td
                    colSpan={cols.length}
                    className={`pb-2 ${groupIdx === 0 ? 'pt-3' : 'pt-4 border-t border-c-line'}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                        {PHASE_LABELS[phase].name}
                      </span>
                      <span className="text-[10px] text-c-text-2">{PHASE_LABELS[phase].desc}</span>
                      <span className="text-[11px] font-semibold text-accent bg-accent/10 rounded-full px-2 py-0.5 leading-none">
                        {PHASE_LABELS[phase].years}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {items.map(({ rank, name, min, max, updated }) => (
                <tr key={rank}>
                  <td className="py-2.5 border-b border-c-line font-mono text-[11px] text-c-text-2 pr-2 w-8">{rank}</td>
                  <td className="py-2.5 border-b border-c-line text-[0.8125rem] text-c-text">{name}</td>
                  <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] text-c-text-2 text-right">
                    {min}
                  </td>
                  <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] text-c-text-2 text-right">
                    {max}
                  </td>
                  {groupByPhase && (
                    <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] font-semibold text-c-text text-right">
                      {updated}
                    </td>
                  )}
                </tr>
              ))}
            </Fragment>
          ))}
          <tr>
            <td className="pt-3 border-t-2 border-c-line" />
            <td className="pt-3 border-t-2 border-c-line text-[0.8125rem] font-bold text-c-text">{t.totalLabel}</td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">
              {totals.min}
            </td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">
              {totals.max}
            </td>
            {groupByPhase && (
              <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">
                {totals.updated}
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
