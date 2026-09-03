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
  // Multiplicador base_template → data_base_projeto. 1 = sem ajuste.
  fator: number
  // Anos ausentes em parametros_anuais dentro do range [anoBaseTemplate,
  // anoBaseProjeto). Quando não-vazio, `fator` volta 1 e a UI mostra aviso —
  // preferimos NÃO ajustar do que ajustar errado com buraco no meio (mesmo
  // princípio de sequenciaMidpoints).
  faltantes: number[]
  // Range inclusivo de anos considerados na multiplicação — útil pra tooltip
  // e pra i18n do badge de ancoragem.
  anoInicio: number
  anoFim: number
}

// Constrói o fator de ancoragem base_template → data_base_projeto.
//
// Ancoragem = ∏(1 + ipca_i) do ano_base_template até ano_base_projeto - 1.
// Ex: template base 2022, projeto data-base 2026:
//   fator = (1 + ipca_2022) × (1 + ipca_2023) × (1 + ipca_2024) × (1 + ipca_2025)
//
// Se ano_base_projeto <= ano_base_template, fator = 1 (sem ajuste; não
// desconta pra trás — se o projeto estiver rodando em 2020 com template
// 2022, o consultor deve corrigir a data-base manualmente).
export function computeFatorAncoragem(
  anoBaseTemplate: number,
  anoBaseProjeto: number,
  parametrosAnuais: ParametroAnual[]
): FatorAncoragem {
  if (!Number.isFinite(anoBaseProjeto) || anoBaseProjeto <= anoBaseTemplate) {
    return { fator: 1, faltantes: [], anoInicio: anoBaseTemplate, anoFim: anoBaseProjeto }
  }

  const anosAlvo: number[] = []
  for (let ano = anoBaseTemplate; ano < anoBaseProjeto; ano++) anosAlvo.push(ano)

  const ipcaMap = new Map<number, number>()
  for (const p of parametrosAnuais) {
    if (p.chave !== 'inflacao_ipca') continue
    if (p.valorMin == null || p.valorMax == null) continue
    // Ponto médio, mesma convenção de sequenciaMidpoints. /100 porque
    // valor_min/max são percentuais (5.79 = 5,79%), não frações.
    ipcaMap.set(p.ano, (p.valorMin + p.valorMax) / 2 / 100)
  }

  const faltantes: number[] = []
  let fator = 1
  for (const ano of anosAlvo) {
    const r = ipcaMap.get(ano)
    if (r == null) faltantes.push(ano)
    else fator *= 1 + r
  }

  if (faltantes.length > 0) {
    return { fator: 1, faltantes, anoInicio: anoBaseTemplate, anoFim: anoBaseProjeto - 1 }
  }
  return { fator, faltantes: [], anoInicio: anoBaseTemplate, anoFim: anoBaseProjeto - 1 }
}
