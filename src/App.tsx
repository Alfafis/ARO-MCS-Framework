import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { LangProvider } from './i18n/LangContext'
import { ClientProvider } from './context/ClientContext'
import Sidebar from './components/layout/Sidebar'
import OctahedronIcon from './components/icons/OctahedronIcon'
import Login from './pages/Login'
import ResumoExecutivo from './pages/ResumoExecutivo'
import Categorias from './pages/Categorias'
import Simulacao from './pages/Simulacao'
import Lancamentos from './pages/Lancamentos'
import Revisoes from './pages/Revisoes'
import Clientes from './pages/Clientes'
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('aro_auth') === '1')

  function handleLogin() {
    localStorage.setItem('aro_auth', '1')
    setIsLoggedIn(true)
  }

  function handleLogout() {
    localStorage.removeItem('aro_auth')
    setIsLoggedIn(false)
  }

  return (
    <LangProvider>
    <ClientProvider>
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />

        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <ResumoExecutivo />
            </ProtectedLayout>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Categorias />
            </ProtectedLayout>
          }
        />
        <Route
          path="/simulacao"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Simulacao />
            </ProtectedLayout>
          }
        />
        <Route
          path="/lancamentos"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Lancamentos />
            </ProtectedLayout>
          }
        />
        <Route
          path="/revisoes"
          element={
            <ProtectedLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Revisoes />
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

        {/* Portal standalone — sem sidebar */}
        <Route path="/relatorio/:id" element={<PortalClienteRelatorio />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
    </ClientProvider>
    </LangProvider>
  )
}
