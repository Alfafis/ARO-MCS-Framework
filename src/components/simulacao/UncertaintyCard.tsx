import { Target } from 'lucide-react'

const CONTRIBUTIONS = [
  { name: 'Monitoramento', pct: '±20,0%' },
  { name: 'Barragem',      pct: '±19,3%' },
  { name: 'Cavas',         pct: '±19,1%' },
]

export default function UncertaintyCard() {
  return (
    <div className="content-card">
      <div className="card-section-title">
        <Target size={14} color="var(--accent)" aria-hidden="true" />
        <span>Contribuição de incerteza por categoria</span>
      </div>

      {CONTRIBUTIONS.map(({ name, pct }) => (
        <div key={name} className="unc-row">
          <span style={{ color: 'var(--c-text)', fontSize: '0.875rem' }}>{name}</span>
          <span className="unc-pct">{pct}</span>
        </div>
      ))}
    </div>
  )
}
