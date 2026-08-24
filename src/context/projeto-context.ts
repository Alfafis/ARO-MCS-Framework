import { createContext } from 'react'
import type { Category, CategoryItem, CategoriaCatalogo } from '@/types/categorias'
import type { Cliente, Projeto } from '@/types/clientes'
import type { ParametroGlobal, ParametroGlobalChave, ParametroAnual, ParametroAnualChave } from '@/types/parametrosGlobais'
import type { TipoProjeto } from '@/types/tiposProjeto'

export interface NovoProjetoForm {
  clienteId:     string
  projeto:       string
  tipoProjetoId: string
}

export interface ConfigFinanceiraForm {
  moeda:              string
  dataBase:           string
  horizonteAnos:      number
  metodoAtualizacao:  string
  contingenciaPct:    number
}

export interface ProjetoContextValue {
  loading:         boolean
  clientes:        Cliente[]
  criarCliente:    (nome: string) => Promise<string>
  tiposProjeto:      TipoProjeto[]
  criarTipoProjeto:    (nome: string) => Promise<TipoProjeto>
  renomearTipoProjeto: (id: string, novoNome: string) => Promise<void>
  removerTipoProjeto:  (id: string) => Promise<void>
  catalogo:        CategoriaCatalogo[]
  renomearCategoriaCatalogo: (catalogoId: string, novoNome: string) => Promise<void>
  parametrosGlobais: ParametroGlobal[]
  atualizarParametroGlobal: (chave: ParametroGlobalChave, valor: number, fonte: ParametroGlobal['fonte'], serieBcb: number | null) => Promise<void>
  parametrosAnuais: ParametroAnual[]
  atualizarParametroAnual: (chave: ParametroAnualChave, ano: number, valorMin: number | null, valorMax: number | null, fonte: ParametroAnual['fonte']) => Promise<void>
  tiposComTemplate: string[]
  templates:        Record<string, Category[]>
  fetchTemplateCategorias: (tipoProjetoId: string) => Promise<void>
  templateAddCategoria:    (tipoProjetoId: string) => Promise<void>
  templateRemoveCategoria: (tipoProjetoId: string, catId: string) => Promise<void>
  templateUpdateCategoria: (tipoProjetoId: string, catId: string, field: keyof Category, value: string | boolean) => Promise<void>
  templateAddItem:         (tipoProjetoId: string, catId: string) => Promise<void>
  templateRemoveItem:      (tipoProjetoId: string, catId: string, itemId: string) => Promise<void>
  templateUpdateItem:      (tipoProjetoId: string, catId: string, itemId: string, field: keyof CategoryItem, value: string) => void
  templateSaveItem:        (itemId: string, field: keyof CategoryItem, value: string) => Promise<void>
  projetos:        Projeto[]
  criarProjeto:    (form: NovoProjetoForm) => Promise<string>
  carregarTemplateExemplo: (projetoId: string, tipoProjetoId: string) => Promise<void>
  arquivarProjeto: (id: string) => Promise<void>
  concluirProjeto: (id: string) => Promise<void>
  atualizarConfigFinanceira: (projetoId: string, form: ConfigFinanceiraForm) => Promise<void>
  addCategoria:    (projetoId: string) => Promise<void>
  removeCategoria: (projetoId: string, catId: string) => Promise<void>
  updateCategoria: (projetoId: string, catId: string, field: keyof Category, value: string | boolean) => Promise<void>
  addItem:         (projetoId: string, catId: string) => Promise<void>
  removeItem:      (projetoId: string, catId: string, itemId: string) => Promise<void>
  updateItem:      (projetoId: string, catId: string, itemId: string, field: keyof CategoryItem, value: string) => void
  saveItem:        (itemId: string, field: keyof CategoryItem, value: string) => Promise<void>
  // Publicar revisão (Revisoes.tsx) já persiste projetos.rev no banco via RPC —
  // isso só sincroniza o state local pro badge (ProjetoWorkspace) atualizar sem F5.
  atualizarRevLocal: (projetoId: string, rev: string) => void
}

export const ProjetoContext = createContext<ProjetoContextValue | null>(null)
