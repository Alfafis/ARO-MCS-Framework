// Teste standalone do núcleo de `runAroSimulacao` — RB-03 (convergência
// dinâmica, mínimo 10.000 iterações), RB-04 (reprodutibilidade via seed) e
// VaR/CVaR (metodologia ARO-MCS Framework §5-6). Rodar com:
//   npx tsx --tsconfig tsconfig.app.json scripts/test_aroSimulacao_core.mts

import assert from 'node:assert/strict'
import { runAroSimulacao, MIN_ITERATIONS, type CategoryParam } from '../src/lib/aroSimulacao.ts'

const CATS: CategoryParam[] = [
  { name: 'A', min: 1_000_000, mode: 1_200_000, max: 1_500_000 },
  { name: 'B', min: 500_000,   mode: 600_000,   max: 800_000   },
]
const ACTIVE = new Set(CATS.map(c => c.name))

// === TESTE 1 — RB-04: mesma seed produz exatamente o mesmo resultado ===
{
  const r1 = runAroSimulacao('Triangular', 10_000, CATS, ACTIVE, 95, 42)
  const r2 = runAroSimulacao('Triangular', 10_000, CATS, ACTIVE, 95, 42)
  assert.equal(r1.mean, r2.mean, 'mesma seed deve produzir a mesma média')
  assert.equal(r1.stddev, r2.stddev, 'mesma seed deve produzir o mesmo σ')
  assert.equal(r1.var95, r2.var95, 'mesma seed deve produzir o mesmo VaR_95')
  assert.deepEqual(r1.bars, r2.bars, 'mesma seed deve produzir o mesmo histograma')
  assert.equal(r1.seed, 42)
  console.log(`✔ Seed 42 reproduz resultado idêntico: mean=${r1.mean.toFixed(0)}`)
}

// === TESTE 2 — seeds diferentes produzem resultados diferentes ===
{
  const r1 = runAroSimulacao('Triangular', 10_000, CATS, ACTIVE, 95, 1)
  const r2 = runAroSimulacao('Triangular', 10_000, CATS, ACTIVE, 95, 2)
  assert.notEqual(r1.mean, r2.mean, 'seeds diferentes devem divergir')
  console.log(`✔ Seeds diferentes divergem: mean(1)=${r1.mean.toFixed(0)} mean(2)=${r2.mean.toFixed(0)}`)
}

// === TESTE 3 — RB-03: pedir menos que MIN_ITERATIONS ainda roda o piso ===
{
  const r = runAroSimulacao('Triangular', 100, CATS, ACTIVE, 95, 7)
  assert.ok(r.iterationsRun >= MIN_ITERATIONS, `iterationsRun (${r.iterationsRun}) deve ser >= MIN_ITERATIONS (${MIN_ITERATIONS})`)
  console.log(`✔ Pedido de 100 iterações rodou ${r.iterationsRun} (piso RB-03 respeitado)`)
}

// === TESTE 4 — VaR_95 = P95, CVaR_95 >= VaR_95 (cauda sempre pior que o corte) ===
{
  const r = runAroSimulacao('Triangular', 20_000, CATS, ACTIVE, 95, 99)
  assert.equal(r.var95, r.p95, 'VaR_95 deve ser exatamente P95')
  assert.ok(r.cvar95 >= r.var95, 'CVaR_95 (média da cauda) deve ser >= VaR_95')
  assert.ok(r.p5 <= r.p25 && r.p25 <= r.p75 && r.p75 <= r.p95 && r.p95 <= r.p99, 'percentis devem ser monotônicos')
  console.log(`✔ VaR_95=${r.var95.toFixed(0)} CVaR_95=${r.cvar95.toFixed(0)} (CVaR >= VaR)`)
}

// === TESTE 5 — converged=true quando a distribuição é estreita (deve convergir bem antes do teto) ===
{
  const tightCats: CategoryParam[] = [{ name: 'X', min: 999_000, mode: 1_000_000, max: 1_001_000 }]
  const r = runAroSimulacao('Triangular', MIN_ITERATIONS, tightCats, new Set(['X']), 95, 3)
  assert.equal(r.converged, true, 'distribuição estreita deve convergir')
  console.log(`✔ Distribuição estreita converge em ${r.iterationsRun} iterações`)
}

console.log('\n✅ Todos os 5 casos de teste verdes.')
