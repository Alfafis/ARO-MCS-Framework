import type { Category, CategoriaCatalogo } from '@/types/categorias'
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
}

export function computeDesembolsoMatrix({ categorias, catalogo, horizonYears, contingenciaPct, ipcaPorAno, modo }: ComputeArgs): DesembolsoMatrixResult {
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
