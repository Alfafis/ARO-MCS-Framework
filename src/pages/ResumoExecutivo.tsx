import { useState } from 'react'
import { DollarSign, ArrowLeftRight, ArrowUpRight, Plus } from 'lucide-react'
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

const CLIENTS: ClientOption[] = [
  { id: '1', name: 'NX Gold · Fechamento de Mina' },
  { id: '2', name: 'ARO · Plano de Fechamento 2024' },
  { id: '3', name: 'Mineração Horizonte · Fase 2' },
]

export default function ResumoExecutivo() {
  const navigate = useNavigate()
  const t = useT(resumoT)
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)

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
            <Button variant="ghost">{t.exportPdf}</Button>
            <Button variant="primary" onClick={() => navigate('/simulacao')}>{t.runSimulation}</Button>
          </>
        }
      />

      <div className="px-8 pb-8 flex flex-col gap-4">

        {/* Linha 1 — 4 KPI cards */}
        <div className="grid grid-cols-4 gap-4">
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

        <MonetaryMethodsCard />
        <AnnualDisbursementCard />
        <FanChartCard />
        <RisksCard />

        <div className="grid grid-cols-12 gap-4">
          <CostByCategoryTable />
          <RiskMetricsCard />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <RecentLaunches />
          <RevisionTimeline />
        </div>

      </div>
    </div>
  )
}
