import type { Category } from '@/types/categorias'

// Tabela de escalonamento por ano da planilha de referência ORIGINAL — mantida
// hardcoded de propósito como cenário de comparação fixo, distinto da tabela
// ano-a-ano administrável em `parametros_anuais` (Subsistema A2). As duas têm
// estrutura idêntica (sequência de taxa por ano, composta sequencialmente) mas
// fontes diferentes: esta é a referência congelada da planilha original: nunca
// muda; a de `selicPorAno`/`inflacaoPorAno` é editável pelo consultor e reflete
// a expectativa atual. Ver specs/2026-08-23-parametros-anuais-design.md.
const IPCA_RATES = [0.034, 0.003, 0.028, 0.031, 0.04, 0.042, 0.05, 0.03, 0.0211, 0.034]

export interface ParametrosCalculo {
  selicPorAno: number[] | null // frações (0.14 = 14%), 1 por ano do horizonte — null = algum ano sem parâmetro, omite simples/compostos
  inflacaoPorAno: number[] | null // idem, omite inflação constante
  horizonYears: number
}

export interface MetodoAtualizacao {
  metodo: 'simples' | 'compostos' | 'inflacao' | 'escalonamento'
  valor: number
}

function compostoSequencial(base: number, taxas: number[]): number {
  let fv = base
  for (const rate of taxas) fv *= 1 + rate
  return fv
}

// Escalonamento (IPCA_RATES) nunca é omitido — não depende de parâmetro global,
// por isso está sempre presente no retorno, mesmo se simples/compostos/inflação
// sumirem por falta de configuração. Usa só os primeiros `horizonYears` anos da
// tabela original (nunca mais que os 10 anos que ela tem).
export function computeMonetaryValues(filteredBase: number, params: ParametrosCalculo): MetodoAtualizacao[] {
  const resultados: MetodoAtualizacao[] = []

  if (params.selicPorAno !== null) {
    const media = params.selicPorAno.reduce((a, b) => a + b, 0) / params.selicPorAno.length
    resultados.push({ metodo: 'simples', valor: filteredBase * (1 + media * params.horizonYears) })
    resultados.push({ metodo: 'compostos', valor: compostoSequencial(filteredBase, params.selicPorAno) })
  }
  if (params.inflacaoPorAno !== null) {
    resultados.push({ metodo: 'inflacao', valor: compostoSequencial(filteredBase, params.inflacaoPorAno) })
  }
  resultados.push({
    metodo: 'escalonamento',
    valor: compostoSequencial(filteredBase, IPCA_RATES.slice(0, params.horizonYears)),
  })

  return resultados
}

// Máscara de digitação em moeda BR — bloqueia letras/símbolos e mantém
// separador de milhar/decimal durante a digitação. Tolerante à edição no meio:
// vírgulas extras são removidas, decimais cortados a 2 dígitos.
//
// Casos:
//   "abc123"     → "123"
//   "1234"       → "1.234"
//   "1234,56"    → "1.234,56"
//   "12,3,4"     → "12,34"       (2ª vírgula ignorada, decimal truncado)
//   "1.234,56ab" → "1.234,56"
export function maskMoedaBR(input: string): string {
  let s = input.replace(/[^\d,]/g, '')
  const firstComma = s.indexOf(',')
  if (firstComma >= 0) {
    s = s.slice(0, firstComma + 1) + s.slice(firstComma + 1).replace(/,/g, '')
  }
  const [inteira = '', decimal] = s.split(',')
  const inteiraFmt = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decimal !== undefined ? `${inteiraFmt},${decimal.slice(0, 2)}` : inteiraFmt
}

// Máscara de número BR pura — sem "R$" e sem cap de casas decimais. Usada em
// campos de quantidade operacional (perímetro, área, volume, tonelagem,
// densidade) que seguem o padrão de milhar `.` e decimal `,` da planilha
// (ex.: "1.643", "12,9", "56,7384", "4.721,6"). Diferente de maskMoedaBR,
// preserva quantas casas decimais o usuário digitar.
export function maskNumeroBR(input: string): string {
  let s = input.replace(/[^\d,]/g, '')
  const firstComma = s.indexOf(',')
  if (firstComma >= 0) {
    s = s.slice(0, firstComma + 1) + s.slice(firstComma + 1).replace(/,/g, '')
  }
  const [inteira = '', decimal] = s.split(',')
  const inteiraFmt = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decimal !== undefined ? `${inteiraFmt},${decimal}` : inteiraFmt
}

// "R$ 1.234.567" ou "1.234.567,89" → 1234567(.89). Retorna 0 se não conseguir extrair número.
export function parseMoedaBR(str: string): number {
  const cleaned = str
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

// Formatter compacto único — escalona entre k/M/B conforme magnitude:
//   1.234        → "R$ 1,2 k"
//   32.400       → "R$ 32,4 k"
//   2.860.213    → "R$ 2,86 M"
//   12.635.174   → "R$ 12,64 M"
//   1.2e9        → "R$ 1,20 B"
//
// M e B usam 2 casas decimais porque 1 casa arredonda demais no range 1-10M
// (ex: 2.860.213 vira "R$ 2,86 M" em vez de "R$ 2,9 M" — erro relativo ~1,4%).
// k usa 1 casa (33.500 → "R$ 33,5 k" — o range é largo o suficiente).
//
// `withPrefix=false` remove o "R$ " — usado em células de tabela onde o
// cabeçalho da coluna já traz "R$" implícito e prefixar por célula polui.
export function formatMoedaCompact(n: number, withPrefix: boolean = true): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  const prefix = withPrefix ? 'R$ ' : ''
  if (abs >= 1_000_000_000) return `${sign}${prefix}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')} B`
  if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(2).replace('.', ',')} M`
  if (abs >= 1_000) return `${sign}${prefix}${(abs / 1_000).toFixed(1).replace('.', ',')} k`
  return `${sign}${prefix}${abs.toFixed(0)}`
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
  let min = 0,
    max = 0
  for (const cat of categorias) {
    for (const item of cat.items) {
      min += parseMoedaBR(item.min)
      max += parseMoedaBR(item.max)
    }
  }
  return (min + max) / 2
}
