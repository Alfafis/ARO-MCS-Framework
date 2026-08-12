import { Activity, Clock, Layers, MoreVertical, Users } from 'lucide-react'
import type { IconKey, LancStatus, Lancamento } from '@/types/lancamentos'

const ICON_MAP: Record<IconKey, React.ElementType> = {
  barragem:      Layers,
  monitoramento: Clock,
  cavas:         Activity,
  default:       Users,
}

const STATUS_META: Record<LancStatus, { label: string; cls: string }> = {
  validado: { label: 'Validado',           cls: 'pill-validado' },
  revisao:  { label: 'Em revisão',         cls: 'pill-revisao'  },
  pendente: { label: 'Pendente evidência', cls: 'pill-pendente' },
}

interface Props {
  row:          Lancamento
  isMenuOpen:   boolean
  onMenuToggle: (e: React.MouseEvent) => void
  onAction:     (action: 'validado' | 'revisao' | 'delete') => void
}

export default function LancRow({ row, isMenuOpen, onMenuToggle, onAction }: Props) {
  const Icon   = ICON_MAP[row.iconKey]
  const status = STATUS_META[row.status]

  return (
    <div className={`prow${row.highlight ? ' highlight' : ''}`}>
      {/* Categoria */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="row-icon">
          <Icon size={15} aria-hidden="true" />
        </div>
        <div>
          <div className="row-cat-name">{row.categoria}</div>
          <div className="row-cat-sub">{row.anexo || 'Sem anexo'}</div>
        </div>
      </div>

      {/* Período */}
      <span style={{ fontSize: '0.875rem', color: 'var(--c-text-2)' }}>{row.periodo}</span>

      {/* Valor real */}
      <span className="mono-value">R$&nbsp;{row.valor.toLocaleString('pt-BR')}</span>

      {/* Status */}
      <span className={`tag ${status.cls}`}>{status.label}</span>

      {/* Menu */}
      <div className="row-menu-wrap">
        <button
          className="row-action-btn"
          aria-label="Ações do lançamento"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onMouseDown={onMenuToggle}
        >
          <MoreVertical size={14} aria-hidden="true" />
        </button>

        <div
          className="row-menu"
          role="menu"
          style={{
            opacity:       isMenuOpen ? 1 : 0,
            transform:     isMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
            pointerEvents: isMenuOpen ? 'auto' : 'none',
            transition:    'opacity 140ms ease, transform 140ms ease',
          }}
        >
          <button className="row-menu-item" role="menuitem" onClick={() => onAction('validado')}>
            Marcar como validado
          </button>
          <button className="row-menu-item" role="menuitem" onClick={() => onAction('revisao')}>
            Marcar em revisão
          </button>
          <button className="row-menu-item danger" role="menuitem" onClick={() => onAction('delete')}>
            Excluir lançamento
          </button>
        </div>
      </div>
    </div>
  )
}
