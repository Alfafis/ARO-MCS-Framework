import type { Lang } from './LangContext'

export const setoresT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
  addSetor:         string
  emptyState:       string
  colId:            string
  colNome:          string
  colUsage:         string
  colActions:       string
  usageInUse:       (n: number) => string
  usageNotUsed:     string
  actionRename:     string
  actionDelete:     string
  deleteConfirm:    string
  deleteBlockedInUse: string
  newSetorIdLabel:  string
  newSetorNomeLabel: string
  newSetorIdHint:   string
  newSetorConfirm:  string
  newSetorCancel:   string
  errIdInUse:       string
  errIdInvalid:     string
  errNomeEmpty:     string
  savingError:      string
}> = {
  'pt-BR': {
    headerTitle:      'Setores da mina',
    headerSubtitle:   'Áreas físicas/funcionais usadas no multi-select de aplicabilidade de itens de custo.',
    addSetor:         'Novo setor',
    emptyState:       'Nenhum setor cadastrado ainda.',
    colId:            'ID',
    colNome:          'Nome',
    colUsage:         'Uso',
    colActions:       'Ações',
    usageInUse:       (n) => n === 1 ? `Em uso em 1 item` : `Em uso em ${n} itens`,
    usageNotUsed:     'Sem uso',
    actionRename:     'Renomear',
    actionDelete:     'Excluir',
    deleteConfirm:    'Tem certeza que deseja excluir esse setor? Essa ação não pode ser desfeita.',
    deleteBlockedInUse: 'Este setor está em uso por um ou mais itens de custo. Remova-o das aplicabilidades antes de excluir.',
    newSetorIdLabel:  'ID (número)',
    newSetorNomeLabel: 'Nome',
    newSetorIdHint:   'ID é atribuído automaticamente com o próximo número livre.',
    newSetorConfirm:  'Adicionar',
    newSetorCancel:   'Cancelar',
    errIdInUse:       'Já existe um setor com esse ID.',
    errIdInvalid:     'ID deve ser um inteiro entre 1 e 99.',
    errNomeEmpty:     'Nome não pode ficar em branco.',
    savingError:      'Erro ao salvar. Verifique sua conexão e tente de novo.',
  },
  'en': {
    headerTitle:      'Mine sectors',
    headerSubtitle:   'Physical/functional areas used by the applicability multi-select of cost items.',
    addSetor:         'New sector',
    emptyState:       'No sectors registered yet.',
    colId:            'ID',
    colNome:          'Name',
    colUsage:         'Usage',
    colActions:       'Actions',
    usageInUse:       (n) => n === 1 ? `Used by 1 item` : `Used by ${n} items`,
    usageNotUsed:     'Not used',
    actionRename:     'Rename',
    actionDelete:     'Delete',
    deleteConfirm:    'Are you sure you want to delete this sector? This action cannot be undone.',
    deleteBlockedInUse: 'This sector is in use by one or more cost items. Remove it from applicabilities before deleting.',
    newSetorIdLabel:  'ID (number)',
    newSetorNomeLabel: 'Name',
    newSetorIdHint:   'ID is assigned automatically with the next free number.',
    newSetorConfirm:  'Add',
    newSetorCancel:   'Cancel',
    errIdInUse:       'A sector with this ID already exists.',
    errIdInvalid:     'ID must be an integer between 1 and 99.',
    errNomeEmpty:     'Name cannot be empty.',
    savingError:      'Save error. Check your connection and try again.',
  },
  'es': {
    headerTitle:      'Sectores de la mina',
    headerSubtitle:   'Áreas físicas/funcionales usadas por el multi-select de aplicabilidad de ítems de costo.',
    addSetor:         'Nuevo sector',
    emptyState:       'Ningún sector registrado aún.',
    colId:            'ID',
    colNome:          'Nombre',
    colUsage:         'Uso',
    colActions:       'Acciones',
    usageInUse:       (n) => n === 1 ? `Usado en 1 ítem` : `Usado en ${n} ítems`,
    usageNotUsed:     'Sin uso',
    actionRename:     'Renombrar',
    actionDelete:     'Eliminar',
    deleteConfirm:    '¿Seguro que deseas eliminar este sector? Esta acción no se puede deshacer.',
    deleteBlockedInUse: 'Este sector está en uso por uno o más ítems de costo. Retíralo de las aplicabilidades antes de eliminar.',
    newSetorIdLabel:  'ID (número)',
    newSetorNomeLabel: 'Nombre',
    newSetorIdHint:   'El ID se asigna automáticamente con el próximo número libre.',
    newSetorConfirm:  'Agregar',
    newSetorCancel:   'Cancelar',
    errIdInUse:       'Ya existe un sector con este ID.',
    errIdInvalid:     'El ID debe ser un entero entre 1 y 99.',
    errNomeEmpty:     'El nombre no puede quedar vacío.',
    savingError:      'Error al guardar. Verifica tu conexión e inténtalo de nuevo.',
  },
}
