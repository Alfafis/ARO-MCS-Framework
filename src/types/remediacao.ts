// Módulo Remediação — escopo alternativo do projeto (áreas contaminadas,
// barragem de rejeitos, planta de tratamento). Modelado com quantidade × custo
// unitário, diferente das categorias principais que usam min/max direto por
// item. Não entra no cálculo do provisionamento principal (Aro Simulação, Sensibilidade,
// Ancoragem, Curva de Desembolso) — vive em rota própria `/projetos/:id/remediacao`.

export interface CategoriaRemediacao {
  id: string
  projetoId: string
  nome: string
  areaHa: number | null
  ordem: number
  items: ItemRemediacao[]
}

export interface ItemRemediacao {
  id: string
  categoriaId: string
  descricao: string
  unidade: string
  quantidade: number
  custoUnitMin: number
  custoUnitMax: number
  fonte: string | null
  ordem: number
}

// Rows do banco (snake_case) → tipos do frontend (camelCase).
export interface CategoriaRemediacaoRow {
  id: string
  projeto_id: string
  nome: string
  area_ha: number | null
  ordem: number
}

export interface ItemRemediacaoRow {
  id: string
  categoria_id: string
  descricao: string
  unidade: string
  quantidade: number | string
  custo_unit_min: number | string
  custo_unit_max: number | string
  fonte: string | null
  ordem: number
}

const toNumber = (v: number | string | null | undefined): number => {
  if (v == null) return 0
  if (typeof v === 'number') return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function mapCategoriaRemediacaoRow(
  row: CategoriaRemediacaoRow,
  items: ItemRemediacao[] = []
): CategoriaRemediacao {
  return {
    id: row.id,
    projetoId: row.projeto_id,
    nome: row.nome,
    areaHa: row.area_ha != null ? toNumber(row.area_ha) : null,
    ordem: row.ordem,
    items,
  }
}

export function mapItemRemediacaoRow(row: ItemRemediacaoRow): ItemRemediacao {
  return {
    id: row.id,
    categoriaId: row.categoria_id,
    descricao: row.descricao,
    unidade: row.unidade,
    quantidade: toNumber(row.quantidade),
    custoUnitMin: toNumber(row.custo_unit_min),
    custoUnitMax: toNumber(row.custo_unit_max),
    fonte: row.fonte,
    ordem: row.ordem,
  }
}

// Template administrável (`/remediacao-padrao`) — mesmo shape das versões
// por-projeto, sem `projetoId`/`categoriaId` reais (a FK aponta pro template,
// não pro projeto). `carregar_remediacao_padrao` copia daqui pra
// categorias_remediacao/itens_remediacao no primeiro acesso de cada projeto.
export interface CategoriaRemediacaoTemplate {
  id: string
  nome: string
  areaHa: number | null
  ordem: number
  items: ItemRemediacaoTemplate[]
}

export interface ItemRemediacaoTemplate {
  id: string
  categoriaTemplateId: string
  descricao: string
  unidade: string
  quantidade: number
  custoUnitMin: number
  custoUnitMax: number
  fonte: string | null
  ordem: number
}

export interface CategoriaRemediacaoTemplateRow {
  id: string
  nome: string
  area_ha: number | null
  ordem: number
}

export interface ItemRemediacaoTemplateRow {
  id: string
  categoria_template_id: string
  descricao: string
  unidade: string
  quantidade: number | string
  custo_unit_min: number | string
  custo_unit_max: number | string
  fonte: string | null
  ordem: number
}

export function mapCategoriaRemediacaoTemplateRow(
  row: CategoriaRemediacaoTemplateRow,
  items: ItemRemediacaoTemplate[] = []
): CategoriaRemediacaoTemplate {
  return {
    id: row.id,
    nome: row.nome,
    areaHa: row.area_ha != null ? toNumber(row.area_ha) : null,
    ordem: row.ordem,
    items,
  }
}

export function mapItemRemediacaoTemplateRow(row: ItemRemediacaoTemplateRow): ItemRemediacaoTemplate {
  return {
    id: row.id,
    categoriaTemplateId: row.categoria_template_id,
    descricao: row.descricao,
    unidade: row.unidade,
    quantidade: toNumber(row.quantidade),
    custoUnitMin: toNumber(row.custo_unit_min),
    custoUnitMax: toNumber(row.custo_unit_max),
    fonte: row.fonte,
    ordem: row.ordem,
  }
}

// Assinatura estrutural (Pick), não o tipo concreto — reaproveitada tanto por
// ItemRemediacao (por-projeto) quanto ItemRemediacaoTemplate (admin), que têm
// os mesmos campos de cálculo com FK diferente.
type ItemComCusto = Pick<ItemRemediacao, 'quantidade' | 'custoUnitMin' | 'custoUnitMax'>
type CategoriaComItens = { items: ItemComCusto[] }

// Ponto médio do custo unitário — coerente com o padrão do resto do sistema
// (Triangular usa (min+mode+max)/3, aqui mode não existe, então (min+max)/2).
export const custoUnitMedio = (item: ItemComCusto): number => (item.custoUnitMin + item.custoUnitMax) / 2

// Custo total por item = quantidade × custo unitário médio.
export const custoTotalItem = (item: ItemComCusto): number => item.quantidade * custoUnitMedio(item)

// Total da categoria = soma dos custos totais dos itens.
export const custoTotalCategoria = (cat: CategoriaComItens): number =>
  cat.items.reduce((acc, i) => acc + custoTotalItem(i), 0)

// Total geral do módulo — soma das categorias.
export const custoTotalRemediacao = (categorias: CategoriaComItens[]): number =>
  categorias.reduce((acc, c) => acc + custoTotalCategoria(c), 0)
