import type { Category, CategoriaCatalogo, CategoryItem } from '@/types/categorias'
import { parseMoedaBR } from '@/lib/financeiro'

// Calcula a matriz de desembolso por categoria × ano do projeto. Cada linha da
// planilha vira uma DisbursementCategoryRow com `values[ano-1]`. Estratégia
// item-a-item, seguindo a planilha NX Gold (ver `_Dados_Formulas_Planilha.md`):
//
// - Se o item tem `desembolsoPorAno` (detalhado pelo consultor), usa direto —
//   fiel à planilha (splits assimétricos como "1/4 + 3/4" só saem daí).
// - Fallback 1: distribuição uniforme entre `anoInicio..anoFim` do `custo_max`.
//   Cobre "100% no ano X" (Cavas, Barragem etc.) e "uniforme entre 7-10"
//   (Monitoramento) sem precisar detalhamento explícito.
// - Fallback 2: sem ano definido, joga tudo no ano 1 (visível como "flag"
//   de dado incompleto — evita sumir custo do total).
//
// Modos:
// - 'base'     — só a distribuição
// - 'provisao' — multiplica cada ano por (1 + contingenciaPct/100)
// - 'ipca'     — depois da provisão, aplica ∏(1+ipca_i) do ano 1 até N
export interface DesembolsoMatrixResult {
  // Matriz[categoria][ano-1] = valor bruto
  matrix: number[][]
  // Nomes de categoria em mesma ordem de matrix
  categorias: string[]
  // Soma por ano (matrix reduzida verticalmente) — pra rodapé "Total"
  totaisPorAno: number[]
  // Valor total acumulado (soma de tudo)
  totalGeral: number
}

export type ModoDesembolso = 'base' | 'provisao' | 'ipca'

interface ComputeArgs {
  categorias:      Category[]
  catalogo:        CategoriaCatalogo[]
  horizonYears:    number
  contingenciaPct: number
  ipcaPorAno:      number[] | null    // frações (0.034 = 3,4%), tamanho horizonYears — null se não configurado
  modo:            ModoDesembolso
  // Multiplicador de ancoragem base_template → data_base_projeto (default 1).
  // Aplicado antes dos modos 'provisao' e 'ipca' — todas as células da matriz
  // são shift-ajustadas. Ver `computeFatorAncoragem` em src/lib/ancoragem.ts.
  fatorAncoragem?: number
}

