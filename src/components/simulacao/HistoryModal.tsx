import { X } from 'lucide-react'
import type { HistoryRun, UncertaintyLevel } from '@/types/simulacao'

const UNC_STYLE: Record<UncertaintyLevel, { background: string; color: string }> = {
  baixo:    { background: 'var(--success-bg)', color: 'var(--success)' },
  moderado: { background: '#fff8e1',            color: '#7a5f00' },
  alto:     { background: 'var(--accent-100)', color: 'var(--accent-700)' },
}

const UNC_LABEL: Record<UncertaintyLevel, string> = {
  baixo: 'Baixa', moderado: 'Moderada', alto: 'Alta',
}

interface Props {
  history: HistoryRun[]
  onSelect: (run: HistoryRun) => void
  onClose: () => void
}

function stopPropagation(e: React.MouseEvent) { e.stopPropagation() }

export default function HistoryModal({ history, onSelect, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
        aria-label="Rodadas anteriores"
      >
        <div className="modal-head">
          <span className="modal-title">Rodadas anteriores</span>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar modal">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {history.map(run => (
          <div
            key={run.id}
            className="history-row"
            role="button"
            tabIndex={0}
            onClick={() => onSelect(run)}
            onKeyDown={e => e.key === 'Enter' && onSelect(run)}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: 3 }}>
                {run.date}
              </div>
              <div style={{ fontSize: '0.78125rem', color: 'var(--c-text-2)' }}>
                {run.dist} · {run.iterations} iterações
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--c-text)' }}>
                {run.mean}
              </span>
              <span className="tag" style={UNC_STYLE[run.uncertainty]}>
                {UNC_LABEL[run.uncertainty]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
