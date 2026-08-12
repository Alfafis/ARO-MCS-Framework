import { Clock, Check } from 'lucide-react'

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
    <div className="cell" style={{ gridColumn: 'span 5' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <Clock size={14} color="var(--accent)" aria-hidden="true" />
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--c-text)' }}>Timeline de revisões</span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {REVISIONS.map(({ id, title, date, done, tag, desc }, idx) => (
          <div
            key={id}
            style={{ display: 'flex', gap: 12, opacity: done ? 1 : 0.6 }}
          >
            {/* Coluna do dot + conector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: done ? 'var(--accent)' : '#d1cec9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <Check size={11} color="#fff" strokeWidth={2.5} aria-hidden="true" />
                  : <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.625rem', fontWeight: 700, color: '#fff' }}>{idx + 1}</span>
                }
              </div>
              {idx < REVISIONS.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--c-line)', margin: '4px 0' }} />
              )}
            </div>

            {/* Conteúdo */}
            <div style={{ paddingBottom: idx < REVISIONS.length - 1 ? 20 : 0, flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text)' }}>{title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {tag && (
                    <span className="tag" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>{tag}</span>
                  )}
                  <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.6875rem', color: 'var(--c-text-2)' }}>{date}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--c-text-2)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
