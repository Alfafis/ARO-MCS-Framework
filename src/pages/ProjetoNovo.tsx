import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CustomSelect from '@/components/categorias/CustomSelect'
import { useProjeto } from '@/context/useProjeto'
import { useT } from '@/i18n/useLang'
import { clientesT } from '@/i18n/clientes'

// Step 1 do wizard de criação (ver specs/2026-08-23-wizard-criacao-projeto-design.md).
// Ao confirmar, cria o projeto de verdade (create_projeto — mesma RPC de sempre, sem rascunho
// fantasma) e navega pro step 2 usando o :projetoId real, não estado local — assim um F5 no meio
// do step 2 continua o fluxo em vez de reiniciar.
export default function ProjetoNovo() {
  const t = useT(clientesT)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clienteIdFixo = searchParams.get('clienteId')
  const { clientes, tiposProjeto, criarProjeto } = useProjeto()

  const clienteFixo = clienteIdFixo ? clientes.find(c => c.id === clienteIdFixo) : undefined
  const clienteLivre = !clienteIdFixo || !clienteFixo

  const [projeto, setProjeto] = useState('')
  const [tipoProjetoId, setTipoProjetoId] = useState('')
  const [clienteId, setClienteId] = useState(clienteIdFixo ?? '')
  const [tipoOpen, setTipoOpen] = useState(false)
  const [clienteOpen, setClienteOpen] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const tipoRef = useRef<HTMLDivElement>(null)
  const clienteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tipoProjetoId && tiposProjeto[0]) setTipoProjetoId(tiposProjeto[0].id)
  }, [tiposProjeto, tipoProjetoId])

  useEffect(() => {
    if (clienteLivre && !clienteId && clientes[0]) setClienteId(clientes[0].id)
  }, [clienteLivre, clienteId, clientes])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!tipoRef.current?.contains(e.target as Node)) setTipoOpen(false)
      if (!clienteRef.current?.contains(e.target as Node)) setClienteOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const canSubmit = projeto.trim().length > 0 && !!clienteId && !!tipoProjetoId
  const clienteOptions = clientes.map(c => ({ value: c.id, label: c.nome }))
  const tipoOptions = tiposProjeto.map(tp => ({ value: tp.id, label: tp.nome }))

  async function handleAvancar() {
    if (!canSubmit) return
    setSalvando(true)
    try {
      const id = await criarProjeto({ clienteId, projeto: projeto.trim(), tipoProjetoId })
      navigate(`/projetos/${id}/config-inicial`)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.wizardStep1Title} />
      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-8 max-w-[480px]">
        <div className="flex flex-col gap-1.5" ref={clienteRef}>
          <Label htmlFor="pn-cliente">{t.labelClient}</Label>
          {clienteLivre ? (
            <CustomSelect
              id="pn-cliente"
              options={clienteOptions}
              value={clienteId}
              onChange={setClienteId}
              isOpen={clienteOpen}
              onToggle={() => setClienteOpen(o => !o)}
            />
          ) : (
            <Input id="pn-cliente" variant="default" value={clienteFixo!.nome} disabled />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pn-projeto">{t.labelProject}</Label>
          <Input
            id="pn-projeto"
            variant="default"
            placeholder={t.placeholderProject}
            value={projeto}
            onChange={e => setProjeto(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5" ref={tipoRef}>
          <Label htmlFor="pn-tipo">{t.labelProjectType}</Label>
          <CustomSelect
            id="pn-tipo"
            options={tipoOptions}
            value={tipoProjetoId}
            onChange={setTipoProjetoId}
            isOpen={tipoOpen}
            onToggle={() => setTipoOpen(o => !o)}
          />
          <p className="text-[11.5px] text-c-text-2">{t.helpProjectType}</p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <button type="button" className="text-[12.5px] font-medium text-c-text-2 hover:underline" onClick={() => navigate(-1)}>
            {t.voltar}
          </button>
          <Button variant="primary" disabled={!canSubmit || salvando} onClick={handleAvancar}>
            {t.avancar}
          </Button>
        </div>
      </div>
    </div>
  )
}
