import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Categorias from './pages/Categorias'
import Simulacao from './pages/Simulacao'
import Lancamentos from './pages/Lancamentos'
import Revisoes from './pages/Revisoes'
import Clientes from './pages/Clientes'
import './index.css'

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? '76px' : '228px'

  return (
    <BrowserRouter>
      <div className="appgrid" style={{ gridTemplateColumns: `${sidebarWidth} 1fr` }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

        <main className="overflow-auto bg-c-bg">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/simulacao" element={<Simulacao />} />
            <Route path="/lancamentos" element={<Lancamentos />} />
            <Route path="/revisoes" element={<Revisoes />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
