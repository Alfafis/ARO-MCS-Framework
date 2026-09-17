import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { categoriasT } from '@/i18n/categorias'
import { aroSimForOneCategory, MIN_ITERATIONS, type CategoryParam } from '@/lib/aroSimulacao'
import { formatMoedaBR, formatMoedaCompact } from '@/lib/financeiro'

// Painel Aro Simulação POR CATEGORIA. Replica as 3 seções da aba de categoria da
// planilha de referência (`1.Estudos` linhas 20-57): Normal (F21-F31), Triangular
// (F34-F44) e Uniforme (F47-F57). Cada bloco é uma rodada independente da
// engine — na planilha, coluna B (Normal), D (Triangular) e E (Uniforme) usam
// sementes independentes, então as médias variam levemente entre rodadas.
//
// **Nota de fidelidade:** a "Normal" da planilha é RANDBETWEEN(min, max) —
// tecnicamente uniforme discreta, rotulada "Normal" por convenção do autor.
// Aqui usamos o sampler Uniforme para o bloco Normal (opção A do alinhamento
// 2026-09-10), reproduzindo o comportamento da planilha ao invés da normal
// PERT-Beta que o motor tem em `sampleNormal`. Consequência esperada: blocos
// Normal e Uniforme dão resultados quase idênticos (≈ (min+max)/2, com ruído
// estatístico), só Triangular usa `custo_provavel`.
//
// `param` já vem escalado pela ancoragem base_template → data_base_projeto
// (fator aplicado em categoryParamsFromCategorias) — este card mostra as
// métricas no mesmo espaço de valores do dashboard.
//
// `iterations` vem da última simulação salva do projeto (via useSimulation).
// Fallback = MIN_ITERATIONS (10.000) quando ainda não houve rodada.
//
// `custoProvavelRaw` (nullable) é a moda que o consultor cadastrou, ANTES do
// clamp de `categoryParamsFromCategorias`. Serve pra detectar o caso "moda
// fora do range" — típico com template de referência copiado (moda hardcoded 8,15M
// pra um projeto com itens muito menores). Quando fora do range, banner
// amber deixa o clamp explícito (só afeta Triangular; Normal/Uniforme
// ignoram a moda por design).
interface Props {
  param: CategoryParam
  iterations?: number
  custoProvavelRaw?: number | null
}

const CONFIDENCE = 95

export default function CategoryAroSimStatsCard({
  param,
  iterations = MIN_ITERATIONS,
  custoProvavelRaw = null,
}: Props) {
  const t = useT(categoriasT)

  const sims = useMemo(() => {
    if (param.min <= 0 && param.max <= 0) return null
    return {
      normal: aroSimForOneCategory('Uniforme', iterations, param, CONFIDENCE),
      triangular: aroSimForOneCategory('Triangular', iterations, param, CONFIDENCE),
      uniforme: aroSimForOneCategory('Uniforme', iterations, param, CONFIDENCE),
    }
  }, [param, iterations])

  if (!sims) return null

  // Moda fora do range → Triangular degenerada (mode clampado num extremo).
  // Aviso card-level pra ser a primeira coisa que o leitor vê antes das métricas.
  const modaOutOfRange =
    custoProvavelRaw !== null &&
    custoProvavelRaw > 0 &&
    param.max > 0 &&
    (custoProvavelRaw < param.min || custoProvavelRaw > param.max)
  const modaClamped = modaOutOfRange ? Math.max(param.min, Math.min(param.max, custoProvavelRaw!)) : null

  return (
    <div className="mt-4 pt-3 border-t border-c-line flex flex-col gap-4">
      <div className="text-[0.75rem] font-semibold tracking-wide uppercase text-c-text-2">
        {t.simStatsTitle}
      </div>
      {modaOutOfRange && (
        <div
          className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-md text-[0.75rem] text-amber-800 leading-snug"
          role="alert"
        >
          <AlertTriangle size={14} className="shrink-0 mt-[2px]" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{t.simModaClampedTitle}</span>
            <span>
              {t.simModaClampedBody(
                formatMoedaBR(custoProvavelRaw!),
                formatMoedaBR(param.min),
                formatMoedaBR(param.max),
                formatMoedaBR(modaClamped!)
              )}
            </span>
          </div>
        </div>
      )}
      <DistBlock label={t.simDistNormal(sims.normal.iterationsRun.toLocaleString('pt-BR'))} sim={sims.normal} tLabels={t} />
      <DistBlock label={t.simDistTriangular(sims.triangular.iterationsRun.toLocaleString('pt-BR'))} sim={sims.triangular} tLabels={t} />
      <DistBlock label={t.simDistUniforme(sims.uniforme.iterationsRun.toLocaleString('pt-BR'))} sim={sims.uniforme} tLabels={t} />
    </div>
  )
}

interface DistBlockProps {
  label: string
  sim: ReturnType<typeof aroSimForOneCategory>
  tLabels: {
    simStatsMean: string
    simStatsStddev: string
    simStatsP80: string
    simStatsIC: (conf: number) => string
    simStatsCV: string
  }
}

function DistBlock({ label, sim, tLabels }: DistBlockProps) {
  const cvPct = (sim.cv * 100).toFixed(2).replace('.', ',') + '%'
  return (
    <div>
      <div className="text-[0.7rem] font-semibold tracking-widest uppercase text-c-text-2 mb-2">
        {label}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCell label={tLabels.simStatsMean} value={formatMoedaCompact(sim.mean)} />
        <StatCell label={tLabels.simStatsStddev} value={formatMoedaCompact(sim.stddev)} />
        <StatCell label={tLabels.simStatsP80} value={formatMoedaCompact(sim.p80)} />
        <StatCell
          label={tLabels.simStatsIC(CONFIDENCE)}
          value={`${formatMoedaCompact(sim.icLo)} – ${formatMoedaCompact(sim.icHi)}`}
        />
        <StatCell label={tLabels.simStatsCV} value={cvPct} />
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
