import { useState, useRef, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CustomSelect from './CustomSelect'

const TIPO_OPTIONS = [
  { value: 'aro-fechamento', label: 'ARO — Fechamento de mina' },
  { value: 'plano',          label: 'Plano de fechamento' },
  { value: 'progressao',     label: 'Relatório de progressão' },
  { value: 'cenarios',       label: 'Estudo de cenários' },
]

const MOEDA_OPTIONS = [
  { value: 'brl', label: 'BRL (R$)' },
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
]

const METODO_OPTIONS = [
  { value: 'a-definir',       label: 'A definir' },
  { value: 'ipca',            label: 'Escalonamento (IPCA)' },
  { value: 'juros-simples',   label: 'Juros simples 10,75%' },
  { value: 'juros-compostos', label: 'Juros compostos 10,75%' },
  { value: 'inflacao',        label: 'Inflação constante 3,4%' },
]

export default function ProjectDataCard() {
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const [tipo,   setTipo]   = useState('aro-fechamento')
  const [moeda,  setMoeda]  = useState('brl')
  const [metodo, setMetodo] = useState('a-definir')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpenSelect(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function toggle(id: string) {
    setOpenSelect(prev => prev === id ? null : id)
  }

  return (
    <div className="card" ref={ref}>
      <div className="flex items-center gap-1.5 mb-5 text-sm font-semibold text-c-text">
        <CalendarDays size={14} color="var(--accent)" aria-hidden="true" />
        <span>Dados do projeto</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cliente">Cliente</Label>
          <Input id="cliente" variant="filled" defaultValue="NX Gold" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipo">Tipo de projeto</Label>
          <CustomSelect id="tipo" options={TIPO_OPTIONS} value={tipo} onChange={setTipo}
            isOpen={openSelect === 'tipo'} onToggle={() => toggle('tipo')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="database">Data-base</Label>
          <Input id="database" variant="filled" defaultValue="2023" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="moeda">Moeda</Label>
          <CustomSelect id="moeda" options={MOEDA_OPTIONS} value={moeda} onChange={setMoeda}
            isOpen={openSelect === 'moeda'} onToggle={() => toggle('moeda')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="metodo">Método de atualização</Label>
          <CustomSelect id="metodo" options={METODO_OPTIONS} value={metodo} onChange={setMetodo}
            isOpen={openSelect === 'metodo'} onToggle={() => toggle('metodo')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contingencia">Contingência aplicada</Label>
          <Input id="contingencia" variant="filled" defaultValue="20%" />
        </div>
      </div>
    </div>
  )
}
