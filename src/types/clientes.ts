import type { Category } from './categorias'

export type ProjStatus = 'andamento' | 'aguardando' | 'concluido'
export type FilterTab = 'all' | ProjStatus

export interface Cliente {
  id: string
  nome: string
  initials: string
  email: string | null
}

export interface Projeto {
  id: string
  clienteId: string
  projeto: string
  status: ProjStatus
  rev: string
  esperado: string
  atualizado: string
  atualizadoEm: string // ISO cru — atualizado é formatado (relativo), não ordenável
  highlight: boolean
  // Dados de cadastro — nascem no fluxo "Novo projeto", editáveis depois em Categorias.
  tipoProjetoId: string
  moeda: string
  dataBase: string
  // Ano em que os valores dos itens de custo do projeto estão expressos —
  // default = ano corrente na criação. Se o consultor cadastrou os valores
  // em ano anterior à data-base, sobrescreve na aba Configurações pra a
  // ancoragem IPCA calcular corretamente. Quando `anoReferencia == dataBase`
  // (ou > dataBase), o fator de ancoragem sai 1 e a badge some.
  anoReferencia: number
  horizonteAnos: number
  metodoAtualizacao: string
  contingenciaPct: number
  remediacaoHabilitada: boolean
  categorias: Category[]
}
