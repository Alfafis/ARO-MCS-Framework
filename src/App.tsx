import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { supabase } from './integrations/supabase/client'
import { LangProvider } from './i18n/LangContext'
import { usePlataformaConfig } from './context/PlataformaConfigContext'
import { ProjetoProvider } from './context/ProjetoContext'
import { SimulationProvider } from './context/SimulationContext'
import Sidebar from './components/layout/Sidebar'
import DocumentTitle from './components/layout/DocumentTitle'
import { PageLoader, SplashScreen } from './components/layout/PageLoader'
import './index.css'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const EsqueciSenha = lazy(() => import('./pages/EsqueciSenha'))
const RedefinirSenha = lazy(() => import('./pages/RedefinirSenha'))
const VerificarCodigo = lazy(() => import('./pages/VerificarCodigo'))
const ResumoExecutivo = lazy(() => import('./pages/ResumoExecutivo'))
const Categorias = lazy(() => import('./pages/Categorias'))
const Simulacao = lazy(() => import('./pages/Simulacao'))
const ProjetoWorkspace = lazy(() => import('./pages/ProjetoWorkspace'))
const ProjetoNovo = lazy(() => import('./pages/ProjetoNovo'))
const ProjetoConfigInicial = lazy(() => import('./pages/ProjetoConfigInicial'))
const ProjetoConfiguracoes = lazy(() => import('./pages/ProjetoConfiguracoes'))
const Projetos = lazy(() => import('./pages/Projetos'))
const VisaoGeral = lazy(() => import('./pages/VisaoGeral'))
const Lancamentos = lazy(() => import('./pages/Lancamentos'))
const Revisoes = lazy(() => import('./pages/Revisoes'))
const Perfil = lazy(() => import('./pages/Perfil'))
const TiposProjeto = lazy(() => import('./pages/TiposProjeto'))
const CategoriasCusto = lazy(() => import('./pages/CategoriasCusto'))
const ParametrosGlobais = lazy(() => import('./pages/ParametrosGlobais'))
const Setores = lazy(() => import('./pages/Setores'))
const Remediacao = lazy(() => import('./pages/Remediacao'))
const RemediacaoPadrao = lazy(() => import('./pages/RemediacaoPadrao'))
const Auditoria = lazy(() => import('./pages/Auditoria'))
const ConfiguracoesPlataforma = lazy(() => import('./pages/ConfiguracoesPlataforma'))
const Clientes = lazy(() => import('./pages/Clientes'))
const ClienteProjetos = lazy(() => import('./pages/ClienteProjetos'))
const PortalClienteRelatorio = lazy(() => import('./pages/PortalClienteRelatorio'))
const PoliticaPrivacidade = lazy(() => import('./pages/PoliticaPrivacidade'))

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
  authStatus,
  onLogout,
  children,
}: {
  authStatus: AuthStatus
  onLogout: () => void
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const { config } = usePlataformaConfig()

  if (authStatus === 'mfa_required') return <Navigate to="/verificar-codigo" replace />
  if (authStatus !== 'authenticated') return <Navigate to="/login" replace />

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
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
          <div className="flex items-center justify-between h-14 px-4 bg-c-card border-b border-c-line shrink-0 z-30">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] text-c-text-2 hover:bg-c-surface-2-hover transition-colors border-none bg-transparent cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu size={18} strokeWidth={2} />
            </button>
            <img src={config.logoCompletoUrl} alt="Be Planned" className="h-9 w-auto object-contain" />
            <div className="w-9" />
          </div>
          <main className="flex-1 overflow-auto">
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </main>
        </div>
      </>
    )
  }

  const effectiveCollapsed = isTablet ? true : collapsed
  const sidebarWidth = effectiveCollapsed ? '76px' : '228px'

  return (
    <div className="appgrid" style={{ gridTemplateColumns: `${sidebarWidth} 1fr` }}>
      <Sidebar collapsed={effectiveCollapsed} onToggle={() => setCollapsed((v) => !v)} onLogout={onLogout} />
      <main className="overflow-auto">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
    </div>
  )
}

type AuthStatus = 'loading' | 'authenticated' | 'mfa_required' | 'unauthenticated'

