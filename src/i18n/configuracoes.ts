import type { Lang } from './LangContext'

export const configuracoesT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
  tiposSectionTitle: string
  tiposSectionHint:  string
  placeholderNovoTipo: string
  addTipo:          string
  deleteTipo:       string
  createdToast:     string
  renameSavedToast: string
  renameErrorToast: string
  createErrorToast: string
  deleteErrorToast: string
  emptyNomeError:   string
}> = {
  'pt-BR': {
    headerTitle:      'Configurações',
    headerSubtitle:   'Ajustes administrativos do sistema.',
    tiposSectionTitle: 'Tipos de projeto',
    tiposSectionHint:  'Usados ao criar um projeto novo e no filtro da lista de projetos.',
    placeholderNovoTipo: 'Nome do novo tipo',
    addTipo:          'Adicionar',
    deleteTipo:       'Remover tipo',
    createdToast:     'Tipo criado.',
    renameSavedToast: 'Tipo atualizado.',
    renameErrorToast: 'Não foi possível renomear.',
    createErrorToast: 'Não foi possível criar o tipo.',
    deleteErrorToast: 'Não foi possível remover.',
    emptyNomeError:   'Nome não pode ser vazio.',
  },
  'en': {
    headerTitle:      'Settings',
    headerSubtitle:   'Administrative system settings.',
    tiposSectionTitle: 'Project types',
    tiposSectionHint:  'Used when creating a new project and in the projects list filter.',
    placeholderNovoTipo: 'New type name',
    addTipo:          'Add',
    deleteTipo:       'Remove type',
    createdToast:     'Type created.',
    renameSavedToast: 'Type updated.',
    renameErrorToast: 'Could not rename.',
    createErrorToast: 'Could not create the type.',
    deleteErrorToast: 'Could not remove.',
    emptyNomeError:   'Name cannot be empty.',
  },
  'es': {
    headerTitle:      'Configuración',
    headerSubtitle:   'Ajustes administrativos del sistema.',
    tiposSectionTitle: 'Tipos de proyecto',
    tiposSectionHint:  'Usados al crear un proyecto nuevo y en el filtro de la lista de proyectos.',
    placeholderNovoTipo: 'Nombre del nuevo tipo',
    addTipo:          'Agregar',
    deleteTipo:       'Quitar tipo',
    createdToast:     'Tipo creado.',
    renameSavedToast: 'Tipo actualizado.',
    renameErrorToast: 'No se pudo renombrar.',
    createErrorToast: 'No se pudo crear el tipo.',
    deleteErrorToast: 'No se pudo quitar.',
    emptyNomeError:   'El nombre no puede estar vacío.',
  },
}
