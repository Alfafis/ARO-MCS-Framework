import { Activity } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { simulacaoT } from '@/i18n/simulacao'
import type { SimResult, UncertaintyLevel } from '@/types/simulacao'

interface Props {
  result:     SimResult | null
  iterations: string
}

export default function HistogramCard({ result, iterations }: Props) {
  const t = useT(simulacaoT)

  const UNCERTAINTY_TEXT: Record<UncertaintyLevel, string> = {
    baixo:    t.uncertainty_low,
    moderado: t.uncertainty_mod,
    alto:     t.uncertainty_high,
  }

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5 text-sm font-semibold text-c-text">
        <Activity size={14} color="var(--accent)" aria-hidden="true" />
        <span>{t.histTitle(iterations)}</span>
      </div>

      {result ? (
        <>
          <div className="histogram" aria-hidden="true">
            {result.bars.map((h, i) => {
              const maxH = Math.max(...result.bars)
              return (
                <div
                  key={i}
                  className={`hist-bar${h / maxH >= 0.45 ? ' in' : ''}`}
                  style={{ height: `${Math.round((h / maxH) * 100)}px` }}
                />
              )
            })}
          </div>

          <div className="hist-labels">
            <span>{result.min}</span>
            <span>{result.mean}</span>
            <span>{result.max}</span>
          </div>

          <p className="mt-3.5 text-[0.8125rem] text-c-text-2 leading-relaxed">
            {UNCERTAINTY_TEXT[result.uncertainty]} —{' '}
            <strong className="text-c-text font-mono font-bold">{result.range}</strong>{' '}
            {t.variationSuffix}
          </p>
        </>
      ) : (
        <p className="text-[0.8125rem] text-c-text-2 leading-relaxed">{t.noResultYet}</p>
      )}
    </div>
  )
}
