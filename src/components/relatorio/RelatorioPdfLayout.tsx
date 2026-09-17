import { DollarSign, ArrowLeftRight, Plus } from 'lucide-react'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import RiskMetricsCard, { type RiskScenario } from '@/components/resumo-executivo/RiskMetricsCard'
import CostCompositionCard, { type CostCompositionItem } from '@/components/resumo-executivo/CostCompositionCard'
import DisbursementLineCard from '@/components/resumo-executivo/DisbursementLineCard'
import HistogramCard from '@/components/simulacao/HistogramCard'
import RiskDriversCard from '@/components/simulacao/RiskDriversCard'
import ScenariosCard from '@/components/simulacao/ScenariosCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import { AncoragemBadge } from '@/components/resumo-executivo/AncoragemBadge'
import { formatMoedaCompact, scaleSimStringValue } from '@/lib/financeiro'
import { useT } from '@/i18n/useLang'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { resumoT } from '@/i18n/resumo-executivo'
import type { CostCategory, CostTotals, DisbursementYear, DisbursementCategory, RiskMetric } from '@/types/relatorio'
import type { SimResult } from '@/types/simulacao'
import type { FatorAncoragem } from '@/lib/ancoragem'

// Layout do relatório usado no export para PDF. Renderiza o corpo do
// Portal do Cliente como componente puro — recebe todos os cálculos já
// prontos via props. Consumido offscreen pelo ResumoExecutivo antes do
// html2pdf capturar o nó. Portal do Cliente atualmente usa layout próprio;
// a unificação vai acontecer quando a task #4 do backlog rodar.
export interface RelatorioPdfLayoutProps {
  projectName: string
  revLabel: string | null
  clienteNome: string
  simResult: SimResult | null
  costCategories: CostCategory[]
  costTotals: CostTotals
  riskMetrics: RiskMetric[]
  riskScenarios?: RiskScenario[]
  /** Fase 1 do enriquecimento do relatório — 3 cards novos (Composição,
   *  Direcionadores de risco, Histograma). Composição é opcional: se não vier,
   *  o PDF não renderiza esse bloco. Direcionadores e Histograma vêm do
   *  `simResult` (renderizam quando a simulação já foi rodada). */
  compositionItems?: CostCompositionItem[]
  cvLabel: string
  icLoLabel: string
  icHiLabel: string
  confLevel: number
  contingenciaPct: number
  // `baseWithProvisionOrModo` = disbursement.totalGeral quando o modo do
  // toggle está em provisão/IPCA, ou baseWithProvision no fallback. É o valor
  // que vai no KPI "Provisão base" — mantém consistência com o resto do
  // relatório (Custo médio, métricas de risco já re-escaladas via modoMultiplier).
  baseWithProvisionOrModo: number
  baseTotal: number
  modoMultiplier: number
  ancoragem: FatorAncoragem
  disbursement: {
    years: DisbursementYear[]
    categories: DisbursementCategory[]
    /** Números crus por ano — alimentam o DisbursementLineCard sem
     *  reparsear as strings do `years[i].value`. Opcional pra retrocompat. */
    totaisPorAno?: number[]
  } | null
  monetaryMethods: Array<{ label: string; value: string }>
  horizonteAnos: number
  logoUrl: string
}

