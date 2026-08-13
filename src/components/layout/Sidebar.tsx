import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Tag, Activity, FileText, History,
  Users, ChevronsLeft, MoreHorizontal, User, Settings, LogOut,
} from 'lucide-react'
import OctahedronIcon from '@/components/icons/OctahedronIcon'

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Visão geral',         Icon: LayoutDashboard },
  { to: '/categorias',   label: 'Categorias de custo', Icon: Tag             },
  { to: '/simulacao',    label: 'Simulação',            Icon: Activity        },
  { to: '/lancamentos',  label: 'Lançamentos',          Icon: FileText        },
  { to: '/revisoes',     label: 'Revisões',             Icon: History         },
  { to: '/clientes',     label: 'Clientes',             Icon: Users           },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onLogout: () => void
}

export default function Sidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <aside className="bsidebar">

      {/* ── Topline — marca ── */}
      <div
        className="bsidebar-topline"
        style={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '8px 10px 20px' : '8px 4px 20px 10px',
          gap: '9px',
        }}
      >
        <OctahedronIcon />
        {!collapsed && (
          <span className="brand-label">ARO-MCS</span>
        )}
      </div>

      {/* ── Botão de recolher ── */}
      <button
        className="bsidebar-toggle"
        onClick={onToggle}
        aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
      >
        <ChevronsLeft
          size={13}
          strokeWidth={2.5}
          color="var(--c-text-2)"
          aria-hidden="true"
          style={{
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>

      {/* ── Navegação principal ── */}
      <nav className="bsidebar-scroll" aria-label="Menu principal">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <NavLink
              key={to}
              to={to}
              className={`bsidebar-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
              end
              style={{ justifyContent: collapsed ? 'center' : undefined }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="ico" aria-hidden="true">
                <Icon size={14} strokeWidth={2} />
              </span>
              {!collapsed && label}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Rodapé de perfil — FORA do scroll ── */}
      <div
        ref={profileRef}
        style={{ position: 'relative', flex: 'none', padding: '8px 0 20px' }}
      >
        {/* Dropdown — sempre no DOM, nunca desmontado */}
        <div
          className="profile-dropdown"
          role="menu"
          aria-label="Menu do perfil"
          style={{
            opacity: profileOpen ? 1 : 0,
            transform: profileOpen ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
            pointerEvents: profileOpen ? 'auto' : 'none',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          <button className="profile-menu-item" role="menuitem">
            <User size={14} strokeWidth={2} aria-hidden="true" />
            Meu perfil
          </button>
          <NavLink
            to="/configuracoes"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => setProfileOpen(false)}
          >
            <Settings size={14} strokeWidth={2} aria-hidden="true" />
            Configurações
          </NavLink>
          <div className="profile-dropdown-divider" role="separator" />
          <button
            className="profile-menu-item danger"
            role="menuitem"
            onClick={() => { setProfileOpen(false); onLogout() }}
          >
            <LogOut size={14} strokeWidth={2} aria-hidden="true" />
            Sair
          </button>
        </div>

        {/* Cartão de perfil */}
        <button
          className="bsidebar-foot"
          onClick={() => setProfileOpen(v => !v)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          aria-label="Abrir menu do perfil"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div className="bsidebar-avatar" aria-hidden="true">CA</div>
          {!collapsed && (
            <>
              <div className="bsidebar-foot-info">
                <div className="name">Cesar Aro</div>
                <div className="role">Consultor</div>
              </div>
              <MoreHorizontal size={14} strokeWidth={2} color="var(--c-text-2)" aria-hidden="true" style={{ flex: 'none' }} />
            </>
          )}
        </button>
      </div>

    </aside>
  )
}
