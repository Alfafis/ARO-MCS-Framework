import type { ItemCustoRow } from '@/types'
import type { CategoryItem } from '@/types/categorias'
import { formatMoedaBR } from '@/lib/financeiro'

// Compartilhado entre ProjetoContext (admin) e PortalClienteRelatorio (público)
// — os dois convertem a mesma linha de itens_custo pro mesmo shape de tela.
export function mapItemCustoRow(row: ItemCustoRow): CategoryItem {
  return {
    id: row.id,
    name: row.nome,
    unit: row.unidade,
    min: formatMoedaBR(row.custo_min),
    max: formatMoedaBR(row.custo_max),
    source: row.fonte ?? '',
    aplicabilidade: row.aplicabilidade ?? '',
    anoPrevisto: row.ano_previsto ?? '',
  }
}
