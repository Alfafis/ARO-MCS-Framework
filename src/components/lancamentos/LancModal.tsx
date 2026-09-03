import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/i18n/useLang'
import { lancamentosT } from '@/i18n/lancamentos'

interface Form {
  categoria: string
  periodo: string
  valor: string
}

interface Props {
  onConfirm: (form: Form) => void
  onCancel: () => void
}

export default function LancModal({ onConfirm, onCancel }: Props) {
  const t = useT(lancamentosT)
  const [form, setForm] = useState<Form>({ categoria: '', periodo: '', valor: '' })
  const canSubmit = form.categoria.trim().length > 0
  const set = (field: keyof Form, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <Dialog title={t.modalTitle} onClose={onCancel}>
      {(close) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lnc-cat">{t.labelCategory}</Label>
            <Input
              id="lnc-cat"
              variant="filled"
              placeholder={t.placeholderCategory}
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lnc-per">{t.labelPeriod}</Label>
            <Input
              id="lnc-per"
              variant="filled"
              placeholder={t.placeholderPeriod}
              value={form.periodo}
              onChange={(e) => set('periodo', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lnc-val">{t.labelValue}</Label>
            <Input
              id="lnc-val"
              variant="filled"
              placeholder={t.placeholderValue}
              value={form.valor}
              onChange={(e) => set('valor', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => close(onCancel)}>
              {t.cancel}
            </Button>
            <Button variant="primary" disabled={!canSubmit} onClick={() => canSubmit && close(() => onConfirm(form))}>
              {t.add}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
