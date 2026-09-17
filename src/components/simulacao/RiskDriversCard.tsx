import { Crosshair } from 'lucide-react'
import { useT, useLang } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import type { SimResult } from '@/types/simulacao'
import type { RiskDriver } from '@/lib/aroSimulacao'

interface Props {
  result: SimResult | null
}

// Faixas qualitativas de impacto — baseadas em |correlação de Pearson| entre
// categoria e total simulado. Substituem o número cru (ex.: "+0,42") que
// pedia contexto estatístico pra ser interpretado. Faixas alinhadas com o
// que a literatura de análise de risco costuma tratar como "forte/moderada/
// fraca" — sinal ignorado (custos são todos positivos, correlação negativa
// significativa é edge case; se aparecer com |r|<0.2 vira "baixo" mesmo).
function classifyImpact(correlation: number): 'high' | 'medium' | 'low' {
  const abs = Math.abs(correlation)
  if (abs >= 0.5) return 'high'
  if (abs >= 0.2) return 'medium'
  return 'low'
}

const IMPACT_COLOR: Record<'high' | 'medium' | 'low', string> = {
  high: 'text-accent',
  medium: 'text-yellow-600',
  low: 'text-c-text-2',
}

// Monta o hint dinâmico com base nos direcionadores de alto impacto da
// simulação atual. 4 variantes:
// - 0 altos: "Nenhuma categoria domina o risco…"
// - 1 alto: cita ela
// - 2-3 altos: cita todos
// - 4+ altos: cita top 3 + "(entre outras)"
// Junção de nomes usa `Intl.ListFormat` — respeita a gramática do idioma
// atual (pt: "A, B e C" / en: "A, B, and C" / es: "A, B y C").
function buildHint(
  drivers: RiskDriver[],
  lang: string,
  t: (typeof simulacaoT)['pt-BR']
): string {
  const highs = drivers.filter((d) => Math.abs(d.correlation) >= 0.5).map((d) => d.name)
  if (highs.length === 0) return t.riskDriversHintDistributed
  const lf = new Intl.ListFormat(lang, { type: 'conjunction' })
  if (highs.length === 1) return t.riskDriversHintSingle(highs[0])
  if (highs.length <= 3) return t.riskDriversHintMulti(lf.format(highs))
  return t.riskDriversHintMany(lf.format(highs.slice(0, 3)))
}

export default function RiskDriversCard({ result }: Props) {
  const t = useT(simulacaoT)
  const { lang } = useLang()

  // `riskDrivers` pode faltar em SimResult persistido antes desta feature
  // existir — degrada pro estado "sem dado" em vez de quebrar.
  if (!result || !result.riskDrivers) return null

  const drivers = result.riskDrivers
  const maxAbs = Math.max(...drivers.map((d) => Math.abs(d.correlation)), 1e-9)
  const impactLabel: Record<'high' | 'medium' | 'low', string> = {
    high: t.impactHigh,
    medium: t.impactMedium,
    low: t.impactLow,
  }
  const hint = drivers.length >= 2 ? buildHint(drivers, lang, t) : ''

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-1.5 text-sm font-semibold text-c-text">
        <Crosshair size={14} color="var(--accent)" aria-hidden="true" />
        <span>{t.riskDriversTitle}</span>
      </div>
      {hint && <p className="text-[12px] text-c-text-2 leading-snug mb-4">{hint}</p>}

      {drivers.length < 2 ? (
        <p className="text-[0.8125rem] text-c-text-2 leading-relaxed">{t.riskDriversEmpty}</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {drivers.map(({ name, correlation }) => {
            const impact = classifyImpact(correlation)
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="text-[0.8125rem] text-c-text w-[38%] shrink-0 truncate">{name}</span>
                <div className="flex-1 h-2 rounded-full bg-c-surface-2-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(2, (Math.abs(correlation) / maxAbs) * 100)}%` }}
                  />
                </div>
                <span className={`text-[0.75rem] font-semibold whitespace-nowrap ${IMPACT_COLOR[impact]}`}>
                  {impactLabel[impact]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
