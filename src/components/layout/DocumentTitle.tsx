import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useT } from '@/i18n/LangContext'
import { sidebarT } from '@/i18n/sidebar'
import { loginT } from '@/i18n/login'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { perfilT } from '@/i18n/perfil'
import { configuracoesT } from '@/i18n/configuracoes'

const APP_NAME = 'ARO-MCS Framework'

// Sem client name no título de propósito — histórico do browser é visível
// localmente no dispositivo, dado de cliente não precisa vazar pra lá.
export default function DocumentTitle() {
  const location = useLocation()
  const tNav = useT(sidebarT)
  const tLogin = useT(loginT)
  const tRel = useT(relatorioClienteT)
  const tPerfil = useT(perfilT)
  const tConfig = useT(configuracoesT)

  useEffect(() => {
    const [, root, , tab] = location.pathname.split('/')
    const label = {
      login:      tLogin.enter,
      'visao-geral': tNav.overview,
      clientes:   tNav.clients,
      projetos:   root === 'projetos' && tab
        ? ({ dashboard: tNav.overview, categorias: tNav.costCategories, simulacao: tNav.simulation, revisoes: tNav.revisions, lancamentos: tNav.launches }[tab] ?? tNav.projects)
        : tNav.projects,
      relatorio:  tRel.reportTitle,
      perfil:     tPerfil.headerTitle,
      configuracoes: tConfig.headerTitle,
    }[root]

    document.title = label ? `${label} | ${APP_NAME}` : APP_NAME
  }, [location.pathname, tNav, tLogin, tRel, tPerfil, tConfig])

  return null
}
