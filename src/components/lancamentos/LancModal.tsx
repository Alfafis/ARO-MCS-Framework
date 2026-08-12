import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Form { categoria: string; periodo: string; valor: string }

interface Props {
  onConfirm: (form: Form) => void
  onCancel:  () => void
}

export default function LancModal({ onConfirm, onCancel }: Props) {
  const [form, setForm] = useState<Form>({ categoria: '', periodo: '', valor: '' })
  const canSubmit = form.categoria.trim().length > 0
  const set = (field: keyof Form, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <Dialog title="Novo lançamento" onClose={onCancel}>
      {(close) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lnc-cat">Categoria</Label>
            <Input
              id="lnc-cat"
              variant="filled"
              placeholder="Ex: Barragem"
              value={form.categoria}
              onChange={e => set('categoria', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lnc-per">Período</Label>
            <Input
              id="lnc-per"
              variant="filled"
              placeholder="Ex: Jul/2026"
              value={form.periodo}
              onChange={e => set('periodo', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lnc-val">Valor real (R$)</Label>
            <Input
              id="lnc-val"
              variant="filled"
              placeholder="Ex: 350.000"
              value={form.valor}
              onChange={e => set('valor', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => close(onCancel)}>Cancelar</Button>
            <Button
              variant="primary"
              disabled={!canSubmit}
              onClick={() => canSubmit && close(() => onConfirm(form))}
            >
              Adicionar
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
