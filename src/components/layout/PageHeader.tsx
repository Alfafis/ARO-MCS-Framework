import type { ReactNode } from 'react'

interface Props {
  title: string
  badge?: string
  subtitle?: string
  clientSelector?: ReactNode
  actions?: ReactNode
}

export default function PageHeader({ title, badge, subtitle, clientSelector, actions }: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between px-4 sm:px-8 py-4 sm:py-5 gap-4 shrink-0">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-[26px] font-bold text-c-text tracking-tight leading-none">{title}</h1>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-c-surface-2-hover text-c-text-2 text-[11px] font-semibold font-mono">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-[13px] text-c-text-2">{subtitle}</p>}
        {clientSelector && <div className="mt-1.5">{clientSelector}</div>}
      </div>
      {actions && <div className="flex items-center gap-[10px] shrink-0">{actions}</div>}
    </header>
  )
}
