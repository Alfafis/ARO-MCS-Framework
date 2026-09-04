import { useEffect, useState, type FormEvent } from 'react'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'

interface Props {
  reportId: string // projeto_id
  clientName: string
  projectName: string
  onClose: () => void
}

export default function CodigoAcessoModal({ reportId, clientName, projectName, onClose }: Props) {
  const [code, setCode] = useState<string>('')
  const [manualInput, setManualInput] = useState('')
  const [manualError, setManualError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.rpc('obter_codigo_acesso', { p_projeto_id: reportId }).then(({ data }) => {
      if (data) setCode(data)
    })
  }, [reportId])

  async function handleGenerate() {
    const { data, error } = await supabase.rpc('gerar_codigo_acesso', { p_projeto_id: reportId })
    if (error || !data) return
    setCode(data)
    setManualInput('')
    setManualError('')
  }

  async function handleSaveManual(e: FormEvent) {
    e.preventDefault()
    const trimmed = manualInput.trim()
    if (trimmed.length < 4) {
      setManualError('O código precisa ter pelo menos 4 caracteres.')
      return
    }
    const { data, error } = await supabase.rpc('definir_codigo_acesso', { p_projeto_id: reportId, p_codigo: trimmed })
    if (error || !data) {
      setManualError('Não foi possível salvar o código.')
      return
    }
    setCode(data)
    setManualInput('')
    setManualError('')
  }

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog title="Código de acesso" onClose={onClose}>
      {(close) => (
        <div className="flex flex-col gap-5">
          {/* Projeto info */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.875rem] font-semibold text-c-text">{projectName}</span>
            <span className="text-[12px] text-c-text-2">{clientName}</span>
          </div>

          {/* Código atual */}
          {code ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2">Código ativo</span>
              <div className="flex items-center gap-2">
                <span className="flex-1 bg-c-surface-2 rounded-[11px] px-[13px] py-[10px] text-[0.875rem] font-mono font-bold tracking-wider text-c-text">
                  {code}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-[10px] rounded-[11px] border border-c-line bg-c-card text-[12px] font-semibold text-c-text hover:bg-c-surface-2-hover transition-colors duration-150 cursor-pointer whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-success" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-c-text-2">Nenhum código gerado ainda para este relatório.</p>
          )}

          <div className="h-px bg-c-line" />

          {/* Opção 1 — gerar aleatório */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold text-c-text">Gerar código aleatório</span>
            <Button variant="ghost" onClick={handleGenerate} className="inline-flex items-center gap-2 self-start">
              <RefreshCw size={13} strokeWidth={2} />
              {code ? 'Gerar novo código' : 'Gerar código'}
            </Button>
            {code && <p className="text-[11.5px] text-c-text-2">Gerar um novo código invalida o anterior.</p>}
          </div>

          <div className="h-px bg-c-line" />

          {/* Opção 2 — manual */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold text-c-text">Inserir código manualmente</span>
            <form onSubmit={handleSaveManual} className="flex items-start gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => {
                    setManualInput(e.target.value)
                    setManualError('')
                  }}
                  placeholder="Ex: NXGOLD-2024"
                  autoComplete="off"
                  autoCapitalize="characters"
                  className={[
                    'w-full bg-c-surface-2 rounded-[11px] px-[13px] py-[10px] text-[0.875rem] font-mono tracking-wider text-c-text outline-none border transition-colors duration-150',
                    manualError ? 'border-[#f44] focus:border-[#f44]' : 'border-transparent focus:border-accent',
                  ].join(' ')}
                />
                {manualError && <p className="text-[11.5px] text-[#e33]">{manualError}</p>}
              </div>
              <Button type="submit" variant="primary" disabled={!manualInput.trim()}>
                Salvar
              </Button>
            </form>
          </div>

          <div className="flex justify-end mt-1">
            <Button variant="ghost" onClick={() => close(onClose)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
