import type { CategoryItem, CampoOperacionalTemplate } from '@/types/categorias'
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
  // Novos (migration 20260824120000_setores_fase_ano.sql).
  // `fase` é `text` com CHECK no banco — tipos gerados vêm como string, o
  // mapper faz o narrow pra Fase (valores fora do enum caem em null).
  aplicabilidade_setores?:  number[] | null
  fase?:                    string | null
  ano_inicio?:              number | null
  ano_fim?:                 number | null
  // Legado (transitório)
  aplicabilidade:           string | null
  ano_previsto:             string | null
}

const FASES_VALIDAS: readonly Fase[] = ['pre-fechamento', 'fechamento', 'pos-fechamento']

function narrowFase(valor: string | null | undefined): Fase | null {
  return valor && (FASES_VALIDAS as readonly string[]).includes(valor) ? (valor as Fase) : null
}

interface CampoOperacionalTemplateRow {
  id:               string
  label:            string
  unidade:          string | null
  valor_referencia: string | null
  ordem:            number
}

export function mapCampoOperacionalTemplateRow(row: CampoOperacionalTemplateRow): CampoOperacionalTemplate {
  return {
    id:              row.id,
    label:           row.label,
    unidade:         row.unidade ?? '',
    valorReferencia: row.valor_referencia ?? '',
    ordem:           row.ordem,
  }
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
    fase:                  narrowFase(row.fase),
    anoInicio:             row.ano_inicio ?? null,
    anoFim:                row.ano_fim ?? null,
    aplicabilidade:        row.aplicabilidade ?? '',
    anoPrevisto:           row.ano_previsto ?? '',
  }
}
