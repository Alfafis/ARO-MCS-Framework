// Teste standalone do núcleo de `runAroSimulacao` — RB-03 (convergência
// dinâmica, mínimo 10.000 iterações), RB-04 (reprodutibilidade via seed) e
// VaR/CVaR (metodologia ARO-MCS Framework §5-6). Rodar com:
//   npx tsx --tsconfig tsconfig.app.json scripts/test_aroSimulacao_core.mts

import assert from 'node:assert/strict'
import { runAroSimulacao, calibrarProvisao, MIN_ITERATIONS, type CategoryParam } from '../src/lib/aroSimulacao.ts'

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

// === TESTE 6 — Engine 6: categoria de maior variância domina o ranking de Risk Drivers ===
{
  // B tem faixa MUITO mais larga que A → deve dominar a variância do total
  // e sair em 1º no ranking por |correlação|.
  const wideCats: CategoryParam[] = [
    { name: 'A_estavel', min: 999_000,   mode: 1_000_000, max: 1_001_000  },
    { name: 'B_volatil', min: 500_000,   mode: 1_000_000, max: 2_000_000  },
  ]
  const r = runAroSimulacao('Triangular', MIN_ITERATIONS, wideCats, new Set(['A_estavel', 'B_volatil']), 95, 11)
  assert.equal(r.riskDrivers.length, 2)
  assert.equal(r.riskDrivers[0].name, 'B_volatil', 'categoria mais volátil deve liderar o ranking de Risk Drivers')
  assert.ok(Math.abs(r.riskDrivers[0].correlation) > Math.abs(r.riskDrivers[1].correlation))
  console.log(`✔ Risk Drivers: ${r.riskDrivers[0].name} (r=${r.riskDrivers[0].correlation.toFixed(3)}) > ${r.riskDrivers[1].name} (r=${r.riskDrivers[1].correlation.toFixed(3)})`)
}

// === TESTE 7 — §9: cenários são monotônicos (Otimista ≤ Moderado ≤ Pessimista ≤ Estresse) ===
{
  const r = runAroSimulacao('Triangular', 20_000, CATS, ACTIVE, 95, 21)
  const { otimista, moderado, pessimista, estresse } = r.scenarios
  assert.ok(otimista <= moderado && moderado <= pessimista && pessimista <= estresse,
    `cenários devem ser monotônicos: ${otimista} <= ${moderado} <= ${pessimista} <= ${estresse}`)
  console.log(`✔ Cenários monotônicos: Otimista=${otimista.toFixed(0)} Moderado=${moderado.toFixed(0)} Pessimista=${pessimista.toFixed(0)} Estresse=${estresse.toFixed(0)}`)
}

// === TESTE 8 — Engine 5: calibração escolhe o nível de risco certo pelo CV ===
{
  // Faixa estreita → CV baixo → "Baixo", margem 10%, base=P50
  const tightCats: CategoryParam[] = [{ name: 'X', min: 990_000, mode: 1_000_000, max: 1_010_000 }]
  const rLow = runAroSimulacao('Triangular', MIN_ITERATIONS, tightCats, new Set(['X']), 95, 5)
  const calLow = calibrarProvisao(rLow)
  assert.equal(calLow.nivelRisco, 'Baixo')
  assert.equal(calLow.margemSeguranca, 0.10)
  assert.equal(calLow.provisaoBase, rLow.p50)
  assert.ok(Math.abs(calLow.provisaoFinal - calLow.provisaoBase * 1.10) < 1e-6)

  // Faixa larga → CV alto → "Alto", margem 20%, base=MAX(P95,CVaR_95)
  const wideCats2: CategoryParam[] = [{ name: 'Y', min: 100_000, mode: 1_000_000, max: 5_000_000 }]
  const rHigh = runAroSimulacao('Triangular', MIN_ITERATIONS, wideCats2, new Set(['Y']), 95, 6)
  const calHigh = calibrarProvisao(rHigh)
  assert.equal(calHigh.nivelRisco, 'Alto')
  assert.equal(calHigh.margemSeguranca, 0.20)
  assert.equal(calHigh.provisaoBase, Math.max(rHigh.p95, rHigh.cvar95))

  console.log(`✔ Calibração: faixa estreita→${calLow.nivelRisco} (${(calLow.margemSeguranca*100).toFixed(0)}%), faixa larga→${calHigh.nivelRisco} (${(calHigh.margemSeguranca*100).toFixed(0)}%)`)
}

console.log('\n✅ Todos os 8 casos de teste verdes.')
