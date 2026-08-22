import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FolderKanban,
  Users, ChevronsLeft, MoreHorizontal, User, Settings, LogOut,
  Globe, ChevronDown,
} from 'lucide-react'
import { useLang, useT, type Lang } from '@/i18n/LangContext'
import { sidebarT } from '@/i18n/sidebar'
import OctahedronIcon from '@/components/icons/OctahedronIcon'

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en',    label: 'English'             },
  { code: 'es',    label: 'Español'             },
]

interface SidebarProps {
  collapsed: boolean
  onToggle:  () => void
  onLogout:  () => void
  hideToggle?:    boolean
  onMobileClose?: () => void
}

export default function Sidebar({ collapsed, onToggle, onLogout, hideToggle, onMobileClose }: SidebarProps) {
  const { lang, setLang } = useLang()
  const t = useT(sidebarT)

  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen,    setLangOpen]    = useState(false)
  const [langMenuPos, setLangMenuPos] = useState({ bottom: 0, left: 0, width: 0 })
  const profileRef    = useRef<HTMLDivElement>(null)
  const langRef       = useRef<HTMLDivElement>(null)
  const langBtnRef    = useRef<HTMLButtonElement>(null)
  const langMenuRef   = useRef<HTMLDivElement>(null)
  const location   = useLocation()

  const NAV_ITEMS = [
    { to: '/clientes',    label: t.clients,   Icon: Users,        matchExact: false },
    // exato: /projetos/:id/* é o workspace de projeto, com nav própria — não é
    // "dentro" da lista global mesmo entrando por ela. Revisões e Lançamentos
    // passaram pra dentro do workspace por projeto (2026-08-21) — não são mais
    // rotas globais.
    { to: '/projetos',    label: t.projects,  Icon: FolderKanban, matchExact: true  },
  ]

  useEffect(() => {
    if (langOpen && langBtnRef.current) {
      const rect = langBtnRef.current.getBoundingClientRect()
      setLangMenuPos({
        bottom: window.innerHeight - rect.top + 8,
        left:   rect.left,
        width:  Math.max(rect.width, 180),
      })
    }
  }, [langOpen])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      const insideLang = (langRef.current?.contains(e.target as Node) ||
                          langMenuRef.current?.contains(e.target as Node))
      if (!insideLang) setLangOpen(false)
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
        {!collapsed && <span className="brand-label">ARO-MCS</span>}
      </div>

      {/* ── Botão de recolher ── */}
      {!hideToggle && <button
        className="bsidebar-toggle"
        onClick={onToggle}
        aria-label={collapsed ? t.expand : t.collapse}
      >
        <ChevronsLeft
          size={13}
          strokeWidth={2.5}
          color="var(--c-text-2)"
          aria-hidden="true"
          style={{
            transform:  collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>}

      {/* ── Navegação principal ── */}
      <nav className="bsidebar-scroll" aria-label="Menu principal">
        {NAV_ITEMS.map(({ to, label, Icon, matchExact }) => {
          const isActive = location.pathname === to || (!matchExact && location.pathname.startsWith(to + '/'))
          return (
            <NavLink
              key={to}
              to={to}
              className={`bsidebar-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
              end
              style={{ justifyContent: collapsed ? 'center' : undefined }}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onMobileClose?.()}
            >
              <span className="ico" aria-hidden="true">
                <Icon size={14} strokeWidth={2} />
              </span>
              {!collapsed && label}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Seletor de idioma ── */}
      <div ref={langRef} className="relative flex-none">
        {/* Botão de idioma */}
        <button
          ref={langBtnRef}
          className="flex items-center gap-2 w-full p-2 rounded-[14px] bg-[#f6f5f3] hover:bg-[#efece9] transition-colors duration-[220ms] border-0 cursor-pointer whitespace-nowrap overflow-hidden"
          onClick={() => { setLangOpen(v => !v); setProfileOpen(false) }}
          aria-expanded={langOpen}
          aria-haspopup="listbox"
          aria-label={t.selectLang}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <Globe size={14} strokeWidth={2} color="var(--c-text-2)" aria-hidden="true" style={{ flex: 'none' }} />
          {!collapsed && (
            <>
              <span className="flex-1 text-xs text-[#14151a] text-left overflow-hidden text-ellipsis">
                {LANGUAGES.find(l => l.code === lang)?.label}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                color="var(--c-text-2)"
                aria-hidden="true"
                style={{
                  flex:       'none',
                  transform:  langOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 220ms ease',
                }}
              />
            </>
          )}
        </button>

        {/* Dropdown — portal com position:fixed para não ser clipado pelo overflow:hidden do appgrid */}
        {createPortal(
          <div
            ref={langMenuRef}
            role="listbox"
            aria-label={t.selectLang}
            style={{
              position:      'fixed',
              bottom:        langMenuPos.bottom,
              left:          langMenuPos.left,
              width:         langMenuPos.width,
              background:    'var(--c-card)',
              borderRadius:  14,
              boxShadow:     '0 16px 40px -12px rgba(20,21,26,.18)',
              padding:       6,
              zIndex:        200,
              opacity:       langOpen ? 1 : 0,
              transform:     langOpen ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
              transformOrigin: 'bottom left',
              pointerEvents: langOpen ? 'auto' : 'none',
              transition:    'opacity 160ms ease, transform 160ms ease',
            }}
          >
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                className="profile-menu-item"
                role="option"
                aria-selected={lang === code}
                onClick={() => { setLang(code); setLangOpen(false) }}
              >
                {label}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>

      {/* ── Rodapé de perfil — FORA do scroll ── */}
      <div
        ref={profileRef}
        style={{ position: 'relative', flex: 'none', padding: '4px 0 20px' }}
      >
        {/* Dropdown — sempre no DOM, nunca desmontado */}
        <div
          className="profile-dropdown"
          role="menu"
          aria-label={t.openProfile}
          style={{
            opacity:       profileOpen ? 1 : 0,
            transform:     profileOpen ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
            pointerEvents: profileOpen ? 'auto' : 'none',
            transition:    'opacity 160ms ease, transform 160ms ease',
          }}
        >
          <button className="profile-menu-item" role="menuitem">
            <User size={14} strokeWidth={2} aria-hidden="true" />
            {t.myProfile}
          </button>
          <NavLink
            to="/configuracoes"
            className="profile-menu-item"
            role="menuitem"
            onClick={() => setProfileOpen(false)}
          >
            <Settings size={14} strokeWidth={2} aria-hidden="true" />
            {t.settings}
          </NavLink>
          <div className="profile-dropdown-divider" role="separator" />
          <button
            className="profile-menu-item danger"
            role="menuitem"
            onClick={() => { setProfileOpen(false); onLogout() }}
          >
            <LogOut size={14} strokeWidth={2} aria-hidden="true" />
            {t.logout}
          </button>
        </div>

        {/* Cartão de perfil */}
        <button
          className="bsidebar-foot"
          onClick={() => { setProfileOpen(v => !v); setLangOpen(false) }}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          aria-label={t.openProfile}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div className="bsidebar-avatar" aria-hidden="true">CA</div>
          {!collapsed && (
            <>
              <div className="bsidebar-foot-info">
                <div className="name">Cesar Aro</div>
                <div className="role">{t.consultant}</div>
              </div>
              <MoreHorizontal size={14} strokeWidth={2} color="var(--c-text-2)" aria-hidden="true" style={{ flex: 'none' }} />
            </>
          )}
        </button>
      </div>

    </aside>
  )
}
