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
    <div className="content-card">
      <div className="card-section-title">
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

      <p style={{ marginTop: 14, fontSize: '0.8125rem', color: 'var(--c-text-2)', lineHeight: 1.6 }}>
        {UNCERTAINTY_TEXT[result.uncertainty]} —{' '}
        <strong style={{ color: 'var(--c-text)', fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700 }}>
          {result.range}
        </strong>{' '}
        de variação no intervalo de confiança de 95%.
      </p>
    </div>
  )
}
