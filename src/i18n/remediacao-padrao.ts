import type { Lang } from './LangContext'

// Chrome próprio da página admin `/remediacao-padrao` — reaproveita
// `remediacaoT` (via RemediacaoCategoriaCard) pras strings de coluna/categoria/
// confirmação, que são idênticas às da versão por-projeto.
export const remediacaoPadraoT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    emptyStateTitle: string
    emptyStateBody: string
  }
> = {
  'pt-BR': {
    headerTitle: 'Remediação — Modelo de Referência',
    headerSubtitle:
      'Valores usados quando o consultor carrega o modelo padrão num projeto novo (botão "Carregar modelo de referência" em Remediação). Editar aqui não afeta projetos que já carregaram o modelo.',
    emptyStateTitle: 'Nenhuma categoria de referência cadastrada',
    emptyStateBody: 'Adicione a primeira categoria manualmente.',
  },
  en: {
    headerTitle: 'Remediation — Reference Model',
    headerSubtitle:
      'Values used when the consultant loads the default model into a new project ("Load reference model" button in Remediation). Editing here does not affect projects that already loaded the model.',
    emptyStateTitle: 'No reference category registered yet',
    emptyStateBody: 'Add the first category manually.',
  },
  es: {
    headerTitle: 'Remediación — Modelo de Referencia',
    headerSubtitle:
      'Valores usados cuando el consultor carga el modelo predeterminado en un proyecto nuevo (botón "Cargar modelo de referencia" en Remediación). Editar aquí no afecta proyectos que ya cargaron el modelo.',
    emptyStateTitle: 'Ninguna categoría de referencia registrada',
    emptyStateBody: 'Agrega la primera categoría manualmente.',
  },
}
