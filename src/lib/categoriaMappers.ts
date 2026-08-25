import type { CategoryItem } from '@/types/categorias'
import type { Fase } from '@/types/setores'
import { formatMoedaBR } from '@/lib/financeiro'

// Shape estrutural comum a itens_custo e itens_template (mesmas colunas de
// conteúdo, FK pra tabela pai diferente) — permite reaproveitar o mapper pros
// dois sem duplicar a função só por causa do tipo gerado divergir.
interface ItemCustoLikeRow {
  id:                       string
  nome:                     string
  unidade:                  string
  custo_min:                number
  custo_max:                number
  fonte:                    string | null
  // Novos (migration 20260824120000_setores_fase_ano.sql)
  aplicabilidade_setores?:  number[] | null
  fase?:                    Fase | null
  ano_inicio?:              number | null
  ano_fim?:                 number | null
  // Legado (transitório)
  aplicabilidade:           string | null
  ano_previsto:             string | null
}

// Compartilhado entre ProjetoContext (admin, projeto real e template) e
// PortalClienteRelatorio (público) — todos convertem a mesma forma de linha
// de custo pro mesmo shape de tela.
export function mapItemCustoRow(row: ItemCustoLikeRow): CategoryItem {
  return {
    id:                    row.id,
    name:                  row.nome,
    unit:                  row.unidade,
    min:                   formatMoedaBR(row.custo_min),
    max:                   formatMoedaBR(row.custo_max),
    source:                row.fonte ?? '',
    aplicabilidadeSetores: row.aplicabilidade_setores ?? null,
    fase:                  row.fase ?? null,
    anoInicio:             row.ano_inicio ?? null,
    anoFim:                row.ano_fim ?? null,
    aplicabilidade:        row.aplicabilidade ?? '',
    anoPrevisto:           row.ano_previsto ?? '',
  }
}
