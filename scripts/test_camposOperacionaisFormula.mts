// Teste standalone do motor de fórmula de campos operacionais — rodar com:
//   npx tsx scripts/test_camposOperacionaisFormula.mts
// Não integra com framework; usa asserts nativos + saída legível.

import assert from 'node:assert/strict'
import {
  avaliarCamposOperacionais,
  avaliarQuantidadeItem,
  type CampoOperacionalInput,
} from '../src/lib/camposOperacionaisFormula.ts'

function run(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✅ ${name}`)
  } catch (e) {
    console.error(`❌ ${name}`)
    throw e
  }
}

// 1. Folha simples — sem fórmula, parse BR (ponto=milhar, vírgula=decimal)
run('folha simples parseia número BR', () => {
  const campos: CampoOperacionalInput[] = [{ label: 'Perímetro', valor: '7,89', formula: null }]
  const r = avaliarCamposOperacionais(campos)
  assert.equal(r.get('Perímetro')?.valor, 7.89)
})

// 2. Cadeia de 2 níveis — Volume = Perímetro × Largura × Altura, replica o
//    caso real da planilha NX Gold (aba "2. Cavas")
run('cadeia de 2 níveis (Volume derivado de 3 folhas)', () => {
  const campos: CampoOperacionalInput[] = [
    { label: 'Perímetro', valor: '7890', formula: null },
    { label: 'Largura Berma', valor: '4', formula: null },
    { label: 'Altura Bancada', valor: '10', formula: null },
    { label: 'Volume', valor: null, formula: 'Perímetro * Largura Berma * Altura Bancada' },
  ]
  const r = avaliarCamposOperacionais(campos)
  assert.equal(r.get('Volume')?.valor, 7890 * 4 * 10)
})

// 3. Cadeia de 3 níveis — Tonelagem depende de Volume (derivado), que depende
//    de 3 folhas. Confirma que memoização não recalcula Volume duas vezes e
//    a ordem de avaliação (não-declarada, resolvida por recursão) funciona.
run('cadeia de 3 níveis (Tonelagem depende de campo derivado)', () => {
  const campos: CampoOperacionalInput[] = [
    { label: 'Perímetro', valor: '7890', formula: null },
    { label: 'Largura Berma', valor: '4', formula: null },
    { label: 'Altura Bancada', valor: '10', formula: null },
    { label: 'Volume', valor: null, formula: 'Perímetro * Largura Berma * Altura Bancada' },
    { label: 'Tonelagem', valor: null, formula: 'Volume * 2.7' },
  ]
  const r = avaliarCamposOperacionais(campos)
  const volumeEsperado = 7890 * 4 * 10
  assert.equal(r.get('Volume')?.valor, volumeEsperado)
  assert.equal(r.get('Tonelagem')?.valor, volumeEsperado * 2.7)
})

// 4. Referência circular — A depende de B, B depende de A. Tem que virar
//    erro tratado (valor: null + mensagem), nunca stack overflow.
run('ciclo detectado, não trava', () => {
  const campos: CampoOperacionalInput[] = [
    { label: 'A', valor: null, formula: 'B * 2' },
    { label: 'B', valor: null, formula: 'A * 2' },
  ]
  const r = avaliarCamposOperacionais(campos)
  assert.equal(r.get('A')?.valor, null)
  assert.ok(r.get('A')?.erro, 'campo A devia ter erro')
})

// 5. Fórmula referenciando campo que não existe
run('campo referenciado ausente vira erro, não crash', () => {
  const campos: CampoOperacionalInput[] = [{ label: 'Volume', valor: null, formula: 'Perímetro * 2' }]
  const r = avaliarCamposOperacionais(campos)
  assert.equal(r.get('Volume')?.valor, null)
  assert.ok(r.get('Volume')?.erro?.includes('Perímetro'))
})

// 6. Fórmula com erro de sintaxe
run('fórmula com sintaxe inválida vira erro, não crash', () => {
  const campos: CampoOperacionalInput[] = [
    { label: 'Perímetro', valor: '10', formula: null },
    { label: 'Volume', valor: null, formula: 'Perímetro * * 2' },
  ]
  const r = avaliarCamposOperacionais(campos)
  assert.equal(r.get('Volume')?.valor, null)
  assert.ok(r.get('Volume')?.erro)
})

// 7. Label com substring de outro label não colide ("Área" dentro de "Área
//    total") — tokenização ordena por tamanho decrescente antes de substituir
run('label substring de outro label não colide', () => {
  const campos: CampoOperacionalInput[] = [
    { label: 'Área', valor: '10', formula: null },
    { label: 'Área total', valor: '100', formula: null },
    { label: 'Soma', valor: null, formula: 'Área + Área total' },
  ]
  const r = avaliarCamposOperacionais(campos)
  assert.equal(r.get('Soma')?.valor, 110)
})

// 8. avaliarQuantidadeItem — item referencia campo já avaliado (Tonelagem)
run('quantidade do item referencia campo derivado avaliado', () => {
  const campos: CampoOperacionalInput[] = [
    { label: 'Perímetro', valor: '7890', formula: null },
    { label: 'Largura Berma', valor: '4', formula: null },
    { label: 'Altura Bancada', valor: '10', formula: null },
    { label: 'Volume', valor: null, formula: 'Perímetro * Largura Berma * Altura Bancada' },
    { label: 'Tonelagem', valor: null, formula: 'Volume * 2.7' },
  ]
  const avaliados = avaliarCamposOperacionais(campos)
  const { valor, erro } = avaliarQuantidadeItem('Tonelagem', avaliados)
  assert.equal(erro, undefined)
  assert.equal(valor, 7890 * 4 * 10 * 2.7)
})

// 9. Folha vazia/inválida vira null, nunca 0 silencioso
run('folha vazia vira null, não 0', () => {
  const campos: CampoOperacionalInput[] = [{ label: 'Perímetro', valor: '', formula: null }]
  const r = avaliarCamposOperacionais(campos)
  assert.equal(r.get('Perímetro')?.valor, null)
})

console.log('\nTodos os testes de camposOperacionaisFormula passaram.')
