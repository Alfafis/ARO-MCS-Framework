import type { Lang } from './LangContext'

export const tiposProjetoT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
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
    headerTitle:      'Tipos de Projeto',
    headerSubtitle:   'Usados ao criar um projeto novo e no filtro da lista de projetos.',
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
    headerTitle:      'Project Types',
    headerSubtitle:   'Used when creating a new project and in the projects list filter.',
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
    headerTitle:      'Tipos de Proyecto',
    headerSubtitle:   'Usados al crear un proyecto nuevo y en el filtro de la lista de proyectos.',
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
