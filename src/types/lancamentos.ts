export type LancStatus = 'validado' | 'revisao' | 'pendente'
export type FilterTab = 'all' | LancStatus
export type IconKey = 'barragem' | 'monitoramento' | 'cavas' | 'default'

export interface Lancamento {
  id: string
  categoria: string
  anexo: string
  periodo: string
  valor: number
  status: LancStatus
  iconKey: IconKey
  highlight: boolean
}
