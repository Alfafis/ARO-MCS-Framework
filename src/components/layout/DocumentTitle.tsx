import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useT } from '@/i18n/useLang'
import { sidebarT } from '@/i18n/sidebar'
import { loginT } from '@/i18n/login'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { perfilT } from '@/i18n/perfil'
import { tiposProjetoT } from '@/i18n/tipos-projeto'
import { categoriasCustoT } from '@/i18n/categorias-custo'
import { parametrosGlobaisT } from '@/i18n/parametros-globais'

const APP_NAME = 'Be Planned'

// Sem client name no título de propósito — histórico do browser é visível
// localmente no dispositivo, dado de cliente não precisa vazar pra lá.
export default function DocumentTitle() {
  const location = useLocation()
  const tNav = useT(sidebarT)
  const tLogin = useT(loginT)
  const tRel = useT(relatorioClienteT)
  const tPerfil = useT(perfilT)
  const tTipos = useT(tiposProjetoT)
  const tCatCusto = useT(categoriasCustoT)
  const tParamGlobais = useT(parametrosGlobaisT)

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
      'tipos-projeto':    tTipos.headerTitle,
      'categorias-custo': tCatCusto.headerTitle,
      'parametros-globais': tParamGlobais.headerTitle,
    }[root]

    document.title = label ? `${label} | ${APP_NAME}` : APP_NAME
  }, [location.pathname, tNav, tLogin, tRel, tPerfil, tTipos, tCatCusto, tParamGlobais])

  return null
}
