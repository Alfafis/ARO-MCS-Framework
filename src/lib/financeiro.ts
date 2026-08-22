import type { Category } from '@/types/categorias'

const SIMPLE_RATE    = 0.1075
const COMPOUND_RATE  = 0.1075
const INFLATION_RATE = 0.034
const IPCA_RATES     = [0.034, 0.003, 0.028, 0.031, 0.040, 0.042, 0.050, 0.030, 0.0211, 0.034]
const HORIZON_YEARS  = 10

// [simples, compostos, inflação, IPCA] — valores brutos em R$
export function computeMonetaryValues(filteredBase: number): [number, number, number, number] {
  const n = HORIZON_YEARS
  const simpleInterest    = filteredBase * (1 + SIMPLE_RATE * n)
  const compoundInterest  = filteredBase * Math.pow(1 + COMPOUND_RATE, n)
  const constantInflation = filteredBase * Math.pow(1 + INFLATION_RATE, n)
  let ipcaFV = filteredBase
  for (const rate of IPCA_RATES) ipcaFV *= (1 + rate)
  return [simpleInterest, compoundInterest, constantInflation, ipcaFV]
}

// "R$ 1.234.567" ou "1.234.567,89" → 1234567(.89). Retorna 0 se não conseguir extrair número.
export function parseMoedaBR(str: string): number {
  const cleaned = str.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

// 32400000 → "R$ 32,4 M"
export function formatMoedaCompact(n: number): string {
  return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')} M`
}

// Inverso de parseMoedaBR — só pra re-exibir valor NUMERIC do banco no campo
// de texto livre. 0 vira '' (item novo/em branco), não "R$ 0,00".
export function formatMoedaBR(n: number): string {
  if (n === 0) return ''
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
}

// Ponto médio (min+max)/2 somado de todos os itens de todas as categorias —
// única fonte de "valor esperado" do projeto, usada por ProjetoContext
// (formatado), pela Visão Geral global (soma numérica cross-projeto) e pelo
// ranking por cliente. Extraída pra número puro porque `estimateTotal` só
// existia formatada ("R$ 1,2 M") e string compacta não reverte pra número
// sem perder precisão.
export function valorEsperadoNumerico(categorias: Category[]): number {
  let min = 0, max = 0
  for (const cat of categorias) {
    for (const item of cat.items) {
      min += parseMoedaBR(item.min)
      max += parseMoedaBR(item.max)
    }
  }
  return (min + max) / 2
}
