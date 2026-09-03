// Teste standalone de `aroSimSensibilidadeAno10` — rodar com:
//   npx tsx --tsconfig tsconfig.app.json scripts/test_sensibilidade_ano10.mts
// Valida a estatística contra o esperado analítico da distribuição uniforme
// discreta usada na aba `Simulation` da planilha NX Gold
// (`_Dados_Formulas_Planilha.md` §Etapa 6).
//
// Distribuição: cada iteração multiplica `base` por (1 + T/100), onde
// T ~ Uniforme discreta em {1, 2, ..., 10}. Logo:
//   E[fator]   = 1 + 5.5/100     = 1.055
//   E[valor]   = base * 1.055
//   Var(T)/100² = 8.25/10000     (Var(Uniforme discreta 1..10) = (10²-1)/12 = 8.25)
//   σ(valor)   = base * sqrt(8.25) / 100 ≈ base * 0.028723
//   CV         ≈ 0.028723 / 1.055 ≈ 0.02722 (2.72%)

import assert from 'node:assert/strict'
import { aroSimSensibilidadeAno10 } from '../src/lib/aroSimulacao.ts'

const BASE = 40_000_000 // ~R$40M — ordem de magnitude do Ano 10 do NX Gold

// === TESTE 1 — Estatísticas da simulação, 10k iterações com base padrão 1..10% ===
{
  const r = aroSimSensibilidadeAno10(BASE, 10_000, 1, 10)
  const meanExpected = BASE * 1.055
  const stddevExpected = BASE * Math.sqrt(8.25) / 100

  assert.equal(r.base, BASE)
  assert.equal(r.iterations, 10_000)
  assert.equal(r.taxaMinPct, 1)
  assert.equal(r.taxaMaxPct, 10)
  assert.equal(r.bars.length, 12)
  assert.ok(r.mean > 0)
  assert.ok(r.stddev > 0)

  // Média da simulação dentro de ±0.5% do esperado analítico
  const meanErr = Math.abs(r.mean - meanExpected) / meanExpected
  assert.ok(meanErr < 0.005, `Média ${r.mean.toFixed(0)} fora de ±0.5% do esperado ${meanExpected.toFixed(0)} (erro ${(meanErr * 100).toFixed(3)}%)`)

  // σ da simulação dentro de ±3% do esperado analítico (10k iterações + N=10 discreto tem alguma variância residual)
  const stdErr = Math.abs(r.stddev - stddevExpected) / stddevExpected
  assert.ok(stdErr < 0.03, `σ ${r.stddev.toFixed(0)} fora de ±3% do esperado ${stddevExpected.toFixed(0)} (erro ${(stdErr * 100).toFixed(3)}%)`)

  // CV ≈ 2.72% ± 0.1pp
  const cvPct = r.cv * 100
  assert.ok(cvPct > 2.6 && cvPct < 2.85, `CV ${cvPct.toFixed(3)}% fora de [2.6%, 2.85%]`)

  console.log(`✔ Simulação 10k iter, base ${BASE.toLocaleString('pt-BR')}: mean=${r.mean.toFixed(0)}, σ=${r.stddev.toFixed(0)}, CV=${cvPct.toFixed(2)}%`)
}

// === TESTE 2 — Range mínimo/máximo da simulação bate com {1%, 10%} ===
{
  const r = aroSimSensibilidadeAno10(BASE, 5_000, 1, 10)
  const minExpected = BASE * 1.01
  const maxExpected = BASE * 1.10

  assert.equal(r.minVal, minExpected, `Min ${r.minVal} não é base × 1.01 = ${minExpected}`)
  assert.equal(r.maxVal, maxExpected, `Max ${r.maxVal} não é base × 1.10 = ${maxExpected}`)
  console.log(`✔ Min ${r.minVal / 1e6}M = base × 1.01, Max ${r.maxVal / 1e6}M = base × 1.10`)
}

// === TESTE 3 — Percentis são monotônicos ===
{
  const r = aroSimSensibilidadeAno10(BASE, 10_000, 1, 10)
  assert.ok(r.p10 <= r.p50, `P10 ${r.p10} > P50 ${r.p50}`)
  assert.ok(r.p50 <= r.p80, `P50 ${r.p50} > P80 ${r.p80}`)
  assert.ok(r.p80 <= r.p90, `P80 ${r.p80} > P90 ${r.p90}`)
  assert.ok(r.p90 <= r.p95, `P90 ${r.p90} > P95 ${r.p95}`)
  console.log('✔ Percentis monotônicos: P10 ≤ P50 ≤ P80 ≤ P90 ≤ P95')
}

// === TESTE 4 — Base zero devolve zeros ===
{
  const r = aroSimSensibilidadeAno10(0, 100, 1, 10)
  assert.equal(r.mean, 0)
  assert.equal(r.stddev, 0)
  assert.equal(r.cv, 0)
  console.log('✔ base=0 devolve mean=0, σ=0, CV=0 (sem divisão por zero)')
}

// === TESTE 5 — Faixa customizada (3..7%) ===
{
  const r = aroSimSensibilidadeAno10(BASE, 10_000, 3, 7)
  // Uniforme discreta 3..7: E[T]=5, Var(T)=2 (n=5, (n²-1)/12 = 24/12 = 2)
  const meanExpected = BASE * 1.05
  const stddevExpected = BASE * Math.sqrt(2) / 100

  const meanErr = Math.abs(r.mean - meanExpected) / meanExpected
  const stdErr = Math.abs(r.stddev - stddevExpected) / stddevExpected
  assert.ok(meanErr < 0.005, `Faixa 3..7: mean erro ${(meanErr * 100).toFixed(3)}%`)
  assert.ok(stdErr < 0.05,  `Faixa 3..7: σ erro ${(stdErr * 100).toFixed(3)}%`)
  assert.equal(r.minVal, BASE * 1.03)
  assert.equal(r.maxVal, BASE * 1.07)
  console.log(`✔ Faixa customizada 3..7%: mean=${(r.mean / 1e6).toFixed(2)}M, σ=${(r.stddev / 1e6).toFixed(2)}M, min=${(r.minVal / 1e6).toFixed(2)}M, max=${(r.maxVal / 1e6).toFixed(2)}M`)
}

console.log('\n✅ Todos os 5 casos de teste verdes.')
