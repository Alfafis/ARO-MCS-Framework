import type { FatorAncoragem } from '@/lib/ancoragem'

// Badge sutil que informa se a matriz e o MC estão ancorados na data-base do
// projeto (fator > 1) ou não. Quando há anos faltantes em `parametros_anuais`,
// mostra em amber com a lista de anos.
export function AncoragemBadge({ ancoragem }: { ancoragem: FatorAncoragem }) {
  if (ancoragem.faltantes.length > 0) {
    return (
      <span
        className="text-[0.7rem] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
        title={`Anos sem IPCA em parâmetros anuais: ${ancoragem.faltantes.join(', ')}. Sem ancoragem — valores em base ${ancoragem.anoInicio}.`}
      >
        ⚠ ancoragem incompleta ({ancoragem.faltantes.length} ano{ancoragem.faltantes.length === 1 ? '' : 's'} sem IPCA)
      </span>
    )
  }
  if (ancoragem.fator === 1) return null
  const pct = (ancoragem.fator - 1) * 100
  return (
    <span
      className="text-[0.7rem] font-medium text-c-text-2 bg-c-bg rounded-full px-2 py-0.5"
      title={`Valores multiplicados por ${ancoragem.fator.toFixed(4)} (IPCA acumulado ${ancoragem.anoInicio}–${ancoragem.anoFim}).`}
    >
      ancoragem {ancoragem.anoInicio}→{ancoragem.anoFim + 1} (+{pct.toFixed(1)}%)
    </span>
  )
}
