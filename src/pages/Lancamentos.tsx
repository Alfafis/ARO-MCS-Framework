import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CheckCircle2, Clock, DollarSign, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { lancamentosT } from '@/i18n/lancamentos'
import LancRow from '@/components/lancamentos/LancRow'
import LancModal from '@/components/lancamentos/LancModal'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/integrations/supabase/client'
import type { Projeto } from '@/types/clientes'
import type { LancamentoRow } from '@/types'
import type { FilterTab, IconKey, LancStatus } from '@/types/lancamentos'

const ICON_KEY_MAP: Record<string, IconKey> = {
  barragem: 'barragem', monitoramento: 'monitoramento', cavas: 'cavas',
}

function iconFor(cat: string): IconKey {
  return ICON_KEY_MAP[cat.toLowerCase()] ?? 'default'
}

function parseValor(s: string): number {
  return parseInt(s.replace(/\./g, ''), 10) || 0
}

function formatM(v: number): string {
  return `R$ ${(v / 1e6).toFixed(2).replace('.', ',')} M`
}

export default function Lancamentos() {
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const t = useT(lancamentosT)

  const FILTER_OPTS: { value: FilterTab; label: string }[] = [
    { value: 'all',      label: t.filterAll       },
    { value: 'validado', label: t.filterValidated  },
    { value: 'revisao',  label: t.filterReview     },
    { value: 'pendente', label: t.filterPending    },
  ]

  const [rows,      setRows]      = useState<LancamentoRow[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState<FilterTab>('all')
  const [openMenu,  setOpenMenu]  = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
    if (!error && data) setRows(data)
    setLoading(false)
  }, [projeto.id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    function onMouseDown() { setOpenMenu(null) }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const total      = rows.reduce((s, r) => s + r.valor, 0)
  const validados  = rows.filter(r => r.status === 'validado').length
  const aguardando = rows.filter(r => r.status === 'pendente').length

  const filtered = rows.filter(r =>
    r.categoria.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || r.status === filter)
  )

  const handleAction = useCallback(async (id: string, action: 'validado' | 'revisao' | 'delete') => {
    setOpenMenu(null)
    if (action === 'delete') {
      const { error } = await supabase.rpc('remover_lancamento', { p_id: id })
      if (error) return
      setRows(prev => prev.filter(r => r.id !== id))
    } else {
      const { error } = await supabase.rpc('atualizar_status_lancamento', { p_id: id, p_status: action })
      if (error) return
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: action as LancStatus } : r))
    }
  }, [])

  const confirmAdd = useCallback(async (form: { categoria: string; periodo: string; valor: string }) => {
    const { data, error } = await supabase.rpc('criar_lancamento', {
      p_projeto_id: projeto.id,
      p_categoria: form.categoria,
      p_periodo: form.periodo.trim() || 'N/D',
      p_valor: parseValor(form.valor),
    })
    if (error || !data) return
    setRows(prev => [data, ...prev])
    setModalOpen(false)
    setHighlightId(data.id)
    setTimeout(() => setHighlightId(null), 900)
  }, [projeto.id])

  return (
    <div className="flex flex-col h-full">

      <header className="flex items-start justify-between px-4 sm:px-8 py-4 sm:py-[22px] gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h1>
          </div>
          <p className="text-[13px] text-c-text-2">{t.headerSubtitle(projeto.projeto)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" onClick={() => setModalOpen(true)}>{t.newEntry}</Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="w-[26px] h-[26px] rounded-[9px] bg-accent-100 text-accent-700 flex items-center justify-center mb-3">
              <DollarSign size={14} aria-hidden="true" />
            </div>
            <div className="text-sm font-semibold text-c-text-2 mb-1.5">{t.kpiRealized}</div>
            <div className="text-[22px] font-bold text-c-text tracking-tight font-mono">{formatM(total)}</div>
          </div>
          <div className="card">
            <div className="w-[26px] h-[26px] rounded-[9px] bg-success-bg text-success flex items-center justify-center mb-3">
              <CheckCircle2 size={14} aria-hidden="true" />
            </div>
            <div className="text-sm font-semibold text-c-text-2 mb-1.5">{t.kpiValidated}</div>
            <div className="text-[22px] font-bold text-c-text tracking-tight font-mono">{validados}</div>
          </div>
          <div className="card">
            <div className="w-[26px] h-[26px] rounded-[9px] bg-accent-100 text-accent-700 flex items-center justify-center mb-3">
              <Clock size={14} aria-hidden="true" />
            </div>
            <div className="text-sm font-semibold text-c-text-2 mb-1.5">{t.kpiPending}</div>
            <div className="text-[22px] font-bold text-c-text tracking-tight font-mono">{aguardando}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="lnc-search-pill flex-1 min-w-[180px]">
            <Search size={15} aria-hidden="true" />
            <input
              className="lnc-search"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label={t.searchPlaceholder}
            />
          </label>
          <div className="flex flex-wrap gap-1" role="group" aria-label={t.searchPlaceholder}>
            {FILTER_OPTS.map(opt => (
              <button
                key={opt.value}
                className={`filter-chip${filter === opt.value ? ' active' : ''}`}
                onClick={() => setFilter(opt.value)}
                aria-pressed={filter === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)]">
          <div className="min-w-[540px]">
            <div className="plist-head">
              {[t.colCategory, t.colPeriod, t.colValue, t.colStatus, ''].map((col, i) => (
                <span
                  key={i}
                  className={`plist-col-label${i === 2 ? ' right' : ''}`}
                >{col}</span>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col gap-3 p-4">
                {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 px-6 text-center text-c-text-2 text-[0.875rem]">{t.empty}</div>
            ) : (
              filtered.map(row => (
                <LancRow
                  key={row.id}
                  row={{
                    id: row.id,
                    categoria: row.categoria,
                    anexo: row.anexo ?? '',
                    periodo: row.periodo,
                    valor: row.valor,
                    status: row.status as LancStatus,
                    iconKey: iconFor(row.categoria),
                    highlight: highlightId === row.id,
                  }}
                  isMenuOpen={openMenu === row.id}
                  onMenuToggle={e => {
                    e.stopPropagation()
                    setOpenMenu(prev => prev === row.id ? null : row.id)
                  }}
                  onAction={action => handleAction(row.id, action)}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {modalOpen && <LancModal onConfirm={confirmAdd} onCancel={() => setModalOpen(false)} />}
    </div>
  )
}
