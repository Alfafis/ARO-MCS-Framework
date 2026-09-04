import { createContext } from 'react'
import type {
  Category,
  CategoryItem,
  CategoriaCatalogo,
  CampoOperacional,
  CampoOperacionalTemplate,
} from '@/types/categorias'
import type { Cliente, Projeto } from '@/types/clientes'
import type {
  ParametroGlobal,
  ParametroGlobalChave,
  ParametroAnual,
  ParametroAnualChave,
} from '@/types/parametrosGlobais'
import type { TipoProjeto } from '@/types/tiposProjeto'
import type { Setor } from '@/types/setores'
import type {
  CategoriaRemediacao,
  ItemRemediacao,
  CategoriaRemediacaoTemplate,
  ItemRemediacaoTemplate,
} from '@/types/remediacao'

export interface NovoProjetoForm {
  clienteId: string
  projeto: string
  tipoProjetoId: string
}

export interface ConfigFinanceiraForm {
  moeda: string
  dataBase: string
  horizonteAnos: number
  metodoAtualizacao: string
  contingenciaPct: number
}

export interface ProjetoContextValue {
  loading: boolean
  clientes: Cliente[]
  criarCliente: (nome: string) => Promise<string>
  tiposProjeto: TipoProjeto[]
  criarTipoProjeto: (nome: string) => Promise<TipoProjeto>
  renomearTipoProjeto: (id: string, novoNome: string) => Promise<void>
  removerTipoProjeto: (id: string) => Promise<void>
  catalogo: CategoriaCatalogo[]
  renomearCategoriaCatalogo: (catalogoId: string, novoNome: string) => Promise<void>
  setores: Setor[]
  // Setores admin (rota `/setores`) — CRUD direto via supabase.from, mesmo
  // padrão de `campos_operacionais_template`. RLS aplicada em migration
  // 20260830170905_setores_admin_rls.
  addSetor: (id: number, nome: string) => Promise<void>
  renomearSetor: (id: number, nome: string) => Promise<void>
  removerSetor: (id: number) => Promise<void>
  // Remediação (rota `/projetos/:id/remediacao`) — escopo alternativo.
  // Categorias/itens carregados sob demanda (lazy) via `fetchRemediacao`,
  // não no boot. Estado local: `remediacaoByProjeto[projetoId]`.
  remediacaoByProjeto: Record<string, CategoriaRemediacao[]>
  remediacaoLoading: boolean
  fetchRemediacao: (projetoId: string) => Promise<void>
  setRemediacaoHabilitada: (projetoId: string, habilitada: boolean) => Promise<void>
  carregarRemediacaoPadrao: (projetoId: string) => Promise<void>
  addRemediacaoCategoria: (projetoId: string, nome: string, areaHa: number | null) => Promise<void>
  updateRemediacaoCategoria: (
    id: string,
    patch: Partial<Pick<CategoriaRemediacao, 'nome' | 'areaHa' | 'ordem'>>
  ) => Promise<void>
  removeRemediacaoCategoria: (projetoId: string, id: string) => Promise<void>
  addRemediacaoItem: (categoriaId: string) => Promise<void>
  updateRemediacaoItem: (
    id: string,
    patch: Partial<
      Pick<ItemRemediacao, 'descricao' | 'unidade' | 'quantidade' | 'custoUnitMin' | 'custoUnitMax' | 'fonte' | 'ordem'>
    >
  ) => Promise<void>
  removeRemediacaoItem: (categoriaId: string, id: string) => Promise<void>
  // Template administrável de Remediação (rota `/remediacao-padrao`) —
  // conjunto único global, sem key por projeto (diferente de
  // `remediacaoByProjeto`). undefined = ainda não buscado.
  remediacaoTemplate: CategoriaRemediacaoTemplate[] | undefined
  remediacaoTemplateLoading: boolean
  fetchRemediacaoTemplate: () => Promise<void>
  addRemediacaoTemplateCategoria: (nome: string, areaHa: number | null) => Promise<void>
  updateRemediacaoTemplateCategoria: (
    id: string,
    patch: Partial<Pick<CategoriaRemediacaoTemplate, 'nome' | 'areaHa' | 'ordem'>>
  ) => Promise<void>
  removeRemediacaoTemplateCategoria: (id: string) => Promise<void>
  addRemediacaoTemplateItem: (categoriaId: string) => Promise<void>
  updateRemediacaoTemplateItem: (
    id: string,
    patch: Partial<
      Pick<
        ItemRemediacaoTemplate,
        'descricao' | 'unidade' | 'quantidade' | 'custoUnitMin' | 'custoUnitMax' | 'fonte' | 'ordem'
      >
    >
  ) => Promise<void>
  removeRemediacaoTemplateItem: (categoriaId: string, id: string) => Promise<void>
  parametrosGlobais: ParametroGlobal[]
  atualizarParametroGlobal: (
    chave: ParametroGlobalChave,
    valor: number,
    fonte: ParametroGlobal['fonte'],
    serieBcb: number | null
  ) => Promise<void>
  parametrosAnuais: ParametroAnual[]
  atualizarParametroAnual: (
    chave: ParametroAnualChave,
    ano: number,
    valorMin: number | null,
    valorMax: number | null,
    fonte: ParametroAnual['fonte']
  ) => Promise<void>
  tiposComTemplate: string[]
  templates: Record<string, Category[]>
  fetchTemplateCategorias: (tipoProjetoId: string) => Promise<void>
  templateAddCategoria: (tipoProjetoId: string) => Promise<void>
  templateRemoveCategoria: (tipoProjetoId: string, catId: string) => Promise<void>
  templateUpdateCategoria: (
    tipoProjetoId: string,
    catId: string,
    field: keyof Category,
    value: string | boolean
  ) => Promise<void>
  templateAddItem: (tipoProjetoId: string, catId: string) => Promise<void>
  templateRemoveItem: (tipoProjetoId: string, catId: string, itemId: string) => Promise<void>
  templateUpdateItem: (
    tipoProjetoId: string,
    catId: string,
    itemId: string,
    field: keyof CategoryItem,
    value: unknown
  ) => void
  templateSaveItem: (itemId: string, field: keyof CategoryItem, value: unknown) => Promise<void>
  // Campos operacionais template (Perímetro/Área/Volume/…): CRUD via supabase
  // direto, sem RPC — mesmo padrão de `setores`. Só usado em /categorias-custo.
  templateAddCampoOp: (tipoProjetoId: string, catId: string) => Promise<void>
  templateRemoveCampoOp: (tipoProjetoId: string, catId: string, campoId: string) => Promise<void>
  templateUpdateCampoOp: (
    tipoProjetoId: string,
    catId: string,
    campoId: string,
    field: keyof CampoOperacionalTemplate,
    value: string
  ) => void
  templateSaveCampoOp: (campoId: string, field: keyof CampoOperacionalTemplate, value: string) => Promise<void>
  projetos: Projeto[]
  criarProjeto: (form: NovoProjetoForm) => Promise<string>
  carregarTemplateExemplo: (projetoId: string, tipoProjetoId: string) => Promise<void>
  arquivarProjeto: (id: string) => Promise<void>
  concluirProjeto: (id: string) => Promise<void>
  atualizarConfigFinanceira: (projetoId: string, form: ConfigFinanceiraForm) => Promise<void>
  addCategoria: (projetoId: string) => Promise<void>
  removeCategoria: (projetoId: string, catId: string) => Promise<void>
  updateCategoria: (projetoId: string, catId: string, field: keyof Category, value: string | boolean) => Promise<void>
  addItem: (projetoId: string, catId: string) => Promise<void>
  removeItem: (projetoId: string, catId: string, itemId: string) => Promise<void>
  // `value` é `unknown` para acomodar os campos novos que não são string:
  // aplicabilidadeSetores (number[] | null), anoInicio/anoFim (number | null),
  // fase (Fase | null). Fields legados continuam recebendo string.
  updateItem: (projetoId: string, catId: string, itemId: string, field: keyof CategoryItem, value: unknown) => void
  saveItem: (itemId: string, field: keyof CategoryItem, value: unknown) => Promise<void>
  // Campos operacionais do projeto (herdados do template ao carregar, editáveis
  // pelo consultor). Padrão idêntico aos template*: add/remove no banco, update
  // só state local, save em blur. Status pendente/preenchido = toggle explícito.
  addCampoOp: (projetoId: string, catId: string) => Promise<void>
  removeCampoOp: (projetoId: string, catId: string, campoId: string) => Promise<void>
  updateCampoOp: (
    projetoId: string,
    catId: string,
    campoId: string,
    field: keyof CampoOperacional,
    value: string
  ) => void
  saveCampoOp: (campoId: string, field: keyof CampoOperacional, value: string) => Promise<void>
  // Desembolso ano-a-ano por item — array `[{ano, valor}]`, upsert+delete
  // atômico. Item de projeto vs. template.
  updateItemDesembolso: (
    projetoId: string,
    catId: string,
    itemId: string,
    valores: { ano: number; valor: number }[]
  ) => Promise<void>
  templateUpdateItemDesembolso: (
    tipoProjetoId: string,
    catId: string,
    itemId: string,
    valores: { ano: number; valor: number }[]
  ) => Promise<void>
  // Custo provável (moda "pela experiência") por categoria. null = fallback (min+max)/2 na Aro Simulação.
  updateCategoriaCustoProvavel: (projetoId: string, catId: string, valor: number | null) => Promise<void>
  templateUpdateCategoriaCustoProvavel: (tipoProjetoId: string, catId: string, valor: number | null) => Promise<void>
  // Publicar revisão (Revisoes.tsx) já persiste projetos.rev no banco via RPC —
  // isso só sincroniza o state local pro badge (ProjetoWorkspace) atualizar sem F5.
  atualizarRevLocal: (projetoId: string, rev: string) => void
}

export const ProjetoContext = createContext<ProjetoContextValue | null>(null)
