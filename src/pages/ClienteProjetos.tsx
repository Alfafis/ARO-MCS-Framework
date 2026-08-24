import { useCallback, useEffect, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/useLang'
import { clientesT } from '@/i18n/clientes'
import CltRow, { ROW_COLS } from '@/components/clientes/CltRow'
import CodigoAcessoModal from '@/components/clientes/CodigoAcessoModal'
import { useProjeto } from '@/context/useProjeto'
import { useProjetoRowActions } from '@/hooks/useProjetoRowActions'
import { Skeleton } from '@/components/ui/skeleton'
import type { FilterTab } from '@/types/clientes'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

export default function ClienteProjetos() {
  const { clienteId = '' } = useParams<{ clienteId: string }>()
  const navigate = useNavigate()
  const t = useT(clientesT)
  const { clientes, projetos: allProjetos, tiposProjeto, loading } = useProjeto()

  const cliente = clientes.find(c => c.id === clienteId)
  const rows = allProjetos.filter(p => p.clienteId === clienteId)
  const { handleAction: sharedHandleAction, linkCopied, codeModalFor, setCodeModalFor } = useProjetoRowActions(rows)

  const FILTER_OPTS: { value: FilterTab; label: string }[] = [
    { value: 'all',        label: t.filterAll     },
    { value: 'andamento',  label: t.filterActive  },
    { value: 'aguardando', label: t.filterWaiting },
    { value: 'concluido',  label: t.filterDone    },
  ]

  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState<FilterTab>('all')
  const [openMenu,    setOpenMenu]    = useState<string | null>(null)

  useEffect(() => {
    function onMouseDown() { setOpenMenu(null) }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const ativos = rows.filter(r => r.status !== 'concluido').length

  const filtered = rows.filter(r =>
    r.projeto.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || r.status === filter)
  )

  const handleAction = useCallback((id: string, action: Parameters<typeof sharedHandleAction>[1]) => {
    setOpenMenu(null)
    sharedHandleAction(id, action)
  }, [sharedHandleAction])

  if (loading) {
    return (
      <div className="flex flex-col h-full gap-4 p-4 sm:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <p className="text-[0.875rem] text-c-text-2">Cliente não encontrado.</p>
        <Button variant="ghost" onClick={() => navigate('/clientes')}>{t.backToClients}</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-8 pt-4 sm:pt-5">
        <button
          onClick={() => navigate('/clientes')}
          className="text-[12.5px] font-medium text-c-text-2 hover:text-accent transition-colors bg-transparent border-0 p-0 cursor-pointer"
        >
          {t.backToClients}
        </button>
      </div>
      <PageHeader
        title={cliente.nome}
        badge={t.activesBadge(ativos)}
        subtitle={t.headerSubtitle}
        actions={<Button variant="primary" onClick={() => navigate(`/projetos/novo?clienteId=${clienteId}`)}>{t.newProject}</Button>}
      />

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">

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

        {/* Table */}
        <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)]">
          <div className="min-w-[660px]">
            {/* Header */}
            <div
              className="grid items-center gap-4 px-6 pt-[14px] pb-3 border-b border-[rgba(20,21,26,.08)]"
              style={{ gridTemplateColumns: ROW_COLS }}
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
                  badgeLabel={initials(row.projeto)}
                  subtitle={tiposProjeto.find(tp => tp.id === row.tipoProjetoId)?.nome ?? '—'}
                  isMenuOpen={openMenu === row.id}
                  onOpen={() => navigate(`/projetos/${row.id}/dashboard`)}
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

      {codeModalFor && (
        <CodigoAcessoModal
          reportId={codeModalFor.id}
          clientName={cliente.nome}
          projectName={codeModalFor.projeto}
          onClose={() => setCodeModalFor(null)}
        />
      )}

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
          opacity:    linkCopied ? 1 : 0,
          transform:  linkCopied ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          pointerEvents: 'none',
        }}
      >
        <Check size={13} />
        {t.linkCopied}
      </div>
    </div>
  )
}
