import { useState, useRef, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import CustomSelect from './CustomSelect'

const TIPO_OPTIONS = [
  { value: 'aro-fechamento', label: 'ARO — Fechamento de mina' },
  { value: 'plano', label: 'Plano de fechamento' },
  { value: 'progressao', label: 'Relatório de progressão' },
  { value: 'cenarios', label: 'Estudo de cenários' },
]

const MOEDA_OPTIONS = [
  { value: 'brl', label: 'BRL (R$)' },
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
]

const METODO_OPTIONS = [
  { value: 'a-definir', label: 'A definir' },
  { value: 'ipca', label: 'Escalonamento (IPCA)' },
  { value: 'juros-simples', label: 'Juros simples 10,75%' },
  { value: 'juros-compostos', label: 'Juros compostos 10,75%' },
  { value: 'inflacao', label: 'Inflação constante 3,4%' },
]

export default function ProjectDataCard() {
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const [tipo, setTipo] = useState('aro-fechamento')
  const [moeda, setMoeda] = useState('brl')
  const [metodo, setMetodo] = useState('a-definir')
  const ref = useRef<HTMLDivElement>(null)

  /* fecha ao clicar fora */
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
    <div className="content-card" ref={ref}>
      <div className="card-section-title">
        <CalendarDays size={14} color="var(--accent)" aria-hidden="true" />
        <span>Dados do projeto</span>
      </div>

      <div className="project-grid">
        {/* Row 1 */}
        <div className="field-group">
          <label className="field-label" htmlFor="cliente">Cliente</label>
          <input id="cliente" className="field-input" defaultValue="NX Gold" />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="tipo">Tipo de projeto</label>
          <CustomSelect id="tipo" options={TIPO_OPTIONS} value={tipo} onChange={setTipo}
            isOpen={openSelect === 'tipo'} onToggle={() => toggle('tipo')} />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="database">Data-base</label>
          <input id="database" className="field-input" defaultValue="2023" />
        </div>

        {/* Row 2 */}
        <div className="field-group">
          <label className="field-label" htmlFor="moeda">Moeda</label>
          <CustomSelect id="moeda" options={MOEDA_OPTIONS} value={moeda} onChange={setMoeda}
            isOpen={openSelect === 'moeda'} onToggle={() => toggle('moeda')} />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="metodo">Método de atualização</label>
          <CustomSelect id="metodo" options={METODO_OPTIONS} value={metodo} onChange={setMetodo}
            isOpen={openSelect === 'metodo'} onToggle={() => toggle('metodo')} />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="contingencia">Contingência aplicada</label>
          <input id="contingencia" className="field-input" defaultValue="20%" />
        </div>
      </div>
    </div>
  )
}
