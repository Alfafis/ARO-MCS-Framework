import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/i18n/useLang'
import { clientesT } from '@/i18n/clientes'

interface Props {
  onConfirm: (nome: string) => void
  onCancel: () => void
}

export default function NovoClienteModal({ onConfirm, onCancel }: Props) {
  const t = useT(clientesT)
  const [nome, setNome] = useState('')
  const canSubmit = nome.trim().length > 0

  return (
    <Dialog title={t.newClientModalTitle} onClose={onCancel}>
      {(close) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="novo-cliente-nome">{t.labelClientName}</Label>
            <Input
              id="novo-cliente-nome"
              variant="filled"
              placeholder={t.placeholderClientName}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => close(onCancel)}>
              {t.cancel}
            </Button>
            <Button variant="primary" disabled={!canSubmit} onClick={() => canSubmit && close(() => onConfirm(nome))}>
              {t.createClient}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
