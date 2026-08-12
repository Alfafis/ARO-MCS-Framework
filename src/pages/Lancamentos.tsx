import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock, DollarSign, Search } from 'lucide-react'
import LancRow from '@/components/lancamentos/LancRow'
import LancModal from '@/components/lancamentos/LancModal'
import type { FilterTab, IconKey, Lancamento, LancStatus } from '@/types/lancamentos'

const uid = () => Math.random().toString(36).slice(2)

const FILTER_OPTS: { value: FilterTab; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'validado', label: 'Validados' },
  { value: 'revisao',  label: 'Em revisão' },
  { value: 'pendente', label: 'Pendente evidência' },
]

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
  const [rows,       setRows]       = useState<Lancamento[]>(INITIAL)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState<FilterTab>('all')
  const [openMenu,   setOpenMenu]   = useState<string | null>(null)
  const [modalOpen,  setModalOpen]  = useState(false)

  useEffect(() => {
    function onMouseDown() { setOpenMenu(null) }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const total     = rows.reduce((s, r) => s + r.valor, 0)
  const validados = rows.filter(r => r.status === 'validado').length
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
      anexo:     'Sem anexo',
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">
            <h1>Lançamentos realizados</h1>
          </div>
          <p className="topbar-sub">NX Gold · Fechamento de Mina — base do comparativo expectativa vs. realidade</p>
        </div>
        <div className="topbar-actions">
          <button className="btn-primary" onClick={() => setModalOpen(true)}>+ Novo lançamento</button>
        </div>
      </header>

      <div className="content">

        {/* KPI cards */}
        <div className="kpi-grid">
          <div className="content-card">
            <div className="kpi-badge"><DollarSign size={14} aria-hidden="true" /></div>
            <div className="cell-title">Realizado em 2026</div>
            <div className="kpi-value">{formatM(total)}</div>
          </div>
          <div className="content-card">
            <div className="kpi-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle2 size={14} aria-hidden="true" />
            </div>
            <div className="cell-title">Validados</div>
            <div className="kpi-value">{validados}</div>
          </div>
          <div className="content-card">
            <div className="kpi-badge"><Clock size={14} aria-hidden="true" /></div>
            <div className="cell-title">Aguardando evidência</div>
            <div className="kpi-value">{aguardando}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="lnc-toolbar">
          <label className="lnc-search-pill">
            <Search size={15} aria-hidden="true" />
            <input
              className="lnc-search"
              placeholder="Buscar por categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar lançamentos"
            />
          </label>
          <div className="filter-chips" role="group" aria-label="Filtrar por status">
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
        <div className="content-card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'none' }}>
          <div className="plist-head">
            {(['Categoria', 'Período', 'Valor real', 'Status', ''] as const).map(col => (
              <span
                key={col}
                className={`plist-col-label${col === 'Valor real' ? ' right' : ''}`}
              >{col}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">Nenhum lançamento encontrado.</div>
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
