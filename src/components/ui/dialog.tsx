import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

const CLOSE_DURATION = 170

interface DialogProps {
  title:    string
  onClose:  () => void
  children: (close: (callback?: () => void) => void) => React.ReactNode
  className?: string
}

function stopPropagation(e: React.MouseEvent) { e.stopPropagation() }

export function Dialog({ title, onClose, children, className }: DialogProps) {
  const [closing, setClosing] = useState(false)

  function close(callback?: () => void) {
    if (closing) return
    setClosing(true)
    setTimeout(callback ?? onClose, CLOSE_DURATION)
  }

  return (
    <div
      className={cn('modal-backdrop', closing && 'closing')}
      onClick={() => close()}
      role="presentation"
    >
      <div
        className={cn('modal-card', closing && 'closing', className)}
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-bold text-c-text">{title}</span>
          <Button variant="icon-btn" onClick={() => close()} aria-label="Fechar modal">
            <X size={16} aria-hidden="true" />
          </Button>
        </div>
        {children(close)}
      </div>
    </div>
  )
}
