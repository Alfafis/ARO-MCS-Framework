import { useState, useMemo, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Copy, Check, KeyRound } from 'lucide-react'
import { DollarSign, ArrowLeftRight, ArrowUpRight, Plus } from 'lucide-react'
import OctahedronIcon from '@/components/icons/OctahedronIcon'
import LangSelector from '@/components/layout/LangSelector'
import CodigoAcessoModal from '@/components/clientes/CodigoAcessoModal'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import FanChartCard from '@/components/resumo-executivo/FanChartCard'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'
import PhaseBreakdown from '@/components/dashboard/PhaseBreakdown'
import {
  MOCK_CATEGORIES,
  MOCK_DISBURSEMENT_VALUES, MOCK_DISBURSEMENT_BY_CATEGORY,
  MOCK_RISK_METRIC_VALUES, buildFanData,
} from '@/data/relatorio-mock'
import { validateCodeForReport } from '@/data/invite-codes'
import { useSimulation } from '@/context/SimulationContext'
import { computeMonetaryValues, BASE_TOTAL_WITH_PROVISION, TOTAL_UPDATED_2023 } from '@/lib/financeiro'
import { useT } from '@/i18n/LangContext'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { resumoT } from '@/i18n/resumo-executivo'
import type { DisbursementYear, RiskMetric } from '@/types/relatorio'

