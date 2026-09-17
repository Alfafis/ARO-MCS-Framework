import { PieChart } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'

export interface CostCompositionItem {
  name: string
  value: string
  percent: number
}

interface Props {
  items: CostCompositionItem[]
  className?: string
}

// Gráfico de barras horizontais mostrando a composição percentual do custo
// total por categoria. Barras ordenadas por peso decrescente pra destacar
// visualmente as categorias que mais compõem o custo. Cada linha traz nome,
// valor absoluto (formato compacto) e barra proporcional ao %.
export default function CostCompositionCard({ items, className = '' }: Props) {
  const t = useT(resumoT)

  if (items.length === 0) {
    return (
      <div className={`card ${className}`.trimEnd()}>
        <div className="flex items-center gap-1.5 mb-4 text-sm font-semibold text-c-text">
          <PieChart size={14} color="var(--accent)" aria-hidden="true" />
          <span>{t.compositionTitle}</span>
        </div>
        <p className="text-[0.8125rem] text-c-text-2 leading-relaxed">{t.compositionEmpty}</p>
      </div>
    )
  }

  const sorted = [...items].sort((a, b) => b.percent - a.percent)

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-1.5 text-sm font-semibold text-c-text">
        <PieChart size={14} color="var(--accent)" aria-hidden="true" />
        <span>{t.compositionTitle}</span>
      </div>
      <p className="text-[12px] text-c-text-2 leading-snug mb-4">{t.compositionHint}</p>

      <div className="flex flex-col gap-2.5">
        {sorted.map(({ name, value, percent }) => (
          <div key={name} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[0.8125rem] text-c-text truncate">{name}</span>
              <span className="text-[0.75rem] text-c-text-2 whitespace-nowrap">
                <span className="font-mono font-semibold text-c-text">{value}</span>
                {' · '}
                <span className="font-mono font-semibold">{percent.toFixed(1).replace('.', ',')}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-c-surface-2-hover overflow-hidden">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(2, percent)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