// Sessão existir não basta: um fator TOTP verificado exige currentLevel==='aal2' antes de liberar
// rotas protegidas, senão 2FA vira decorativo (senha sozinha já dá acesso total). Ver ADR.
async function resolveAuthStatus(hasSession: boolean): Promise<AuthStatus> {
  if (!hasSession) return 'unauthenticated'
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (data && data.nextLevel === 'aal2' && data.currentLevel !== 'aal2') return 'mfa_required'
  return 'authenticated'
}

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveAuthStatus(Boolean(session)).then(setAuthStatus)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveAuthStatus(Boolean(session)).then(setAuthStatus)
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleLogout() {
    supabase.auth.signOut()
  }

  if (authStatus === 'loading') return <SplashScreen />

  const isLoggedIn = authStatus === 'authenticated'
  // Alvo de redirect pra quem já passou da tela de login (senha ok ou totalmente autenticado) —
  // usado pelas rotas "só deslogado" abaixo. null = deixa a rota pública renderizar normal.
  const publicOnlyRedirect =
    authStatus === 'authenticated' ? '/visao-geral' : authStatus === 'mfa_required' ? '/verificar-codigo' : null

  return (
    <LangProvider>
      <ProjetoProvider>
        <SimulationProvider>
          <BrowserRouter>
            <DocumentTitle />
            <Routes>
              {/* Rotas públicas */}
              <Route
                path="/"
                element={
                  publicOnlyRedirect ? (
                    <Navigate to={publicOnlyRedirect} replace />
                  ) : (
                    <Suspense fallback={<SplashScreen />}>
                      <Landing />
                    </Suspense>
                  )
                }
              />
              <Route
                path="/login"
                element={
                  publicOnlyRedirect ? (
                    <Navigate to={publicOnlyRedirect} replace />
                  ) : (
                    <Suspense fallback={<SplashScreen />}>
                      <Login />
                    </Suspense>
                  )
                }
              />
              <Route
                path="/esqueci-senha"
                element={
                  publicOnlyRedirect ? (
                    <Navigate to={publicOnlyRedirect} replace />
                  ) : (
                    <Suspense fallback={<SplashScreen />}>
                      <EsqueciSenha />
                    </Suspense>
                  )
                }
              />
              {/* Sem gate de isLoggedIn de propósito: o link de recuperação do Supabase cria uma
                  sessão temporária ao carregar, o que faria o gate acima expulsar o usuário pra
                  /visao-geral antes de ele conseguir trocar a senha. */}
              <Route
                path="/redefinir-senha"
                element={
                  <Suspense fallback={<SplashScreen />}>
                    <RedefinirSenha />
                  </Suspense>
                }
              />
              <Route
                path="/verificar-codigo"
                element={
                  authStatus === 'unauthenticated' ? (
                    <Navigate to="/login" replace />
                  ) : authStatus === 'authenticated' ? (
                    <Navigate to="/visao-geral" replace />
                  ) : (
                    <Suspense fallback={<SplashScreen />}>
                      <VerificarCodigo />
                    </Suspense>
                  )
                }
              />

              {/* Rotas protegidas */}
              <Route
                path="/visao-geral"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <VisaoGeral />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/projetos"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <Projetos />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/projetos/novo"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <ProjetoNovo />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/projetos/:projetoId/config-inicial"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <ProjetoConfigInicial />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/projetos/:projetoId"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <ProjetoWorkspace />
                  </ProtectedLayout>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ResumoExecutivo />} />
                <Route path="categorias" element={<Categorias />} />
                <Route path="simulacao" element={<Simulacao />} />
                <Route path="remediacao" element={<Remediacao />} />
                <Route path="revisoes" element={<Revisoes />} />
                <Route path="lancamentos" element={<Lancamentos />} />
                <Route path="config" element={<ProjetoConfiguracoes />} />
              </Route>
              <Route
                path="/perfil"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <Perfil />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/tipos-projeto"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <TiposProjeto />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/categorias-custo"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <CategoriasCusto />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/parametros-globais"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <ParametrosGlobais />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/setores"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <Setores />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/remediacao-padrao"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <RemediacaoPadrao />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/auditoria"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <Auditoria />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/plataforma"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <ConfiguracoesPlataforma />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <Clientes />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/clientes/:clienteId"
                element={
                  <ProtectedLayout authStatus={authStatus} onLogout={handleLogout}>
                    <ClienteProjetos />
                  </ProtectedLayout>
                }
              />

              {/* Portal standalone — sem sidebar */}
              <Route
                path="/relatorio/:id"
                element={
                  <Suspense fallback={<SplashScreen />}>
                    <PortalClienteRelatorio />
                  </Suspense>
                }
              />
              <Route
                path="/privacidade"
                element={
                  <Suspense fallback={<SplashScreen />}>
                    <PoliticaPrivacidade />
                  </Suspense>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to={isLoggedIn ? '/visao-geral' : '/'} replace />} />
            </Routes>
          </BrowserRouter>
        </SimulationProvider>
      </ProjetoProvider>
    </LangProvider>
  )
}
