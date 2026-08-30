// Teste standalone de `computeFatorAncoragem` — rodar com:
//   npx tsx --tsconfig tsconfig.app.json scripts/test_ancoragem.mts
// Não integra com framework; asserts nativos + saída legível.

import assert from 'node:assert/strict'
import { computeFatorAncoragem, ANO_BASE_TEMPLATE } from '../src/lib/ancoragem.ts'
import type { ParametroAnual } from '../src/types/parametrosGlobais.ts'

function mkIpca(ano: number, pct: number): ParametroAnual {
  return {
    chave: 'inflacao_ipca',
    ano,
    valorMin: pct,
    valorMax: pct,
    fonte: 'manual',
    atualizadoEm: '2026-08-29T00:00:00Z',
  }
}

const historicoOficial: ParametroAnual[] = [
  mkIpca(2022, 5.79),
  mkIpca(2023, 4.62),
  mkIpca(2024, 4.83),
  mkIpca(2025, 4.83),
]

// === TESTE 1 — ANO_BASE_TEMPLATE é 2022 ===
assert.equal(ANO_BASE_TEMPLATE, 2022, 'ANO_BASE_TEMPLATE fixo em 2022')
console.log('✔ ANO_BASE_TEMPLATE = 2022')

// === TESTE 2 — data_base = template → sem ajuste ===
const semAjuste = computeFatorAncoragem(2022, 2022, historicoOficial)
assert.equal(semAjuste.fator, 1)
assert.equal(semAjuste.faltantes.length, 0)
console.log('✔ data_base == ano_base_template → fator=1')

// === TESTE 3 — data_base < template → sem ajuste (não desconta pra trás) ===
const passado = computeFatorAncoragem(2022, 2020, historicoOficial)
assert.equal(passado.fator, 1)
console.log('✔ data_base < ano_base_template → fator=1 (não desconta)')

// === TESTE 4 — 2022 → 2023 (só 1 ano: 2022 IPCA aplicado) ===
const um = computeFatorAncoragem(2022, 2023, historicoOficial)
assert.ok(Math.abs(um.fator - 1.0579) < 0.0001, `fator 2022→2023 = 1.0579, got ${um.fator}`)
console.log('✔ 2022 → 2023 = (1 + 0,0579) = 1,0579')

// === TESTE 5 — 2022 → 2026 (4 anos cumulativos) ===
const quatro = computeFatorAncoragem(2022, 2026, historicoOficial)
const esperado = 1.0579 * 1.0462 * 1.0483 * 1.0483
assert.ok(Math.abs(quatro.fator - esperado) < 0.0001, `fator 2022→2026 = ${esperado}, got ${quatro.fator}`)
console.log(`✔ 2022 → 2026 = ∏(1+r_i) = ${quatro.fator.toFixed(4)} (${((quatro.fator-1)*100).toFixed(2)}%)`)

// === TESTE 6 — faltando ano no meio → fator=1 + faltantes ===
const semAno2024 = historicoOficial.filter(p => p.ano !== 2024)
const faltando = computeFatorAncoragem(2022, 2026, semAno2024)
assert.equal(faltando.fator, 1)
assert.deepEqual(faltando.faltantes, [2024])
console.log('✔ ano faltando no range → fator=1 + faltantes=[2024]')

// === TESTE 7 — múltiplos anos faltando ===
const soUmAno = historicoOficial.filter(p => p.ano === 2022)
const multiFalt = computeFatorAncoragem(2022, 2026, soUmAno)
assert.equal(multiFalt.fator, 1)
assert.deepEqual(multiFalt.faltantes, [2023, 2024, 2025])
console.log('✔ múltiplos anos faltando → faltantes=[2023, 2024, 2025]')

// === TESTE 8 — valor_min ≠ valor_max usa ponto médio ===
const comRange: ParametroAnual[] = [{
  chave: 'inflacao_ipca',
  ano: 2022,
  valorMin: 5.0,
  valorMax: 6.58,  // média = 5.79
  fonte: 'manual',
  atualizadoEm: '2026-08-29T00:00:00Z',
}]
const midpoint = computeFatorAncoragem(2022, 2023, comRange)
assert.ok(Math.abs(midpoint.fator - 1.0579) < 0.0001, 'ponto médio (5.0+6.58)/2 = 5.79')
console.log('✔ range min≠max usa ponto médio')

// === TESTE 9 — selic no state é ignorado (só IPCA importa) ===
const misto: ParametroAnual[] = [
  ...historicoOficial,
  { chave: 'selic', ano: 2022, valorMin: 14, valorMax: 14, fonte: 'manual', atualizadoEm: '2026-08-29T00:00:00Z' },
]
const soIpca = computeFatorAncoragem(2022, 2023, misto)
assert.ok(Math.abs(soIpca.fator - 1.0579) < 0.0001, 'Selic é ignorada mesmo se presente')
console.log('✔ selic no array é ignorada (só inflacao_ipca conta)')

// === TESTE 10 — parametrosAnuais vazio → fator=1 + faltantes range inteiro ===
const vazio = computeFatorAncoragem(2022, 2026, [])
assert.equal(vazio.fator, 1)
assert.deepEqual(vazio.faltantes, [2022, 2023, 2024, 2025])
console.log('✔ parametrosAnuais vazio → faltantes=[2022..2025]')

console.log('\n=== TODOS OS TESTES PASSARAM ===')
