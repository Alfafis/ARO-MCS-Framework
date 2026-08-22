import { Fragment, useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useProjeto } from '@/context/ProjetoContext'
import { Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/LangContext'
import { revisoesT } from '@/i18n/revisoes'
import { supabase } from '@/integrations/supabase/client'
import type { Projeto } from '@/types/clientes'
import type { RevisaoRow } from '@/types'

type RevisoesT = typeof revisoesT['pt-BR']

function tituloRevisao(rev: RevisaoRow, t: RevisoesT): string {
  const numero = rev.codigo.replace(/\D/g, '')
  if (rev.status === 'rascunho') return `Rev${numero} ${t.plannedSuffix}`
  if (rev.status === 'vigente')  return `Rev${numero} ${t.currentSuffix}`
  return `Rev${numero}`
}

function subtituloRevisao(rev: RevisaoRow, t: RevisoesT): string {
  if (!rev.publicado_em) return t.toDefine
  const d = new Date(rev.publicado_em)
  return `${t.publishedIn} ${t.months[d.getMonth()]}/${d.getFullYear()}`
}

export default function Revisoes() {
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const { atualizarRevLocal } = useProjeto()
  const t = useT(revisoesT)

  const STATUS_META: Record<RevisaoRow['status'], { label: string; cls: string }> = {
    rascunho:    { label: t.statusDraft,    cls: 'bg-[#f0eeec] text-c-text-2' },
    vigente:     { label: t.statusCurrent,  cls: 'bg-success-bg text-success' },
    substituida: { label: t.statusReplaced, cls: 'bg-[#f0eeec] text-c-text-2' },
  }

  const [revisoes,    setRevisoes]    = useState<RevisaoRow[]>([])
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editText,    setEditText]    = useState('')
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('revisoes')
      .select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
    if (!error && data) setRevisoes(data)
  }, [projeto.id])

  useEffect(() => { load() }, [load])

  async function handleNovaRevisao() {
    const { data, error } = await supabase.rpc('criar_revisao_rascunho', { p_projeto_id: projeto.id })
    if (error || !data) return
    setRevisoes(prev => [data, ...prev])
    setEditingId(data.id)
    setEditText('')
    setHighlightId(data.id)
    setTimeout(() => setHighlightId(null), 900)
  }

  function toggleEditor(rev: RevisaoRow) {
    if (editingId === rev.id) {
      setEditingId(null)
    } else {
      setEditingId(rev.id)
      setEditText(rev.itens.join('\n'))
    }
  }

  async function handleSalvar(id: string) {
    const itens = editText.split('\n').map(s => s.trim()).filter(Boolean)
    const { data, error } = await supabase.rpc('salvar_rascunho_revisao', { p_id: id, p_itens: itens })
    if (error || !data) return
    setRevisoes(prev => prev.map(r => r.id === id ? data : r))
    setEditingId(null)
  }

  async function handlePublicar(id: string) {
    const itens = editText.split('\n').map(s => s.trim()).filter(Boolean)
    const { data, error } = await supabase.rpc('publicar_revisao', { p_id: id, p_itens: itens })
    if (error || !data) return
    setRevisoes(prev => prev.map(r => {
      if (r.id === id) return data
      if (r.status === 'vigente') return { ...r, status: 'substituida' as const }
      return r
    }))
    setEditingId(null)
    atualizarRevLocal(projeto.id, `Rev${data.codigo.replace(/\D/g, '')}`)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t.headerTitle}
        subtitle={t.headerSubtitle(projeto.projeto)}
        actions={<Button variant="primary" onClick={handleNovaRevisao}>{t.newRevision}</Button>}
      />

      <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex-1 overflow-y-auto">
        <div className="card">
          {revisoes.length === 0 && (
            <p className="text-[0.8125rem] text-c-text-2 text-center py-8">{t.emptyState}</p>
          )}

          {revisoes.map((rev, i) => {
            const meta       = STATUS_META[rev.status]
            const published  = rev.status !== 'rascunho'
            const isEditing  = editingId === rev.id
            const highlight  = highlightId === rev.id

            const borderCls = highlight
              ? 'border-accent'
              : rev.status === 'vigente'
                ? 'border-[rgba(236,48,19,.25)]'
                : 'border-[rgba(20,21,26,.08)]'

            const badgeCls = published
              ? 'bg-accent text-white'
              : 'bg-[#f0eeec] text-c-text-2'

            return (
              <Fragment key={rev.id}>
                {i > 0 && (
                  <div className="ml-[37px] w-px h-5 bg-[rgba(20,21,26,.08)]" />
                )}

                <div className={[
                  'border rounded-2xl p-5 transition-[border-color] duration-[900ms]',
                  borderCls,
                  highlight ? 'animate-[catIn_420ms_cubic-bezier(.2,.8,.2,1)]' : '',
                ].join(' ')}>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={`inline-flex items-center justify-center w-[34px] h-[34px] rounded-[10px] font-mono font-bold text-[13px] flex-none ${badgeCls}`}>
                        {rev.codigo}
                      </span>
                      <div>
                        <div className="text-[15px] font-bold text-c-text leading-tight">{tituloRevisao(rev, t)}</div>
                        <div className="text-[13px] text-c-text-2 mt-0.5">{subtituloRevisao(rev, t)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-none">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                      {rev.hash && (
                        <Button variant="ghost">{t.viewPdf}</Button>
                      )}
                    </div>
                  </div>

                  {rev.itens.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {rev.itens.map((text, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Check
                            size={14}
                            className={`flex-none mt-0.5 ${published ? 'text-success' : 'invisible'}`}
                          />
                          <span className="text-[13.5px] text-c-text-2 leading-snug">{text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {rev.hash && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f6f5f3] rounded-[8px] font-mono text-[11.5px] text-c-text-2">
                        <Lock size={11} aria-hidden="true" />
                        {rev.hash.slice(0, 8)}...{rev.hash.slice(-6)} · {t.hashLabel}
                      </span>
                    </div>
                  )}

                  {rev.status === 'rascunho' && (
                    <div className="mt-3">
                      <button
                        className="text-[13.5px] font-semibold text-c-text bg-transparent border-0 p-0 cursor-pointer transition-colors duration-[220ms] hover:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                        onClick={() => toggleEditor(rev)}
                      >
                        {isEditing ? t.closeEditor : t.continueEditing}
                      </button>

                      {isEditing && (
                        <div className="mt-3 flex flex-col gap-2">
                          <textarea
                            className="w-full bg-[#f6f5f3] border-0 outline-none rounded-[11px] px-[13px] py-[10px] text-[0.875rem] text-c-text leading-relaxed resize-y font-sans"
                            placeholder={t.editorPlaceholder}
                            value={editText}
                            rows={3}
                            onChange={e => setEditText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button variant="ghost"   onClick={() => handleSalvar(rev.id)}>{t.saveChanges}</Button>
                            <Button variant="primary" onClick={() => handlePublicar(rev.id)}>{t.publishRevision}</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
