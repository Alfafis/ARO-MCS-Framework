import type { ParametroAnual } from '@/types/parametrosGlobais'

// Ano-base do template NX Gold. A Tabela 1 do `_Dados_Planilha.md` está em
// base 2022 — `custo_provavel` das 8 categorias (F18 da planilha) e os
// `custo_min/max` dos 62 itens template todos referenciam este ano.
//
// Se um dia surgir um template com base diferente (ex: Petz-Reciclagem em
// base 2025), virar coluna `ano_base` em `tipos_projeto` ou coluna similar
// em `categorias_template`. Por enquanto, constante.
export const ANO_BASE_TEMPLATE = 2022

export interface FatorAncoragem {
  // Multiplicador base_template → data_base_projeto usando IPCA midpoint por
  // ano. 1 = sem ajuste. Nome preservado por retrocompat com callers antigos —
  // é o mesmo que fatorMid.
  fator: number
  // Cenário determinístico "otimista" (IPCA min por ano acumulado) — replica
  // linha 20 de `0. Síntese Por Setor` da planilha NX Gold (ADR-013, D15).
  // 1 quando não há ancoragem.
  fatorMin: number
  // Alias explícito de `fator` — mesmo valor, nome mais claro quando co-existe
  // com fatorMin/fatorMax.
  fatorMid: number
  // Cenário determinístico "pessimista" (IPCA max por ano acumulado) — linha
  // 21 da planilha. 1 quando não há ancoragem.
  fatorMax: number
  // Anos ausentes em parametros_anuais dentro do range [anoBaseTemplate,
  // anoBaseProjeto). Quando não-vazio, TODOS os fatores voltam 1 e a UI mostra
  // aviso — preferimos NÃO ajustar do que ajustar errado com buraco no meio
  // (mesmo princípio de sequenciaMidpoints).
  faltantes: number[]
  // Range inclusivo de anos considerados na multiplicação — útil pra tooltip
  // e pra i18n do badge de ancoragem.
  anoInicio: number
  anoFim: number
}

// Constrói o fator de ancoragem base_template → data_base_projeto.
//
// Ancoragem = ∏(1 + ipca_i) do ano_base_template até ano_base_projeto - 1.
// Retorna 3 versões — min/mid/max — cada uma usando o percentil correspondente
// do IPCA anual (min = valorMin/100, mid = (min+max)/2/100, max = valorMax/100).
// Replica as linhas 18-21 de `0. Síntese Por Setor` da planilha NX Gold que
// calcula valor esperado com IPCA min E IPCA max separadamente (ADR-013, D15).
//
// Ex: template base 2022, projeto data-base 2026:
//   fatorMid = (1 + ipca_mid_2022) × ... × (1 + ipca_mid_2025)
//   fatorMin = (1 + ipca_min_2022) × ... × (1 + ipca_min_2025)  ← cenário otimista
//   fatorMax = (1 + ipca_max_2022) × ... × (1 + ipca_max_2025)  ← cenário pessimista
//
// Se ano_base_projeto <= ano_base_template, todos = 1 (sem ajuste; não
// desconta pra trás — se o projeto estiver rodando em 2020 com template
// 2022, o consultor deve corrigir a data-base manualmente).
export function computeFatorAncoragem(
  anoBaseTemplate: number,
  anoBaseProjeto: number,
  parametrosAnuais: ParametroAnual[]
): FatorAncoragem {
  if (!Number.isFinite(anoBaseProjeto) || anoBaseProjeto <= anoBaseTemplate) {
    return {
      fator: 1,
      fatorMin: 1,
      fatorMid: 1,
      fatorMax: 1,
      faltantes: [],
      anoInicio: anoBaseTemplate,
      anoFim: anoBaseProjeto,
    }
  }

  const anosAlvo: number[] = []
  for (let ano = anoBaseTemplate; ano < anoBaseProjeto; ano++) anosAlvo.push(ano)

  // Cada entry guarda min/mid/max já em fração (5.79 → 0.0579).
  const ipcaMap = new Map<number, { min: number; mid: number; max: number }>()
  for (const p of parametrosAnuais) {
    if (p.chave !== 'inflacao_ipca') continue
    if (p.valorMin == null || p.valorMax == null) continue
    ipcaMap.set(p.ano, {
      min: p.valorMin / 100,
      mid: (p.valorMin + p.valorMax) / 2 / 100,
      max: p.valorMax / 100,
    })
  }

  const faltantes: number[] = []
  let fatorMin = 1
  let fatorMid = 1
  let fatorMax = 1
  for (const ano of anosAlvo) {
    const r = ipcaMap.get(ano)
    if (r == null) {
      faltantes.push(ano)
    } else {
      fatorMin *= 1 + r.min
      fatorMid *= 1 + r.mid
      fatorMax *= 1 + r.max
    }
  }

  if (faltantes.length > 0) {
    return {
      fator: 1,
      fatorMin: 1,
      fatorMid: 1,
      fatorMax: 1,
      faltantes,
      anoInicio: anoBaseTemplate,
      anoFim: anoBaseProjeto - 1,
    }
  }
  return {
    fator: fatorMid,
    fatorMin,
    fatorMid,
    fatorMax,
    faltantes: [],
    anoInicio: anoBaseTemplate,
    anoFim: anoBaseProjeto - 1,
  }
}
