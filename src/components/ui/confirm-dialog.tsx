import { Dialog } from './dialog'
import { Button } from './button'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog title={title} onClose={onClose}>
      {(close) => (
        <div className="flex flex-col gap-5">
          <p className="text-[13px] text-c-text-2">{message}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => close(onClose)}>
              {cancelLabel}
            </Button>
            <Button variant="primary" onClick={() => close(onConfirm)}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
