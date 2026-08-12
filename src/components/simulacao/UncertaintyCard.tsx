import { Target } from 'lucide-react'

const CONTRIBUTIONS = [
  { name: 'Monitoramento', pct: '±20,0%' },
  { name: 'Barragem',      pct: '±19,3%' },
  { name: 'Cavas',         pct: '±19,1%' },
]

export default function UncertaintyCard() {
  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5 text-sm font-semibold text-c-text">
        <Target size={14} color="var(--accent)" aria-hidden="true" />
        <span>Contribuição de incerteza por categoria</span>
      </div>

      {CONTRIBUTIONS.map(({ name, pct }) => (
        <div key={name} className="flex items-center justify-between py-2.5 border-b border-[rgba(20,21,26,.08)] last:border-b-0">
          <span className="text-[0.875rem] text-c-text">{name}</span>
          <span className="font-mono font-bold text-sm text-c-text">{pct}</span>
        </div>
      ))}
    </div>
  )
}
