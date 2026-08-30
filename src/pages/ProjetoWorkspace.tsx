import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, Tag, Activity, History, FileText, Settings2, Sprout } from 'lucide-react'
import ClientSelector from '@/components/layout/ClientSelector'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjeto } from '@/context/useProjeto'
import { useT } from '@/i18n/useLang'
import { sidebarT } from '@/i18n/sidebar'
import { clientesT } from '@/i18n/clientes'
import { projetoWorkspaceT } from '@/i18n/projeto-workspace'
import type { ProjStatus } from '@/types/clientes'

export default function ProjetoWorkspace() {
  const { projetoId = '' } = useParams<{ projetoId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { projetos, clientes, loading } = useProjeto()
  const tNav = useT(sidebarT)
  const tCli = useT(clientesT)
  const t    = useT(projetoWorkspaceT)

  const projeto = projetos.find(p => p.id === projetoId)
  const cliente = clientes.find(c => c.id === projeto?.clienteId)

  const options = projetos.map(p => ({
    id:   p.id,
    name: `${clientes.find(c => c.id === p.clienteId)?.nome ?? '—'} · ${p.projeto}`,
  }))

  const currentTab = location.pathname.split('/')[3] ?? 'dashboard'

  function switchProjeto(novoId: string) {
    navigate(`/projetos/${novoId}/${currentTab}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full gap-4 p-4 sm:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!projeto || !cliente) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-center px-4">
        <p className="text-[15px] font-bold text-c-text">{t.notFoundTitle}</p>
        <p className="text-[13px] text-c-text-2 max-w-[360px]">{t.notFoundBody}</p>
        <NavLink to="/clientes" className="text-[12.5px] font-medium text-accent hover:underline">
          {t.backToClients}
        </NavLink>
      </div>
    )
  }

  const STATUS_META: Record<ProjStatus, { label: string; cls: string }> = {
    andamento:  { label: tCli.statusActive,  cls: 'bg-success-bg text-success'    },
    aguardando: { label: tCli.statusWaiting, cls: 'bg-accent-100 text-accent-700' },
    concluido:  { label: tCli.statusDone,    cls: 'bg-[#f0eeec] text-c-text-2'    },
  }
  const status = STATUS_META[projeto.status]

  const TABS = [
    { to: 'dashboard',  label: tNav.overview,       Icon: LayoutDashboard },
    { to: 'categorias', label: tNav.costCategories, Icon: Tag             },
    { to: 'simulacao',  label: tNav.simulation,     Icon: Activity        },
    // Tab Remediação só aparece quando o módulo foi habilitado no /config.
    // Mantém o workspace enxuto pra projetos que não usam escopo alternativo.
    ...(projeto.remediacaoHabilitada ? [{ to: 'remediacao', label: tNav.remediation, Icon: Sprout }] : []),
    { to: 'revisoes',   label: tNav.revisions,      Icon: History         },
    { to: 'lancamentos', label: tNav.launches,      Icon: FileText        },
    { to: 'config',      label: tNav.settings,      Icon: Settings2       },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-8 pt-4 sm:pt-5 flex flex-col gap-3">
        <NavLink
          to={`/clientes/${cliente.id}`}
          className="text-[12.5px] font-medium text-c-text-2 hover:text-accent transition-colors self-start"
        >
          ← {cliente.nome}
        </NavLink>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold text-c-text tracking-tight leading-none">{projeto.projeto}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0eeec] text-c-text-2 text-xs font-semibold font-mono">
              {projeto.rev}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <ClientSelector options={options} value={projetoId} onChange={switchProjeto} />
        </div>

        <nav className="flex items-center gap-1 border-b border-[rgba(20,21,26,.08)] -mb-px" aria-label="Navegação do projeto">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
                  isActive ? 'border-accent text-c-text' : 'border-transparent text-c-text-2 hover:text-c-text'
                }`
              }
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Outlet context={{ projeto, cliente }} />
      </div>
    </div>
  )
}
