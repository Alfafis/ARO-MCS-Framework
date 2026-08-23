import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FolderKanban, DollarSign, Trophy, Activity, FileText, History } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import KpiCard from '@/components/dashboard/KpiCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjeto } from '@/context/ProjetoContext'
import { supabase } from '@/integrations/supabase/client'
import { valorEsperadoNumerico, formatMoedaCompact } from '@/lib/financeiro'
import { formatRelativeTime } from '@/lib/utils'
import { useT } from '@/i18n/LangContext'
import { visaoGeralT } from '@/i18n/visao-geral'
import { clientesT } from '@/i18n/clientes'
import type { ProjStatus } from '@/types/clientes'

interface AtividadeItem {
  id:          string
  label:       string
  clienteNome: string
  projetoNome: string
  projetoId:   string
  ocorridoEm:  string
}

interface FeedJoinRow {
  id:         string
  categoria?: string
  codigo?:    string
  projeto_id: string
  atualizado_em?: string | null
  publicado_em?:  string | null
  projeto: { nome: string; cliente: { nome: string } | null } | null
}

export default function VisaoGeral() {
  const navigate = useNavigate()
  const t  = useT(visaoGeralT)
  const tc = useT(clientesT)
  const { clientes, projetos, loading } = useProjeto()
  const [atividade, setAtividade] = useState<AtividadeItem[]>([])
  const [atividadeLoading, setAtividadeLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [{ data: lanc }, { data: rev }] = await Promise.all([
        supabase.from('lancamentos')
          .select('id, categoria, projeto_id, atualizado_em, projeto:projetos(nome, cliente:clientes(nome))')
          .order('atualizado_em', { ascending: false })
          .limit(10),
        supabase.from('revisoes')
          .select('id, codigo, projeto_id, publicado_em, projeto:projetos(nome, cliente:clientes(nome))')
          .eq('status', 'vigente')
          .order('publicado_em', { ascending: false })
          .limit(10),
      ])
      if (cancelled) return

      const lancItems: AtividadeItem[] = ((lanc ?? []) as unknown as FeedJoinRow[]).map(r => ({
        id: `lanc-${r.id}`,
        label: t.activityLancamento(r.categoria ?? '—'),
        clienteNome: r.projeto?.cliente?.nome ?? '—',
        projetoNome: r.projeto?.nome ?? '—',
        projetoId: r.projeto_id,
        ocorridoEm: r.atualizado_em ?? '',
      }))
      const revItems: AtividadeItem[] = ((rev ?? []) as unknown as FeedJoinRow[]).map(r => ({
        id: `rev-${r.id}`,
        label: t.activityRevisao(`Rev${(r.codigo ?? '').replace(/\D/g, '')}`),
        clienteNome: r.projeto?.cliente?.nome ?? '—',
        projetoNome: r.projeto?.nome ?? '—',
        projetoId: r.projeto_id,
        ocorridoEm: r.publicado_em ?? '',
      }))

      const merged = [...lancItems, ...revItems]
        .filter(item => item.ocorridoEm)
        .sort((a, b) => new Date(b.ocorridoEm).getTime() - new Date(a.ocorridoEm).getTime())
        .slice(0, 10)

      setAtividade(merged)
      setAtividadeLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [t])

  const clienteNomePorId = useMemo(() => new Map(clientes.map(c => [c.id, c.nome])), [clientes])

  const porStatus = useMemo(() => {
    const acc: Record<ProjStatus, number> = { andamento: 0, aguardando: 0, concluido: 0 }
    for (const p of projetos) acc[p.status]++
    return acc
  }, [projetos])

  const valorTotalEsperado = useMemo(
    () => projetos
      .filter(p => p.status !== 'concluido')
      .reduce((acc, p) => acc + valorEsperadoNumerico(p.categorias), 0),
    [projetos]
  )

  const projetosRecentes = useMemo(
    () => [...projetos]
      .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
      .slice(0, 8),
    [projetos]
  )

  const rankingClientes = useMemo(() => {
    const porCliente = new Map<string, number>()
    for (const p of projetos) {
      if (p.status === 'concluido') continue
      porCliente.set(p.clienteId, (porCliente.get(p.clienteId) ?? 0) + valorEsperadoNumerico(p.categorias))
    }
    return clientes
      .map(c => ({ id: c.id, nome: c.nome, valor: porCliente.get(c.id) ?? 0 }))
      .filter(c => c.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8)
  }, [clientes, projetos])

  const maxRanking = rankingClientes[0]?.valor ?? 0

  const STATUS_META: Record<ProjStatus, { label: string; cls: string }> = {
    andamento:  { label: tc.statusActive,  cls: 'bg-success-bg text-success'    },
    aguardando: { label: tc.statusWaiting, cls: 'bg-accent-100 text-accent-700' },
    concluido:  { label: tc.statusDone,    cls: 'bg-[#f0eeec] text-c-text-2'    },
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              icon={<Users size={14} strokeWidth={2} aria-hidden="true" />}
              label={t.kpiClientsLabel}
              value={String(clientes.length)}
              sub={t.kpiClientsSub}
            />
            <KpiCard
              icon={<FolderKanban size={14} strokeWidth={2} aria-hidden="true" />}
              label={t.kpiProjectsLabel}
              value={String(projetos.length)}
              sub={t.kpiProjectsSub(porStatus.andamento, porStatus.aguardando, porStatus.concluido)}
            />
            <KpiCard
              icon={<DollarSign size={14} strokeWidth={2} aria-hidden="true" />}
              label={t.kpiValueLabel}
              value={valorTotalEsperado > 0 ? formatMoedaCompact(valorTotalEsperado) : '—'}
              sub={t.kpiValueSub}
            />
          </div>
        )}

        {/* Projetos recentes + Ranking por cliente */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="card lg:col-span-7">
            <div className="flex items-center gap-1.5 mb-4">
              <FileText size={14} color="var(--accent)" aria-hidden="true" />
              <span className="font-semibold text-[0.875rem] text-c-text">{t.recentProjectsTitle}</span>
            </div>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : projetosRecentes.length === 0 ? (
              <p className="text-[0.8125rem] text-c-text-2">{t.recentProjectsEmpty}</p>
            ) : (
              <div className="flex flex-col">
                {projetosRecentes.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 py-3 border-b border-c-line last:border-b-0 first:pt-0 last:pb-0 cursor-pointer"
                    onClick={() => navigate(`/projetos/${p.id}/dashboard`)}
                  >
                    <div className="min-w-0">
                      <div className="text-[0.8125rem] font-semibold text-c-text truncate">{p.projeto}</div>
                      <div className="text-[0.75rem] text-c-text-2 truncate">{clienteNomePorId.get(p.clienteId) ?? '—'}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_META[p.status].cls}`}>
                        {STATUS_META[p.status].label}
                      </span>
                      <span className="text-[0.8125rem] font-semibold text-c-text w-20 text-right">{p.esperado}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card lg:col-span-5">
            <div className="flex items-center gap-1.5 mb-4">
              <Trophy size={14} color="var(--accent)" aria-hidden="true" />
              <span className="font-semibold text-[0.875rem] text-c-text">{t.rankingTitle}</span>
            </div>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : rankingClientes.length === 0 ? (
              <p className="text-[0.8125rem] text-c-text-2">{t.rankingEmpty}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {rankingClientes.map((c, i) => (
                  <div key={c.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[0.8125rem] font-semibold text-c-text truncate">
                        <span className="font-mono text-c-text-2 mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                        {c.nome}
                      </span>
                      <span className="text-[0.8125rem] font-semibold text-c-text shrink-0">
                        {formatMoedaCompact(c.valor)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded bg-[#ece9e6] overflow-hidden">
                      <div
                        className="h-full rounded bg-accent"
                        style={{ width: maxRanking > 0 ? `${(c.valor / maxRanking) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="card">
          <div className="flex items-center gap-1.5 mb-4">
            <Activity size={14} color="var(--accent)" aria-hidden="true" />
            <span className="font-semibold text-[0.875rem] text-c-text">{t.activityTitle}</span>
          </div>
          {atividadeLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : atividade.length === 0 ? (
            <p className="text-[0.8125rem] text-c-text-2">{t.activityEmpty}</p>
          ) : (
            <div className="flex flex-col">
              {atividade.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3 border-b border-c-line last:border-b-0 first:pt-0 last:pb-0 cursor-pointer"
                  onClick={() => navigate(`/projetos/${item.projetoId}/dashboard`)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <History size={13} color="var(--c-text-2)" aria-hidden="true" className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[0.8125rem] font-semibold text-c-text truncate">{item.label}</div>
                      <div className="text-[0.75rem] text-c-text-2 truncate">{item.projetoNome} · {item.clienteNome}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-c-text-2 shrink-0">{formatRelativeTime(item.ocorridoEm)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
