import { AlertTriangle, FolderOpen, AlertCircle, ShieldAlert, FileCheck2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'

export default function RisksCard() {
  const t = useT(resumoT)

  const RISKS: { Icon: LucideIcon; title: string; desc: string }[] = [
    { Icon: FolderOpen,  title: t.risk1Title, desc: t.risk1Desc },
    { Icon: AlertCircle, title: t.risk2Title, desc: t.risk2Desc },
    { Icon: ShieldAlert, title: t.risk3Title, desc: t.risk3Desc },
    { Icon: FileCheck2,  title: t.risk4Title, desc: t.risk4Desc },
  ]

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <AlertTriangle size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.risksTitle}</span>
      </div>

      <div className="flex flex-col">
        {RISKS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-3 py-3.5 border-b border-c-line last:border-b-0 first:pt-0 last:pb-0"
          >
            <div className="w-7 h-7 rounded-[9px] bg-accent-100 flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={13} color="var(--accent-700)" strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold text-c-text mb-0.5">{title}</p>
              <p className="text-[0.75rem] text-c-text-2 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
