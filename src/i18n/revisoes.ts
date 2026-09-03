import type { Lang } from './LangContext'

export const revisoesT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: (projetoNome: string) => string
    newRevision: string
    statusDraft: string
    statusCurrent: string
    statusReplaced: string
    viewPdf: string
    closeEditor: string
    continueEditing: string
    saveChanges: string
    publishRevision: string
    editorPlaceholder: string
    hashLabel: string
    publishedIn: string
    toDefine: string
    plannedSuffix: string
    currentSuffix: string
    emptyState: string
    months: string[]
  }
> = {
  'pt-BR': {
    headerTitle: 'Revisões do relatório',
    headerSubtitle: (nome) => `${nome} — histórico auditável, com hash de conteúdo por versão`,
    newRevision: '+ Gerar nova revisão',
    statusDraft: 'Rascunho',
    statusCurrent: 'Vigente',
    statusReplaced: 'Substituída',
    viewPdf: 'Ver PDF',
    closeEditor: 'Fechar edição',
    continueEditing: 'Continuar edição',
    saveChanges: 'Salvar mudanças',
    publishRevision: 'Publicar revisão',
    editorPlaceholder: 'Descreva as mudanças desta revisão (uma por linha)...',
    hashLabel: 'hash SHA-256 do conteúdo',
    publishedIn: 'Publicada em',
    toDefine: 'A definir',
    plannedSuffix: '— Planejada',
    currentSuffix: '— Vigente',
    emptyState: 'Nenhuma revisão ainda. Gere a primeira pra começar o histórico deste projeto.',
    months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  },
  en: {
    headerTitle: 'Report revisions',
    headerSubtitle: (nome) => `${nome} — auditable history, with a content hash per version`,
    newRevision: '+ Generate new revision',
    statusDraft: 'Draft',
    statusCurrent: 'Current',
    statusReplaced: 'Superseded',
    viewPdf: 'View PDF',
    closeEditor: 'Close editor',
    continueEditing: 'Continue editing',
    saveChanges: 'Save changes',
    publishRevision: 'Publish revision',
    editorPlaceholder: 'Describe the changes in this revision (one per line)...',
    hashLabel: 'SHA-256 content hash',
    publishedIn: 'Published in',
    toDefine: 'TBD',
    plannedSuffix: '— Planned',
    currentSuffix: '— Current',
    emptyState: 'No revisions yet. Generate the first one to start this project’s history.',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  es: {
    headerTitle: 'Revisiones del informe',
    headerSubtitle: (nome) => `${nome} — historial auditable, con hash de contenido por versión`,
    newRevision: '+ Generar nueva revisión',
    statusDraft: 'Borrador',
    statusCurrent: 'Vigente',
    statusReplaced: 'Sustituida',
    viewPdf: 'Ver PDF',
    closeEditor: 'Cerrar edición',
    continueEditing: 'Continuar edición',
    saveChanges: 'Guardar cambios',
    publishRevision: 'Publicar revisión',
    editorPlaceholder: 'Describa los cambios de esta revisión (uno por línea)...',
    hashLabel: 'hash SHA-256 del contenido',
    publishedIn: 'Publicada en',
    toDefine: 'A definir',
    plannedSuffix: '— Planificada',
    currentSuffix: '— Vigente',
    emptyState: 'Aún no hay revisiones. Genere la primera para iniciar el historial de este proyecto.',
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  },
}
