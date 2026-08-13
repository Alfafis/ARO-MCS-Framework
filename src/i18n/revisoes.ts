import type { Lang } from './LangContext'

export const revisoesT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
  newRevision:      string
  statusDraft:      string
  statusCurrent:    string
  statusReplaced:   string
  viewPdf:          string
  closeEditor:      string
  continueEditing:  string
  saveChanges:      string
  publishRevision:  string
  editorPlaceholder: string
  anchoredVia:      string
  publishedIn:      string
  toDefine:         string
  plannedSuffix:    string
  currentSuffix:    string
  initialSuffix:    string
  months:           string[]
  r2Items:          string[]
  r1Items:          string[]
  r0Items:          string[]
}> = {
  'pt-BR': {
    headerTitle:      'Revisões do relatório',
    headerSubtitle:   'NX Gold · Fechamento de Mina — histórico auditável, com hash de registro',
    newRevision:      '+ Gerar nova revisão',
    statusDraft:      'Rascunho',
    statusCurrent:    'Vigente',
    statusReplaced:   'Substituída',
    viewPdf:          'Ver PDF',
    closeEditor:      'Fechar edição',
    continueEditing:  'Continuar edição',
    saveChanges:      'Salvar mudanças',
    publishRevision:  'Publicar revisão',
    editorPlaceholder: 'Descreva as mudanças desta revisão (uma por linha)...',
    anchoredVia:      'ancorado via OpenTimestamps',
    publishedIn:      'Publicada em',
    toDefine:         'A definir',
    plannedSuffix:    '— Planejada',
    currentSuffix:    '— Vigente',
    initialSuffix:    '— Versão inicial',
    months:           ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
    r2Items: [
      'Unificar o método de atualização monetária (substitui os 4 métodos conflitantes)',
      'Fixar a contingência como campo único versionado por projeto',
    ],
    r1Items: [
      'Incorporou "Investigação e remediação" (+R$ 19,5 M) ao total geral',
      'Corrigiu a Inversão Min/Max do item 8.1.1 (Bloqueio de acessos)',
      'Ajustou rótulos dos itens 8.4.1 e 8.5.1 (antes duplicados como 8.3.1)',
    ],
    r0Items: [
      'Levantamento bottom-up dos 8 setores e primeira rodada Monte Carlo (10.000 iterações)',
    ],
  },
  'en': {
    headerTitle:      'Report revisions',
    headerSubtitle:   'NX Gold · Mine Closure — auditable history with registration hash',
    newRevision:      '+ Generate new revision',
    statusDraft:      'Draft',
    statusCurrent:    'Current',
    statusReplaced:   'Superseded',
    viewPdf:          'View PDF',
    closeEditor:      'Close editor',
    continueEditing:  'Continue editing',
    saveChanges:      'Save changes',
    publishRevision:  'Publish revision',
    editorPlaceholder: 'Describe the changes in this revision (one per line)...',
    anchoredVia:      'anchored via OpenTimestamps',
    publishedIn:      'Published in',
    toDefine:         'TBD',
    plannedSuffix:    '— Planned',
    currentSuffix:    '— Current',
    initialSuffix:    '— Initial version',
    months:           ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    r2Items: [
      'Unify the monetary update method (replaces the 4 conflicting methods)',
      'Fix contingency as a single versioned field per project',
    ],
    r1Items: [
      'Added "Investigation and remediation" (+R$ 19.5 M) to the grand total',
      'Corrected the Min/Max inversion in item 8.1.1 (Access blocking)',
      'Adjusted labels for items 8.4.1 and 8.5.1 (previously duplicated as 8.3.1)',
    ],
    r0Items: [
      'Bottom-up survey of 8 sectors and first Monte Carlo simulation run (10,000 iterations)',
    ],
  },
  'es': {
    headerTitle:      'Revisiones del informe',
    headerSubtitle:   'NX Gold · Cierre de Mina — historial auditable con hash de registro',
    newRevision:      '+ Generar nueva revisión',
    statusDraft:      'Borrador',
    statusCurrent:    'Vigente',
    statusReplaced:   'Sustituida',
    viewPdf:          'Ver PDF',
    closeEditor:      'Cerrar edición',
    continueEditing:  'Continuar edición',
    saveChanges:      'Guardar cambios',
    publishRevision:  'Publicar revisión',
    editorPlaceholder: 'Describa los cambios de esta revisión (uno por línea)...',
    anchoredVia:      'anclado via OpenTimestamps',
    publishedIn:      'Publicada en',
    toDefine:         'A definir',
    plannedSuffix:    '— Planificada',
    currentSuffix:    '— Vigente',
    initialSuffix:    '— Versión inicial',
    months:           ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    r2Items: [
      'Unificar el método de actualización monetaria (reemplaza los 4 métodos conflictivos)',
      'Fijar la contingencia como campo único versionado por proyecto',
    ],
    r1Items: [
      'Incorporó "Investigación y remediación" (+R$ 19,5 M) al total general',
      'Corrigió la inversión Mín/Máx del ítem 8.1.1 (Bloqueo de accesos)',
      'Ajustó etiquetas de los ítems 8.4.1 y 8.5.1 (antes duplicados como 8.3.1)',
    ],
    r0Items: [
      'Levantamiento bottom-up de 8 sectores y primera ejecución de simulación Monte Carlo (10.000 iteraciones)',
    ],
  },
}
