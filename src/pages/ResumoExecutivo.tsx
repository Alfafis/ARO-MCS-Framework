import { DollarSign, ArrowLeftRight, ArrowUpRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import KpiCard from '@/components/dashboard/KpiCard'
import RecentLaunches from '@/components/dashboard/RecentLaunches'
import RevisionTimeline from '@/components/dashboard/RevisionTimeline'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import FanChartCard from '@/components/resumo-executivo/FanChartCard'
import RisksCard from '@/components/resumo-executivo/RisksCard'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'

export default function ResumoExecutivo() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Resumo Executivo"
        badge="Rev1"
        subtitle="NX Gold · Fechamento de Mina — Provisionamento VP rev0"
        actions={
          <>
            <Button variant="ghost">Exportar PDF</Button>
            <Button variant="primary" onClick={() => navigate('/simulacao')}>Rodar simulação</Button>
          </>
        }
      />

      <div className="px-8 pb-8 flex flex-col gap-4">

        {/* Linha 1 — 4 KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            icon={<DollarSign size={14} strokeWidth={2} aria-hidden="true" />}
            label="Custo médio"
            value="R$ 32,4 M"
            sub="Monte Carlo · 10.000 iterações"
          />
          <KpiCard
            icon={<ArrowLeftRight size={14} strokeWidth={2} aria-hidden="true" />}
            label="Faixa min–max"
            value="R$ 29,6–35,2 M"
            sub="Custo total, 8 categorias"
          />
          <KpiCard
            icon={<ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />}
            label="Valor atualizado 2023"
            value="R$ 36,9 M"
            sub="Custo total, valor atualizado"
          />
          <KpiCard
            icon={<Plus size={14} strokeWidth={2} aria-hidden="true" />}
            label="Provisão base"
            value="R$ 40,57 M"
            sub="Valor presente antes de atualização"
          />
        </div>

        {/* Linha 2 — Métodos de atualização monetária */}
        <MonetaryMethodsCard />

        {/* Linha 3 — Desembolso projetado por ano */}
        <AnnualDisbursementCard />

        {/* Linha 4 — Fan chart */}
        <FanChartCard />

        {/* Linha 5 — Riscos e pontos de atenção */}
        <RisksCard />

        {/* Linha 6 — Custo por categoria + Métricas de risco */}
        <div className="grid grid-cols-12 gap-4">
          <CostByCategoryTable />
          <RiskMetricsCard />
        </div>

        {/* Linha 7 — Lançamentos recentes + Timeline de revisões */}
        <div className="grid grid-cols-12 gap-4">
          <RecentLaunches />
          <RevisionTimeline />
        </div>

      </div>
    </div>
  )
}
