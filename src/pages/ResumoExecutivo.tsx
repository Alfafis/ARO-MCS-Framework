import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Copy, Check, Sprout, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import type { Projeto } from '@/types/clientes'
import RevisionTimeline, { type RevisionTimelineItem } from '@/components/dashboard/RevisionTimeline'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import AnnualDisbursementDetailedCard from '@/components/resumo-executivo/AnnualDisbursementDetailedCard'
import { ModoToggle, ViewToggle } from '@/components/resumo-executivo/DesembolsoControls'
import { computeDesembolsoMatrix, computeDesembolsoItemMatrix, type ModoDesembolso } from '@/lib/desembolsoAno'
import { computeFatorAncoragem, ANO_BASE_TEMPLATE } from '@/lib/ancoragem'
import { AncoragemBadge } from '@/components/resumo-executivo/AncoragemBadge'
import type { DisbursementYear, DisbursementCategory } from '@/types/relatorio'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjeto } from '@/context/useProjeto'
import { supabase } from '@/integrations/supabase/client'
import { categoryParamsFromCategorias } from '@/lib/aroSimulacao'
import { computeMonetaryValues, formatMoedaCompact, type MetodoAtualizacao } from '@/lib/financeiro'
import { formatDateTime } from '@/lib/utils'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { remediacaoT } from '@/i18n/remediacao'
import { custoTotalRemediacao } from '@/types/remediacao'
import type { CostCategory, CostTotals, RiskMetric } from '@/types/relatorio'
import type { SimResult } from '@/types/simulacao'
import type { RevisaoRow } from '@/types'
import { sequenciaMidpoints } from '@/types/parametrosGlobais'

// mesmo formato já usado em ParametroRow (ParametrosGlobais.tsx): "14" → "14,00"
const pct = (v: number) => (v * 100).toFixed(2).replace('.', ',')
const media = (valores: number[]) => valores.reduce((a, b) => a + b, 0) / valores.length

function labelPorMetodo(
  metodo: MetodoAtualizacao['metodo'],
  t: ResumoT,
  selicPorAno: number[] | null,
  inflacaoPorAno: number[] | null,
  dataBaseAno: number | null
): string {
  switch (metodo) {
    case 'simples':
      return t.method1(pct(media(selicPorAno!)))
    case 'compostos':
      return t.method2(pct(media(selicPorAno!)))
    case 'inflacao':
      return t.method3(pct(media(inflacaoPorAno!)))
    case 'escalonamento':
      return t.method4(dataBaseAno)
  }
}

type ResumoT = (typeof resumoT)['pt-BR']

function revisaoToTimelineItem(rev: RevisaoRow, t: ResumoT): RevisionTimelineItem {
  const numero = rev.codigo.replace(/\D/g, '')
  const ocorridoEm = rev.publicado_em ?? rev.criado_em
  const desc =
    rev.status === 'rascunho' ? t.revDraftDesc : rev.status === 'vigente' ? t.revCurrentDesc : t.revReplacedDesc
  return {
    id: rev.id,
    title: `Rev${numero}`,
    date: formatDateTime(ocorridoEm),
    done: rev.status !== 'rascunho',
    tag: rev.status === 'vigente' ? t.revCurrent : null,
    desc,
  }
}

