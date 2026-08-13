import { useState, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ResumoExecutivo from './pages/ResumoExecutivo'
import Categorias from './pages/Categorias'
import Simulacao from './pages/Simulacao'
import Lancamentos from './pages/Lancamentos'
import Revisoes from './pages/Revisoes'
import Clientes from './pages/Clientes'
import './index.css'

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
  const sidebarWidth = collapsed ? '76px' : '228px'

  if (!isLoggedIn) return <Navigate to="/login" replace />

  return (
    <div className="appgrid" style={{ gridTemplateColumns: `${sidebarWidth} 1fr` }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} onLogout={onLogout} />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
