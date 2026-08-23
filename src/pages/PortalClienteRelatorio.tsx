import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Copy, Check, KeyRound } from 'lucide-react'
import { DollarSign, ArrowLeftRight, Plus } from 'lucide-react'
import OctahedronIcon from '@/components/icons/OctahedronIcon'
import LangSelector from '@/components/layout/LangSelector'
import CodigoAcessoModal from '@/components/clientes/CodigoAcessoModal'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'
import { supabase } from '@/integrations/supabase/client'
import { mapItemCustoRow } from '@/lib/categoriaMappers'
import { categoryParamsFromCategorias } from '@/lib/monteCarlo'
import { computeMonetaryValues, type MetodoAtualizacao } from '@/lib/financeiro'
import { useT } from '@/i18n/LangContext'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { resumoT } from '@/i18n/resumo-executivo'
import type { CostCategory, CostTotals, RiskMetric } from '@/types/relatorio'
import type { Category, CategoriaCatalogo } from '@/types/categorias'
import type { SimResult } from '@/types/simulacao'
import type { RelatorioPublicoReturns } from '@/types'
import { buscarParametro, mapParametroGlobalRow } from '@/types/parametrosGlobais'

type ResumoT = typeof resumoT['pt-BR']

// mesmo formato já usado em ParametroRow (Configuracoes.tsx): "14" → "14,00"
const pct = (v: number) => v.toFixed(2).replace('.', ',')

function labelPorMetodo(metodo: MetodoAtualizacao['metodo'], t: ResumoT, selicPct: number | null, inflacaoPct: number | null, dataBaseAno: number | null): string {
  switch (metodo) {
    case 'simples':       return t.method1(pct(selicPct!))
    case 'compostos':     return t.method2(pct(selicPct!))
    case 'inflacao':      return t.method3(pct(inflacaoPct!))
    case 'escalonamento': return t.method4(dataBaseAno)
  }
}

function fmtM(v: number) {
  return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} M`
}

function fmtCompact(v: number) {
  return `${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
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

  const projeto = bundle?.projeto
  const cliente = bundle?.cliente

  const categorias: Category[] = useMemo(() => (bundle?.categorias ?? []).map(({ categoria, itens }) => ({
    id: categoria.id, catalogoId: categoria.catalogo_id, preenche: categoria.preenche as Category['preenche'],
    expanded: false, justAdded: false, items: itens.map(mapItemCustoRow), camposOperacionais: [],
  })), [bundle])

  const catalogo: CategoriaCatalogo[] = useMemo(() => {
    const seen = new Map<string, string>()
    for (const { catalogo: cat } of bundle?.categorias ?? []) seen.set(cat.id, cat.nome)
    return [...seen.entries()].map(([id, nome]) => ({ id, nome }))
  }, [bundle])

  const simResult = (bundle?.simulacao?.id ? bundle.simulacao.resultado : null) as unknown as SimResult | null
  const activeCatSet = useMemo(() => new Set(bundle?.simulacao?.active_categories ?? []), [bundle])

  const categoryParams = useMemo(() => categoryParamsFromCategorias(categorias, catalogo), [categorias, catalogo])

  const filteredParams = useMemo(
    () => activeCatSet.size === 0 ? categoryParams : categoryParams.filter(c => activeCatSet.has(c.name)),
    [categoryParams, activeCatSet]
  )

  const costCategories: CostCategory[] = useMemo(
    () => filteredParams.map((c, i) => ({
      rank: String(i + 1).padStart(2, '0'),
      name: c.name,
      min:  fmtCompact(c.min),
      max:  fmtCompact(c.max),
    })),
    [filteredParams]
  )

  const costTotals: CostTotals = useMemo(() => ({
    min: fmtCompact(filteredParams.reduce((acc, c) => acc + c.min, 0)),
    max: fmtCompact(filteredParams.reduce((acc, c) => acc + c.max, 0)),
  }), [filteredParams])

  // Base pro provisionamento: soma do ponto médio (min+max)/2 de cada categoria real —
  // mesma convenção usada em ProjetoContext.estimateTotal. "Valor atualizado" por
  // categoria (juros/inflação aplicados individualmente) é gap de modelagem, não existe
  // ainda — ver spec 2026-08-21-simulacao-isolamento-relatorio-design.
  const baseTotal          = useMemo(() => filteredParams.reduce((acc, c) => acc + c.mode, 0), [filteredParams])
  const contingenciaPct    = projeto?.contingencia_pct ?? 0
  const baseWithProvision  = baseTotal * (1 + contingenciaPct / 100)

  const parametrosGlobais = useMemo(() => (bundle?.parametrosGlobais ?? []).map(mapParametroGlobalRow), [bundle])

  const monetaryMethods = useMemo(() => {
    if (baseTotal === 0) return []
    const selicPct    = buscarParametro(parametrosGlobais, 'selic')
    const inflacaoPct = buscarParametro(parametrosGlobais, 'inflacao_ipca')
    const dataBaseAno = projeto?.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    return computeMonetaryValues(baseWithProvision, { selicPct, inflacaoPct }).map(({ metodo, valor }) => ({
      label: labelPorMetodo(metodo, tBase, selicPct, inflacaoPct, dataBaseAno),
      value: fmt(valor),
    }))
  }, [baseTotal, baseWithProvision, parametrosGlobais, projeto?.data_base, tBase])

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
      <div className="min-h-screen bg-c-bg flex items-center justify-center px-4">
        <div className="max-w-[420px] text-center flex flex-col items-center gap-3">
          <OctahedronIcon />
          <h1 className="text-[18px] font-bold text-c-text">{t.reportNotFoundTitle}</h1>
          <p className="text-[13px] text-c-text-2">{t.reportNotFoundBody}</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-c-bg" />
  }

  if (status === 'need-code') {
    return (
      <div className="min-h-screen bg-c-bg flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] bg-white rounded-[20px] shadow-[0_24px_64px_-12px_rgba(20,21,26,.28)] p-7">
          <div className="flex items-center mb-5">
            <div className="flex items-center gap-2">
              <OctahedronIcon />
              <span className="text-[15px] font-bold text-c-text">ARO-MCS</span>
            </div>
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
    <div className="min-h-screen bg-c-bg print:bg-white">

      {/* ── Header fixo ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[rgba(20,21,26,.08)] flex items-center justify-between px-4 sm:px-8 py-[14px] sm:py-[22px]">
        <div className="flex items-center gap-2">
          <OctahedronIcon />
          <span className="text-[16px] font-bold text-c-text">ARO-MCS</span>
        </div>
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
                sub: simResult ? t.kpiAvgCostSubMC(simResult.status) : t.simPendingSub,
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
                value: baseTotal > 0 ? fmtM(baseWithProvision) : '—',
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

          {monetaryMethods.length > 0 && (
            <MonetaryMethodsCard methods={monetaryMethods} baseLabel={fmtM(baseWithProvision)} />
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
