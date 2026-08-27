import type { ParametroGlobalRow, ParametroAnualRow } from '@/types'

// Câmbio é o único parâmetro "spot" que sobrou aqui — inflação e Selic viraram
// tabela ano-a-ano (ver ParametroAnual abaixo, Subsistema A2). Câmbio não tem
// tabela ano-a-ano pedida, e não alimenta computeMonetaryValues de qualquer forma.
export type ParametroGlobalChave = 'cambio_usd_brl'

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

// --- Parâmetros anuais (Subsistema A2) ---------------------------------------
// Inflação e Selic entram como tabela ano-a-ano (min/max), 20 linhas fixas —
// "ano" é relativo ao horizonte de cada projeto (ano 1 = 1º ano de fechamento
// daquele projeto), não ano-calendário. Ver
// specs/2026-08-23-parametros-anuais-design.md.

export type ParametroAnualChave = 'inflacao_ipca' | 'selic'

export interface ParametroAnual {
  chave:        ParametroAnualChave
  ano:          number
  valorMin:     number | null
  valorMax:     number | null
  fonte:        'bcb-sgs' | 'manual'
  atualizadoEm: string
}

export function mapParametroAnualRow(row: ParametroAnualRow): ParametroAnual {
  return {
    chave: row.chave as ParametroAnualChave,
    ano: row.ano,
    valorMin: row.valor_min === null ? null : Number(row.valor_min),
    valorMax: row.valor_max === null ? null : Number(row.valor_max),
    fonte: row.fonte as ParametroAnual['fonte'],
    atualizadoEm: row.atualizado_em,
  }
}

// Sequência de taxas (fração, ex: 0.044 = 4,4%) do `anoBase` até
// `anoBase + horizonYears - 1`, usando o ponto médio (min+max)/2 de cada ano.
// `null` se QUALQUER ano dentro do horizonte não tiver min E max preenchidos
// — nunca calcula com buraco no meio (silenciosamente errado é pior que método
// ausente, mesmo princípio de "dado não disponível: ocultar, nunca mockar").
//
// `ano` aqui é ano-calendário absoluto (migration 20260827120000), não relativo
// ao projeto. Callers precisam passar `anoBase = ano-calendário do 1º ano do
// horizonte do projeto` (tipicamente derivado de `projeto.dataBase`).
export function sequenciaMidpoints(parametrosAnuais: ParametroAnual[], chave: ParametroAnualChave, anoBase: number, horizonYears: number): number[] | null {
  if (!Number.isFinite(anoBase)) return null
  const porAno = new Map(parametrosAnuais.filter(p => p.chave === chave).map(p => [p.ano, p]))
  const sequencia: number[] = []
  for (let ano = anoBase; ano < anoBase + horizonYears; ano++) {
    const p = porAno.get(ano)
    if (!p || p.valorMin === null || p.valorMax === null) return null
    sequencia.push((p.valorMin + p.valorMax) / 2 / 100)
  }
  return sequencia
}
