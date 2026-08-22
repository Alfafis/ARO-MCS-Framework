import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import CustomSelect from '@/components/categorias/CustomSelect'
import { useT } from '@/i18n/LangContext'
import { clientesT } from '@/i18n/clientes'
import CltRow, { ROW_COLS_WITH_CLIENTE } from '@/components/clientes/CltRow'
import ClienteModal from '@/components/clientes/ClienteModal'
import CodigoAcessoModal from '@/components/clientes/CodigoAcessoModal'
import { useProjeto } from '@/context/ProjetoContext'
import { useProjetoRowActions } from '@/hooks/useProjetoRowActions'
import type { FilterTab } from '@/types/clientes'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

export default function Projetos() {
  const navigate = useNavigate()
  const t = useT(clientesT)
  const { clientes, projetos, criarProjeto, tiposProjeto } = useProjeto()
  const { handleAction: sharedHandleAction, linkCopied, codeModalFor, setCodeModalFor } = useProjetoRowActions(projetos)

  const FILTER_OPTS: { value: FilterTab; label: string }[] = [
    { value: 'all',        label: t.filterAll     },
    { value: 'andamento',  label: t.filterActive  },
    { value: 'aguardando', label: t.filterWaiting },
    { value: 'concluido',  label: t.filterDone    },
  ]
  const CLIENTE_OPTS = [
    { value: 'all', label: t.filterByClientAll },
    ...clientes.map(c => ({ value: c.id, label: c.nome })),
  ]
  const TIPO_OPTS = [
    { value: 'all', label: t.filterByTypeAll },
    ...tiposProjeto.map(tp => ({ value: tp.id, label: tp.nome })),
  ]

  const [search,      setSearch]      = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterTab>('all')
  const [clienteFilter, setClienteFilter] = useState('all')
  const [tipoFilter,   setTipoFilter]   = useState('all')
  const [openFilter,   setOpenFilter]   = useState<'cliente' | 'tipo' | null>(null)
  const [openMenu,     setOpenMenu]     = useState<string | null>(null)
  const [modalOpen,    setModalOpen]    = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      setOpenMenu(null)
      if (!filtersRef.current?.contains(e.target as Node)) setOpenFilter(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const clienteNomePorId = useMemo(
    () => new Map(clientes.map(c => [c.id, c.nome])),
    [clientes]
  )

  const filtered = projetos.filter(p => {
    const clienteNome = clienteNomePorId.get(p.clienteId) ?? ''
    const matchesSearch =
      p.projeto.toLowerCase().includes(search.toLowerCase()) ||
      clienteNome.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
      && (statusFilter === 'all' || p.status === statusFilter)
      && (clienteFilter === 'all' || p.clienteId === clienteFilter)
      && (tipoFilter === 'all' || p.tipoProjetoId === tipoFilter)
  })

  const handleAction = (id: string, action: Parameters<typeof sharedHandleAction>[1]) => {
    setOpenMenu(null)
    sharedHandleAction(id, action)
  }

  const confirmAdd = (form: { projeto: string; tipoProjetoId: string; clienteId?: string }) => {
    if (!form.clienteId) return
    criarProjeto({ projeto: form.projeto, tipoProjetoId: form.tipoProjetoId, clienteId: form.clienteId })
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t.projetosHeaderTitle}
        badge={t.projectsCount(projetos.length)}
        subtitle={t.projetosHeaderSubtitle}
        actions={<Button variant="primary" onClick={() => setModalOpen(true)}>{t.newProject}</Button>}
      />

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="lnc-search-pill flex-1 min-w-[180px]">
            <Search size={15} aria-hidden="true" />
            <input
              className="lnc-search"
              placeholder={t.searchAllPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label={t.searchAllPlaceholder}
            />
          </label>
          <div className="flex items-center gap-2" ref={filtersRef}>
            <div className="w-[180px]">
              <CustomSelect
                id="projetos-filtro-cliente"
                options={CLIENTE_OPTS}
                value={clienteFilter}
                onChange={setClienteFilter}
                isOpen={openFilter === 'cliente'}
                onToggle={() => setOpenFilter(v => v === 'cliente' ? null : 'cliente')}
              />
            </div>
            <div className="w-[180px]">
              <CustomSelect
                id="projetos-filtro-tipo"
                options={TIPO_OPTS}
                value={tipoFilter}
                onChange={setTipoFilter}
                isOpen={openFilter === 'tipo'}
                onToggle={() => setOpenFilter(v => v === 'tipo' ? null : 'tipo')}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label={t.searchAllPlaceholder}>
            {FILTER_OPTS.map(opt => (
              <button
                key={opt.value}
                className={`filter-chip${statusFilter === opt.value ? ' active' : ''}`}
                onClick={() => setStatusFilter(opt.value)}
                aria-pressed={statusFilter === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)]">
          <div className="min-w-[780px]">
            {/* Header */}
            <div
              className="grid items-center gap-4 px-6 pt-[14px] pb-3 border-b border-[rgba(20,21,26,.08)]"
              style={{ gridTemplateColumns: ROW_COLS_WITH_CLIENTE }}
            >
              {[t.colClient, t.colProject, t.colStatus, t.colRev, t.colExpected, t.colUpdated, ''].map((col, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-semibold tracking-[0.06em] uppercase text-c-text-2${i === 4 ? ' text-right' : ''}`}
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
                  clienteNome={clienteNomePorId.get(row.clienteId) ?? '—'}
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

      {modalOpen && (
        <ClienteModal clientes={clientes} onConfirm={confirmAdd} onCancel={() => setModalOpen(false)} />
      )}

      {codeModalFor && (
        <CodigoAcessoModal
          reportId={codeModalFor.id}
          clientName={clienteNomePorId.get(codeModalFor.clienteId) ?? '—'}
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
