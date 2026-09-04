import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ChevronsLeft,
  MoreHorizontal,
  User,
  LogOut,
  Globe,
  ChevronDown,
  Tag,
  FolderTree,
  SlidersHorizontal,
  MapPin,
  Sprout,
  History,
  Palette,
  Sun,
  Moon,
} from 'lucide-react'
import { useLang, useT } from '@/i18n/useLang'
import type { Lang } from '@/i18n/LangContext'
import { sidebarT } from '@/i18n/sidebar'
import { supabase } from '@/integrations/supabase/client'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'
import { useTema } from '@/context/TemaContext'

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  const letters = local.replace(/[^a-zA-Z]/g, '')
  return (letters.slice(0, 2) || '??').toUpperCase()
}

function initialsFromNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '??'
  const iniciais = partes.length === 1 ? partes[0].slice(0, 2) : partes[0][0] + partes[partes.length - 1][0]
  return iniciais.toUpperCase()
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onLogout: () => void
  hideToggle?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ collapsed, onToggle, onLogout, hideToggle, onMobileClose }: SidebarProps) {
  const { lang, setLang } = useLang()
  const t = useT(sidebarT)
  const { config } = usePlataformaConfig()
  const { tema, toggleTema } = useTema()

  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [langMenuPos, setLangMenuPos] = useState({ bottom: 0, left: 0, width: 0 })
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const langBtnRef = useRef<HTMLButtonElement>(null)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const NAV_ITEMS = [
    { to: '/visao-geral', label: t.overview, Icon: LayoutDashboard, matchExact: false },
    { to: '/clientes', label: t.clients, Icon: Users, matchExact: false },
    // não-exato: /projetos/:id/* é o workspace de projeto (nav própria via
    // ProjetoWorkspace), mas continua "dentro" de Projetos pra fins de
    // destaque na sidebar global — usuário passa a maior parte do tempo lá
    // dentro, perder o highlight nesse momento deixa a sidebar parecendo sem
    // nada selecionado (2026-08-22).
    { to: '/projetos', label: t.projects, Icon: FolderKanban, matchExact: false },
    { to: '/tipos-projeto', label: t.projectTypes, Icon: Tag, matchExact: false },
    { to: '/categorias-custo', label: t.costCategoriesModule, Icon: FolderTree, matchExact: false },
    { to: '/parametros-globais', label: t.globalParams, Icon: SlidersHorizontal, matchExact: false },
    { to: '/setores', label: t.sectors, Icon: MapPin, matchExact: false },
    { to: '/remediacao-padrao', label: t.remediationTemplate, Icon: Sprout, matchExact: false },
    { to: '/auditoria', label: t.auditLog, Icon: History, matchExact: false },
    { to: '/plataforma', label: t.platformSettings, Icon: Palette, matchExact: false },
  ]

  async function fetchPerfil(userId: string) {
    const { data } = await supabase.from('perfis').select('nome, foto_url').eq('id', userId).single()
    setNome(data?.nome ?? '')
    setFotoUrl(data?.foto_url ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user.email ?? '')
      if (session) void fetchPerfil(session.user.id)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? '')
      if (session) void fetchPerfil(session.user.id)
      else {
        setNome('')
        setFotoUrl(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handlePerfilAtualizado() {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) void fetchPerfil(session.user.id)
      })
    }
    window.addEventListener('perfil-atualizado', handlePerfilAtualizado)
    return () => window.removeEventListener('perfil-atualizado', handlePerfilAtualizado)
  }, [])

  useEffect(() => {
    if (langOpen && langBtnRef.current) {
      const rect = langBtnRef.current.getBoundingClientRect()
      setLangMenuPos({
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
        width: Math.max(rect.width, 180),
      })
    }
  }, [langOpen])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      const insideLang = langRef.current?.contains(e.target as Node) || langMenuRef.current?.contains(e.target as Node)
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
          gap: '10px',
        }}
      >
        <img src={config.logoIconeUrl} alt="Be Planned" className="h-9 w-auto object-contain" />
        {!collapsed && <span className="brand-label">Be Planned</span>}
      </div>

      {/* ── Botão de recolher ── */}
      {!hideToggle && (
        <button className="bsidebar-toggle" onClick={onToggle} aria-label={collapsed ? t.expand : t.collapse}>
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
      )}

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
                <Icon size={16} strokeWidth={2} />
              </span>
              {!collapsed && label}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Toggle de tema ── */}
      <div className="flex-none mb-2">
        <button
          type="button"
          onClick={() => void toggleTema()}
          aria-label={tema === 'dark' ? t.themeSwitchToLight : t.themeSwitchToDark}
          title={tema === 'dark' ? t.themeSwitchToLight : t.themeSwitchToDark}
          className="flex items-center gap-2 w-full p-2 rounded-[14px] bg-c-surface-2 hover:bg-c-surface-2-hover transition-colors duration-[220ms] border-0 cursor-pointer whitespace-nowrap overflow-hidden"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          {tema === 'dark' ? (
            <Sun size={16} strokeWidth={2} color="var(--c-text-2)" aria-hidden="true" style={{ flex: 'none' }} />
          ) : (
            <Moon size={16} strokeWidth={2} color="var(--c-text-2)" aria-hidden="true" style={{ flex: 'none' }} />
          )}
          {!collapsed && (
            <span className="flex-1 text-sm text-c-text text-left overflow-hidden text-ellipsis">
              {tema === 'dark' ? t.themeLight : t.themeDark}
            </span>
          )}
        </button>
      </div>

      {/* ── Seletor de idioma ── */}
      <div ref={langRef} className="relative flex-none">
        {/* Botão de idioma */}
        <button
          ref={langBtnRef}
          className="flex items-center gap-2 w-full p-2 rounded-[14px] bg-c-surface-2 hover:bg-c-surface-2-hover transition-colors duration-[220ms] border-0 cursor-pointer whitespace-nowrap overflow-hidden"
          onClick={() => {
            setLangOpen((v) => !v)
            setProfileOpen(false)
          }}
          aria-expanded={langOpen}
          aria-haspopup="listbox"
          aria-label={t.selectLang}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <Globe size={16} strokeWidth={2} color="var(--c-text-2)" aria-hidden="true" style={{ flex: 'none' }} />
          {!collapsed && (
            <>
              <span className="flex-1 text-sm text-c-text text-left overflow-hidden text-ellipsis">
                {LANGUAGES.find((l) => l.code === lang)?.label}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2}
                color="var(--c-text-2)"
                aria-hidden="true"
                style={{
                  flex: 'none',
                  transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)',
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
              position: 'fixed',
              bottom: langMenuPos.bottom,
              left: langMenuPos.left,
              width: langMenuPos.width,
              background: 'var(--c-card)',
              borderRadius: 14,
              boxShadow: '0 16px 40px -12px rgba(20,21,26,.18)',
              padding: 6,
              zIndex: 200,
              opacity: langOpen ? 1 : 0,
              transform: langOpen ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
              transformOrigin: 'bottom left',
              pointerEvents: langOpen ? 'auto' : 'none',
              transition: 'opacity 160ms ease, transform 160ms ease',
            }}
          >
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                className="profile-menu-item"
                role="option"
                aria-selected={lang === code}
                onClick={() => {
                  setLang(code)
                  setLangOpen(false)
                }}
              >
                {label}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>

      {/* ── Rodapé de perfil — FORA do scroll ── */}
      <div ref={profileRef} style={{ position: 'relative', flex: 'none', padding: '4px 0 20px' }}>
        {/* Dropdown — sempre no DOM, nunca desmontado */}
        <div
          className="profile-dropdown"
          role="menu"
          aria-label={t.openProfile}
          style={{
            opacity: profileOpen ? 1 : 0,
            transform: profileOpen ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
            pointerEvents: profileOpen ? 'auto' : 'none',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          <button
            className="profile-menu-item"
            role="menuitem"
            onClick={() => {
              setProfileOpen(false)
              navigate('/perfil')
            }}
          >
            <User size={16} strokeWidth={2} aria-hidden="true" />
            {t.myProfile}
          </button>
          <div className="profile-dropdown-divider" role="separator" />
          <button
            className="profile-menu-item danger"
            role="menuitem"
            onClick={() => {
              setProfileOpen(false)
              onLogout()
            }}
          >
            <LogOut size={16} strokeWidth={2} aria-hidden="true" />
            {t.logout}
          </button>
        </div>

        {/* Cartão de perfil */}
        <button
          className="bsidebar-foot"
          onClick={() => {
            setProfileOpen((v) => !v)
            setLangOpen(false)
          }}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          aria-label={t.openProfile}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div className="bsidebar-avatar" aria-hidden="true">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt=""
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : nome ? (
              initialsFromNome(nome)
            ) : (
              initialsFromEmail(email)
            )}
          </div>
          {!collapsed && (
            <>
              <div className="bsidebar-foot-info">
                <div className="name">{nome || email || '—'}</div>
                <div className="role">{t.consultant}</div>
              </div>
              <MoreHorizontal
                size={16}
                strokeWidth={2}
                color="var(--c-text-2)"
                aria-hidden="true"
                style={{ flex: 'none' }}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
