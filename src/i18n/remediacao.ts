import type { Lang } from './LangContext'

export const remediacaoT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    disabledStateTitle: string
    disabledStateBody: string
    disabledStateEnable: string
    emptyStateTitle: string
    emptyStateBody: string
    emptyStateSeed: string
    emptyStateAddManual: string
    addCategoria: string
    addItem: string
    totalGeral: string
    moduleTag: string
    colDescricao: string
    colUnidade: string
    colQuantidade: string
    colCustoUnitMin: string
    colCustoUnitMax: string
    colTotal: string
    colFonte: string
    colActions: string
    categoriaArea: string
    categoriaNome: string
    categoriaTotal: string
    categoriaRemove: string
    itemRemove: string
    removeCategoriaConfirm: string
    removeItemConfirm: string
    configToggleLabel: string
    configToggleHint: string
    revisionIncludeLabel: string
    revisionIncludeHint: string
  }
> = {
  'pt-BR': {
    headerTitle: 'Remediação',
    headerSubtitle: 'Escopo alternativo — não entra no provisionamento principal.',
    disabledStateTitle: 'Módulo de remediação desabilitado',
    disabledStateBody:
      'Este módulo cobre investigação e reabilitação de áreas contaminadas, barragens de rejeitos e planta de tratamento. Fica separado do provisionamento principal e é opcional por projeto.',
    disabledStateEnable: 'Habilitar módulo de remediação',
    emptyStateTitle: 'Nenhuma categoria de remediação cadastrada',
    emptyStateBody: 'Carregue o modelo de referência (solo, barragem, planta de tratamento) ou adicione manualmente.',
    emptyStateSeed: 'Carregar modelo de referência',
    emptyStateAddManual: 'Adicionar categoria manualmente',
    addCategoria: 'Nova categoria',
    addItem: 'Novo item',
    totalGeral: 'Total do módulo',
    moduleTag: 'Escopo alternativo',
    colDescricao: 'Descrição',
    colUnidade: 'Unid.',
    colQuantidade: 'Qtd.',
    colCustoUnitMin: 'Custo unit. mín.',
    colCustoUnitMax: 'Custo unit. máx.',
    colTotal: 'Total',
    colFonte: 'Fonte',
    colActions: 'Ações',
    categoriaArea: 'Área (ha)',
    categoriaNome: 'Nome da categoria',
    categoriaTotal: 'Subtotal',
    categoriaRemove: 'Remover categoria',
    itemRemove: 'Remover item',
    removeCategoriaConfirm: 'Remover essa categoria remove também todos os itens dela. Confirma?',
    removeItemConfirm: 'Remover este item?',
    configToggleLabel: 'Habilitar módulo de Remediação',
    configToggleHint:
      'Quando habilitado, o projeto ganha uma aba "Remediação" no workspace com categorias e itens em modelo próprio (quantidade × custo unitário). Não afeta o provisionamento principal.',
    revisionIncludeLabel: 'Incluir remediação nesta revisão',
    revisionIncludeHint:
      'Se marcada, o portal público exibe uma seção adicional com os dados de remediação quando esta revisão estiver vigente.',
  },
  en: {
    headerTitle: 'Remediation',
    headerSubtitle: 'Alternative scope — not part of the main provisioning.',
    disabledStateTitle: 'Remediation module disabled',
    disabledStateBody:
      'This module covers investigation and rehabilitation of contaminated areas, tailings dams and treatment plant. It stays separate from the main provisioning and is opt-in per project.',
    disabledStateEnable: 'Enable remediation module',
    emptyStateTitle: 'No remediation categories registered yet',
    emptyStateBody: 'Load the reference model (soil, dam, treatment plant) or add manually.',
    emptyStateSeed: 'Load reference model',
    emptyStateAddManual: 'Add category manually',
    addCategoria: 'New category',
    addItem: 'New item',
    totalGeral: 'Module total',
    moduleTag: 'Alternative scope',
    colDescricao: 'Description',
    colUnidade: 'Unit',
    colQuantidade: 'Qty',
    colCustoUnitMin: 'Min unit cost',
    colCustoUnitMax: 'Max unit cost',
    colTotal: 'Total',
    colFonte: 'Source',
    colActions: 'Actions',
    categoriaArea: 'Area (ha)',
    categoriaNome: 'Category name',
    categoriaTotal: 'Subtotal',
    categoriaRemove: 'Remove category',
    itemRemove: 'Remove item',
    removeCategoriaConfirm: 'Removing this category will also remove all its items. Confirm?',
    removeItemConfirm: 'Remove this item?',
    configToggleLabel: 'Enable Remediation module',
    configToggleHint:
      'When enabled, the project gains a "Remediation" tab in the workspace with categories and items in a dedicated model (quantity × unit cost). It does not affect the main provisioning.',
    revisionIncludeLabel: 'Include remediation in this revision',
    revisionIncludeHint:
      'If checked, the public portal will show an additional remediation section when this revision is the current one.',
  },
  es: {
    headerTitle: 'Remediación',
    headerSubtitle: 'Alcance alternativo — no forma parte del provisionamiento principal.',
    disabledStateTitle: 'Módulo de remediación deshabilitado',
    disabledStateBody:
      'Este módulo cubre investigación y rehabilitación de áreas contaminadas, presas de residuos y planta de tratamiento. Permanece separado del provisionamiento principal y es opcional por proyecto.',
    disabledStateEnable: 'Habilitar módulo de remediación',
    emptyStateTitle: 'Ninguna categoría de remediación registrada',
    emptyStateBody: 'Carga el modelo de referencia (suelo, presa, planta de tratamiento) o agrega manualmente.',
    emptyStateSeed: 'Cargar modelo de referencia',
    emptyStateAddManual: 'Agregar categoría manualmente',
    addCategoria: 'Nueva categoría',
    addItem: 'Nuevo ítem',
    totalGeral: 'Total del módulo',
    moduleTag: 'Alcance alternativo',
    colDescricao: 'Descripción',
    colUnidade: 'Unid.',
    colQuantidade: 'Cant.',
    colCustoUnitMin: 'Costo unit. mín.',
    colCustoUnitMax: 'Costo unit. máx.',
    colTotal: 'Total',
    colFonte: 'Fuente',
    colActions: 'Acciones',
    categoriaArea: 'Área (ha)',
    categoriaNome: 'Nombre de la categoría',
    categoriaTotal: 'Subtotal',
    categoriaRemove: 'Remover categoría',
    itemRemove: 'Remover ítem',
    removeCategoriaConfirm: 'Al remover esta categoría también se remueven todos sus ítems. ¿Confirmar?',
    removeItemConfirm: '¿Remover este ítem?',
    configToggleLabel: 'Habilitar módulo de Remediación',
    configToggleHint:
      'Cuando está habilitado, el proyecto gana una pestaña "Remediación" en el workspace con categorías e ítems en modelo propio (cantidad × costo unitario). No afecta el provisionamiento principal.',
    revisionIncludeLabel: 'Incluir remediación en esta revisión',
    revisionIncludeHint:
      'Si se marca, el portal público mostrará una sección adicional con datos de remediación cuando esta revisión sea la vigente.',
  },
}
