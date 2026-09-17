import { TrendingUp } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import { formatMoedaCompact } from '@/lib/financeiro'

interface Props {
  /** Totais por ano em unidades absolutas (R$), na ordem cronológica. */
  totalsPorAno: number[]
  /** Rótulo de cada ano (ex.: "Ano 01", "Ano 02", …). Mesmo length de totalsPorAno. */
  yearLabels: string[]
  className?: string
}

// SVG puro — evita adicionar dep de gráficos (chart.js/recharts) só pra uma
// linha simples. Layout: viewBox 100×40 (aspecto largo/baixo), padding
// interno pra rótulos não colarem na borda. Área embaixo da curva preenchida
// com accent semitransparente pra reforçar a magnitude. Pontos marcados em
// cada ano; hover nativo do <title> mostra ano+valor.
export default function DisbursementLineCard({ totalsPorAno, yearLabels, className = '' }: Props) {
  const t = useT(resumoT)

  if (totalsPorAno.length === 0) return null

  const maxVal = Math.max(...totalsPorAno, 1e-9)
  const n = totalsPorAno.length
  const padX = 4
  const padY = 6
  const W = 100
  const H = 40

  // Espaçamento horizontal — se só tem 1 ano, coloca no meio; senão distribui.
  const xOf = (i: number) => (n === 1 ? W / 2 : padX + (i * (W - padX * 2)) / (n - 1))
  const yOf = (v: number) => H - padY - (v / maxVal) * (H - padY * 2)

  const points = totalsPorAno.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')
  const areaPath =
    `M ${xOf(0)},${H - padY} ` +
    totalsPorAno.map((v, i) => `L ${xOf(i)},${yOf(v)}`).join(' ') +
    ` L ${xOf(n - 1)},${H - padY} Z`

  const totalGeral = totalsPorAno.reduce((a, b) => a + b, 0)
  const anoPico = totalsPorAno.indexOf(maxVal)

  return (
    <div className={`card ${className}`.trimEnd()}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
          <TrendingUp size={14} color="var(--accent)" aria-hidden="true" />
          <span>{t.disbursementLineTitle}</span>
        </div>
        <span className="font-mono text-[12px] text-c-text-2">
          {t.disbursementLineTotal}: <span className="font-semibold text-c-text">{formatMoedaCompact(totalGeral)}</span>
        </span>
      </div>
      <p className="text-[12px] text-c-text-2 leading-snug mb-4">
        {t.disbursementLineHint(yearLabels[anoPico] ?? '—', formatMoedaCompact(maxVal))}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-32">
        <path d={areaPath} fill="var(--accent)" fillOpacity="0.15" />
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="0.6" strokeLinejoin="round" />
        {totalsPorAno.map((v, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r="0.9" fill="var(--accent)">
            <title>{`${yearLabels[i] ?? `#${i + 1}`}: ${formatMoedaCompact(v)}`}</title>
          </circle>
        ))}
      </svg>

      <div className="flex justify-between mt-1">
        {yearLabels.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="font-mono text-[10px] text-c-text-2"
            style={{ width: `${100 / n}%`, textAlign: n <= 1 ? 'center' : i === 0 ? 'left' : i === n - 1 ? 'right' : 'center' }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
