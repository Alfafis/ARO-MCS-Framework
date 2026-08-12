import { Clock, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const REVISIONS = [
  {
    id: 'Rev0',
    title: 'Rev0 — Versão inicial',
    date: 'Jan/2026',
    done: true,
    tag: null,
    desc: 'Levantamento bottom-up dos 8 setores e primeira rodada de simulação Monte Carlo (10.000 iterações).',
  },
  {
    id: 'Rev1',
    title: 'Rev1 — Atual',
    date: 'Abr/2026',
    done: true,
    tag: 'Vigente',
    desc: 'Incorporou "Investigação e remediação" (+R$ 19,5 M) ao total geral e corrigiu a inversão Min/Max do item 8.1.1.',
  },
  {
    id: 'Rev2',
    title: 'Rev2 — Planejada',
    date: 'A definir',
    done: false,
    tag: null,
    desc: 'Unificar o método de atualização monetária e fixar a contingência como campo único por projeto.',
  },
]

export default function RevisionTimeline() {
  return (
    <div className="card col-span-5">
      <div className="flex items-center gap-1.5 mb-5">
        <Clock size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Timeline de revisões</span>
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
