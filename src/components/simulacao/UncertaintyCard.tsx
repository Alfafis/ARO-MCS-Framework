import { useMemo } from 'react'
import { Target } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import { categoryStddev, categoryMean, type CategoryParam } from '@/lib/aroSimulacao'
import type { Distribution, SimResult } from '@/types/simulacao'

interface Props {
  result:           SimResult | null
  dist:             Distribution
  activeCategories: Set<string>
  categoryParams:   CategoryParam[]
}

export default function UncertaintyCard({ result, dist, activeCategories, categoryParams }: Props) {
  const t = useT(simulacaoT)

  const rows = useMemo(() => {
    const cats = categoryParams.filter(c => activeCategories.has(c.name))
    const totalMean = cats.reduce((s, c) => s + categoryMean(c, dist), 0) || 1

    return cats
      .map(cat => ({
        name: cat.name,
        pct:  (categoryStddev(cat, dist) / totalMean) * 100,
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [dist, activeCategories, categoryParams])

  const fmt = (pct: number) =>
    `±${pct.toFixed(1).replace('.', ',')}%`

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5 text-sm font-semibold text-c-text">
        <Target size={14} color="var(--accent)" aria-hidden="true" />
        <span>{t.uncertaintyTitle}</span>
      </div>

      {result ? (
        rows.map(({ name, pct }) => (
          <div key={name} className="flex items-center justify-between py-2.5 border-b border-[rgba(20,21,26,.08)] last:border-b-0">
            <span className="text-[0.875rem] text-c-text">{name}</span>
            <span className="font-mono font-bold text-sm text-c-text">{fmt(pct)}</span>
          </div>
        ))
      ) : (
        <p className="text-[0.8125rem] text-c-text-2 leading-relaxed">{t.noResultYet}</p>
      )}
    </div>
  )
}
