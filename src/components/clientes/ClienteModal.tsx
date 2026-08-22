import { useEffect, useRef, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/i18n/LangContext'
import { clientesT } from '@/i18n/clientes'
import { TIPOS_PROJETO } from '@/data/categoria-templates'
import CustomSelect from '@/components/categorias/CustomSelect'
import type { Cliente } from '@/types/clientes'

interface Form { projeto: string; tipoProjetoId: string; clienteId?: string }

interface Props {
  clientes?: Cliente[]  // se presente, mostra select de cliente (obrigatório)
  onConfirm: (form: Form) => void
  onCancel:  () => void
}

const TIPO_OPTIONS = TIPOS_PROJETO.map(tp => ({ value: tp.id, label: tp.nome }))

export default function ClienteModal({ clientes, onConfirm, onCancel }: Props) {
  const t = useT(clientesT)
  const [form, setForm] = useState<Form>({
    projeto: '', tipoProjetoId: TIPOS_PROJETO[0].id, clienteId: clientes?.[0]?.id,
  })
  const [tipoOpen, setTipoOpen] = useState(false)
  const [clienteOpen, setClienteOpen] = useState(false)
  const canSubmit = form.projeto.trim().length > 0 && (!clientes || !!form.clienteId)
  const set = (field: keyof Form, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const tipoRef = useRef<HTMLDivElement>(null)
  const clienteRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!tipoRef.current?.contains(e.target as Node)) setTipoOpen(false)
      if (!clienteRef.current?.contains(e.target as Node)) setClienteOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const clienteOptions = clientes?.map(c => ({ value: c.id, label: c.nome })) ?? []

  return (
    <Dialog title={t.modalTitle} onClose={onCancel}>
      {(close) => (
        <div className="flex flex-col gap-4">
          {clientes && (
            <div className="flex flex-col gap-1.5" ref={clienteRef}>
              <Label htmlFor="clt-cliente">{t.labelClient}</Label>
              <CustomSelect
                id="clt-cliente"
                options={clienteOptions}
                value={form.clienteId ?? ''}
                onChange={v => set('clienteId', v)}
                isOpen={clienteOpen}
                onToggle={() => setClienteOpen(o => !o)}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clt-projeto">{t.labelProject}</Label>
            <Input
              id="clt-projeto"
              variant="filled"
              placeholder={t.placeholderProject}
              value={form.projeto}
              onChange={e => set('projeto', e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5" ref={tipoRef}>
            <Label htmlFor="clt-tipo">{t.labelProjectType}</Label>
            <CustomSelect
              id="clt-tipo"
              options={TIPO_OPTIONS}
              value={form.tipoProjetoId}
              onChange={v => set('tipoProjetoId', v)}
              isOpen={tipoOpen}
              onToggle={() => setTipoOpen(o => !o)}
            />
            <p className="text-[11.5px] text-c-text-2">{t.helpProjectType}</p>
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
