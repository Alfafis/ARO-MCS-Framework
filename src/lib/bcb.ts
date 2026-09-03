import type { ParametroGlobalChave, ParametroAnualChave } from '@/types/parametrosGlobais'

// Séries do SGS (Banco Central) — 433 é IPCA MENSAL, não usar: 0,07% em
// julho/2026 é 60x menor que a taxa anual real (13522 devolveu 4,44% no
// mesmo mês). Confirmado com chamada real à API antes de escrever esta spec.
export const SERIE_BCB: Record<ParametroGlobalChave, number> = {
  cambio_usd_brl: 1, // PTAX dólar venda
}

// API do BCB só devolve valor spot/histórico, nunca projeção futura — "atualizar
// da API" pros parâmetros anuais preenche só o ano 1 (min=max=spot); anos 2-20
// são sempre entrada manual (mesma decisão já registrada na spec de A2).
export const SERIE_BCB_ANUAL: Record<ParametroAnualChave, number> = {
  inflacao_ipca: 13522, // IPCA acumulado 12 meses
  selic: 432, // Meta Selic vigente
}

// Boletim Focus (Expectativas de Mercado, API Olinda/OData) — consenso de
// mercado ano-a-ano, não série histórica como o SGS. Só publica projeção pros
// próximos ~5 anos (confirmado com chamada real: hoje 2026-09-03 devolve
// 2026..2030) — anos além disso continuam sempre manuais, mesma decisão já
// registrada pro ano 1 via SGS, agora estendida pro que o mercado realmente
// projeta.
const FOCUS_INDICADOR: Record<ParametroAnualChave, string> = {
  inflacao_ipca: 'IPCA',
  selic: 'Selic',
}

const TIMEOUT_MS = 8000

// baseCalculo=0 é o cálculo padrão (toda a base de respondentes) — a série
// também publica baseCalculo=1 (só últimos 30 dias) pro MESMO ano/data, que
// duplicaria a linha se não filtrado. Mediana (não Média) é o número
// manchete que o próprio Boletim Focus destaca.
export async function buscarProjecoesFocus(chave: ParametroAnualChave): Promise<Map<number, number>> {
  const indicador = FOCUS_INDICADOR[chave]
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const url =
      'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais' +
      `?$top=40&$filter=Indicador eq '${indicador}' and baseCalculo eq 0&$orderby=Data desc&$format=json`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Focus respondeu ${res.status}`)
    const data = (await res.json()) as { value: { DataReferencia: string; Mediana: number }[] }
    // Ordenado por Data desc — primeira ocorrência de cada ano é a projeção
    // mais recente (múltiplos dias de pesquisa podem aparecer no top 40).
    const porAno = new Map<number, number>()
    for (const row of data.value) {
      const ano = Number(row.DataReferencia)
      if (!porAno.has(ano)) porAno.set(ano, row.Mediana)
    }
    return porAno
  } finally {
    clearTimeout(timeout)
  }
}

export async function buscarValorBcb(serie: number): Promise<number> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`, {
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`BCB respondeu ${res.status}`)
    const data = (await res.json()) as { valor: string }[]
    if (!data[0]) throw new Error('BCB não retornou dado pra esta série')
    // Formato do BCB usa ponto decimal (confirmado: "0.07", "4.44", "5.1625") —
    // Number() direto, sem a conversão de vírgula que outras telas fazem pra input BR.
    return Number(data[0].valor)
  } finally {
    clearTimeout(timeout)
  }
}
