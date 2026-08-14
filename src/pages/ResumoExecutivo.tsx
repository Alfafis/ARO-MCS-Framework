import { useState } from 'react'
import { DollarSign, ArrowLeftRight, ArrowUpRight, Plus, Copy, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import ClientSelector, { type ClientOption } from '@/components/layout/ClientSelector'
import KpiCard from '@/components/dashboard/KpiCard'
import RecentLaunches from '@/components/dashboard/RecentLaunches'
import RevisionTimeline from '@/components/dashboard/RevisionTimeline'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import FanChartCard from '@/components/resumo-executivo/FanChartCard'
import RisksCard from '@/components/resumo-executivo/RisksCard'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'
import {
  MOCK_CATEGORIES, MOCK_TOTALS,
  MOCK_DISBURSEMENT_VALUES, MOCK_METHOD_VALUES,
  MOCK_RISK_METRIC_VALUES, buildFanData,
} from '@/data/relatorio-mock'
import { getCodeByClientId } from '@/data/invite-codes'
import type { MonetaryMethod, DisbursementYear, RiskMetric } from '@/types/relatorio'

const CLIENTS: ClientOption[] = [
  { id: '1', name: 'NX Gold · Fechamento de Mina' },
  { id: '2', name: 'ARO · Plano de Fechamento 2024' },
  { id: '3', name: 'Mineração Horizonte · Fase 2' },
]

export default function ResumoExecutivo() {
  const navigate = useNavigate()
  const t = useT(resumoT)
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)
  const [linkCopied, setLinkCopied] = useState(false)

  async function handleGerarLink() {
    const invite = getCodeByClientId(selectedClient)
    if (!invite) return
    const url = `${window.location.origin}/portal-cliente?code=${invite.code}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      prompt('Copie o link de acesso do cliente:', url)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  const methods: MonetaryMethod[] = [
    { label: t.method1, value: MOCK_METHOD_VALUES[0] },
    { label: t.method2, value: MOCK_METHOD_VALUES[1] },
    { label: t.method3, value: MOCK_METHOD_VALUES[2] },
    { label: t.method4, value: MOCK_METHOD_VALUES[3] },
  ]

  const disbursementYears: DisbursementYear[] = MOCK_DISBURSEMENT_VALUES.map((value, i) => ({
    label: `${t.yearPrefix} ${i + 1}`,
    value,
  }))

  const fanData = buildFanData(
    MOCK_DISBURSEMENT_VALUES.map((_, i) =>
      `${t.yearPrefix[0]}${t.yearPrefix.slice(1).toLowerCase()} ${i + 1}`
    )
  )

  const riskMetrics: RiskMetric[] = [
    { label: t.metricMean,   value: MOCK_RISK_METRIC_VALUES[0] },
    { label: t.metricStddev, value: MOCK_RISK_METRIC_VALUES[1] },
    { label: 'P(x > 80%)',   value: MOCK_RISK_METRIC_VALUES[2] },
    { label: 'Prob. de excedência (x>80%)', value: MOCK_RISK_METRIC_VALUES[3] },
  ]

  return (
    <div>
      <PageHeader
        title={t.headerTitle}
        badge="Rev1"
        clientSelector={
          <ClientSelector
            options={CLIENTS}
            value={selectedClient}
            onChange={setSelectedClient}
          />
        }
        actions={
          <>
            <Button variant="ghost" onClick={handleGerarLink}>
              {linkCopied
                ? <><Check size={13} /> Link copiado!</>
                : <><Copy size={13} /> Gerar link do cliente</>}
            </Button>
            <Button variant="ghost">{t.exportPdf}</Button>
            <Button variant="primary" onClick={() => navigate('/simulacao')}>{t.runSimulation}</Button>
          </>
        }
      />

      <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-4">

        {/* Linha 1 — 4 KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<DollarSign size={14} strokeWidth={2} aria-hidden="true" />}
            label={t.avgCost}
            value="R$ 32,4 M"
            sub={t.avgCostSub}
          />
          <KpiCard
            icon={<ArrowLeftRight size={14} strokeWidth={2} aria-hidden="true" />}
            label={t.minMaxRange}
            value="R$ 29,6–35,2 M"
            sub={t.minMaxSub}
          />
          <KpiCard
            icon={<ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />}
            label={t.updatedValue}
            value="R$ 36,9 M"
            sub={t.updatedSub}
          />
          <KpiCard
            icon={<Plus size={14} strokeWidth={2} aria-hidden="true" />}
            label={t.baseProvision}
            value="R$ 40,57 M"
            sub={t.baseSub}
          />
        </div>

        <MonetaryMethodsCard methods={methods} />
        <AnnualDisbursementCard years={disbursementYears} />
        <FanChartCard data={fanData} />
        <RisksCard />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <CostByCategoryTable
            categories={MOCK_CATEGORIES}
            totals={MOCK_TOTALS}
            className="col-span-7"
          />
          <RiskMetricsCard
            metrics={riskMetrics}
            cvLabel="CV = 4,97%"
            icLo="IC 95%: R$ 32,35 M"
            icHi="R$ 32,41 M"
            contingency="0%"
            className="col-span-5"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <RecentLaunches />
          <RevisionTimeline />
        </div>

      </div>
    </div>
  )
}