export function computeDesembolsoMatrix({ categorias, catalogo, horizonYears, contingenciaPct, ipcaPorAno, modo, fatorAncoragem = 1 }: ComputeArgs): DesembolsoMatrixResult {
  const matrix: number[][] = []
  const categoriasNomes: string[] = []

  for (const cat of categorias) {
    const valoresAno = new Array<number>(horizonYears).fill(0)
    let algumValor = false

    for (const item of cat.items) {
      const custoMax = parseMoedaBR(item.max)
      if (custoMax <= 0) continue

      if (item.desembolsoPorAno && item.desembolsoPorAno.length > 0) {
        // Detalhado — usa direto (mais fiel à planilha)
        for (const d of item.desembolsoPorAno) {
          if (d.ano >= 1 && d.ano <= horizonYears) {
            valoresAno[d.ano - 1] += d.valor
            algumValor = true
          }
        }
      } else if (item.anoInicio !== null && item.anoFim !== null) {
        // Distribuição uniforme entre anoInicio..anoFim (fallback comum)
        const inicio = Math.max(1, Math.min(horizonYears, item.anoInicio))
        const fim    = Math.max(inicio, Math.min(horizonYears, item.anoFim))
        const spanN  = fim - inicio + 1
        const porAno = custoMax / spanN
        for (let ano = inicio; ano <= fim; ano++) {
          valoresAno[ano - 1] += porAno
          algumValor = true
        }
      } else {
        // Sem ano definido — joga no ano 1 (fica visível pro consultor
        // completar depois em vez de sumir do total).
        valoresAno[0] += custoMax
        algumValor = true
      }
    }

    if (algumValor) {
      const nome = catalogo.find(c => c.id === cat.catalogoId)?.nome ?? '—'
      categoriasNomes.push(nome)
      matrix.push(valoresAno)
    }
  }

  // Ancoragem base_template → data_base_projeto. Aplica um multiplicador
  // uniforme em todas as células da matriz antes dos modos. fator=1 = no-op
  // (é o default e o caso quando data_base <= ano_base_template ou quando
  // faltam anos em parametros_anuais).
  if (fatorAncoragem !== 1) {
    for (const row of matrix) {
      for (let a = 0; a < horizonYears; a++) row[a] *= fatorAncoragem
    }
  }

  // Aplica modos coluna a coluna. Provisão e IPCA são multiplicadores da
  // planilha (linhas 22/44 e 20/21 de "0. Síntese Por Setor"): provisão é
  // por-ano (SUM(coluna)*0.2 → equivalente a somar 20% em cada célula da
  // coluna), IPCA é cumulativo ∏(1+r_i) do ano 1 até o ano N.
  if (modo !== 'base') {
    const provFator = 1 + contingenciaPct / 100
    const ipcaFatoresAcum: number[] = []
    if (modo === 'ipca' && ipcaPorAno && ipcaPorAno.length >= horizonYears) {
      let acum = 1
      for (let i = 0; i < horizonYears; i++) {
        acum *= 1 + ipcaPorAno[i]
        ipcaFatoresAcum.push(acum)
      }
    }
    for (let c = 0; c < matrix.length; c++) {
      for (let a = 0; a < horizonYears; a++) {
        let v = matrix[c][a] * provFator
        if (modo === 'ipca' && ipcaFatoresAcum.length > 0) v *= ipcaFatoresAcum[a]
        matrix[c][a] = v
      }
    }
  }

  const totaisPorAno = new Array<number>(horizonYears).fill(0)
  let totalGeral = 0
  for (const row of matrix) {
    for (let a = 0; a < horizonYears; a++) {
      totaisPorAno[a] += row[a]
      totalGeral += row[a]
    }
  }

  return { matrix, categorias: categoriasNomes, totaisPorAno, totalGeral }
}

// Distribuição item-a-item (base, sem provisão e sem IPCA). Segue a mesma
// hierarquia do computeDesembolsoMatrix: desembolsoPorAno explícito >
// distribuição uniforme entre anoInicio..anoFim > tudo no ano 1.
function distribuirItem(item: CategoryItem, horizonYears: number): { valoresPorAno: number[]; hasValue: boolean } {
  const valoresAno = new Array<number>(horizonYears).fill(0)
  const custoMax = parseMoedaBR(item.max)
  if (custoMax <= 0) return { valoresPorAno: valoresAno, hasValue: false }

  if (item.desembolsoPorAno && item.desembolsoPorAno.length > 0) {
    for (const d of item.desembolsoPorAno) {
      if (d.ano >= 1 && d.ano <= horizonYears) valoresAno[d.ano - 1] += d.valor
    }
    return { valoresPorAno: valoresAno, hasValue: true }
  }
  if (item.anoInicio !== null && item.anoFim !== null) {
    const inicio = Math.max(1, Math.min(horizonYears, item.anoInicio))
    const fim    = Math.max(inicio, Math.min(horizonYears, item.anoFim))
    const spanN  = fim - inicio + 1
    const porAno = custoMax / spanN
    for (let ano = inicio; ano <= fim; ano++) valoresAno[ano - 1] += porAno
    return { valoresPorAno: valoresAno, hasValue: true }
  }
  valoresAno[0] += custoMax
  return { valoresPorAno: valoresAno, hasValue: true }
}

