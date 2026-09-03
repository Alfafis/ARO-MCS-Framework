import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Copy, Check, KeyRound } from 'lucide-react'
import { DollarSign, ArrowLeftRight, Plus } from 'lucide-react'
import LangSelector from '@/components/layout/LangSelector'
import CodigoAcessoModal from '@/components/clientes/CodigoAcessoModal'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import AnnualDisbursementDetailedCard from '@/components/resumo-executivo/AnnualDisbursementDetailedCard'
import { computeDesembolsoMatrix, computeDesembolsoItemMatrix, type ModoDesembolso } from '@/lib/desembolsoAno'
import { ModoToggle, ViewToggle } from '@/components/resumo-executivo/DesembolsoControls'
import { Sprout } from 'lucide-react'
import { remediacaoT } from '@/i18n/remediacao'
import { computeFatorAncoragem, ANO_BASE_TEMPLATE } from '@/lib/ancoragem'
import { AncoragemBadge } from '@/components/resumo-executivo/AncoragemBadge'
import type { DisbursementYear, DisbursementCategory } from '@/types/relatorio'
import { supabase } from '@/integrations/supabase/client'
import { mapItemCustoRow } from '@/lib/categoriaMappers'
import { categoryParamsFromCategorias } from '@/lib/aroSimulacao'
import { computeMonetaryValues, formatMoedaCompact, type MetodoAtualizacao } from '@/lib/financeiro'
import { useT } from '@/i18n/useLang'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { resumoT } from '@/i18n/resumo-executivo'
import type { CostCategory, CostTotals, RiskMetric } from '@/types/relatorio'
import type { Category, CategoriaCatalogo } from '@/types/categorias'
import type { SimResult } from '@/types/simulacao'
import type { RelatorioPublicoReturns } from '@/types'
import { sequenciaMidpoints, mapParametroAnualRow } from '@/types/parametrosGlobais'

type ResumoT = typeof resumoT['pt-BR']

// mesmo formato já usado em ParametroRow (ParametrosGlobais.tsx): "14" → "14,00"
const pct = (v: number) => (v * 100).toFixed(2).replace('.', ',')
const media = (valores: number[]) => valores.reduce((a, b) => a + b, 0) / valores.length

function labelPorMetodo(metodo: MetodoAtualizacao['metodo'], t: ResumoT, selicPorAno: number[] | null, inflacaoPorAno: number[] | null, dataBaseAno: number | null): string {
  switch (metodo) {
    case 'simples':       return t.method1(pct(media(selicPorAno!)))
    case 'compostos':     return t.method2(pct(media(selicPorAno!)))
    case 'inflacao':      return t.method3(pct(media(inflacaoPorAno!)))
    case 'escalonamento': return t.method4(dataBaseAno)
  }
}

function sessionKey(id: string) {
  return `aro_portal_${id}`
}

