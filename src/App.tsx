import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { supabase } from './integrations/supabase/client'
import { LangProvider } from './i18n/LangContext'
import { ProjetoProvider } from './context/ProjetoContext'
import { SimulationProvider } from './context/SimulationContext'
import Sidebar from './components/layout/Sidebar'
import DocumentTitle from './components/layout/DocumentTitle'
import OctahedronIcon from './components/icons/OctahedronIcon'
import Login from './pages/Login'
import ResumoExecutivo from './pages/ResumoExecutivo'
import Categorias from './pages/Categorias'
import Simulacao from './pages/Simulacao'
import ProjetoWorkspace from './pages/ProjetoWorkspace'
import ProjetoNovo from './pages/ProjetoNovo'
import ProjetoConfigInicial from './pages/ProjetoConfigInicial'
import ProjetoConfiguracoes from './pages/ProjetoConfiguracoes'
import Projetos from './pages/Projetos'
import VisaoGeral from './pages/VisaoGeral'
import Lancamentos from './pages/Lancamentos'
import Revisoes from './pages/Revisoes'
import Perfil from './pages/Perfil'
import TiposProjeto from './pages/TiposProjeto'
import CategoriasCusto from './pages/CategoriasCusto'
import ParametrosGlobais from './pages/ParametrosGlobais'
import Setores from './pages/Setores'
import Clientes from './pages/Clientes'
import ClienteProjetos from './pages/ClienteProjetos'
import PortalClienteRelatorio from './pages/PortalClienteRelatorio'
import './index.css'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

function ProtectedLayout({
  isLoggedIn,
  onLogout,
  children,
}: {
  isLoggedIn: boolean
  onLogout: () => void
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

  if (!isLoggedIn) return <Navigate to="/login" replace />

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-[rgba(20,21,26,.4)]"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className="fixed inset-y-0 left-0 z-50 w-[228px] overflow-hidden"
          style={{
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 220ms ease',
          }}
        >
          <Sidebar
            collapsed={false}
            onToggle={() => {}}
            onLogout={onLogout}
            hideToggle
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>

        <div className="flex flex-col h-screen">
          <div className="flex items-center justify-between h-14 px-4 bg-white border-b border-[rgba(20,21,26,.08)] shrink-0 z-30">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] text-c-text-2 hover:bg-[#f0eeec] transition-colors border-none bg-transparent cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu size={18} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2">
              <OctahedronIcon />
              <span className="font-bold text-[15px] text-c-text tracking-tight">ARO-MCS</span>
            </div>
            <div className="w-9" />
          </div>
          <main className="flex-1 overflow-auto bg-c-bg">{children}</main>
        </div>
      </>
    )
  }

  const effectiveCollapsed = isTablet ? true : collapsed
  const sidebarWidth = effectiveCollapsed ? '76px' : '228px'

  return (
    <div className="appgrid" style={{ gridTemplateColumns: `${sidebarWidth} 1fr` }}>
      <Sidebar
        collapsed={effectiveCollapsed}
        onToggle={() => setCollapsed(v => !v)}
        onLogout={onLogout}
      />
      <main className="overflow-auto bg-c-bg">{children}</main>
    </div>
  )
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthStatus(session ? 'authenticated' : 'unauthenticated')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthStatus(session ? 'authenticated' : 'unauthenticated')
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleLogout() {
    supabase.auth.signOut()
  }

  if (authStatus === 'loading') return null

  const isLoggedIn = authStatus === 'authenticated'

  return (
    <LangProvider>
    <ProjetoProvider>
    <SimulationProvider>
    <BrowserRouter>
      <DocumentTitle />
      <Routes>
        {/* Rota pública */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/visao-geral" replace /> : <Login />}
        />

        {/* Rotas protegidas */}
        <Route
          path="/visao-geral"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <VisaoGeral />
            </ProtectedLayout>
          }
        />
        <Route
          path="/projetos"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Projetos />
            </ProtectedLayout>
          }
        />
        <Route
          path="/projetos/novo"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <ProjetoNovo />
            </ProtectedLayout>
          }
        />
        <Route
          path="/projetos/:projetoId/config-inicial"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <ProjetoConfigInicial />
            </ProtectedLayout>
          }
        />
        <Route
          path="/projetos/:projetoId"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <ProjetoWorkspace />
            </ProtectedLayout>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ResumoExecutivo />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="simulacao" element={<Simulacao />} />
          <Route path="revisoes" element={<Revisoes />} />
          <Route path="lancamentos" element={<Lancamentos />} />
          <Route path="config" element={<ProjetoConfiguracoes />} />
        </Route>
        <Route
          path="/perfil"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Perfil />
            </ProtectedLayout>
          }
        />
        <Route
          path="/tipos-projeto"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <TiposProjeto />
            </ProtectedLayout>
          }
        />
        <Route
          path="/categorias-custo"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <CategoriasCusto />
            </ProtectedLayout>
          }
        />
        <Route
          path="/parametros-globais"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <ParametrosGlobais />
            </ProtectedLayout>
          }
        />
        <Route
          path="/setores"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Setores />
            </ProtectedLayout>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Clientes />
            </ProtectedLayout>
          }
        />
        <Route
          path="/clientes/:clienteId"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <ClienteProjetos />
            </ProtectedLayout>
          }
        />

        {/* Portal standalone — sem sidebar */}
        <Route path="/relatorio/:id" element={<PortalClienteRelatorio />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/visao-geral' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
    </SimulationProvider>
    </ProjetoProvider>
    </LangProvider>
  )
}
