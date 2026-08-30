import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import { formatMoedaCompact } from '@/lib/financeiro'
import { mcSensibilidadeAno10 } from '@/lib/monteCarlo'

// Card de sensibilidade final do Ano 10 — replica a aba `Simulation` da
// planilha NX Gold (`_Dados_Formulas_Planilha.md` §Etapa 6). O consumidor
// passa o valor base do Ano 10 (já corrigido por IPCA acumulado ou provisão)
// e o modo em que foi calculado; o card roda 10k iterações no useMemo e
// mostra estatísticas + histograma de 12 bins.

interface Props {
  baseAno10:  number
  modoIpcaDisponivel: boolean
  iterations?: number
}

const ITER_DEFAULT = 10_000

export default function SensibilidadeAno10Card({ baseAno10, modoIpcaDisponivel, iterations = ITER_DEFAULT }: Props) {
  const t = useT(simulacaoT)

  // Roda MC apenas quando o base muda — 10k iterações são baratas (<20ms)
  // mas revalidar sem necessidade tira reprodutibilidade visual entre re-renders.
  const result = useMemo(() => {
    if (!baseAno10 || baseAno10 <= 0) return null
    return mcSensibilidadeAno10(baseAno10, iterations, 1, 10)
  }, [baseAno10, iterations])

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-c-text">
        <TrendingUp size={14} color="var(--accent)" aria-hidden="true" />
        <span>{t.sensAno10Title(iterations.toLocaleString('pt-BR'))}</span>
      </div>

      {!result ? (
        <p className="text-[0.8125rem] text-c-text-2 leading-relaxed">{t.sensAno10Empty}</p>
      ) : (
        <>
          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-c-text-2">
              {t.sensAno10Base}:
            </span>
            <span className="font-mono text-[15px] font-bold text-c-text">
              {formatMoedaCompact(result.base)}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f6f5f3] text-c-text-2 font-medium">
              {modoIpcaDisponivel ? t.sensAno10ModeIpca : t.sensAno10ModeProv}
            </span>
          </div>

          {/* Histogram — 12 bins Tailwind puro (`hist-bar`/`histogram` do
              legacy é CSS avulso; aqui seguimos a regra do projeto de usar
              apenas utilitários Tailwind no JSX). */}
          <div className="flex items-end gap-1 h-[100px] mb-2">
            {result.bars.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-[4px] transition-[height] duration-500 ease-out ${
                  h / Math.max(...result.bars) >= 0.45 ? 'bg-[color:var(--accent)]' : 'bg-[#e0ddd9]'
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-c-text-2 mt-2 font-mono text-[0.6875rem]">
            <span>{formatMoedaCompact(result.minVal)}</span>
            <span>{formatMoedaCompact(result.mean)}</span>
            <span>{formatMoedaCompact(result.maxVal)}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            <StatCell label={t.sensAno10Mean}    value={formatMoedaCompact(result.mean)} />
            <StatCell label={t.sensAno10Stddev}  value={formatMoedaCompact(result.stddev)} />
            <StatCell label={t.sensAno10P50}     value={formatMoedaCompact(result.p50)} />
            <StatCell label={t.sensAno10P80}     value={formatMoedaCompact(result.p80)} />
            <StatCell label={t.sensAno10P95}     value={formatMoedaCompact(result.p95)} />
            <StatCell label={t.sensAno10CV}      value={`${(result.cv * 100).toFixed(2).replace('.', ',')}%`} />
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-c-text-2">
            {t.sensAno10RangeInfo(result.taxaMinPct, result.taxaMaxPct)}. {t.sensAno10FooterNote}
          </p>
        </>
      )}
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f6f5f3] rounded-[8px] p-2 flex flex-col items-start">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 mb-0.5">
        {label}
      </span>
      <span className="font-mono text-[13px] font-bold text-c-text">{value}</span>
    </div>
  )
}
