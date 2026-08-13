import { Fragment, useEffect, useRef, useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/LangContext'
import { revisoesT } from '@/i18n/revisoes'

const uid = () => Math.random().toString(36).slice(2)

type RevStatus = 'rascunho' | 'vigente' | 'substituida'

interface Revisao {
  id:        string
  code:      string
  title:     string
  subtitle:  string
  status:    RevStatus
  items:     string[]
  hash?:     string
  highlight: boolean
  entering:  boolean
}

const INITIAL_IDS = { r2: 'init-r2', r1: 'init-r1', r0: 'init-r0' }

function buildInitial(t: typeof revisoesT['pt-BR']): Revisao[] {
  return [
    {
      id: INITIAL_IDS.r2, code: 'R2',
      title: `Rev2 ${t.plannedSuffix}`, subtitle: t.toDefine,
      status: 'rascunho', highlight: false, entering: false,
      items: t.r2Items,
    },
    {
      id: INITIAL_IDS.r1, code: 'R1',
      title: `Rev1 ${t.currentSuffix}`, subtitle: `${t.publishedIn} ${t.months[3]}/2026`,
      status: 'vigente', highlight: false, entering: false,
      items: t.r1Items,
      hash: '0x8f2a...c194',
    },
    {
      id: INITIAL_IDS.r0, code: 'R0',
      title: `Rev0 ${t.initialSuffix}`, subtitle: `${t.publishedIn} ${t.months[0]}/2026`,
      status: 'substituida', highlight: false, entering: false,
      items: t.r0Items,
      hash: '0x1c7d...a02f',
    },
  ]
}

function fakeHash() {
  const h = () => Math.random().toString(16).slice(2, 6)
  return `0x${h()}...${h()}`
}

function nextCode(list: Revisao[]) {
  const nums = list.map(r => parseInt(r.code.slice(1), 10)).filter(n => !isNaN(n))
  return `R${Math.max(...nums) + 1}`
}

export default function Revisoes() {
  const t = useT(revisoesT)

  const STATUS_META: Record<RevStatus, { label: string; cls: string }> = {
    rascunho:    { label: t.statusDraft,    cls: 'bg-[#f0eeec] text-c-text-2' },
    vigente:     { label: t.statusCurrent,  cls: 'bg-success-bg text-success'  },
    substituida: { label: t.statusReplaced, cls: 'bg-[#f0eeec] text-c-text-2' },
  }

  const initialRef = useRef(t)
  const [revisoes,  setRevisoes]  = useState<Revisao[]>(() => buildInitial(t))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText,  setEditText]  = useState('')

  useEffect(() => {
    if (initialRef.current === t) return
    initialRef.current = t
    const initialIds = new Set(Object.values(INITIAL_IDS))
    const updated = buildInitial(t)
    setRevisoes(prev => prev.map(r => {
      if (!initialIds.has(r.id)) return r
      return updated.find(u => u.id === r.id) ?? r
    }))
  }, [t])

  function handleNovaRevisao() {
    const code = nextCode(revisoes)
    const num  = code.slice(1)
    const nova: Revisao = {
      id: uid(), code, title: `Rev${num} ${t.plannedSuffix}`, subtitle: t.toDefine,
      status: 'rascunho', items: [], highlight: true, entering: true,
    }
    setRevisoes(prev => [nova, ...prev])
    setEditingId(nova.id)
    setEditText('')
    setTimeout(() => {
      setRevisoes(prev => prev.map(r =>
        r.id === nova.id ? { ...r, highlight: false, entering: false } : r
      ))
    }, 900)
  }

  function toggleEditor(rev: Revisao) {
    if (editingId === rev.id) {
      setEditingId(null)
    } else {
      setEditingId(rev.id)
      setEditText(rev.items.join('\n'))
    }
  }

  function handleSalvar(id: string) {
    const items = editText.split('\n').map(s => s.trim()).filter(Boolean)
    setRevisoes(prev => prev.map(r => r.id === id ? { ...r, items } : r))
    setEditingId(null)
  }

  function handlePublicar(id: string) {
    const now      = new Date()
    const subtitle = `${t.publishedIn} ${t.months[now.getMonth()]}/${now.getFullYear()}`
    const items    = editText.split('\n').map(s => s.trim()).filter(Boolean)
    const hash     = fakeHash()
    setRevisoes(prev => prev.map(r => {
      if (r.id === id)            return { ...r, status: 'vigente', subtitle, items, hash }
      if (r.status === 'vigente') return { ...r, status: 'substituida' }
      return r
    }))
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        actions={<Button variant="primary" onClick={handleNovaRevisao}>{t.newRevision}</Button>}
      />

      <div className="px-8 pb-8 flex-1 overflow-y-auto">
        <div className="card">
          {revisoes.map((rev, i) => {
            const meta      = STATUS_META[rev.status]
            const published = rev.status !== 'rascunho'
            const isEditing = editingId === rev.id

            const borderCls = rev.highlight
              ? 'border-accent'
              : rev.status === 'vigente'
                ? 'border-[rgba(236,48,19,.25)]'
                : 'border-[rgba(20,21,26,.08)]'

            const badgeCls = published
              ? 'bg-accent text-white'
              : 'bg-[#f0eeec] text-c-text-2'

            return (
              <Fragment key={rev.id}>
                {/* Connector line between cards */}
                {i > 0 && (
                  <div className="ml-[37px] w-px h-5 bg-[rgba(20,21,26,.08)]" />
                )}

                {/* Revision card */}
                <div className={[
                  'border rounded-2xl p-5 transition-[border-color] duration-[900ms]',
                  borderCls,
                  rev.entering ? 'animate-[catIn_420ms_cubic-bezier(.2,.8,.2,1)]' : '',
                ].join(' ')}>

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={`inline-flex items-center justify-center w-[34px] h-[34px] rounded-[10px] font-mono font-bold text-[13px] flex-none ${badgeCls}`}>
                        {rev.code}
                      </span>
                      <div>
                        <div className="text-[15px] font-bold text-c-text leading-tight">{rev.title}</div>
                        <div className="text-[13px] text-c-text-2 mt-0.5">{rev.subtitle}</div>
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

                  {/* Items */}
                  {rev.items.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {rev.items.map((text, j) => (
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

                  {/* Hash badge */}
                  {rev.hash && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f6f5f3] rounded-[8px] font-mono text-[11.5px] text-c-text-2">
                        <Lock size={11} aria-hidden="true" />
                        {rev.hash} · {t.anchoredVia}
                      </span>
                    </div>
                  )}

                  {/* Draft editor */}
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
