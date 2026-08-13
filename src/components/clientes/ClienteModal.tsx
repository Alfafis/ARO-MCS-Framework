import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/i18n/LangContext'
import { clientesT } from '@/i18n/clientes'

interface Form { cliente: string; projeto: string; esperado: string }

interface Props {
  onConfirm: (form: Form) => void
  onCancel:  () => void
}

export default function ClienteModal({ onConfirm, onCancel }: Props) {
  const t = useT(clientesT)
  const [form, setForm] = useState<Form>({ cliente: '', projeto: '', esperado: '' })
  const canSubmit = form.cliente.trim().length > 0 && form.projeto.trim().length > 0
  const set = (field: keyof Form, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <Dialog title={t.modalTitle} onClose={onCancel}>
      {(close) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clt-cliente">{t.labelClient}</Label>
            <Input
              id="clt-cliente"
              variant="filled"
              placeholder={t.placeholderClient}
              value={form.cliente}
              onChange={e => set('cliente', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clt-projeto">{t.labelProject}</Label>
            <Input
              id="clt-projeto"
              variant="filled"
              placeholder={t.placeholderProject}
              value={form.projeto}
              onChange={e => set('projeto', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clt-esperado">{t.labelExpected}</Label>
            <Input
              id="clt-esperado"
              variant="filled"
              placeholder={t.placeholderExpected}
              value={form.esperado}
              onChange={e => set('esperado', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => close(onCancel)}>{t.cancel}</Button>
            <Button
              variant="primary"
              disabled={!canSubmit}
              onClick={() => canSubmit && close(() => onConfirm(form))}
            >
              {t.create}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
