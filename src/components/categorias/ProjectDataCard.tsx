import { useState, useRef, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/i18n/LangContext'
import { categoriasT } from '@/i18n/categorias'
import CustomSelect from './CustomSelect'

export default function ProjectDataCard() {
  const t = useT(categoriasT)

  const TIPO_OPTIONS = [
    { value: 'aro-fechamento', label: t.tipoAro        },
    { value: 'plano',          label: t.tipoPlano      },
    { value: 'progressao',     label: t.tipoProgressao },
    { value: 'cenarios',       label: t.tipoCenarios   },
  ]

  const MOEDA_OPTIONS = [
    { value: 'brl', label: 'BRL (R$)' },
    { value: 'usd', label: 'USD ($)'  },
    { value: 'eur', label: 'EUR (€)'  },
  ]

  const METODO_OPTIONS = [
    { value: 'a-definir',       label: t.metodoDef      },
    { value: 'ipca',            label: t.metodoIpca     },
    { value: 'juros-simples',   label: t.metodoSimples  },
    { value: 'juros-compostos', label: t.metodoCompostos },
    { value: 'inflacao',        label: t.metodoInflacao },
  ]

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
        <span>{t.projectData}</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cliente">{t.client}</Label>
          <Input id="cliente" variant="filled" defaultValue="NX Gold" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipo">{t.projectType}</Label>
          <CustomSelect id="tipo" options={TIPO_OPTIONS} value={tipo} onChange={setTipo}
            isOpen={openSelect === 'tipo'} onToggle={() => toggle('tipo')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="database">{t.baseDate}</Label>
          <Input id="database" variant="filled" defaultValue="2023" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="moeda">{t.currency}</Label>
          <CustomSelect id="moeda" options={MOEDA_OPTIONS} value={moeda} onChange={setMoeda}
            isOpen={openSelect === 'moeda'} onToggle={() => toggle('moeda')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="metodo">{t.updateMethod}</Label>
          <CustomSelect id="metodo" options={METODO_OPTIONS} value={metodo} onChange={setMetodo}
            isOpen={openSelect === 'metodo'} onToggle={() => toggle('metodo')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contingencia">{t.contingency}</Label>
          <Input id="contingencia" variant="filled" defaultValue="20%" />
        </div>
      </div>
    </div>
  )
}