function fmtM(v: number) {
  return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} M`
}

function isAdminSession() {
  return localStorage.getItem('aro_auth') === '1'
}

function sessionKey(id: string) {
  return `aro_portal_${id}`
}

export default function PortalClienteRelatorio() {
  const { id = '' } = useParams<{ id: string }>()
  const { simResult, activeCategories } = useSimulation()
  const t     = useT(relatorioClienteT)
  const tBase = useT(resumoT)

  const disbursementYears: DisbursementYear[] = useMemo(
    () => MOCK_DISBURSEMENT_VALUES.map((value, i) => ({
      label: `${tBase.yearPrefix} ${i + 1}`,
      value,
    })),
    [tBase.yearPrefix]
  )

  const fanLabels = useMemo(
    () => Array.from({ length: 10 }, (_, i) =>
      `${tBase.yearPrefix[0]}${tBase.yearPrefix.slice(1).toLowerCase()} ${i + 1}`
    ),
    [tBase.yearPrefix]
  )

  const fanData = useMemo(
    () => buildFanData(fanLabels, simResult?.cv),
    [fanLabels, simResult]
  )

  const activeCatSet = useMemo(() => new Set(activeCategories), [activeCategories])

  const filteredCategories    = useMemo(
    () => MOCK_CATEGORIES.filter(c => activeCatSet.has(c.name)),
    [activeCatSet]
  )
  const filteredDisbursement  = useMemo(
    () => MOCK_DISBURSEMENT_BY_CATEGORY.filter(c => activeCatSet.has(c.name)),
    [activeCatSet]
  )
  const filteredBase = useMemo(() => {
    const parseM = (s: string) =>
      parseFloat(s.replace(',', '.').replace('M', '').replace('k', '')) *
      (s.includes('k') ? 1_000 : 1_000_000)
    const filteredUpdated = filteredCategories.reduce((acc, c) => acc + parseM(c.updated), 0)
    return BASE_TOTAL_WITH_PROVISION * (filteredUpdated / TOTAL_UPDATED_2023)
  }, [filteredCategories])

  const monetaryMethods = useMemo(() => {
    const [simple, compound, inflation, ipca] = computeMonetaryValues(filteredBase)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    return [
      { label: tBase.method1, value: fmt(simple)    },
      { label: tBase.method2, value: fmt(compound)  },
      { label: tBase.method3, value: fmt(inflation) },
      { label: tBase.method4, value: fmt(ipca)      },
    ]
  }, [filteredBase, tBase])

  const filteredTotals = useMemo(() => {
    const parseM = (s: string) => parseFloat(s.replace(',', '.').replace('M', '').replace('k', '')) *
      (s.includes('k') ? 0.001 : 1) || 0
    const fmtM   = (v: number) => `${v.toFixed(2).replace('.', ',')}M`
    return {
      min:     fmtM(filteredCategories.reduce((acc, c) => acc + parseM(c.min),     0)),
      max:     fmtM(filteredCategories.reduce((acc, c) => acc + parseM(c.max),     0)),
      updated: fmtM(filteredCategories.reduce((acc, c) => acc + parseM(c.updated), 0)),
    }
  }, [filteredCategories])

  const riskMetrics: RiskMetric[] = [
    { label: t.riskMean,       value: simResult?.mean       ?? MOCK_RISK_METRIC_VALUES[0] },
    { label: t.riskStddev,     value: simResult?.stddev     ?? MOCK_RISK_METRIC_VALUES[1] },
    { label: t.riskP80,        value: simResult?.p80        ?? MOCK_RISK_METRIC_VALUES[2] },
    { label: t.riskExceedProb, value: simResult?.exceedProb ?? MOCK_RISK_METRIC_VALUES[3] },
  ]

  const cvLabel   = simResult ? `CV = ${(simResult.cv * 100).toFixed(2)}%` : 'CV = 4,97%'
  const confLevel = simResult?.confidenceLevel ?? 95
  const [icLo, icHi] = simResult
    ? simResult.ic95.replace('M', '').split('–')
    : ['32,35', '32,41']
  const icLoLabel = t.icLabel(confLevel, icLo)
  const icHiLabel = `R$ ${icHi} M`

  const [accessGranted, setAccessGranted] = useState<boolean>(() => {
    if (isAdminSession()) return true
    const stored = sessionStorage.getItem(sessionKey(id))
    return !!stored && validateCodeForReport(id, stored)
  })

  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [toast, setToast] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const isAdmin = isAdminSession()

  async function handleGerarLink() {
    const url = `${window.location.origin}/relatorio/${id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      prompt(t.copyLinkPrompt, url)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  function handleCodeSubmit(e: FormEvent) {
    e.preventDefault()
    if (validateCodeForReport(id, codeInput)) {
      sessionStorage.setItem(sessionKey(id), codeInput)
      setAccessGranted(true)
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  function handleDownload() {
    setToast(true)
    setTimeout(() => { setToast(false); window.print() }, 900)
  }

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
            NX Gold — {t.portalPill}
          </span>
          {accessGranted && (
            <>
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
            </>
          )}
          <LangSelector ariaLabel={t.selectLang} />
        </div>
      </header>

      {/* ── Relatório ── */}
      <div className="pt-[56px] sm:pt-[76px]">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">

          {/* Cabeçalho do relatório */}
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-[22px] font-bold text-c-text">{t.reportTitle}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f0eeec] text-c-text-2 text-[11px] font-semibold">
                Rev1 · {t.reportRevisionCurrent}
              </span>
            </div>
            <p className="text-[13px] text-c-text-2">
              {t.reportSubtitleBase}
              {simResult && t.reportSubtitleSim(simResult.iterations, simResult.distribution)}
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <DollarSign size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiAvgCost,
                value: simResult?.mean ?? 'R$ 32,4 M',
                sub: simResult ? t.kpiAvgCostSubMC(simResult.status) : t.kpiAvgCostSubDefault,
                valueClass: 'text-c-text',
              },
              {
                icon: <ArrowLeftRight size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiMinMaxRange,
                value: simResult?.p10p90 ?? 'R$ 29,6–35,2 M',
                sub: simResult ? t.kpiMinMaxSubIC(confLevel, simResult.ic95) : t.kpiMinMaxSubDefault,
                valueClass: 'text-c-text',
              },
              {
                icon: <ArrowUpRight size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiUpdatedValue,
                value: `R$ ${filteredTotals.updated}`,
                sub: t.kpiUpdatedSub,
                valueClass: 'text-c-text',
              },
              {
                icon: <Plus size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiBaseProvision,
                value: fmtM(filteredBase),
                sub: t.kpiBaseSub,
                valueClass: 'text-c-text',
              },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-[20px] p-6 flex flex-col gap-3">
                <div className="w-[26px] h-[26px] rounded-[9px] bg-accent-100 flex items-center justify-center shrink-0">
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-c-text-2 mb-1">{kpi.label}</p>
                  <p className={`text-[20px] font-bold leading-none mb-1 ${kpi.valueClass}`}>{kpi.value}</p>
                  <p className="text-[12px] text-c-text-2">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Custo por categoria + Métricas de risco */}
          <div className="flex flex-col md:grid md:grid-cols-[1.3fr_1fr] gap-4 items-start">
            <CostByCategoryTable categories={filteredCategories} totals={filteredTotals} />
            <RiskMetricsCard
              metrics={riskMetrics}
              cvLabel={cvLabel}
              icLo={icLoLabel}
              icHi={icHiLabel}
              contingency="0%"
              uncertainty={simResult?.uncertainty}
            />
          </div>

          <PhaseBreakdown />
          <MonetaryMethodsCard methods={monetaryMethods} />
          <AnnualDisbursementCard years={disbursementYears} categories={filteredDisbursement} />
          <FanChartCard data={fanData} />

        </div>
      </div>

      {/* ── Modal de acesso ── */}
      {!accessGranted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(20,21,26,0.6)' }}>
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
                  <p className="text-[12px] text-[#e33] mt-1.5">
                    {t.modalCodeError}
                  </p>
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
      )}

      {/* Modal código de acesso (admin) */}
      {codeModalOpen && (
        <CodigoAcessoModal
          reportId={id}
          clientName="NX Gold"
          projectName="Fechamento de Mina"
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
