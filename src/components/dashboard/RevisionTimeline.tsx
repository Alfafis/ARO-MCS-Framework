import { Clock, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'

interface Props {
  className?: string
}

export default function RevisionTimeline({ className = '' }: Props = {}) {
  const t = useT(resumoT)

  const REVISIONS = [
    { id: 'Rev0', title: t.rev0Title, date: t.rev0Date, done: true,  tag: null,         desc: t.rev0Desc },
    { id: 'Rev1', title: t.rev1Title, date: t.rev1Date, done: true,  tag: t.revCurrent, desc: t.rev1Desc },
    { id: 'Rev2', title: t.rev2Title, date: t.rev2Date, done: false, tag: null,         desc: t.rev2Desc },
  ]

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center gap-1.5 mb-5">
        <Clock size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.revTimeline}</span>
      </div>

      <div className="flex flex-col">
        {REVISIONS.map(({ id, title, date, done, tag, desc }, idx) => (
          <div key={id} className="flex gap-3" style={{ opacity: done ? 1 : 0.6 }}>
            <div className="flex flex-col items-center shrink-0">
              <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
                style={{ background: done ? 'var(--accent)' : '#d1cec9' }}>
                {done
                  ? <Check size={11} color="#fff" strokeWidth={2.5} aria-hidden="true" />
                  : <span className="font-mono text-[10px] font-bold text-white">{idx + 1}</span>
                }
              </div>
              {idx < REVISIONS.length - 1 && (
                <div className="w-px flex-1 min-h-4 bg-[rgba(20,21,26,.08)] my-1" />
              )}
            </div>

            <div className={`flex-1 min-w-0${idx < REVISIONS.length - 1 ? ' pb-5' : ''}`}>
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
    </div>
  )
}
