import { Clock, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'

export interface RevisionTimelineItem {
  id: string
  title: string
  date: string
  done: boolean
  tag: string | null
  desc: string
}

interface Props {
  revisions: RevisionTimelineItem[]
  emptyLabel?: string
  className?: string
}

export default function RevisionTimeline({ revisions, emptyLabel, className = '' }: Props) {
  const t = useT(resumoT)

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-5">
        <Clock size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.revTimeline}</span>
      </div>

      {revisions.length === 0 ? (
        <p className="text-[0.8125rem] text-c-text-2">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col">
          {revisions.map(({ id, title, date, done, tag, desc }, idx) => (
            <div key={id} className="flex gap-3" style={{ opacity: done ? 1 : 0.6 }}>
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: done ? 'var(--accent)' : '#d1cec9' }}
                >
                  {done ? (
                    <Check size={11} color="#fff" strokeWidth={2.5} aria-hidden="true" />
                  ) : (
                    <span className="font-mono text-[10px] font-bold text-white">{idx + 1}</span>
                  )}
                </div>
                {idx < revisions.length - 1 && <div className="w-px flex-1 min-h-4 bg-[rgba(20,21,26,.08)] my-1" />}
              </div>

              <div className={`flex-1 min-w-0${idx < revisions.length - 1 ? ' pb-5' : ''}`}>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="text-[0.8125rem] font-semibold text-c-text">{title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {tag && <Badge variant="success">{tag}</Badge>}
                    <span className="font-mono text-[11px] text-c-text-2">{date}</span>
                  </div>
                </div>
                <p className="text-[0.75rem] text-c-text-2 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
