// Teste standalone de `computeDesembolsoMatrix` — rodar com:
//   npx tsx scripts/test_desembolsoAno.mts
// Não integra com framework; usa asserts nativos + saída legível.

import assert from 'node:assert/strict'
import { computeDesembolsoMatrix } from '../src/lib/desembolsoAno.ts'
import type { Category, CategoriaCatalogo } from '../src/types/categorias.ts'

const catalogo: CategoriaCatalogo[] = [
  { id: 'CAT_A', nome: 'Estudos' },
  { id: 'CAT_B', nome: 'Cavas' },
  { id: 'CAT_C', nome: 'Monitoramento' },
]

const HORIZ = 10

function mkItem(over: Partial<Parameters<typeof itemBase>[0]> = {}) {
  return itemBase(over)
}
function itemBase(o: {
  max: string
  anoInicio?: number | null
  anoFim?:    number | null
  desembolsoPorAno?: { ano: number; valor: number }[] | null
} = { max: '0' }): import('../src/types/categorias.ts').CategoryItem {
  return {
    id: crypto.randomUUID(),
    name: 'x',
    unit: 'vb',
    min: '0',
    max: o.max,
    source: '',
    aplicabilidadeSetores: null,
    fase: null,
    anoInicio: o.anoInicio ?? null,
    anoFim:    o.anoFim ?? null,
    aplicabilidade: '',
    anoPrevisto: '',
    desembolsoPorAno: o.desembolsoPorAno ?? null,
  }
}

const categorias: Category[] = [
  // CAT_A / Estudos — detalhado por ano (Ano 1: 100k, Ano 4: 209.640)
  {
    id: 'c1', catalogoId: 'CAT_A', preenche: 'Consultor', expanded: false, justAdded: false,
    camposOperacionais: [], custoProvavel: null,
    items: [ mkItem({ max: '500.000,00', desembolsoPorAno: [{ ano: 1, valor: 100000 }, { ano: 4, valor: 209640 }] }) ],
  },
  // CAT_B / Cavas — fallback uniforme entre anos 6-6 (100% no Ano 6)
  {
    id: 'c2', catalogoId: 'CAT_B', preenche: 'Consultor', expanded: false, justAdded: false,
    camposOperacionais: [], custoProvavel: null,
    items: [ mkItem({ max: '2.000.000,00', anoInicio: 6, anoFim: 6 }) ],
  },
  // CAT_C / Monitoramento — fallback uniforme entre anos 7-10 (4 anos × 250k)
  {
    id: 'c3', catalogoId: 'CAT_C', preenche: 'Consultor', expanded: false, justAdded: false,
    camposOperacionais: [], custoProvavel: null,
    items: [ mkItem({ max: '1.000.000,00', anoInicio: 7, anoFim: 10 }) ],
  },
]

// === TESTE 1 — modo base ===
const base = computeDesembolsoMatrix({
  categorias, catalogo, horizonYears: HORIZ, contingenciaPct: 20, ipcaPorAno: null, modo: 'base',
})

assert.equal(base.categorias.length, 3, '3 categorias na saída')
assert.equal(base.matrix[0][0], 100000, 'Ano 1 Estudos = 100k (detalhado)')
assert.equal(base.matrix[0][3], 209640, 'Ano 4 Estudos = 209.640 (detalhado)')
assert.equal(base.matrix[1][5], 2000000, 'Ano 6 Cavas = 2M (fallback ano_inicio=ano_fim=6)')
assert.equal(base.matrix[2][6], 250000, 'Ano 7 Monitoramento = 250k (uniforme 7-10)')
assert.equal(base.matrix[2][9], 250000, 'Ano 10 Monitoramento = 250k')
assert.equal(base.totalGeral, 100000 + 209640 + 2000000 + 250000 * 4, 'total geral bate')
console.log('✔ modo base')

// === TESTE 2 — modo provisao (×1,20) ===
const prov = computeDesembolsoMatrix({
  categorias, catalogo, horizonYears: HORIZ, contingenciaPct: 20, ipcaPorAno: null, modo: 'provisao',
})
assert.equal(prov.matrix[0][0], 100000 * 1.2, 'provisão aplicada')
assert.equal(prov.matrix[1][5], 2000000 * 1.2, 'provisão aplicada em Cavas')
assert.equal(prov.totalGeral, base.totalGeral * 1.2, 'total geral = base × 1.20')
console.log('✔ modo provisao')

// === TESTE 3 — modo ipca cumulativo (base × 1.20 × ∏(1+r_i)) ===
const ipca = [0.034, 0.003, 0.028, 0.031, 0.040, 0.042, 0.050, 0.030, 0.0211, 0.034]
const ipcaResult = computeDesembolsoMatrix({
  categorias, catalogo, horizonYears: HORIZ, contingenciaPct: 20, ipcaPorAno: ipca, modo: 'ipca',
})
const fatorAno1 = 1.034
const fatorAno6 = 1.034 * 1.003 * 1.028 * 1.031 * 1.040 * 1.042
assert.ok(Math.abs(ipcaResult.matrix[0][0] - 100000 * 1.2 * fatorAno1) < 0.01, 'IPCA Ano 1')
assert.ok(Math.abs(ipcaResult.matrix[1][5] - 2000000 * 1.2 * fatorAno6) < 0.01, 'IPCA Ano 6 (composto)')
console.log('✔ modo ipca cumulativo')

// === TESTE 4 — degradação (ipca null vira provisao) ===
const degrad = computeDesembolsoMatrix({
  categorias, catalogo, horizonYears: HORIZ, contingenciaPct: 20, ipcaPorAno: null, modo: 'ipca',
})
assert.equal(degrad.totalGeral, prov.totalGeral, 'ipca null → totais iguais a provisao')
console.log('✔ degradação graciosa (ipca null → provisao)')

// === TESTE 5 — item sem ano vai pro ano 1 (flag de incompleto) ===
const semAno = computeDesembolsoMatrix({
  categorias: [{
    id: 'x', catalogoId: 'CAT_A', preenche: 'Consultor', expanded: false, justAdded: false,
    camposOperacionais: [], custoProvavel: null,
    items: [ mkItem({ max: '999.000,00', anoInicio: null, anoFim: null }) ],
  }],
  catalogo, horizonYears: HORIZ, contingenciaPct: 0, ipcaPorAno: null, modo: 'base',
})
assert.equal(semAno.matrix[0][0], 999000, 'sem ano → cai no Ano 1')
assert.equal(semAno.matrix[0].slice(1).reduce((a, b) => a + b, 0), 0, 'demais anos zerados')
console.log('✔ fallback Ano 1 sem ano definido')

console.log('\n=== TODOS OS TESTES PASSARAM ===')
