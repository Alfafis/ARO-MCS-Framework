import type { ReactNode } from 'react'

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: string
  sub: string
  delta?: string
  deltaPositive?: boolean
}

export default function KpiCard({ icon, label, value, sub, delta, deltaPositive }: KpiCardProps) {
  return (
    <div className="cell">
      <div className="kpi-badge">{icon}</div>
      <p className="cell-title">{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="kpi-value">{value}</span>
        {delta && (
          <span className="tag" style={{
            background: deltaPositive ? 'var(--success-bg)' : 'var(--accent-100)',
            color: deltaPositive ? 'var(--success)' : 'var(--accent-700)',
          }}>
            {delta}
          </span>
        )}
      </div>
      <p className="kpi-sub">{sub}</p>
    </div>
  )
}
