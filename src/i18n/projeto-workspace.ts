import type { Lang } from './LangContext'

export const projetoWorkspaceT: Record<Lang, {
  notFoundTitle: string
  notFoundBody:  string
  backToClients: string
}> = {
  'pt-BR': {
    notFoundTitle: 'Projeto não encontrado',
    notFoundBody:  'Esse link não corresponde a nenhum projeto ativo. Volte pra lista de clientes.',
    backToClients: '← Clientes',
  },
  'en': {
    notFoundTitle: 'Project not found',
    notFoundBody:  'This link does not match any active project. Go back to the client list.',
    backToClients: '← Clients',
  },
  'es': {
    notFoundTitle: 'Proyecto no encontrado',
    notFoundBody:  'Este enlace no corresponde a ningún proyecto activo. Vuelva a la lista de clientes.',
    backToClients: '← Clientes',
  },
}
