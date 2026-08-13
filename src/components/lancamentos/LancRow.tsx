import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Activity, Clock, Layers, MoreVertical, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { lancamentosT } from '@/i18n/lancamentos'
import type { IconKey, LancStatus, Lancamento } from '@/types/lancamentos'

const ICON_MAP: Record<IconKey, React.ElementType> = {
  barragem:      Layers,
  monitoramento: Clock,
  cavas:         Activity,
  default:       Users,
}

interface Props {
  row:          Lancamento
  isMenuOpen:   boolean
  onMenuToggle: (e: React.MouseEvent) => void
  onAction:     (action: 'validado' | 'revisao' | 'delete') => void
}

export default function LancRow({ row, isMenuOpen, onMenuToggle, onAction }: Props) {
  const t = useT(lancamentosT)

  const STATUS_META: Record<LancStatus, { label: string; cls: string }> = {
    validado: { label: t.statusValidated, cls: 'pill-validado' },
    revisao:  { label: t.statusReview,    cls: 'pill-revisao'  },
    pendente: { label: t.statusPending,   cls: 'pill-pendente' },
  }

  const Icon   = ICON_MAP[row.iconKey]
  const status = STATUS_META[row.status]
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (isMenuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({
        top:   rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
  }, [isMenuOpen])

  return (
    <div className={`prow${row.highlight ? ' highlight' : ''}`}>
      {/* Categoria */}
      <div className="flex items-center gap-3">
        <div className="row-icon">
          <Icon size={15} aria-hidden="true" />
        </div>
        <div>
          <div className="row-cat-name">{row.categoria}</div>
          <div className="row-cat-sub">{row.anexo || t.noAttachment}</div>
        </div>
      </div>

      {/* Período */}
      <span className="text-[0.875rem] text-c-text-2">{row.periodo}</span>

      {/* Valor real */}
      <span className="mono-value">R$&nbsp;{row.valor.toLocaleString('pt-BR')}</span>

      {/* Status */}
      <span className={`tag ${status.cls}`}>{status.label}</span>

      {/* Menu */}
      <div className="row-menu-wrap">
        <button
          ref={btnRef}
          className="row-action-btn"
          aria-label={t.menuAriaLabel}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onMouseDown={onMenuToggle}
        >
          <MoreVertical size={14} aria-hidden="true" />
        </button>

        {createPortal(
          <div
            className="row-menu"
            role="menu"
            style={{
              position:      'fixed',
              top:           menuPos.top,
              right:         menuPos.right,
              width:         180,
              opacity:       isMenuOpen ? 1 : 0,
              transform:     isMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
              pointerEvents: isMenuOpen ? 'auto' : 'none',
              transition:    'opacity 140ms ease, transform 140ms ease',
            }}
          >
            <Button variant="menu" role="menuitem" onClick={() => onAction('validado')}>
              {t.actionValidate}
            </Button>
            <Button variant="menu" role="menuitem" onClick={() => onAction('revisao')}>
              {t.actionReview}
            </Button>
            <Button variant="menu-danger" role="menuitem" onClick={() => onAction('delete')}>
              {t.actionDelete}
            </Button>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
