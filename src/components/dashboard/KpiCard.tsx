import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

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
    <div className="card">
      <div className="w-[26px] h-[26px] rounded-[9px] bg-accent-100 text-accent-700 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-c-text-2 mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-[28px] font-bold text-c-text tracking-tight font-mono">{value}</span>
        {delta && (
          <Badge variant={deltaPositive ? 'success' : 'accent'}>{delta}</Badge>
        )}
      </div>
      {sub && <p className="text-[12.5px] text-c-text-2 mt-1.5">{sub}</p>}
    </div>
  )
}