export default function RelatorioPdfLayout(props: RelatorioPdfLayoutProps) {
  const t = useT(relatorioClienteT)
  const tBase = useT(resumoT)
  const {
    projectName,
    revLabel,
    clienteNome,
    simResult,
    costCategories,
    costTotals,
    riskMetrics,
    riskScenarios,
    compositionItems,
    cvLabel,
    icLoLabel,
    icHiLabel,
    confLevel,
    contingenciaPct,
    baseWithProvisionOrModo,
    baseTotal,
    modoMultiplier,
    ancoragem,
    disbursement,
    monetaryMethods,
    horizonteAnos,
    logoUrl,
  } = props

  const kpis = [
    {
      icon: <DollarSign size={14} strokeWidth={2} className="text-accent-700" />,
      label: t.kpiAvgCost,
      value: simResult ? scaleSimStringValue(simResult.mean, modoMultiplier) : '—',
      sub: simResult ? t.kpiAvgCostSubSim(simResult.status) : t.simPendingSub,
    },
    {
      icon: <ArrowLeftRight size={14} strokeWidth={2} className="text-accent-700" />,
      label: t.kpiMinMaxRange,
      value: simResult ? scaleSimStringValue(simResult.p10p90, modoMultiplier) : '—',
      sub: simResult ? t.kpiMinMaxSubIC(confLevel, scaleSimStringValue(simResult.ic95, modoMultiplier)) : t.simPendingSub,
    },
    {
      icon: <Plus size={14} strokeWidth={2} className="text-accent-700" />,
      label: t.kpiBaseProvision,
      value: baseTotal > 0 ? formatMoedaCompact(baseWithProvisionOrModo) : '—',
      sub: t.kpiBaseSub(contingenciaPct),
    },
  ]

  return (
    <div className="bg-c-bg" style={{ width: '1040px' }}>
      <div className="flex items-center justify-between px-8 py-6 border-b border-c-line">
        <img src={logoUrl} alt="" className="h-10 w-auto object-contain" />
        <span className="text-[11px] font-semibold text-c-text-2 tracking-widest uppercase">
          {clienteNome} — {t.portalPill}
        </span>
      </div>

      <div className="px-8 py-8 flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[22px] font-bold text-c-text">
              {t.reportTitle} — {projectName}
            </h1>
            {revLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-c-surface-2-hover text-c-text-2 text-[11px] font-semibold">
                {revLabel} · {t.reportRevisionCurrent}
              </span>
            )}
          </div>
          <p className="text-[13px] text-c-text-2">
            {t.reportSubtitleBase(clienteNome)}
            {simResult && t.reportSubtitleSim(simResult.iterations, simResult.distribution)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-c-card rounded-[20px] p-6 flex flex-col gap-3">
              <div className="w-[26px] h-[26px] rounded-[9px] bg-accent-100 flex items-center justify-center shrink-0">
                {kpi.icon}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-c-text-2 mb-1">{kpi.label}</p>
                <p className="text-[20px] font-bold leading-none mb-1 text-c-text">{kpi.value}</p>
                <p className="text-[12px] text-c-text-2">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1.3fr_1fr] gap-4 items-start">
          <CostByCategoryTable
            categories={costCategories}
            totals={costTotals}
            groupByPhase={false}
            ancoragem={ancoragem}
          />
          <RiskMetricsCard
            metrics={riskMetrics}
            cvLabel={cvLabel}
            icLo={icLoLabel}
            icHi={icHiLabel}
            uncertainty={simResult?.uncertainty}
            scenarios={riskScenarios}
          />
        </div>

        {/* Fase 1 do enriquecimento do relatório — mesmos cards espelhados
            no Portal do Cliente e no Resumo Executivo. */}
        {compositionItems && compositionItems.length > 0 && (
          <div className="grid grid-cols-[1.3fr_1fr] gap-4 items-start">
            <CostCompositionCard items={compositionItems} />
            {simResult && <RiskDriversCard result={simResult} />}
          </div>
        )}

        {simResult && <HistogramCard result={simResult} iterations={simResult.iterations} multiplier={modoMultiplier} />}

        {simResult && <ScenariosCard result={simResult} multiplier={modoMultiplier} />}

        {disbursement && disbursement.totaisPorAno && disbursement.totaisPorAno.length > 0 && (
          <DisbursementLineCard
            totalsPorAno={disbursement.totaisPorAno}
            yearLabels={disbursement.years.map((y) => y.label)}
          />
        )}

        {disbursement && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <AncoragemBadge
                ancoragem={ancoragem}
                labels={{
                  incompleteLabel: tBase.ancoragemIncompleteLabel,
                  incompleteTitle: tBase.ancoragemIncompleteTitle,
                  label: tBase.ancoragemLabel,
                  title: tBase.ancoragemTitle,
                }}
              />
            </div>
            <AnnualDisbursementCard years={disbursement.years} categories={disbursement.categories} />
          </div>
        )}

        {monetaryMethods.length > 0 && (
          <MonetaryMethodsCard
            methods={monetaryMethods}
            baseLabel={formatMoedaCompact(baseWithProvisionOrModo)}
            horizonYears={horizonteAnos}
          />
        )}
      </div>
    </div>
  )
}
