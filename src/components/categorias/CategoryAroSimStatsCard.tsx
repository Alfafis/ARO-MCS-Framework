import { useMemo } from 'react'
import { useT } from '@/i18n/useLang'
import { categoriasT } from '@/i18n/categorias'
import { aroSimForOneCategory, MIN_ITERATIONS, type CategoryParam } from '@/lib/aroSimulacao'
import { formatMoedaCompact } from '@/lib/financeiro'

// Painel Aro Simulação compacto POR CATEGORIA. Roda a Triangular no useMemo
// — recomputa só quando min/mode/max mudam (edit de item + blur atualiza o
// state → recompute). Engine aplica o piso RB-03 (mínimo 10.000 iterações,
// convergência dinâmica) igual à "simulação oficial" em /simulacao — o
// título do card mostra `sim.iterationsRun`, a contagem real que rodou, não
// um número pedido que a engine pode ter ignorado ou excedido.
//
// `param` já vem escalado pela ancoragem base_template → data_base_projeto
// (fator aplicado em categoryParamsFromCategorias) — este card mostra as
// métricas no mesmo espaço de valores do dashboard.
//
// Espelha a linha 21-32 de cada aba de categoria da planilha NX Gold:
// F21 (média), F22 (σ), F27 (P80), F25/F26 (IC 95% sup/inf), σ/média (CV).
interface Props {
  param: CategoryParam
}

const CONFIDENCE = 95

export default function CategoryAroSimStatsCard({ param }: Props) {
  const t = useT(categoriasT)

  const sim = useMemo(() => {
    if (param.min <= 0 && param.max <= 0) return null
    return aroSimForOneCategory('Triangular', MIN_ITERATIONS, param, CONFIDENCE)
  }, [param])

  if (!sim) return null

  const cvPct = (sim.cv * 100).toFixed(2).replace('.', ',') + '%'

  return (
    <div className="mt-4 pt-3 border-t border-c-line">
      <div className="text-[0.75rem] font-semibold tracking-wide uppercase text-c-text-2 mb-2">
        {t.simStatsTitle(sim.iterationsRun.toLocaleString('pt-BR'))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCell label={t.simStatsMean} value={formatMoedaCompact(sim.mean)} />
        <StatCell label={t.simStatsStddev} value={formatMoedaCompact(sim.stddev)} />
        <StatCell label={t.simStatsP80} value={formatMoedaCompact(sim.p80)} />
        <StatCell
          label={t.simStatsIC(CONFIDENCE)}
          value={`${formatMoedaCompact(sim.icLo)} – ${formatMoedaCompact(sim.icHi)}`}
        />
        <StatCell label={t.simStatsCV} value={cvPct} />
      </div>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-c-text-2">{label}</span>
      <span className="text-[0.875rem] font-semibold text-c-text mono">{value}</span>
    </div>
  )
}
