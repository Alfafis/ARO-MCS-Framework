import type { ParametroGlobalChave } from '@/types/parametrosGlobais'

// Séries do SGS (Banco Central) — 433 é IPCA MENSAL, não usar: 0,07% em
// julho/2026 é 60x menor que a taxa anual real (13522 devolveu 4,44% no
// mesmo mês). Confirmado com chamada real à API antes de escrever esta spec.
export const SERIE_BCB: Record<ParametroGlobalChave, number> = {
  inflacao_ipca: 13522, // IPCA acumulado 12 meses
  cambio_usd_brl: 1,    // PTAX dólar venda
  selic: 432,           // Meta Selic vigente
}

const TIMEOUT_MS = 8000

export async function buscarValorBcb(serie: number): Promise<number> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`,
      { signal: controller.signal }
    )
    if (!res.ok) throw new Error(`BCB respondeu ${res.status}`)
    const data = await res.json() as { valor: string }[]
    if (!data[0]) throw new Error('BCB não retornou dado pra esta série')
    // Formato do BCB usa ponto decimal (confirmado: "0.07", "4.44", "5.1625") —
    // Number() direto, sem a conversão de vírgula que outras telas fazem pra input BR.
    return Number(data[0].valor)
  } finally {
    clearTimeout(timeout)
  }
}