export default function ResumoExecutivo() {
  const t = useT(resumoT)
  const tRel = useT(relatorioClienteT)
  const tRem = useT(remediacaoT)
  const navigate = useNavigate()
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const { catalogo, parametrosAnuais, remediacaoByProjeto, fetchRemediacao } = useProjeto()

  // Se o módulo Remediação está habilitado, carrega o resumo pra mostrar o
  // card compacto (link "ver detalhes" pra rota dedicada). Escopo alternativo:
  // não soma no total principal.
  const remediacaoCategorias = remediacaoByProjeto[projeto.id]
  useEffect(() => {
    if (projeto.remediacaoHabilitada && remediacaoCategorias === undefined) {
      void fetchRemediacao(projeto.id)
    }
  }, [projeto.id, projeto.remediacaoHabilitada, remediacaoCategorias, fetchRemediacao])
  const remediacaoTotal = useMemo(
    () => (remediacaoCategorias ? custoTotalRemediacao(remediacaoCategorias) : 0),
    [remediacaoCategorias]
  )
  const showRemediacaoCard = projeto.remediacaoHabilitada && remediacaoCategorias && remediacaoCategorias.length > 0

  const [linkCopied, setLinkCopied] = useState(false)
  const [simResult, setSimResult] = useState<SimResult | null>(null)
  const [revisoes, setRevisoes] = useState<RevisaoRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetchSim = supabase
      .from('simulacoes')
      .select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setSimResult(data[0].resultado as unknown as SimResult)
        else setSimResult(null)
      })
    const fetchRev = supabase
      .from('revisoes')
      .select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setRevisoes([...data].reverse())
      })
    Promise.allSettled([fetchSim, fetchRev]).then(() => setLoading(false))
  }, [projeto.id])

  // Fator de ancoragem base_template (2022) → data_base do projeto, via IPCA
  // acumulado composto (`_Dados_Formulas_Planilha.md` §Etapa 3). fator=1 se
  // data_base ausente/anterior ao template ou se algum ano faltar em
  // `parametros_anuais` — nesse caso `faltantes` lista os anos e a UI mostra aviso.
  const ancoragem = useMemo(() => {
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    if (dataBaseAno == null) return { fator: 1, faltantes: [], anoInicio: ANO_BASE_TEMPLATE, anoFim: ANO_BASE_TEMPLATE }
    return computeFatorAncoragem(ANO_BASE_TEMPLATE, dataBaseAno, parametrosAnuais)
  }, [projeto.dataBase, parametrosAnuais])

  const categoryParams = useMemo(
    () => categoryParamsFromCategorias(projeto.categorias, catalogo, ancoragem.fator),
    [projeto.categorias, catalogo, ancoragem.fator]
  )

  const costCategories: CostCategory[] = useMemo(
    () =>
      categoryParams.map((c, i) => ({
        rank: String(i + 1).padStart(2, '0'),
        name: c.name,
        min: formatMoedaCompact(c.min, false),
        max: formatMoedaCompact(c.max, false),
      })),
    [categoryParams]
  )

  const costTotals: CostTotals = useMemo(
    () => ({
      min: formatMoedaCompact(
        categoryParams.reduce((acc, c) => acc + c.min, 0),
        false
      ),
      max: formatMoedaCompact(
        categoryParams.reduce((acc, c) => acc + c.max, 0),
        false
      ),
    }),
    [categoryParams]
  )

  // Base pro provisionamento: soma do ponto médio de cada categoria real —
  // mesma convenção de ProjetoContext.estimateTotal / PortalClienteRelatorio.
  const baseTotal = useMemo(() => categoryParams.reduce((acc, c) => acc + c.mode, 0), [categoryParams])
  const contingenciaPct = projeto.contingenciaPct
  const baseWithProvision = baseTotal * (1 + contingenciaPct / 100)

  const monetaryMethods = useMemo(() => {
    if (baseTotal === 0) return []
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const selicPorAno = sequenciaMidpoints(parametrosAnuais, 'selic', anoBase, projeto.horizonteAnos)
    const inflacaoPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    return computeMonetaryValues(baseWithProvision, {
      selicPorAno,
      inflacaoPorAno,
      horizonYears: projeto.horizonteAnos,
    }).map(({ metodo, valor }) => ({
      label: labelPorMetodo(metodo, t, selicPorAno, inflacaoPorAno, dataBaseAno),
      value: fmt(valor),
    }))
  }, [baseTotal, baseWithProvision, parametrosAnuais, projeto.dataBase, projeto.horizonteAnos, t])

  const riskMetrics: RiskMetric[] = simResult
    ? [
        { label: tRel.riskMean, value: simResult.mean },
        { label: tRel.riskStddev, value: simResult.stddev },
        { label: tRel.riskP80, value: simResult.p80 },
        { label: tRel.riskExceedProb, value: simResult.exceedProb },
      ]
    : []

  const cvLabel = simResult ? `CV = ${(simResult.cv * 100).toFixed(2)}%` : tRel.simPendingSub
  const confLevel = simResult?.confidenceLevel ?? 95
  const [icLo, icHi] = simResult ? simResult.ic95.replace('M', '').split('–') : ['—', '—']
  const icLoLabel = simResult ? tRel.icLabel(confLevel, icLo) : '—'
  const icHiLabel = simResult ? `R$ ${icHi} M` : '—'

  const revisionItems = useMemo(() => revisoes.map((r) => revisaoToTimelineItem(r, t)), [revisoes, t])

  // Curva de desembolso ano-a-ano — matriz por categoria com 3 modos de
  // visualização (Etapa 4 do `_Plan_Curva_Desembolso.md`, `_Dados_Formulas_Planilha.md`).
  // `viewDesembolso` alterna entre Agregado (aba `0. Síntese Por Setor`, categoria × ano)
  // e Detalhado (aba `9. Síntese Por Atividade`, item × ano com contingência por ano).
  const [modoDesembolso, setModoDesembolso] = useState<ModoDesembolso>('base')
  const [viewDesembolso, setViewDesembolso] = useState<'agregado' | 'detalhado'>('agregado')
  const disbursement = useMemo(() => {
    if (projeto.categorias.length === 0) return null
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)

    const res = computeDesembolsoMatrix({
      categorias: projeto.categorias,
      catalogo,
      horizonYears: projeto.horizonteAnos,
      contingenciaPct: projeto.contingenciaPct,
      ipcaPorAno,
      modo: modoDesembolso === 'ipca' && ipcaPorAno === null ? 'provisao' : modoDesembolso,
      fatorAncoragem: ancoragem.fator,
    })

    if (res.totalGeral === 0) return null

    const years: DisbursementYear[] = res.totaisPorAno.map((total, i) => ({
      label: `Ano ${String(i + 1).padStart(2, '0')}`,
      value: formatMoedaCompact(total, false),
    }))
    const categories: DisbursementCategory[] = res.categorias.map((name, ci) => ({
      name,
      values: res.matrix[ci].map((v) => (v > 0 ? formatMoedaCompact(v, false) : null)),
    }))
    return { years, categories, ipcaDisponivel: ipcaPorAno !== null }
  }, [
    projeto.categorias,
    projeto.horizonteAnos,
    projeto.contingenciaPct,
    projeto.dataBase,
    catalogo,
    parametrosAnuais,
    modoDesembolso,
    ancoragem.fator,
  ])

  // Matriz detalhada item × ano — mesma origem de dados, apenas outra
  // granularidade. Rende só quando `viewDesembolso === 'detalhado'` para não
  // computar o item-level (mais pesado que o categoria-level) sem necessidade.
  const disbursementDetalhado = useMemo(() => {
    if (viewDesembolso !== 'detalhado' || projeto.categorias.length === 0) return null
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)
    const modo = modoDesembolso === 'ipca' && ipcaPorAno === null ? 'provisao' : modoDesembolso
    const res = computeDesembolsoItemMatrix({
      categorias: projeto.categorias,
      catalogo,
      horizonYears: projeto.horizonteAnos,
      contingenciaPct: projeto.contingenciaPct,
      ipcaPorAno,
      modo,
      fatorAncoragem: ancoragem.fator,
    })
    if (res.totalGeral === 0) return null
    const yearsLabels = Array.from({ length: projeto.horizonteAnos }, (_, i) => ({
      label: `Ano ${String(i + 1).padStart(2, '0')}`,
    }))
    return { ...res, years: yearsLabels }
  }, [
    viewDesembolso,
    modoDesembolso,
    projeto.categorias,
    projeto.horizonteAnos,
    projeto.contingenciaPct,
    projeto.dataBase,
    catalogo,
    parametrosAnuais,
    ancoragem.fator,
  ])

  async function handleGerarLink() {
    const url = `${window.location.origin}/relatorio/${projeto.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      prompt('Copie o link do relatório:', url)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={t.headerTitle}
        actions={
          <>
            <Button variant="ghost" onClick={handleGerarLink}>
              {linkCopied ? (
                <>
                  <Check size={13} /> Link copiado!
                </>
              ) : (
                <>
                  <Copy size={13} /> Gerar link do cliente
                </>
              )}
            </Button>
            <Button variant="ghost">{t.exportPdf}</Button>
            <Button variant="primary" onClick={() => navigate(`/projetos/${projeto.id}/simulacao`)}>
              {t.runSimulation}
            </Button>
          </>
        }
      />

      <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-4">
        <div className="flex flex-col md:grid md:grid-cols-[1.3fr_1fr] gap-4 items-start">
          <CostByCategoryTable categories={costCategories} totals={costTotals} groupByPhase={false} />
          <RiskMetricsCard
            metrics={riskMetrics}
            cvLabel={cvLabel}
            icLo={icLoLabel}
            icHi={icHiLabel}
            contingency={`${contingenciaPct}%`}
            uncertainty={simResult?.uncertainty}
          />
        </div>

        {disbursement && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-c-text-2">Modo:</span>
                <ModoToggle
                  current={modoDesembolso}
                  onChange={setModoDesembolso}
                  disableIpca={!disbursement.ipcaDisponivel}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-c-text-2">
                  {t.viewLabel}
                </span>
                <ViewToggle
                  current={viewDesembolso}
                  onChange={setViewDesembolso}
                  labels={{ agregado: t.viewAggregated, detalhado: t.viewDetailed }}
                />
              </div>
              <AncoragemBadge ancoragem={ancoragem} />
            </div>
            {viewDesembolso === 'agregado' ? (
              <AnnualDisbursementCard years={disbursement.years} categories={disbursement.categories} />
            ) : (
              disbursementDetalhado && (
                <AnnualDisbursementDetailedCard
                  years={disbursementDetalhado.years}
                  groups={disbursementDetalhado.groups}
                  totaisPorAno={disbursementDetalhado.totaisPorAno}
                />
              )
            )}
          </div>
        )}

        {showRemediacaoCard && (
          <button
            type="button"
            onClick={() => navigate(`/projetos/${projeto.id}/remediacao`)}
            className="card w-full text-left cursor-pointer transition-shadow hover:shadow-[0_4px_12px_rgba(20,21,26,.08)] flex items-center gap-4 border-0"
          >
            <div className="w-[38px] h-[38px] rounded-[10px] bg-accent-100 flex items-center justify-center shrink-0">
              <Sprout size={16} color="var(--accent)" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13.5px] font-semibold text-c-text">{tRem.headerTitle}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f6f5f3] text-c-text-2 font-medium">
                  {tRem.moduleTag}
                </span>
              </div>
              <span className="text-[12px] text-c-text-2 leading-snug">{tRem.headerSubtitle}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[15px] font-bold text-c-text">{formatMoedaCompact(remediacaoTotal)}</span>
              <ChevronRight size={14} className="text-c-text-2" aria-hidden="true" />
            </div>
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {monetaryMethods.length > 0 && (
            <MonetaryMethodsCard
              className="lg:col-span-7"
              methods={monetaryMethods}
              baseLabel={formatMoedaCompact(baseWithProvision)}
              horizonYears={projeto.horizonteAnos}
            />
          )}
          <RevisionTimeline
            className={monetaryMethods.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'}
            revisions={revisionItems}
            emptyLabel={t.revEmpty}
          />
        </div>
      </div>
    </>
  )
}
