import type { FatorAncoragem } from '@/lib/ancoragem'

interface AncoragemBadgeLabels {
  incompleteLabel: (qtdAnos: number) => string
  incompleteTitle: (faltantes: string, anoInicio: number) => string
  label: (anoInicio: number, anoFim: number, pct: string) => string
  title: (fator: string, anoInicio: number, anoFim: number) => string
}

const DEFAULT_ANCORAGEM_LABELS: AncoragemBadgeLabels = {
  incompleteLabel: (qtdAnos) => `⚠ ancoragem incompleta (${qtdAnos} ano${qtdAnos === 1 ? '' : 's'} sem IPCA)`,
  incompleteTitle: (faltantes, anoInicio) =>
    `Anos sem IPCA em parâmetros anuais: ${faltantes}. Sem ancoragem — valores em base ${anoInicio}.`,
  label: (anoInicio, anoFim, pct) => `ancoragem ${anoInicio}→${anoFim} (+${pct}%)`,
  title: (fator, anoInicio, anoFim) => `Valores multiplicados por ${fator} (IPCA acumulado ${anoInicio}–${anoFim}).`,
}

// Badge sutil que informa se a matriz e a Aro Simulação estão ancoradas na data-base do
// projeto (fator > 1) ou não. Quando há anos faltantes em `parametros_anuais`,
// mostra em amber com a lista de anos.
export function AncoragemBadge({
  ancoragem,
  labels = DEFAULT_ANCORAGEM_LABELS,
}: {
  ancoragem: FatorAncoragem
  labels?: AncoragemBadgeLabels
}) {
  if (ancoragem.faltantes.length > 0) {
    return (
      <span
        className="text-[0.7rem] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
        title={labels.incompleteTitle(ancoragem.faltantes.join(', '), ancoragem.anoInicio)}
      >
        {labels.incompleteLabel(ancoragem.faltantes.length)}
      </span>
    )
  }
  if (ancoragem.fator === 1) return null
  const pct = (ancoragem.fator - 1) * 100
  return (
    <span
      className="text-[0.7rem] font-medium text-c-text-2 bg-c-bg rounded-full px-2 py-0.5"
      title={labels.title(ancoragem.fator.toFixed(4), ancoragem.anoInicio, ancoragem.anoFim)}
    >
      {labels.label(ancoragem.anoInicio, ancoragem.anoFim + 1, pct.toFixed(1))}
    </span>
  )
}
