import { Activity } from 'lucide-react'
import type { SimResult, UncertaintyLevel } from '@/types/simulacao'

const UNCERTAINTY_TEXT: Record<UncertaintyLevel, string> = {
  baixo:    'Incerteza baixa',
  moderado: 'Incerteza moderada',
  alto:     'Incerteza alta',
}

interface Props {
  result: SimResult
  iterations: string
}

export default function HistogramCard({ result, iterations }: Props) {
  const maxH = Math.max(...result.bars)

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5 text-sm font-semibold text-c-text">
        <Activity size={14} color="var(--accent)" aria-hidden="true" />
        <span>Distribuição de custo total ({iterations} iterações)</span>
      </div>

      <div className="histogram" aria-hidden="true">
        {result.bars.map((h, i) => (
          <div
            key={i}
            className={`hist-bar${h / maxH >= 0.45 ? ' in' : ''}`}
            style={{ height: `${Math.round((h / maxH) * 100)}px` }}
          />
        ))}
      </div>

      <div className="hist-labels">
        <span>{result.min}</span>
        <span>{result.mean}</span>
        <span>{result.max}</span>
      </div>

      <p className="mt-3.5 text-[0.8125rem] text-c-text-2 leading-relaxed">
        {UNCERTAINTY_TEXT[result.uncertainty]} —{' '}
        <strong className="text-c-text font-mono font-bold">{result.range}</strong>{' '}
        de variação no intervalo de confiança de 95%.
      </p>
    </div>
  )
}
