import type { Lang } from './LangContext'

export const visaoGeralT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    kpiClientsLabel: string
    kpiClientsSub: string
    kpiProjectsLabel: string
    kpiProjectsSub: (andamento: number, aguardando: number, concluido: number) => string
    kpiValueLabel: string
    kpiValueSub: string
    recentProjectsTitle: string
    recentProjectsEmpty: string
    colUpdated: string
    rankingTitle: string
    rankingEmpty: string
    activityTitle: string
    activityEmpty: string
    activityLancamento: (categoria: string) => string
    activityRevisao: (codigo: string) => string
  }
> = {
  'pt-BR': {
    headerTitle: 'Visão Geral',
    headerSubtitle: 'Panorama do sistema — todos os clientes e projetos',
    kpiClientsLabel: 'Total de clientes',
    kpiClientsSub: 'Cadastrados na plataforma',
    kpiProjectsLabel: 'Total de projetos',
    kpiProjectsSub: (a, ag, c) => `${a} em andamento · ${ag} aguardando · ${c} concluído${c === 1 ? '' : 's'}`,
    kpiValueLabel: 'Valor total esperado',
    kpiValueSub: 'Soma dos projetos ativos (andamento + aguardando)',
    recentProjectsTitle: 'Projetos recentes',
    recentProjectsEmpty: 'Nenhum projeto cadastrado ainda.',
    colUpdated: 'Atualizado',
    rankingTitle: 'Ranking por cliente',
    rankingEmpty: 'Nenhum cliente com projeto ativo ainda.',
    activityTitle: 'Atividade recente',
    activityEmpty: 'Nenhuma atividade registrada ainda.',
    activityLancamento: (categoria) => `Lançamento — ${categoria}`,
    activityRevisao: (codigo) => `Revisão ${codigo} publicada`,
  },
  en: {
    headerTitle: 'Overview',
    headerSubtitle: 'System-wide view — all clients and projects',
    kpiClientsLabel: 'Total clients',
    kpiClientsSub: 'Registered on the platform',
    kpiProjectsLabel: 'Total projects',
    kpiProjectsSub: (a, ag, c) => `${a} in progress · ${ag} waiting · ${c} completed`,
    kpiValueLabel: 'Total expected value',
    kpiValueSub: 'Sum of active projects (in progress + waiting)',
    recentProjectsTitle: 'Recent projects',
    recentProjectsEmpty: 'No project registered yet.',
    colUpdated: 'Updated',
    rankingTitle: 'Client ranking',
    rankingEmpty: 'No client with an active project yet.',
    activityTitle: 'Recent activity',
    activityEmpty: 'No activity recorded yet.',
    activityLancamento: (categoria) => `Entry — ${categoria}`,
    activityRevisao: (codigo) => `Revision ${codigo} published`,
  },
  es: {
    headerTitle: 'Vista General',
    headerSubtitle: 'Panorama del sistema — todos los clientes y proyectos',
    kpiClientsLabel: 'Total de clientes',
    kpiClientsSub: 'Registrados en la plataforma',
    kpiProjectsLabel: 'Total de proyectos',
    kpiProjectsSub: (a, ag, c) => `${a} en curso · ${ag} en espera · ${c} completado${c === 1 ? '' : 's'}`,
    kpiValueLabel: 'Valor total esperado',
    kpiValueSub: 'Suma de proyectos activos (en curso + en espera)',
    recentProjectsTitle: 'Proyectos recientes',
    recentProjectsEmpty: 'Todavía no hay ningún proyecto registrado.',
    colUpdated: 'Actualizado',
    rankingTitle: 'Ranking por cliente',
    rankingEmpty: 'Todavía no hay ningún cliente con proyecto activo.',
    activityTitle: 'Actividad reciente',
    activityEmpty: 'Todavía no hay ninguna actividad registrada.',
    activityLancamento: (categoria) => `Lanzamiento — ${categoria}`,
    activityRevisao: (codigo) => `Revisión ${codigo} publicada`,
  },
}
