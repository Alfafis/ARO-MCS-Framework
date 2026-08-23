import type { ParametroGlobalRow } from '@/types'

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

// "Nunca configurado" (seed) e "configurado manualmente como zero" são estados
// diferentes, mas o schema não distingue — valor=0 com fonte='manual' é o único
// jeito de representar "nunca tocado" (câmbio nunca é 0 de verdade, mas
// inflação/Selic hipoteticamente podem ser, então checar só `valor===0` mentiria).
export function isNaoConfigurado(p: ParametroGlobal): boolean {
  return p.valor === 0 && p.fonte === 'manual'
}

export function buscarParametro(parametros: ParametroGlobal[], chave: ParametroGlobalChave): number | null {
  const p = parametros.find(param => param.chave === chave)
  if (!p || isNaoConfigurado(p)) return null
  return p.valor
}

export function mapParametroGlobalRow(row: ParametroGlobalRow): ParametroGlobal {
  return {
    chave: row.chave as ParametroGlobalChave,
    valor: Number(row.valor),
    fonte: row.fonte as ParametroGlobal['fonte'],
    serieBcb: row.serie_bcb,
    atualizadoEm: row.atualizado_em,
  }
}
