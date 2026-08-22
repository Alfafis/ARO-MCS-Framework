import { useEffect, useRef, useState } from 'react'
import { Check, Plus, Settings2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/LangContext'
import { configuracoesT } from '@/i18n/configuracoes'
import { useProjeto } from '@/context/ProjetoContext'
import type { TipoProjeto } from '@/data/categoria-templates'

interface TipoRowProps {
  tipo: TipoProjeto
  onRename: (novoNome: string) => Promise<void>
  onRemove: () => void
}

// Mesmo padrão de inline-rename do CategoryBlock (Categorias.tsx): campo
// sempre editável, ícones de confirmar/cancelar só aparecem com edição em
// andamento, clique fora cancela — nunca salva sozinho no blur (era o
// comportamento anterior, e escondia a ação real do usuário).
function TipoRow({ tipo, onRename, onRemove }: TipoRowProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const isEditing = editing !== null
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditing) return
    function onMouseDown(e: MouseEvent) {
      if (editRef.current?.contains(e.target as Node)) return
      setEditing(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isEditing])

  async function confirmRename() {
    const trimmed = (editing ?? '').trim()
    setEditing(null)
    if (trimmed && trimmed !== tipo.nome) await onRename(trimmed)
  }

  function cancelRename() {
    setEditing(null)
  }

  return (
    <div className="flex items-center gap-2 py-1.5" ref={editRef}>
      <Input
        variant="filled"
        value={editing ?? tipo.nome}
        onChange={e => setEditing(e.target.value)}
        onFocus={() => setEditing(tipo.nome)}
        onKeyDown={e => {
          if (e.key === 'Enter') confirmRename()
          if (e.key === 'Escape') cancelRename()
        }}
        aria-label={tipo.nome}
      />
      {isEditing && (
        <>
          <Button variant="icon-btn" onClick={confirmRename} aria-label="Confirmar novo nome">
            <Check size={14} aria-hidden="true" />
          </Button>
          <Button variant="icon-danger" onClick={cancelRename} aria-label="Cancelar alteração">
            <X size={14} aria-hidden="true" />
          </Button>
        </>
      )}
      <Button variant="icon-danger" onClick={onRemove} aria-label="Remover tipo">
        <Trash2 size={14} aria-hidden="true" />
      </Button>
    </div>
  )
}

export default function Configuracoes() {
  const t = useT(configuracoesT)
  const { tiposProjeto, criarTipoProjeto, renomearTipoProjeto, removerTipoProjeto } = useProjeto()

  const [novoNome, setNovoNome] = useState('')
  const [criando, setCriando]   = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleAdicionar() {
    const nome = novoNome.trim()
    if (!nome) {
      showToast(t.emptyNomeError)
      return
    }
    setCriando(true)
    try {
      await criarTipoProjeto(nome)
      setNovoNome('')
      showToast(t.createdToast)
    } catch {
      showToast(t.createErrorToast)
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="flex flex-col gap-6 px-4 sm:px-8 pb-8 overflow-y-auto flex-1 max-w-[560px]">
        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
            <Settings2 size={14} color="var(--accent)" aria-hidden="true" />
            <span>{t.tiposSectionTitle}</span>
          </div>
          <p className="text-[12px] text-c-text-2 -mt-2">{t.tiposSectionHint}</p>

          <div className="flex flex-col">
            {tiposProjeto.map(tipo => (
              <TipoRow
                key={tipo.id}
                tipo={tipo}
                onRename={async novoNome => {
                  try {
                    await renomearTipoProjeto(tipo.id, novoNome)
                    showToast(t.renameSavedToast)
                  } catch {
                    showToast(t.renameErrorToast)
                  }
                }}
                onRemove={() => removerTipoProjeto(tipo.id)
                  .catch(err => showToast(err?.message || t.deleteErrorToast))}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[rgba(20,21,26,.06)]">
            <Input
              variant="filled"
              placeholder={t.placeholderNovoTipo}
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleAdicionar() }}
            />
            <Button variant="ghost" disabled={criando} onClick={handleAdicionar}>
              <Plus size={14} aria-hidden="true" />
              {t.addTipo}
            </Button>
          </div>
        </div>
      </div>

      <div
        style={{
          position:   'fixed',
          bottom:     24,
          right:      24,
          display:    'flex',
          alignItems: 'center',
          gap:        6,
          background: '#14151a',
          color:      '#fff',
          fontSize:   13,
          fontWeight: 500,
          padding:    '8px 14px',
          borderRadius: 10,
          maxWidth:   360,
          opacity:    toast ? 1 : 0,
          transform:  toast ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          pointerEvents: 'none',
        }}
      >
        <Check size={13} className="shrink-0" />
        {toast}
      </div>
    </div>
  )
}
