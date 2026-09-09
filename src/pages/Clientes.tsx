import { useCallback, useEffect, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/useLang'
import { clientesT } from '@/i18n/clientes'
import ClienteRow from '@/components/clientes/ClienteRow'
import NovoClienteModal from '@/components/clientes/NovoClienteModal'
import { useProjeto } from '@/context/useProjeto'
import { Skeleton } from '@/components/ui/skeleton'

export default function Clientes() {
  const navigate = useNavigate()
  const t = useT(clientesT)
  const { clientes, projetos, criarCliente, removerCliente, loading } = useProjeto()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    function onMouseDown() {
      setOpenMenu(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const filtered = clientes.filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()))
  const clienteToDelete = confirmingDelete ? clientes.find((c) => c.id === confirmingDelete) : null

  const confirmAdd = useCallback(
    async (nome: string) => {
      const id = await criarCliente(nome)
      setModalOpen(false)
      navigate(`/clientes/${id}`)
    },
    [criarCliente, navigate]
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmingDelete) return
    const id = confirmingDelete
    setConfirmingDelete(null)
    try {
      await removerCliente(id)
      showToast(t.deleteClientSuccess)
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P0001'
          ? (err as { message?: string }).message ?? t.deleteClientErrorGeneric
          : t.deleteClientErrorGeneric
      showToast(msg)
    }
  }, [confirmingDelete, removerCliente, t])

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t.clientsHeaderTitle}
        badge={t.clientsBadge(clientes.length)}
        subtitle={t.clientsHeaderSubtitle}
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            {t.newClient}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">
        <div className="flex">
          <label className="lnc-search-pill max-w-[320px]">
            <Search size={15} aria-hidden="true" />
            <input
              className="lnc-search"
              placeholder={t.searchClientPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t.searchClientPlaceholder}
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line">
          <div className="min-w-[420px]">
            {loading ? (
              <div className="flex flex-col gap-px p-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-[0.875rem] text-c-text-2">{t.emptyClients}</div>
            ) : (
              filtered.map((cliente) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  projectsLabel={t.projectsCount(projetos.filter((p) => p.clienteId === cliente.id).length)}
                  isMenuOpen={openMenu === cliente.id}
                  onOpen={() => navigate(`/clientes/${cliente.id}`)}
                  onMenuToggle={(e) => {
                    e.stopPropagation()
                    setOpenMenu((prev) => (prev === cliente.id ? null : cliente.id))
                  }}
                  onDelete={() => {
                    setOpenMenu(null)
                    setConfirmingDelete(cliente.id)
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && <NovoClienteModal onConfirm={confirmAdd} onCancel={() => setModalOpen(false)} />}

      {clienteToDelete && (
        <ConfirmDialog
          title={t.deleteClientTitle}
          message={t.deleteClientMessage(clienteToDelete.nome)}
          confirmLabel={t.deleteClientConfirm}
          cancelLabel={t.deleteClientCancel}
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmingDelete(null)}
        />
      )}

      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#14151a',
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 14px',
          borderRadius: 10,
          opacity: toast ? 1 : 0,
          transform: toast ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          pointerEvents: 'none',
          maxWidth: 'calc(100vw - 48px)',
        }}
      >
        <Check size={13} />
        {toast}
      </div>
    </div>
  )
}