// Resultado da matriz item-a-item, agrupada por categoria. Serve a visão
// "Detalhamento por Atividade".
//
// Cada célula (item × ano) já reflete o modo escolhido — mesma semântica de
// `computeDesembolsoMatrix`, só que na granularidade do item em vez da
// categoria. Isso garante que trocar o modo (base/provisão/IPCA) atualiza os
// valores de cada linha, mantendo o Detalhado consistente com o Agregado.
//
// Multiplicador por célula (aplicado coluna a coluna):
//   - base:     1
//   - provisao: (1 + cont/100)
//   - ipca:     (1 + cont/100) × ∏(1 + r_i) do ano 1..N
export interface DesembolsoItemGroup {
  categoriaNome:     string
  items:             Array<{ nome: string; unidade: string; valoresPorAno: number[] }>
  subtotaisPorAno:   number[]
}

export interface DesembolsoItemMatrixResult {
  groups:       DesembolsoItemGroup[]
  totaisPorAno: number[]  // soma total por ano — já com modo aplicado
  totalGeral:   number
}

interface ComputeItemMatrixArgs {
  categorias:      Category[]
  catalogo:        CategoriaCatalogo[]
  horizonYears:    number
  contingenciaPct: number
  ipcaPorAno:      number[] | null
  modo:            ModoDesembolso
  fatorAncoragem?: number
}

export function computeDesembolsoItemMatrix({
  categorias,
  catalogo,
  horizonYears,
  contingenciaPct,
  ipcaPorAno,
  modo,
  fatorAncoragem = 1,
}: ComputeItemMatrixArgs): DesembolsoItemMatrixResult {
  // Multiplicador por ano — mesma lógica do computeDesembolsoMatrix, pré-
  // calculada em uma pass para reusar por item. `provFator` = (1+cont/100)
  // aplicado em todos os anos quando modo != 'base'. `ipcaAcum[ano]` = ∏(1+r_i)
  // do ano 1 até N; array de 1s quando ipca ausente ou modo != 'ipca'.
  const provFator = modo === 'base' ? 1 : (1 + contingenciaPct / 100)
  const ipcaAcum = new Array<number>(horizonYears).fill(1)
  if (modo === 'ipca' && ipcaPorAno && ipcaPorAno.length >= horizonYears) {
    let acum = 1
    for (let i = 0; i < horizonYears; i++) {
      acum *= 1 + ipcaPorAno[i]
      ipcaAcum[i] = acum
    }
  }
  const modoMultiplierPorAno = ipcaAcum.map(f => provFator * f)

  const groups: DesembolsoItemGroup[] = []
  const totaisPorAno = new Array<number>(horizonYears).fill(0)

  for (const cat of categorias) {
    const items: DesembolsoItemGroup['items'] = []
    const subtotaisPorAno = new Array<number>(horizonYears).fill(0)

    for (const item of cat.items) {
      const { valoresPorAno, hasValue } = distribuirItem(item, horizonYears)
      if (!hasValue) continue

      // Aplica ancoragem + modo por célula (mesma ordem do agregado:
      // fator_ancoragem uniforme, depois provisão, depois IPCA cumulativo).
      for (let a = 0; a < horizonYears; a++) {
        valoresPorAno[a] *= fatorAncoragem * modoMultiplierPorAno[a]
      }

      items.push({ nome: item.name || '—', unidade: item.unit ?? '', valoresPorAno })
      for (let a = 0; a < horizonYears; a++) {
        subtotaisPorAno[a] += valoresPorAno[a]
        totaisPorAno[a] += valoresPorAno[a]
      }
    }

    if (items.length > 0) {
      const nome = catalogo.find(c => c.id === cat.catalogoId)?.nome ?? '—'
      groups.push({ categoriaNome: nome, items, subtotaisPorAno })
    }
  }

  const totalGeral = totaisPorAno.reduce((a, b) => a + b, 0)

  return { groups, totaisPorAno, totalGeral }
}
