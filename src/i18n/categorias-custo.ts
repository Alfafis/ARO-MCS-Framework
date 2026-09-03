import type { Lang } from './LangContext'

export const categoriasCustoT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    addCategoriaBtn: string
    addCategoriaErrorToast: string
    removeCategoriaErrorToast: string
    saveErrorToast: string
    renameSavedToast: string
    renameErrorToast: string
    empty: string
    selectTypeHint: string
  }
> = {
  'pt-BR': {
    headerTitle: 'Categorias de Custo',
    headerSubtitle:
      'Categorias e itens padrão oferecidos como exemplo ao criar um projeto desse tipo — editáveis aqui, sem afetar projetos já criados.',
    addCategoriaBtn: '+ Categoria',
    addCategoriaErrorToast: 'Não foi possível criar a categoria.',
    removeCategoriaErrorToast: 'Não foi possível remover a categoria.',
    saveErrorToast: 'Não foi possível salvar.',
    renameSavedToast: 'Categoria renomeada — vale pra todos os projetos que usam esse nome.',
    renameErrorToast: 'Já existe uma categoria com esse nome.',
    empty: 'Nenhuma categoria de template ainda para este tipo.',
    selectTypeHint: 'Selecione um tipo de projeto pra ver e editar as categorias padrão dele.',
  },
  en: {
    headerTitle: 'Cost Categories',
    headerSubtitle:
      "Default categories and items offered as an example when creating a project of this type — editable here, doesn't affect existing projects.",
    addCategoriaBtn: '+ Category',
    addCategoriaErrorToast: 'Could not create the category.',
    removeCategoriaErrorToast: 'Could not remove the category.',
    saveErrorToast: 'Could not save.',
    renameSavedToast: 'Category renamed — applies to every project using that name.',
    renameErrorToast: 'A category with that name already exists.',
    empty: 'No template category yet for this type.',
    selectTypeHint: 'Select a project type to see and edit its default categories.',
  },
  es: {
    headerTitle: 'Categorías de Costo',
    headerSubtitle:
      'Categorías e ítems predeterminados ofrecidos como ejemplo al crear un proyecto de ese tipo — editables aquí, no afecta proyectos ya creados.',
    addCategoriaBtn: '+ Categoría',
    addCategoriaErrorToast: 'No se pudo crear la categoría.',
    removeCategoriaErrorToast: 'No se pudo quitar la categoría.',
    saveErrorToast: 'No se pudo guardar.',
    renameSavedToast: 'Categoría renombrada — aplica a todos los proyectos que usan ese nombre.',
    renameErrorToast: 'Ya existe una categoría con ese nombre.',
    empty: 'Todavía no hay categoría de plantilla para este tipo.',
    selectTypeHint: 'Selecciona un tipo de proyecto para ver y editar sus categorías predeterminadas.',
  },
}
