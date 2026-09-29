export interface TipoProjeto {
  id: string
  nome: string
  // Ano-base dos valores do template deste tipo (migration 20260929120000).
  // `null` = base não declarada — carregar o template não mexe no
  // `anoReferencia` do projeto, porque corrigir sem saber a base é pior que
  // não corrigir. Ver src/lib/ancoragem.ts.
  anoBase: number | null
}
