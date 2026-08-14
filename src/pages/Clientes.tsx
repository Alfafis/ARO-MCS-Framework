import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/LangContext'
import { clientesT } from '@/i18n/clientes'
import CltRow from '@/components/clientes/CltRow'
import ClienteModal from '@/components/clientes/ClienteModal'
import type { FilterTab, Projeto } from '@/types/clientes'

const uid = () => Math.random().toString(36).slice(2)

const COL = '1fr 160px 90px 110px 140px 32px'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

const INITIAL: Projeto[] = [
  { id: uid(), initials: 'NX', projeto: 'Fechamento de Mina — ARO',           cliente: 'NX Gold',         status: 'andamento',  rev: 'Rev0', esperado: 'R$ 38,5 M', atualizado: 'há 2 dias',    highlight: false },
  { id: uid(), initials: 'FL', projeto: 'Encerramento de Lavra — Cava Norte',  cliente: 'Ferro Linhares',  status: 'aguardando', rev: 'Rev1', esperado: 'R$ 22,1 M', atualizado: 'há 6 dias',    highlight: false },
  { id: uid(), initials: 'CB', projeto: 'Descomissionamento de Barragem',      cliente: 'Cobre Brasil',    status: 'andamento',  rev: 'Rev2', esperado: 'R$ 64,3 M', atualizado: 'há 1 semana',  highlight: false },
  { id: uid(), initials: 'MS', projeto: 'Reabilitação de Área Degradada',      cliente: 'Minérios do Sul', status: 'concluido',  rev: 'Rev3', esperado: 'R$ 11,9 M', atualizado: 'há 3 semanas', highlight: false },
  { id: uid(), initials: 'AZ', projeto: 'Fechamento de Pátio de Estéril',      cliente: 'Aço Zafira',      status: 'andamento',  rev: 'Rev0', esperado: 'R$ 17,2 M', atualizado: 'há 4 dias',    highlight: false },
]

export default function Clientes() {
  const navigate = useNavigate()
  const t = useT(clientesT)

  const FILTER_OPTS: { value: FilterTab; label: string }[] = [
    { value: 'all',        label: t.filterAll     },
    { value: 'andamento',  label: t.filterActive  },
    { value: 'aguardando', label: t.filterWaiting },
    { value: 'concluido',  label: t.filterDone    },
  ]

  const [rows,      setRows]      = useState<Projeto[]>(INITIAL)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState<FilterTab>('all')
  const [openMenu,  setOpenMenu]  = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    function onMouseDown() { setOpenMenu(null) }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const ativos = rows.filter(r => r.status !== 'concluido').length

  const filtered = rows.filter(r =>
    (r.projeto.toLowerCase().includes(search.toLowerCase()) ||
     r.cliente.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || r.status === filter)
  )

  const handleAction = useCallback((id: string, action: 'concluir' | 'arquivar' | 'categorias' | 'relatorio') => {
    setOpenMenu(null)
    if (action === 'relatorio') {
      navigate('/portal-cliente')
    } else if (action === 'categorias') {
      navigate('/categorias')
    } else if (action === 'arquivar') {
      setRows(prev => prev.filter(r => r.id !== id))
    } else {
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'concluido' } : r))
    }
  }, [navigate])

  const confirmAdd = useCallback((form: { cliente: string; projeto: string; esperado: string }) => {
    const novo: Projeto = {
      id:         uid(),
      initials:   initials(form.cliente.trim()),
      projeto:    form.projeto.trim(),
      cliente:    form.cliente.trim(),
      status:     'andamento',
      rev:        'Rev0',
      esperado:   form.esperado.trim() ? `R$ ${form.esperado.trim()} M` : '—',
      atualizado: t.justNow,
      highlight:  true,
    }
    setRows(prev => [novo, ...prev])
    setModalOpen(false)
    setTimeout(() => {
      setRows(prev => prev.map(r => r.id === novo.id ? { ...r, highlight: false } : r))
    }, 900)
  }, [t])

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t.headerTitle}
        badge={t.activesBadge(ativos)}
        subtitle={t.headerSubtitle}
        actions={<Button variant="primary" onClick={() => setModalOpen(true)}>{t.newProject}</Button>}
      />

      <div className="flex flex-col gap-4 px-8 pb-8 overflow-y-auto flex-1">

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

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'clip' }}>
          {/* Header */}
          <div
            className="grid items-center gap-4 px-6 pt-[14px] pb-3 border-b border-[rgba(20,21,26,.08)]"
            style={{ gridTemplateColumns: COL }}
          >
            {[t.colProject, t.colStatus, t.colRev, t.colExpected, t.colUpdated, ''].map((col, i) => (
              <span
                key={i}
                className={`text-[11px] font-semibold tracking-[0.06em] uppercase text-c-text-2${i === 3 ? ' text-right' : ''}`}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[0.875rem] text-c-text-2">
              {t.empty}
            </div>
          ) : (
            filtered.map(row => (
              <CltRow
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

      {modalOpen && <ClienteModal onConfirm={confirmAdd} onCancel={() => setModalOpen(false)} />}
    </div>
  )
}
