import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { clientesT } from '@/i18n/clientes'
import type { Cliente } from '@/types/clientes'

interface Props {
  cliente: Cliente
  projectsLabel: string
  isMenuOpen: boolean
  onOpen: () => void
  onMenuToggle: (e: React.MouseEvent) => void
  onDelete: () => void
}

export default function ClienteRow({ cliente, projectsLabel, isMenuOpen, onOpen, onMenuToggle, onDelete }: Props) {
  const t = useT(clientesT)
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
      className="w-full grid grid-cols-[36px_1fr_auto_16px_32px] items-center gap-3 px-6 py-4 border-b border-c-line last:border-b-0 cursor-pointer hover:bg-c-surface-2 transition-colors duration-150"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-c-surface-2-hover font-mono font-bold text-[13px] text-c-text flex-none">
        {cliente.initials}
      </span>
      <span className="text-[0.875rem] font-semibold text-c-text truncate">{cliente.nome}</span>
      <span className="text-[0.8125rem] text-c-text-2 whitespace-nowrap">{projectsLabel}</span>
      <ChevronRight size={16} className="text-c-text-2" aria-hidden="true" />

      <div className="relative">
        <button
          ref={btnRef}
          className="row-action-btn"
          aria-label={t.clientMenuAriaLabel}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onMouseDown={onMenuToggle}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={14} aria-hidden="true" />
        </button>

        {createPortal(
          <div
            className="row-menu"
            role="menu"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              width: 180,
              opacity: isMenuOpen ? 1 : 0,
              transform: isMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
              pointerEvents: isMenuOpen ? 'auto' : 'none',
              transition: 'opacity 140ms ease, transform 140ms ease',
            }}
          >
            <Button variant="menu-danger" role="menuitem" onClick={onDelete}>
              {t.actionDeleteClient}
            </Button>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
