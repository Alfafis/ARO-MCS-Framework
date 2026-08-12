export type ProjStatus = 'andamento' | 'aguardando' | 'concluido'
export type FilterTab  = 'all' | ProjStatus

export interface Projeto {
  id:         string
  initials:   string
  projeto:    string
  cliente:    string
  status:     ProjStatus
  rev:        string
  esperado:   string
  atualizado: string
  highlight:  boolean
}