// Sem sessão de admin nem código: nada é buscado. A RPC obter_relatorio_publico
// é o único portão — sem ela validar (código certo OU is_consultor()), o dado
// nunca chega no cliente, nem em memória. Diferente do mock antigo, onde o
// modal de código era só um overlay visual sobre dado já carregado.
export default function PortalClienteRelatorio() {
  const { id: projetoId = '' } = useParams<{ id: string }>()
  const t     = useT(relatorioClienteT)
  const tBase = useT(resumoT)

  const [status, setStatus] = useState<'loading' | 'need-code' | 'not-found' | 'ready'>('loading')
  const [bundle, setBundle] = useState<RelatorioPublicoReturns | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [remediacaoData, setRemediacaoData] = useState<Array<{ id: string; nome: string; area_ha: number | null; ordem: number; itens: Array<{ id: string; descricao: string; unidade: string; quantidade: number | string; custo_unit_min: number | string; custo_unit_max: number | string; fonte: string | null; ordem: number }> }>>([])

  const fetchRelatorio = useCallback(async (codigo?: string) => {
    const { data, error } = await supabase.rpc('obter_relatorio_publico', { p_projeto_id: projetoId, p_codigo: codigo })
    if (error || !data) {
      setStatus(error?.message.includes('não encontrado') ? 'not-found' : 'need-code')
      return false
    }
    setBundle(data as unknown as RelatorioPublicoReturns)
    setStatus('ready')
    return true
  }, [projetoId])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session))
    const stored = sessionStorage.getItem(sessionKey(projetoId))
    fetchRelatorio(stored ?? undefined).then(ok => {
      if (!ok && stored) sessionStorage.removeItem(sessionKey(projetoId))
    })
  }, [projetoId, fetchRelatorio])

  // Bundle de remediação — RPC própria, respeita o flag incluir_remediacao
  // da revisão vigente. Se a revisão não marcou opt-in, devolve array vazio.
  useEffect(() => {
    if (status !== 'ready') return
    supabase.rpc('obter_relatorio_publico_remediacao', { p_projeto_id: projetoId })
      .then(({ data, error }) => {
        if (error || !data) return
        setRemediacaoData(data as never)
      })
  }, [projetoId, status])

  const projeto = bundle?.projeto
  const cliente = bundle?.cliente

  const categorias: Category[] = useMemo(() => (bundle?.categorias ?? []).map(({ categoria, itens }) => ({
    id: categoria.id, catalogoId: categoria.catalogo_id, preenche: categoria.preenche as Category['preenche'],
    expanded: false, justAdded: false, items: itens.map(mapItemCustoRow), camposOperacionais: [],
    custoProvavel: categoria.custo_provavel,
  })), [bundle])

  const catalogo: CategoriaCatalogo[] = useMemo(() => {
    const seen = new Map<string, string>()
    for (const { catalogo: cat } of bundle?.categorias ?? []) seen.set(cat.id, cat.nome)
    return [...seen.entries()].map(([id, nome]) => ({ id, nome }))
  }, [bundle])

  const simResult = (bundle?.simulacao?.id ? bundle.simulacao.resultado : null) as unknown as SimResult | null
  const activeCatSet = useMemo(() => new Set(bundle?.simulacao?.active_categories ?? []), [bundle])

  const parametrosAnuais = useMemo(() => (bundle?.parametrosAnuais ?? []).map(mapParametroAnualRow), [bundle])

  // Fator de ancoragem base_template (2022) → data_base do projeto — mesmo
  // pattern do ResumoExecutivo, ver src/lib/ancoragem.ts. Sem essa multiplicação
  // os valores exibidos ao cliente ficam em base 2022, subestimando N anos de IPCA.
  const ancoragem = useMemo(() => {
    const dataBaseAno = projeto?.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    if (dataBaseAno == null) return { fator: 1, faltantes: [], anoInicio: ANO_BASE_TEMPLATE, anoFim: ANO_BASE_TEMPLATE }
    return computeFatorAncoragem(ANO_BASE_TEMPLATE, dataBaseAno, parametrosAnuais)
  }, [projeto?.data_base, parametrosAnuais])

  const categoryParams = useMemo(() => categoryParamsFromCategorias(categorias, catalogo, ancoragem.fator), [categorias, catalogo, ancoragem.fator])

  const filteredParams = useMemo(
    () => activeCatSet.size === 0 ? categoryParams : categoryParams.filter(c => activeCatSet.has(c.name)),
    [categoryParams, activeCatSet]
  )

  const costCategories: CostCategory[] = useMemo(
    () => filteredParams.map((c, i) => ({
      rank: String(i + 1).padStart(2, '0'),
      name: c.name,
      min:  formatMoedaCompact(c.min, false),
      max:  formatMoedaCompact(c.max, false),
    })),
    [filteredParams]
  )

  const costTotals: CostTotals = useMemo(() => ({
    min: formatMoedaCompact(filteredParams.reduce((acc, c) => acc + c.min, 0), false),
    max: formatMoedaCompact(filteredParams.reduce((acc, c) => acc + c.max, 0), false),
  }), [filteredParams])

  // Base pro provisionamento: soma do ponto médio (min+max)/2 de cada categoria real —
  // mesma convenção usada em ProjetoContext.estimateTotal. "Valor atualizado" por
  // categoria (juros/inflação aplicados individualmente) é gap de modelagem, não existe
  // ainda — ver spec 2026-08-21-simulacao-isolamento-relatorio-design.
  const baseTotal          = useMemo(() => filteredParams.reduce((acc, c) => acc + c.mode, 0), [filteredParams])
  const contingenciaPct    = projeto?.contingencia_pct ?? 0
  const baseWithProvision  = baseTotal * (1 + contingenciaPct / 100)

  const monetaryMethods = useMemo(() => {
    if (baseTotal === 0) return []
    const horizonYears   = projeto?.horizonte_anos ?? 10
    const dataBaseAno = projeto?.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const selicPorAno    = sequenciaMidpoints(parametrosAnuais, 'selic', anoBase, horizonYears)
    const inflacaoPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, horizonYears)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    return computeMonetaryValues(baseWithProvision, { selicPorAno, inflacaoPorAno, horizonYears }).map(({ metodo, valor }) => ({
      label: labelPorMetodo(metodo, tBase, selicPorAno, inflacaoPorAno, dataBaseAno),
      value: fmt(valor),
    }))
  }, [baseTotal, baseWithProvision, parametrosAnuais, projeto?.data_base, projeto?.horizonte_anos, tBase])

  const riskMetrics: RiskMetric[] = simResult ? [
    { label: t.riskMean,       value: simResult.mean       },
    { label: t.riskStddev,     value: simResult.stddev     },
    { label: t.riskP80,        value: simResult.p80        },
    { label: t.riskExceedProb, value: simResult.exceedProb },
  ] : []

  const cvPercent = simResult ? (simResult.cv * 100).toFixed(2) : null
  const cvLabel   = simResult ? `CV = ${cvPercent}%` : t.simPendingSub
  const confLevel = simResult?.confidenceLevel ?? 95
  const [icLo, icHi] = simResult ? simResult.ic95.replace('M', '').split('–') : ['—', '—']
  const icLoLabel = simResult ? t.icLabel(confLevel, icLo) : '—'
  const icHiLabel = simResult ? `R$ ${icHi} M` : '—'

  // Curva de desembolso ano-a-ano (`_Plan_Curva_Desembolso.md` — Etapa 4).
  // Portal público reaproveita o mesmo helper e componente do ResumoExecutivo,
  // mudando só a origem dos dados (bundle vs. context). `viewDesembolso`
  // alterna entre agregado (categoria × ano) e detalhado (item × ano).
  const [modoDesembolso, setModoDesembolso] = useState<ModoDesembolso>('base')
  const [viewDesembolso, setViewDesembolso] = useState<'agregado' | 'detalhado'>('agregado')
  const disbursement = useMemo(() => {
    if (!projeto || categorias.length === 0) return null
    const horizonYears = projeto.horizonte_anos ?? 10
    const dataBaseAno = projeto.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, horizonYears)

    const res = computeDesembolsoMatrix({
      categorias,
      catalogo,
      horizonYears,
      contingenciaPct: projeto.contingencia_pct ?? 0,
      ipcaPorAno,
      modo: modoDesembolso === 'ipca' && ipcaPorAno === null ? 'provisao' : modoDesembolso,
      fatorAncoragem: ancoragem.fator,
    })

    if (res.totalGeral === 0) return null

    const years: DisbursementYear[] = res.totaisPorAno.map((total, i) => ({
      label: `Ano ${String(i + 1).padStart(2, '0')}`,
      value: formatMoedaCompact(total, false),
    }))
    const cats: DisbursementCategory[] = res.categorias.map((name, ci) => ({
      name,
      values: res.matrix[ci].map(v => v > 0 ? formatMoedaCompact(v, false) : null),
    }))
    return { years, categories: cats, ipcaDisponivel: ipcaPorAno !== null }
  }, [projeto, categorias, catalogo, parametrosAnuais, modoDesembolso, ancoragem.fator])

  // Matriz item × ano — computada sob demanda quando o cliente troca a visão
  // pra "Detalhado". Cada célula já reflete o modo escolhido (base / provisão /
  // IPCA), mantendo consistência numérica com o modo Agregado.
  const disbursementDetalhado = useMemo(() => {
    if (viewDesembolso !== 'detalhado' || !projeto || categorias.length === 0) return null
    const horizonYears = projeto.horizonte_anos ?? 10
    const dataBaseAno = projeto.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, horizonYears)
    const modo = modoDesembolso === 'ipca' && ipcaPorAno === null ? 'provisao' : modoDesembolso
    const res = computeDesembolsoItemMatrix({
      categorias,
      catalogo,
      horizonYears,
      contingenciaPct: projeto.contingencia_pct ?? 0,
      ipcaPorAno,
      modo,
      fatorAncoragem: ancoragem.fator,
    })
    if (res.totalGeral === 0) return null
    const yearsLabels = Array.from({ length: horizonYears }, (_, i) => ({ label: `Ano ${String(i + 1).padStart(2, '0')}` }))
    return { ...res, years: yearsLabels }
  }, [viewDesembolso, modoDesembolso, projeto, categorias, catalogo, parametrosAnuais, ancoragem.fator])

  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [toast, setToast] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeModalOpen, setCodeModalOpen] = useState(false)

  async function handleGerarLink() {
    const url = `${window.location.origin}/relatorio/${projetoId}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      prompt(t.copyLinkPrompt, url)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await fetchRelatorio(codeInput)
    if (ok) {
      sessionStorage.setItem(sessionKey(projetoId), codeInput)
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  function handleDownload() {
    setToast(true)
    setTimeout(() => { setToast(false); window.print() }, 900)
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-[420px] text-center flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Be Planned" className="h-12 w-auto object-contain" />
          <h1 className="text-[18px] font-bold text-c-text">{t.reportNotFoundTitle}</h1>
          <p className="text-[13px] text-c-text-2">{t.reportNotFoundBody}</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="min-h-screen" />
  }

  if (status === 'need-code') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] bg-white rounded-[20px] shadow-[0_24px_64px_-12px_rgba(20,21,26,.28)] p-7">
          <div className="flex items-center mb-5">
            <img src="/BePlanned Logo.png" alt="Be Planned" className="h-9 w-auto object-contain" />
          </div>
          <h2 className="text-[17px] font-bold text-c-text mb-5">{t.modalTitle}</h2>
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-c-text-2 mb-1.5">
                {t.modalCodeLabel}
              </label>
              <input
                type="text"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value); setCodeError(false) }}
                placeholder={t.modalCodePlaceholder}
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
                className={[
                  'w-full bg-[#f6f5f3] rounded-[11px] px-[13px] py-[10px] text-[0.875rem] text-c-text font-mono tracking-wider outline-none border transition-colors duration-150',
                  codeError
                    ? 'border-[#f44] focus:border-[#f44]'
                    : 'border-transparent focus:border-accent',
                ].join(' ')}
              />
              {codeError && (
                <p className="text-[12px] text-[#e33] mt-1.5">{t.modalCodeError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-[11px] bg-accent text-white font-semibold text-[0.875rem] cursor-pointer border-0 hover:opacity-90 transition-opacity duration-150"
            >
              {t.modalSubmit}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!projeto || !cliente) return null // 'ready' sempre traz os dois — guarda só pro TS

  return (
    <div className="min-h-screen print:bg-white">

      {/* ── Header fixo ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[rgba(20,21,26,.08)] flex items-center justify-between px-4 sm:px-8 py-[14px] sm:py-[22px]">
        <img src="/BePlanned Logo.png" alt="Be Planned" className="h-10 w-auto object-contain" />
        <div className="flex items-center gap-3 print:hidden">
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#f0eeec] text-c-text-2 text-[12px] font-medium">
            {cliente.nome} — {t.portalPill}
          </span>
          {isAdmin && (
            <button
              onClick={() => setCodeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-white border border-[rgba(20,21,26,.12)] shadow-[0_1px_2px_rgba(20,21,26,.06)] text-[13px] font-semibold text-c-text hover:bg-[#f4f3f1] transition-colors duration-150 cursor-pointer"
            >
              <KeyRound size={13} strokeWidth={2} />
              {t.accessCodeBtn}
            </button>
          )}
          <button
            onClick={handleGerarLink}
            className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-white border border-[rgba(20,21,26,.12)] shadow-[0_1px_2px_rgba(20,21,26,.06)] text-[13px] font-semibold text-c-text hover:bg-[#f4f3f1] transition-colors duration-150 cursor-pointer"
          >
            {linkCopied
              ? <><Check size={13} strokeWidth={2} /> {t.linkCopiedBtn}</>
              : <><Copy size={13} strokeWidth={2} /> {t.copyLinkBtn}</>}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-white border border-[rgba(20,21,26,.12)] shadow-[0_1px_2px_rgba(20,21,26,.06)] text-[13px] font-semibold text-c-text hover:bg-[#f4f3f1] transition-colors duration-150 cursor-pointer"
          >
            <Download size={13} strokeWidth={2} />
            {t.downloadPdfBtn}
          </button>
          <LangSelector ariaLabel={t.selectLang} />
        </div>
      </header>

      {/* ── Relatório ── */}
      <div className="pt-[56px] sm:pt-[76px]">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">

          {/* Cabeçalho do relatório */}
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-[22px] font-bold text-c-text">{t.reportTitle} — {projeto.nome}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f0eeec] text-c-text-2 text-[11px] font-semibold">
                {projeto.rev} · {t.reportRevisionCurrent}
              </span>
            </div>
            <p className="text-[13px] text-c-text-2">
              {t.reportSubtitleBase(cliente.nome)}
              {simResult && t.reportSubtitleSim(simResult.iterations, simResult.distribution)}
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <DollarSign size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiAvgCost,
                value: simResult?.mean ?? '—',
                sub: simResult ? t.kpiAvgCostSubSim(simResult.status) : t.simPendingSub,
              },
              {
                icon: <ArrowLeftRight size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiMinMaxRange,
                value: simResult?.p10p90 ?? '—',
                sub: simResult ? t.kpiMinMaxSubIC(confLevel, simResult.ic95) : t.simPendingSub,
              },
              {
                icon: <Plus size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiBaseProvision,
                value: baseTotal > 0 ? formatMoedaCompact(baseWithProvision) : '—',
                sub: t.kpiBaseSub(contingenciaPct),
              },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-[20px] p-6 flex flex-col gap-3">
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

          {/* Custo por categoria + Métricas de risco */}
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
                  <ModoToggle current={modoDesembolso} onChange={setModoDesembolso} disableIpca={!disbursement.ipcaDisponivel} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-c-text-2">{tBase.viewLabel}</span>
                  <ViewToggle
                    current={viewDesembolso}
                    onChange={setViewDesembolso}
                    labels={{ agregado: tBase.viewAggregated, detalhado: tBase.viewDetailed }}
                  />
                </div>
                <AncoragemBadge ancoragem={ancoragem} />
              </div>
              {viewDesembolso === 'agregado'
                ? <AnnualDisbursementCard years={disbursement.years} categories={disbursement.categories} />
                : disbursementDetalhado && (
                  <AnnualDisbursementDetailedCard
                    years={disbursementDetalhado.years}
                    groups={disbursementDetalhado.groups}
                    totaisPorAno={disbursementDetalhado.totaisPorAno}
                  />
                )
              }
            </div>
          )}

          {monetaryMethods.length > 0 && (
            <MonetaryMethodsCard methods={monetaryMethods} baseLabel={formatMoedaCompact(baseWithProvision)} horizonYears={projeto?.horizonte_anos ?? 10} />
          )}

          {/* Seção Remediação — só aparece se a revisão vigente marcou opt-in.
              Escopo alternativo, totais não somam ao provisionamento principal. */}
          {remediacaoData.length > 0 && (
            <RemediacaoSection categorias={remediacaoData} />
          )}

        </div>
      </div>

      {/* Modal código de acesso (admin) */}
      {codeModalOpen && (
        <CodigoAcessoModal
          reportId={projetoId}
          clientName={cliente.nome}
          projectName={projeto.nome}
          onClose={() => setCodeModalOpen(false)}
        />
      )}

      {/* Toast PDF */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center px-5 py-3 rounded-full bg-[#14151a] text-white text-[13px] font-semibold shadow-[0_16px_40px_-12px_rgba(20,21,26,.5)]">
          {t.pdfGenerating}
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// RemediacaoSection — bloco no portal público quando a revisão vigente marcou
// opt-in. Somas por categoria e total geral do módulo. Deixa claro que é
// escopo alternativo (não soma no total principal).
// --------------------------------------------------------------------------
interface RemediacaoSectionProps {
  categorias: Array<{
    id:      string
    nome:    string
    area_ha: number | null
    ordem:   number
    itens:   Array<{ id: string; descricao: string; unidade: string; quantidade: number | string; custo_unit_min: number | string; custo_unit_max: number | string; fonte: string | null; ordem: number }>
  }>
}

function RemediacaoSection({ categorias }: RemediacaoSectionProps) {
  const t = useT(remediacaoT)
  const toNum = (v: number | string | null): number => v == null ? 0 : (typeof v === 'number' ? v : Number(v))
  const custoTotalItem = (item: RemediacaoSectionProps['categorias'][number]['itens'][number]): number => {
    const qtd = toNum(item.quantidade)
    const med = (toNum(item.custo_unit_min) + toNum(item.custo_unit_max)) / 2
    return qtd * med
  }
  const totalCategoria = (c: RemediacaoSectionProps['categorias'][number]): number =>
    c.itens.reduce((acc, i) => acc + custoTotalItem(i), 0)
  const totalGeral = categorias.reduce((acc, c) => acc + totalCategoria(c), 0)

  return (
    <section className="flex flex-col gap-3 pt-2 mt-2 border-t border-[rgba(20,21,26,.08)]">
      <div className="flex items-center gap-2">
        <Sprout size={14} color="var(--accent)" aria-hidden="true" />
        <h2 className="text-[15px] font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f6f5f3] text-c-text-2 font-medium">{t.moduleTag}</span>
      </div>
      <p className="text-[12.5px] text-c-text-2 leading-snug max-w-[720px]">{t.headerSubtitle}</p>

      {categorias.map(cat => (
        <div key={cat.id} className="card">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="text-[14px] font-bold text-c-text">
              {cat.nome}
              {cat.area_ha != null && (
                <span className="text-[12px] font-normal text-c-text-2 ml-2">
                  ({cat.area_ha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ha)
                </span>
              )}
            </h3>
            <span className="font-mono text-[13px] font-bold text-c-text">{formatMoedaCompact(totalCategoria(cat))}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-c-text-2 text-[10px] font-semibold uppercase tracking-widest">
                  <th className="text-left pb-2 pr-3">{t.colDescricao}</th>
                  <th className="text-center pb-2 pr-3">{t.colUnidade}</th>
                  <th className="text-right pb-2 pr-3">{t.colQuantidade}</th>
                  <th className="text-right pb-2 pr-3">{t.colCustoUnitMin}</th>
                  <th className="text-right pb-2 pr-3">{t.colCustoUnitMax}</th>
                  <th className="text-right pb-2 pr-3">{t.colTotal}</th>
                  <th className="text-left pb-2">{t.colFonte}</th>
                </tr>
              </thead>
              <tbody>
                {cat.itens.map(item => (
                  <tr key={item.id} className="border-t border-[rgba(20,21,26,.04)]">
                    <td className="py-1.5 pr-3 text-c-text">{item.descricao}</td>
                    <td className="py-1.5 pr-3 text-center text-c-text-2 font-mono text-[11px]">{item.unidade}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-c-text-2">{toNum(item.quantidade).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-c-text-2">{formatMoedaCompact(toNum(item.custo_unit_min), false)}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-c-text-2">{formatMoedaCompact(toNum(item.custo_unit_max), false)}</td>
                    <td className="py-1.5 pr-3 text-right font-mono font-bold text-c-text">{formatMoedaCompact(custoTotalItem(item), false)}</td>
                    <td className="py-1.5 text-c-text-2 text-[11px]">{item.fonte ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="card flex items-center justify-between gap-4 border-t-2 border-[color:var(--accent)]/40">
        <span className="text-[13px] font-semibold text-c-text">{t.totalGeral}</span>
        <span className="font-mono text-[16px] font-bold text-c-text">{formatMoedaCompact(totalGeral)}</span>
      </div>
    </section>
  )
}

