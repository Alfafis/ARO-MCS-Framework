import type { Lang } from './LangContext'

export const auditoriaT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    filterTabela: string
    filterTabelaAll: string
    filterOperacao: string
    filterOperacaoAll: string
    filterDesde: string
    filterAte: string
    colTabela: string
    colOperacao: string
    colRegistro: string
    colUsuario: string
    colQuando: string
    usuarioDesconhecido: string
    operacaoInsert: string
    operacaoUpdate: string
    operacaoDelete: string
    empty: string
    loadErrorToast: string
    pageInfo: (page: number, totalPages: number, total: number) => string
    prev: string
    next: string
    tabelaLabels: Record<string, string>
  }
> = {
  'pt-BR': {
    headerTitle: 'Auditoria',
    headerSubtitle: 'Histórico de quem alterou o quê nos dados financeiros e operacionais.',
    filterTabela: 'Tabela',
    filterTabelaAll: 'Todas as tabelas',
    filterOperacao: 'Operação',
    filterOperacaoAll: 'Todas as operações',
    filterDesde: 'De',
    filterAte: 'Até',
    colTabela: 'Tabela',
    colOperacao: 'Operação',
    colRegistro: 'Registro',
    colUsuario: 'Usuário',
    colQuando: 'Quando',
    usuarioDesconhecido: 'Usuário removido',
    operacaoInsert: 'Criação',
    operacaoUpdate: 'Edição',
    operacaoDelete: 'Remoção',
    empty: 'Nenhum evento encontrado com esse filtro.',
    loadErrorToast: 'Não foi possível carregar o log de auditoria.',
    pageInfo: (page, totalPages, total) => `Página ${page} de ${totalPages} (${total} eventos)`,
    prev: 'Anterior',
    next: 'Próxima',
    tabelaLabels: {
      itens_custo: 'Itens de custo',
      itens_template: 'Itens de custo (template)',
      categorias_projeto: 'Categorias',
      campos_operacionais: 'Campos operacionais',
      campos_operacionais_template: 'Campos operacionais (template)',
      categorias_remediacao: 'Categorias de remediação',
      itens_remediacao: 'Itens de remediação',
      categorias_remediacao_template: 'Categorias de remediação (template)',
      itens_remediacao_template: 'Itens de remediação (template)',
      parametros_anuais: 'Parâmetros anuais',
      parametros_globais: 'Parâmetros globais',
      configuracoes_plataforma: 'Configurações da plataforma',
    },
  },
  en: {
    headerTitle: 'Audit log',
    headerSubtitle: 'History of who changed what in financial and operational data.',
    filterTabela: 'Table',
    filterTabelaAll: 'All tables',
    filterOperacao: 'Operation',
    filterOperacaoAll: 'All operations',
    filterDesde: 'From',
    filterAte: 'To',
    colTabela: 'Table',
    colOperacao: 'Operation',
    colRegistro: 'Record',
    colUsuario: 'User',
    colQuando: 'When',
    usuarioDesconhecido: 'Removed user',
    operacaoInsert: 'Created',
    operacaoUpdate: 'Updated',
    operacaoDelete: 'Deleted',
    empty: 'No events found for this filter.',
    loadErrorToast: 'Could not load the audit log.',
    pageInfo: (page, totalPages, total) => `Page ${page} of ${totalPages} (${total} events)`,
    prev: 'Previous',
    next: 'Next',
    tabelaLabels: {
      itens_custo: 'Cost items',
      itens_template: 'Cost items (template)',
      categorias_projeto: 'Categories',
      campos_operacionais: 'Operational fields',
      campos_operacionais_template: 'Operational fields (template)',
      categorias_remediacao: 'Remediation categories',
      itens_remediacao: 'Remediation items',
      categorias_remediacao_template: 'Remediation categories (template)',
      itens_remediacao_template: 'Remediation items (template)',
      parametros_anuais: 'Annual parameters',
      parametros_globais: 'Global parameters',
      configuracoes_plataforma: 'Platform settings',
    },
  },
  es: {
    headerTitle: 'Auditoría',
    headerSubtitle: 'Historial de quién cambió qué en los datos financieros y operativos.',
    filterTabela: 'Tabla',
    filterTabelaAll: 'Todas las tablas',
    filterOperacao: 'Operación',
    filterOperacaoAll: 'Todas las operaciones',
    filterDesde: 'Desde',
    filterAte: 'Hasta',
    colTabela: 'Tabla',
    colOperacao: 'Operación',
    colRegistro: 'Registro',
    colUsuario: 'Usuario',
    colQuando: 'Cuándo',
    usuarioDesconhecido: 'Usuario eliminado',
    operacaoInsert: 'Creación',
    operacaoUpdate: 'Edición',
    operacaoDelete: 'Eliminación',
    empty: 'Ningún evento encontrado con este filtro.',
    loadErrorToast: 'No se pudo cargar el registro de auditoría.',
    pageInfo: (page, totalPages, total) => `Página ${page} de ${totalPages} (${total} eventos)`,
    prev: 'Anterior',
    next: 'Siguiente',
    tabelaLabels: {
      itens_custo: 'Ítems de costo',
      itens_template: 'Ítems de costo (plantilla)',
      categorias_projeto: 'Categorías',
      campos_operacionais: 'Campos operativos',
      campos_operacionais_template: 'Campos operativos (plantilla)',
      categorias_remediacao: 'Categorías de remediación',
      itens_remediacao: 'Ítems de remediación',
      categorias_remediacao_template: 'Categorías de remediación (plantilla)',
      itens_remediacao_template: 'Ítems de remediación (plantilla)',
      parametros_anuais: 'Parámetros anuales',
      parametros_globais: 'Parámetros globales',
      configuracoes_plataforma: 'Configuración de la plataforma',
    },
  },
}
