import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock, DollarSign, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { lancamentosT } from '@/i18n/lancamentos'
import LancRow from '@/components/lancamentos/LancRow'
import LancModal from '@/components/lancamentos/LancModal'
import type { FilterTab, IconKey, Lancamento, LancStatus } from '@/types/lancamentos'

const uid = () => Math.random().toString(36).slice(2)

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

const INITIAL: Lancamento[] = [
  { id: uid(), categoria: 'Barragem',       anexo: 'Anexo: NF-4471.pdf',    periodo: 'Jul/2026', valor: 612000, status: 'validado', iconKey: 'barragem',      highlight: false },
  { id: uid(), categoria: 'Monitoramento',  anexo: 'Anexo: fatura-jul.pdf', periodo: 'Jul/2026', valor: 218000, status: 'revisao',  iconKey: 'monitoramento', highlight: false },
  { id: uid(), categoria: 'Cavas',          anexo: 'Anexo: NF-4402.pdf',    periodo: 'Jun/2026', valor: 940000, status: 'validado', iconKey: 'cavas',         highlight: false },
  { id: uid(), categoria: 'Áreas de apoio', anexo: 'Lançado pelo cliente',  periodo: 'Jun/2026', valor: 87000,  status: 'pendente', iconKey: 'default',       highlight: false },
]

export default function Lancamentos() {
  const t = useT(lancamentosT)

  const FILTER_OPTS: { value: FilterTab; label: string }[] = [
    { value: 'all',      label: t.filterAll       },
    { value: 'validado', label: t.filterValidated  },
    { value: 'revisao',  label: t.filterReview     },
    { value: 'pendente', label: t.filterPending    },
  ]

  const [rows,      setRows]      = useState<Lancamento[]>(INITIAL)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState<FilterTab>('all')
  const [openMenu,  setOpenMenu]  = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  const handleAction = useCallback((id: string, action: 'validado' | 'revisao' | 'delete') => {
    setOpenMenu(null)
    if (action === 'delete') {
      setRows(prev => prev.filter(r => r.id !== id))
    } else {
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: action as LancStatus } : r))
    }
  }, [])

  const confirmAdd = useCallback((form: { categoria: string; periodo: string; valor: string }) => {
    const novo: Lancamento = {
      id:        uid(),
      categoria: form.categoria.trim(),
      anexo:     '',
      periodo:   form.periodo.trim() || 'N/D',
      valor:     parseValor(form.valor),
      status:    'pendente',
      iconKey:   iconFor(form.categoria.trim()),
      highlight: true,
    }
    setRows(prev => [novo, ...prev])
    setModalOpen(false)
    setTimeout(() => {
      setRows(prev => prev.map(r => r.id === novo.id ? { ...r, highlight: false } : r))
    }, 900)
  }, [])

  return (
    <div className="flex flex-col h-full">

      <header className="flex items-start justify-between px-8 py-[22px] gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h1>
          </div>
          <p className="text-[13px] text-c-text-2">{t.headerSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" onClick={() => setModalOpen(true)}>{t.newEntry}</Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-8 pb-8 overflow-y-auto flex-1">

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
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
        <div className="flex items-center gap-3">
          <label className="lnc-search-pill">
            <Search size={15} aria-hidden="true" />
            <input
              className="lnc-search"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label={t.searchPlaceholder}
            />
          </label>
          <div className="flex gap-1" role="group" aria-label={t.searchPlaceholder}>
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
        <div className="card" style={{ padding: 0, overflow: 'clip' }}>
          <div className="plist-head">
            {[t.colCategory, t.colPeriod, t.colValue, t.colStatus, ''].map((col, i) => (
              <span
                key={i}
                className={`plist-col-label${i === 2 ? ' right' : ''}`}
              >{col}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 px-6 text-center text-c-text-2 text-[0.875rem]">{t.empty}</div>
          ) : (
            filtered.map(row => (
              <LancRow
                key={row.id}
                row={row}
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

      {modalOpen && <LancModal onConfirm={confirmAdd} onCancel={() => setModalOpen(false)} />}
    </div>
  )
}
