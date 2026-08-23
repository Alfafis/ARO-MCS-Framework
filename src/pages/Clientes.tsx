import { useCallback, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/LangContext'
import { clientesT } from '@/i18n/clientes'
import ClienteRow from '@/components/clientes/ClienteRow'
import NovoClienteModal from '@/components/clientes/NovoClienteModal'
import { useProjeto } from '@/context/ProjetoContext'
import { Skeleton } from '@/components/ui/skeleton'

export default function Clientes() {
  const navigate = useNavigate()
  const t = useT(clientesT)
  const { clientes, projetos, criarCliente, loading } = useProjeto()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = clientes.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()))

  const confirmAdd = useCallback(async (nome: string) => {
    const id = await criarCliente(nome)
    setModalOpen(false)
    navigate(`/clientes/${id}`)
  }, [criarCliente, navigate])

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t.clientsHeaderTitle}
        badge={t.clientsBadge(clientes.length)}
        subtitle={t.clientsHeaderSubtitle}
        actions={<Button variant="primary" onClick={() => setModalOpen(true)}>{t.newClient}</Button>}
      />

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">

        <div className="flex">
          <label className="lnc-search-pill max-w-[320px]">
            <Search size={15} aria-hidden="true" />
            <input
              className="lnc-search"
              placeholder={t.searchClientPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label={t.searchClientPlaceholder}
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)]">
          <div className="min-w-[420px]">
            {loading ? (
              <div className="flex flex-col gap-px p-3">
                {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-[0.875rem] text-c-text-2">
                {t.emptyClients}
              </div>
            ) : (
              filtered.map(cliente => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  projectsLabel={t.projectsCount(projetos.filter(p => p.clienteId === cliente.id).length)}
                  onOpen={() => navigate(`/clientes/${cliente.id}`)}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {modalOpen && <NovoClienteModal onConfirm={confirmAdd} onCancel={() => setModalOpen(false)} />}
    </div>
  )
}
