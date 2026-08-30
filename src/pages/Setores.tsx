import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Plus, MapPin, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/useLang'
import { setoresT } from '@/i18n/setores'
import { useProjeto } from '@/context/useProjeto'
import type { Setor } from '@/types/setores'

type SetoresLabels = typeof setoresT['pt-BR']

interface SetorRowProps {
  setor:      Setor
  usageCount: number
  onRename:   (novoNome: string) => Promise<void>
  onRemove:   () => Promise<void>
  labels:     SetoresLabels
}

// Mesmo padrão de inline-rename do TiposProjeto: edição inline, ícones de
// confirmar/cancelar só aparecem em modo edição, clique fora cancela.
function SetorRow({ setor, usageCount, onRename, onRemove, labels }: SetorRowProps) {
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
    if (trimmed && trimmed !== setor.nome) await onRename(trimmed)
  }

  function cancelRename() {
    setEditing(null)
  }

  async function handleDelete() {
    if (usageCount > 0) return
    if (!confirm(labels.deleteConfirm)) return
    await onRemove()
  }

  const deleteDisabled = usageCount > 0
  return (
    <div
      className="grid grid-cols-[56px_1fr_180px_auto] items-center gap-3 py-2 border-t border-[rgba(20,21,26,.04)]"
      ref={editRef}
    >
      <span className="font-mono text-[12px] text-c-text-2">{String(setor.id).padStart(2, '0')}</span>
      <div className="flex items-center gap-2 min-w-0">
        <Input
          variant="filled"
          value={editing ?? setor.nome}
          onChange={e => setEditing(e.target.value)}
          onFocus={() => setEditing(setor.nome)}
          onKeyDown={e => {
            if (e.key === 'Enter') confirmRename()
            if (e.key === 'Escape') cancelRename()
          }}
          aria-label={setor.nome}
        />
        {isEditing && (
          <>
            <Button variant="icon-btn" onClick={confirmRename} aria-label={labels.actionRename}>
              <Check size={14} aria-hidden="true" />
            </Button>
            <Button variant="icon-danger" onClick={cancelRename} aria-label={labels.newSetorCancel}>
              <X size={14} aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
      <span className="text-[12px] text-c-text-2 truncate">
        {usageCount > 0 ? labels.usageInUse(usageCount) : labels.usageNotUsed}
      </span>
      <Button
        variant="icon-danger"
        onClick={() => void handleDelete()}
        disabled={deleteDisabled}
        title={deleteDisabled ? labels.deleteBlockedInUse : labels.actionDelete}
        aria-label={labels.actionDelete}
      >
        <Trash2 size={14} aria-hidden="true" />
      </Button>
    </div>
  )
}

export default function Setores() {
  const t = useT(setoresT)
  const { setores, addSetor, renomearSetor, removerSetor, projetos, loading } = useProjeto()

  const [showNovo, setShowNovo] = useState(false)
  const [novoNome, setNovoNome] = useState<string>('')
  const [novoError, setNovoError] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // Uso por setor: quantos itens de custo (em projetos vivos) têm o id nas
  // aplicabilidades. Delete fica bloqueado enquanto `usageCount > 0` porque
  // `aplicabilidade_setores` guarda smallint[] sem FK física — dados órfãos
  // ficariam apontando pra id inexistente.
  const usageBySetorId = useMemo(() => {
    const usage = new Map<number, number>()
    for (const projeto of projetos) {
      for (const cat of projeto.categorias ?? []) {
        for (const item of cat.items ?? []) {
          if (!item.aplicabilidadeSetores) continue
          for (const sid of item.aplicabilidadeSetores) {
            usage.set(sid, (usage.get(sid) ?? 0) + 1)
          }
        }
      }
    }
    return usage
  }, [projetos])

  const proxId = useMemo(() => {
    if (setores.length === 0) return 1
    return Math.min(99, Math.max(...setores.map(s => s.id)) + 1)
  }, [setores])

  function openNovo() {
    setNovoNome('')
    setNovoError(null)
    setShowNovo(true)
  }

  async function handleAdicionar() {
    // ID é sempre o próximo livre calculado por `proxId`. Se todos os slots
    // 1..99 estiverem preenchidos (praticamente inatingível na prática),
    // devolve erro amigável em vez de tentar inserir e falhar no check da PK.
    if (proxId > 99 || setores.some(s => s.id === proxId)) {
      setNovoError(t.errIdInvalid)
      return
    }
    const nome = novoNome.trim()
    if (!nome) {
      setNovoError(t.errNomeEmpty)
      return
    }
    const idNum = proxId
    setCriando(true)
    setNovoError(null)
    try {
      await addSetor(idNum, nome)
      setShowNovo(false)
      setNovoNome('')
    } catch {
      setNovoError(t.savingError)
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="px-4 sm:px-8 pb-8 overflow-y-auto flex-1">
        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-4 max-w-[840px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
              <MapPin size={14} color="var(--accent)" aria-hidden="true" />
              <span>{t.headerTitle}</span>
            </div>
            {!showNovo && (
              <Button variant="ghost" onClick={openNovo}>
                <Plus size={14} aria-hidden="true" />
                {t.addSetor}
              </Button>
            )}
          </div>

          {showNovo && (
            <div className="rounded-[12px] border border-dashed border-[rgba(20,21,26,.16)] p-4 flex flex-col gap-3 animate-[catIn_320ms_cubic-bezier(.2,.8,.2,1)]">
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1 shrink-0">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-c-text-2">{t.newSetorIdLabel}</span>
                  <span
                    className="inline-flex items-center justify-center min-w-[56px] h-[38px] px-3 rounded-[11px] bg-[#f6f5f3] font-mono text-[15px] font-bold text-c-text"
                    title={t.newSetorIdHint}
                  >
                    {String(proxId).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-c-text-2">{t.newSetorNomeLabel}</label>
                  <Input
                    autoFocus
                    variant="default"
                    value={novoNome}
                    onChange={e => setNovoNome(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') void handleAdicionar() }}
                    placeholder="Ex.: Áreas de descarte de estéril"
                  />
                </div>
              </div>
              <p className="text-[11px] text-c-text-2">{t.newSetorIdHint}</p>
              {novoError && <p className="text-[12px] text-[color:var(--accent)]">{novoError}</p>}
              <div className="flex items-center gap-2">
                <Button variant="primary" disabled={criando} onClick={handleAdicionar}>
                  <Plus size={14} aria-hidden="true" />
                  {t.newSetorConfirm}
                </Button>
                <Button variant="ghost" onClick={() => { setShowNovo(false); setNovoError(null); setNovoNome('') }}>
                  {t.newSetorCancel}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-[56px_1fr_180px_auto] gap-3 pb-2 border-b border-[rgba(20,21,26,.08)]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2">{t.colId}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2">{t.colNome}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2">{t.colUsage}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pr-1">{t.colActions}</span>
          </div>

          {loading && (
            <div className="flex flex-col gap-2 py-1">
              {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          )}

          {!loading && setores.length === 0 && (
            <p className="text-[13px] text-c-text-2 py-4">{t.emptyState}</p>
          )}

          {!loading && setores.map(setor => (
            <SetorRow
              key={setor.id}
              setor={setor}
              usageCount={usageBySetorId.get(setor.id) ?? 0}
              onRename={async novoNome => {
                try {
                  await renomearSetor(setor.id, novoNome)
                } catch {
                  showToast(t.savingError)
                }
              }}
              onRemove={async () => {
                try {
                  await removerSetor(setor.id)
                } catch {
                  showToast(t.savingError)
                }
              }}
              labels={t}
            />
          ))}
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
        {toast}
      </div>
    </div>
  )
}
