import type { Lang } from './LangContext'

export const projetoWorkspaceT: Record<Lang, {
  notFoundTitle: string
  notFoundBody:  string
  backToClients: string
  configPageTitle:    string
  configPageSubtitle: string
  salvar:             string
}> = {
  'pt-BR': {
    notFoundTitle: 'Projeto não encontrado',
    notFoundBody:  'Esse link não corresponde a nenhum projeto ativo. Volte pra lista de clientes.',
    backToClients: '← Clientes',
    configPageTitle:    'Configurações',
    configPageSubtitle: 'Configuração financeira deste projeto.',
    salvar:             'Salvar',
  },
  'en': {
    notFoundTitle: 'Project not found',
    notFoundBody:  'This link does not match any active project. Go back to the client list.',
    backToClients: '← Clients',
    configPageTitle:    'Settings',
    configPageSubtitle: 'This project\'s financial configuration.',
    salvar:             'Save',
  },
  'es': {
    notFoundTitle: 'Proyecto no encontrado',
    notFoundBody:  'Este enlace no corresponde a ningún proyecto activo. Vuelva a la lista de clientes.',
    backToClients: '← Clientes',
    configPageTitle:    'Configuración',
    configPageSubtitle: 'Configuración financiera de este proyecto.',
    salvar:             'Guardar',
  },
}
