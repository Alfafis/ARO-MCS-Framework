import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { clientesT } from '@/i18n/clientes'
import type { Projeto, ProjStatus } from '@/types/clientes'

export const ROW_COLS              = '1fr 160px 90px 110px 140px 32px'
export const ROW_COLS_WITH_CLIENTE = '140px 1fr 160px 90px 110px 140px 32px'

interface Props {
  row:          Projeto
  badgeLabel:   string
  subtitle:     string
  clienteNome?: string
  isMenuOpen:   boolean
  onOpen:       () => void
  onMenuToggle: (e: React.MouseEvent) => void
  onAction:     (action: 'concluir' | 'arquivar' | 'categorias' | 'relatorio' | 'gerar-link' | 'gerar-codigo') => void
}

export default function CltRow({ row, badgeLabel, subtitle, clienteNome, isMenuOpen, onOpen, onMenuToggle, onAction }: Props) {
  const t = useT(clientesT)
  const COL = clienteNome ? ROW_COLS_WITH_CLIENTE : ROW_COLS

  const STATUS_META: Record<ProjStatus, { label: string; cls: string }> = {
    andamento:  { label: t.statusActive,  cls: 'bg-success-bg text-success'     },
    aguardando: { label: t.statusWaiting, cls: 'bg-accent-100 text-accent-700'  },
    concluido:  { label: t.statusDone,    cls: 'bg-[#f0eeec] text-c-text-2'     },
  }

  const status = STATUS_META[row.status]
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (isMenuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
  }, [isMenuOpen])

  return (
    <div
      className={`grid items-center gap-4 px-6 py-4 border-b border-[rgba(20,21,26,.08)] last:border-b-0 transition-[background] duration-[900ms] cursor-pointer hover:bg-[#faf9f8] ${row.highlight ? 'bg-accent-100' : ''}`}
      style={{ gridTemplateColumns: COL }}
      onClick={onOpen}
    >
      {clienteNome && (
        <span className="text-[0.875rem] text-c-text-2 truncate">{clienteNome}</span>
      )}

      {/* Cliente / Projeto */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#f0eeec] font-mono font-bold text-[13px] text-c-text flex-none">
          {badgeLabel}
        </span>
        <div className="min-w-0">
          <div className="text-[0.875rem] font-semibold text-c-text truncate">{row.projeto}</div>
          <div className="text-[11.5px] text-c-text-2 mt-0.5">{subtitle}</div>
        </div>
      </div>

      {/* Status */}
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold justify-self-start ${status.cls}`}>
        {status.label}
      </span>

      {/* Rev. atual */}
      <span className="text-[0.875rem] text-c-text-2">{row.rev}</span>

      {/* Esperado */}
      <span className="font-mono font-bold text-[0.875rem] text-c-text text-right">{row.esperado}</span>

      {/* Última atualização */}
      <span className="text-[0.875rem] text-c-text-2">{row.atualizado}</span>

      {/* Menu */}
      <div className="relative">
        <button
          ref={btnRef}
          className="row-action-btn"
          aria-label={t.menuAriaLabel}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onMouseDown={onMenuToggle}
          onClick={e => e.stopPropagation()}
        >
          <MoreVertical size={14} aria-hidden="true" />
        </button>

        {createPortal(
          <div
            className="row-menu"
            role="menu"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            style={{
              position:      'fixed',
              top:           menuPos.top,
              right:         menuPos.right,
              width:         200,
              opacity:       isMenuOpen ? 1 : 0,
              transform:     isMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
              pointerEvents: isMenuOpen ? 'auto' : 'none',
              transition:    'opacity 140ms ease, transform 140ms ease',
            }}
          >
            <Button variant="menu" role="menuitem" onClick={() => onAction('relatorio')}>
              {t.actionReport}
            </Button>
            <Button variant="menu" role="menuitem" onClick={() => onAction('gerar-link')}>
              {t.actionCopyLink}
            </Button>
            <Button variant="menu" role="menuitem" onClick={() => onAction('gerar-codigo')}>
              {t.actionGenerateCode}
            </Button>
            <Button variant="menu" role="menuitem" onClick={() => onAction('categorias')}>
              {t.actionCategories}
            </Button>
            <Button variant="menu" role="menuitem" onClick={() => onAction('concluir')}>
              {t.actionComplete}
            </Button>
            <Button variant="menu-danger" role="menuitem" onClick={() => onAction('arquivar')}>
              {t.actionArchive}
            </Button>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
