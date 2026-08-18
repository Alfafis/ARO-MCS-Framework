// Fonte: Khaled 1 Provisionamento_Financeiro_NX_Gold — aba "9. Síntese Por Atividade"
export const BASE_TOTAL_WITH_PROVISION = 40_565_159  // total com provisão 20%, atualizado 2023
export const TOTAL_UPDATED_2023        = 36_897_448  // total sem provisão, atualizado 2023

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
