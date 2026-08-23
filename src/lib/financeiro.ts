import type { Category } from '@/types/categorias'

// Tabela de escalonamento por ano da planilha de referência — fora do escopo do
// Subsistema A (parâmetros globais só cobrem valor spot, não projeção ano-a-ano
// vinda de API pública). Ver specs/2026-08-23-motor-calculo-atualizacao-design.md.
const IPCA_RATES     = [0.034, 0.003, 0.028, 0.031, 0.040, 0.042, 0.050, 0.030, 0.0211, 0.034]
const HORIZON_YEARS  = 10

export interface ParametrosCalculo {
  selicPct:    number | null  // null = parâmetro global não configurado, omite simples/compostos
  inflacaoPct: number | null  // null = parâmetro global não configurado, omite inflação constante
}

export interface MetodoAtualizacao {
  metodo: 'simples' | 'compostos' | 'inflacao' | 'escalonamento'
  valor:  number
}

// Escalonamento (IPCA_RATES) nunca é omitido — não depende de parâmetro global,
// por isso está sempre presente no retorno, mesmo se simples/compostos/inflação
// sumirem por falta de configuração.
export function computeMonetaryValues(filteredBase: number, params: ParametrosCalculo): MetodoAtualizacao[] {
  const resultados: MetodoAtualizacao[] = []
  const n = HORIZON_YEARS

  if (params.selicPct !== null) {
    const rate = params.selicPct / 100
    resultados.push({ metodo: 'simples',   valor: filteredBase * (1 + rate * n) })
    resultados.push({ metodo: 'compostos', valor: filteredBase * Math.pow(1 + rate, n) })
  }
  if (params.inflacaoPct !== null) {
    const rate = params.inflacaoPct / 100
    resultados.push({ metodo: 'inflacao', valor: filteredBase * Math.pow(1 + rate, n) })
  }
  let ipcaFV = filteredBase
  for (const rate of IPCA_RATES) ipcaFV *= (1 + rate)
  resultados.push({ metodo: 'escalonamento', valor: ipcaFV })

  return resultados
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
