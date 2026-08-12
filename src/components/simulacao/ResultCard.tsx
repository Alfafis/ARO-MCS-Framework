import { BarChart2 } from 'lucide-react'
import type { SimResult } from '@/types/simulacao'

const STATS = [
  { key: 'mean',   label: 'Média' },
  { key: 'stddev', label: 'Desvio-padrão' },
  { key: 'p10p90', label: 'P10–P90' },
  { key: 'ic95',   label: 'IC 95%' },
] as const

interface Props {
  result: SimResult
}

export default function ResultCard({ result }: Props) {
  return (
    <div className="content-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="card-section-title" style={{ marginBottom: 0 }}>
          <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
          <span>Resultado da última rodada</span>
        </div>
        <span className="status-pill">{result.status}</span>
      </div>

      <div className="stat-grid">
        {STATS.map(({ key, label }) => (
          <div key={key} className="stat-box">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{result[key]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
