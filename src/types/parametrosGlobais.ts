export type ParametroGlobalChave = 'inflacao_ipca' | 'cambio_usd_brl' | 'selic'

// 'manual' inclui o estado seed ("nunca atualizado", valor=0) — UI distingue
// os dois por valor, não por fonte (ver ParametrosGlobaisSection).
export interface ParametroGlobal {
  chave:        ParametroGlobalChave
  valor:        number
  fonte:        'bcb-sgs' | 'manual'
  serieBcb:     number | null
  atualizadoEm: string
}
