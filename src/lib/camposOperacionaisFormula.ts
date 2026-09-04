import { Parser } from 'expr-eval'

// Motor de avaliação do grafo de campos operacionais (Subsistema 3, ver spec
// 2026-09-03-timing-formula-campos-operacionais-design.md). Campo sem
// `formula` é folha (valor digitado pelo consultor); campo com `formula`
// referencia outros campos pelo `label` (ex.: "Perímetro * Largura Berma *
// Altura Bancada"). Item de custo referencia um desses campos (avaliados) na
// sua própria `formula_quantidade`.
//
// `expr-eval` (gramática restrita a aritmética, sem eval/Function, sem acesso
// a objeto/protótipo arbitrário) — seguro mesmo com fórmula vinda do banco.

export interface CampoOperacionalInput {
  label: string
  valor: string | null
  formula: string | null
}

export interface CampoAvaliado {
  label: string
  valor: number | null
  erro?: string
}

// BR: ponto = milhar, vírgula = decimal ("315.600" = 315600, "7,89" = 7.89).
// Diferente de `parseMoedaBR` (lib/financeiro.ts): aqui vazio/inválido vira
// `null`, nunca 0 — folha sem valor não pode virar zero silencioso dentro de
// uma cadeia de fórmula (mesma doutrina de "dado não disponível: ocultar,
// nunca inventar" já aplicada em outros cálculos deste projeto).
function parseNumeroCampo(raw: string | null): number | null {
  if (raw == null) return null
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const cleaned = trimmed
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

const parser = new Parser()

// Troca cada label (mais longo primeiro — "Área total" não pode colidir com
// "Área") por um token seguro (`__v0__`, `__v1__`...): labels têm espaço e
// acento, inválidos como identificador do expr-eval.
function tokenizarFormula(formula: string, labels: string[]): { expressao: string; tokens: Map<string, string> } {
  const ordenados = [...labels].sort((a, b) => b.length - a.length)
  const tokens = new Map<string, string>() // token -> label original
  let expressao = formula
  ordenados.forEach((label, i) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped, 'g')
    if (re.test(expressao)) {
      const token = `__v${i}__`
      tokens.set(token, label)
      expressao = expressao.replace(re, token)
    }
  })
  return { expressao, tokens }
}

/**
 * Avalia todos os campos operacionais de uma categoria/item num contexto só.
 * Memoiza por label, detecta ciclo (erro tratado, não recursão infinita).
 * Erro de parse/campo ausente/ciclo vira `valor: null` só pro campo afetado
 * (e quem depende dele) — não derruba os outros campos do mesmo contexto.
 */
export function avaliarCamposOperacionais(campos: CampoOperacionalInput[]): Map<string, CampoAvaliado> {
  const porLabel = new Map(campos.map((c) => [c.label, c]))
  const resultado = new Map<string, CampoAvaliado>()
  const emAvaliacao = new Set<string>()

  function resolver(label: string): CampoAvaliado {
    const cached = resultado.get(label)
    if (cached) return cached

    const campo = porLabel.get(label)
    if (!campo) {
      const erro: CampoAvaliado = { label, valor: null, erro: `Campo "${label}" não encontrado` }
      resultado.set(label, erro)
      return erro
    }

    if (campo.formula == null) {
      const r: CampoAvaliado = { label, valor: parseNumeroCampo(campo.valor) }
      resultado.set(label, r)
      return r
    }

    if (emAvaliacao.has(label)) {
      return { label, valor: null, erro: `Referência circular em "${label}"` }
    }
    emAvaliacao.add(label)

    try {
      const { expressao, tokens } = tokenizarFormula(campo.formula, [...porLabel.keys()])
      const contexto: Record<string, number> = {}
      let erroDep: string | undefined
      for (const [token, labelRef] of tokens) {
        const dep = resolver(labelRef)
        if (dep.valor == null) {
          erroDep = dep.erro ?? `Campo "${labelRef}" sem valor`
          break
        }
        contexto[token] = dep.valor
      }
      if (erroDep) {
        const erro: CampoAvaliado = { label, valor: null, erro: erroDep }
        resultado.set(label, erro)
        return erro
      }
      const valor = parser.evaluate(expressao, contexto)
      const r: CampoAvaliado = Number.isFinite(valor)
        ? { label, valor }
        : { label, valor: null, erro: 'Fórmula não retornou número válido' }
      resultado.set(label, r)
      return r
    } catch (e) {
      const erro: CampoAvaliado = {
        label,
        valor: null,
        erro: e instanceof Error ? e.message : 'Erro ao avaliar fórmula',
      }
      resultado.set(label, erro)
      return erro
    } finally {
      emAvaliacao.delete(label)
    }
  }

  for (const campo of campos) resolver(campo.label)
  return resultado
}

/** Avalia `formula_quantidade` de um item no contexto já resolvido acima. */
export function avaliarQuantidadeItem(
  formula: string,
  camposAvaliados: Map<string, CampoAvaliado>
): { valor: number | null; erro?: string } {
  try {
    const { expressao, tokens } = tokenizarFormula(formula, [...camposAvaliados.keys()])
    const contexto: Record<string, number> = {}
    for (const [token, labelRef] of tokens) {
      const dep = camposAvaliados.get(labelRef)
      if (!dep || dep.valor == null) {
        return { valor: null, erro: dep?.erro ?? `Campo "${labelRef}" sem valor` }
      }
      contexto[token] = dep.valor
    }
    const valor = parser.evaluate(expressao, contexto)
    return Number.isFinite(valor) ? { valor } : { valor: null, erro: 'Fórmula não retornou número válido' }
  } catch (e) {
    return { valor: null, erro: e instanceof Error ? e.message : 'Erro ao avaliar fórmula' }
  }
}
