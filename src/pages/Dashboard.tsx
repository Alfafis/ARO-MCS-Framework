import { DollarSign, ArrowLeftRight, ArrowUpRight } from 'lucide-react'
import KpiCard from '@/components/dashboard/KpiCard'
import CostByCategory from '@/components/dashboard/CostByCategory'
import ConfidenceCard from '@/components/dashboard/ConfidenceCard'
import RecentLaunches from '@/components/dashboard/RecentLaunches'
import RevisionTimeline from '@/components/dashboard/RevisionTimeline'

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">
            <h1>Fechamento de Mina — ARO</h1>
            <span className="rev-tag">Rev0</span>
          </div>
          <p className="topbar-sub">NX Gold · Data-base 2023 · Atualizado há 2 dias</p>
        </div>
        <div className="topbar-actions">
          <button className="btn-ghost">Exportar PDF</button>
          <button className="btn-primary">Rodar simulação</button>
        </div>
      </header>

      {/* ── Bento grid ── */}
      <main className="bento">

        {/* Linha 1 — 3 KPI cards (span 4 cada) */}
        <div style={{ gridColumn: 'span 4' }}>
          <KpiCard
            icon={<DollarSign size={14} strokeWidth={2} aria-hidden="true" />}
            label="Custo esperado"
            value="R$ 38,5 M"
            sub="Monte Carlo · 10.000 iterações"
          />
        </div>

        <div style={{ gridColumn: 'span 4' }}>
          <KpiCard
            icon={<ArrowLeftRight size={14} strokeWidth={2} aria-hidden="true" />}
            label="Faixa min–max"
            value="R$ 29,6–35,2 M"
            sub="Soma dos 8 setores"
          />
        </div>

        <div style={{ gridColumn: 'span 4' }}>
          <KpiCard
            icon={<ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />}
            label="Valor atualizado 2023"
            value="R$ 40,6 M"
            sub=""
            delta="+11%"
            deltaPositive={false}
          />
        </div>

        {/* Linha 2 — Custo por categoria (8) + Confiabilidade (4) */}
        <CostByCategory />
        <ConfidenceCard />

        {/* Linha 3 — Lançamentos (7) + Timeline revisões (5) */}
        <RecentLaunches />
        <RevisionTimeline />

      </main>
    </div>
  )
}
