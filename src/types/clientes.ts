import type { Category } from './categorias'

export type ProjStatus = 'andamento' | 'aguardando' | 'concluido'
export type FilterTab = 'all' | ProjStatus

export interface Cliente {
  id: string
  nome: string
  initials: string
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
  horizonteAnos: number
  metodoAtualizacao: string
  contingenciaPct: number
  remediacaoHabilitada: boolean
  categorias: Category[]
}
