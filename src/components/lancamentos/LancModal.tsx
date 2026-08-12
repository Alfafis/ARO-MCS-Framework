import { useState } from 'react'
import { X } from 'lucide-react'

interface Form { categoria: string; periodo: string; valor: string }

interface Props {
  onConfirm: (form: Form) => void
  onCancel:  () => void
}

const CLOSE_DURATION = 170

function stopPropagation(e: React.MouseEvent) { e.stopPropagation() }

export default function LancModal({ onConfirm, onCancel }: Props) {
  const [form,    setForm]    = useState<Form>({ categoria: '', periodo: '', valor: '' })
  const [closing, setClosing] = useState(false)

  const set = (field: keyof Form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const canSubmit = form.categoria.trim().length > 0

  function triggerClose(cb: () => void) {
    if (closing) return
    setClosing(true)
    setTimeout(cb, CLOSE_DURATION)
  }

  return (
    <div
      className={`modal-backdrop${closing ? ' closing' : ''}`}
      onClick={() => triggerClose(onCancel)}
    >
      <div
        className={`modal-card${closing ? ' closing' : ''}`}
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
        aria-label="Novo lançamento"
      >
        <div className="modal-head">
          <span className="modal-title">Novo lançamento</span>
          <button className="icon-btn" onClick={() => triggerClose(onCancel)} aria-label="Fechar modal">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field-group">
            <label className="field-label" htmlFor="lnc-cat">Categoria</label>
            <input
              id="lnc-cat"
              className="field-input"
              placeholder="Ex: Barragem"
              value={form.categoria}
              onChange={e => set('categoria', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="lnc-per">Período</label>
            <input
              id="lnc-per"
              className="field-input"
              placeholder="Ex: Jul/2026"
              value={form.periodo}
              onChange={e => set('periodo', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="lnc-val">Valor real (R$)</label>
            <input
              id="lnc-val"
              className="field-input"
              placeholder="Ex: 350.000"
              value={form.valor}
              onChange={e => set('valor', e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button className="btn-ghost" onClick={() => triggerClose(onCancel)}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={() => canSubmit && triggerClose(() => onConfirm(form))}
            style={canSubmit ? undefined : { opacity: 0.5, cursor: 'not-allowed' }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
