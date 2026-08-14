import { useState } from 'react'
import { DollarSign, ArrowLeftRight, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import ClientSelector, { type ClientOption } from '@/components/layout/ClientSelector'
import KpiCard from '@/components/dashboard/KpiCard'
import CostByCategory from '@/components/dashboard/CostByCategory'
import ConfidenceCard from '@/components/dashboard/ConfidenceCard'
import RecentLaunches from '@/components/dashboard/RecentLaunches'
import RevisionTimeline from '@/components/dashboard/RevisionTimeline'

const CLIENTS: ClientOption[] = [
  { id: '1', name: 'NX Gold · Fechamento de Mina' },
  { id: '2', name: 'ARO · Plano de Fechamento 2024' },
  { id: '3', name: 'Mineração Horizonte · Fase 2' },
]

export default function Dashboard() {
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)

  return (
    <div>
      <PageHeader
        title="Fechamento de Mina — ARO"
        badge="Rev0"
        subtitle="Data-base 2023 · Atualizado há 2 dias"
        clientSelector={
          <ClientSelector
            options={CLIENTS}
            value={selectedClient}
            onChange={setSelectedClient}
          />
        }
        actions={
          <>
            <Button variant="ghost">Exportar PDF</Button>
            <Button variant="primary">Rodar simulação</Button>
          </>
        }
      />

      <div className="px-8 pb-8 flex flex-col gap-4">

        {/* Linha 1 — KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <KpiCard
            icon={<DollarSign size={14} strokeWidth={2} aria-hidden="true" />}
            label="Custo esperado"
            value="R$ 38,5 M"
            sub="Monte Carlo · 10.000 iterações"
          />
          <KpiCard
            icon={<ArrowLeftRight size={14} strokeWidth={2} aria-hidden="true" />}
            label="Faixa min–max"
            value="R$ 29,6–35,2 M"
            sub="Soma dos 8 setores"
          />
          <KpiCard
            icon={<ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />}
            label="Valor atualizado 2023"
            value="R$ 40,6 M"
            sub=""
            delta="+11%"
            deltaPositive={false}
          />
        </div>

        {/* Linha 2 — Custo por categoria + Confiabilidade */}
        <div className="grid grid-cols-12 gap-4">
          <CostByCategory />
          <ConfidenceCard />
        </div>

        {/* Linha 3 — Lançamentos + Timeline */}
        <div className="grid grid-cols-12 gap-4">
          <RecentLaunches />
          <RevisionTimeline />
        </div>

      </div>
    </div>
  )
}
