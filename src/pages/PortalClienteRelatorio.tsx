import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { DollarSign, ArrowLeftRight, ArrowUpRight, Shield } from 'lucide-react'
import OctahedronIcon from '@/components/icons/OctahedronIcon'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import FanChartCard from '@/components/resumo-executivo/FanChartCard'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'
import {
  MOCK_CATEGORIES, MOCK_TOTALS,
  MOCK_DISBURSEMENT_VALUES, MOCK_METHOD_VALUES,
  MOCK_RISK_METRIC_VALUES, buildFanData,
} from '@/data/relatorio-mock'
import { validateCodeForReport } from '@/data/invite-codes'
import type { MonetaryMethod, DisbursementYear, RiskMetric } from '@/types/relatorio'

const METHODS: MonetaryMethod[] = [
  { label: 'Juros simples — 10,75%/ano',              value: MOCK_METHOD_VALUES[0] },
  { label: 'Juros compostos — 10,75%/ano',            value: MOCK_METHOD_VALUES[1] },
  { label: 'Inflação constante — 3,4%/ano',           value: MOCK_METHOD_VALUES[2] },
  { label: 'Escalonamento — IPCA variável 2024–2033', value: MOCK_METHOD_VALUES[3] },
]

const DISBURSEMENT_YEARS: DisbursementYear[] = MOCK_DISBURSEMENT_VALUES.map((value, i) => ({
  label: `ANO ${i + 1}`,
  value,
}))

const FAN_DATA = buildFanData(
  Array.from({ length: 10 }, (_, i) => `Ano ${i + 1}`)
)

const RISK_METRICS: RiskMetric[] = [
  { label: 'Média',                          value: MOCK_RISK_METRIC_VALUES[0] },
  { label: 'Desvio-padrão',                  value: MOCK_RISK_METRIC_VALUES[1] },
  { label: 'P(x = 80%)',                     value: MOCK_RISK_METRIC_VALUES[2] },
  { label: 'Prob. de excedência (x>80%)',    value: MOCK_RISK_METRIC_VALUES[3] },
]

function isAdminSession() {
  return localStorage.getItem('aro_auth') === '1'
}

function sessionKey(id: string) {
  return `aro_portal_${id}`
}

export default function PortalClienteRelatorio() {
  const { id = '' } = useParams<{ id: string }>()

  const [accessGranted, setAccessGranted] = useState<boolean>(() => {
    if (isAdminSession()) return true
    const stored = sessionStorage.getItem(sessionKey(id))
    return !!stored && validateCodeForReport(id, stored)
  })

  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [toast, setToast] = useState(false)

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
            NX Gold — Portal do cliente
          </span>
          {accessGranted && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-white border border-[rgba(20,21,26,.12)] shadow-[0_1px_2px_rgba(20,21,26,.06)] text-[13px] font-semibold text-c-text hover:bg-[#f4f3f1] transition-colors duration-150 cursor-pointer"
            >
              <Download size={13} strokeWidth={2} />
              Baixar PDF
            </button>
          )}
        </div>
      </header>

      {/* ── Relatório ── */}
      <div className="pt-[56px] sm:pt-[76px]">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">

          {/* Cabeçalho do relatório */}
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-[22px] font-bold text-c-text">Relatório — Fechamento de Mina</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f0eeec] text-c-text-2 text-[11px] font-semibold">
                Rev1 · Vigente
              </span>
            </div>
            <p className="text-[13px] text-c-text-2">
              Provisionamento financeiro NX Gold · Simulação Monte Carlo, 10.000 iterações
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <DollarSign size={14} strokeWidth={2} className="text-accent-700" />,
                label: 'Custo médio',
                value: 'R$ 32,4 M',
                sub: 'Monte Carlo · 10.000 iterações',
                valueClass: 'text-c-text',
              },
              {
                icon: <ArrowLeftRight size={14} strokeWidth={2} className="text-accent-700" />,
                label: 'Faixa min–max',
                value: 'R$ 29,6–35,2 M',
                sub: 'Custo total, 8 categorias',
                valueClass: 'text-c-text',
              },
              {
                icon: <ArrowUpRight size={14} strokeWidth={2} className="text-accent-700" />,
                label: 'Valor atualizado 2023',
                value: 'R$ 36,9 M',
                sub: 'Custo total, valor atualizado',
                valueClass: 'text-c-text',
              },
              {
                icon: <Shield size={14} strokeWidth={2} className="text-accent-700" />,
                label: 'Nível de incerteza',
                value: 'Baixo',
                sub: 'CV = 4,97%',
                valueClass: 'text-success',
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
            <CostByCategoryTable categories={MOCK_CATEGORIES} totals={MOCK_TOTALS} />
            <RiskMetricsCard
              metrics={RISK_METRICS}
              cvLabel="CV = 4,97%"
              icLo="IC 95%: R$ 32,35 M"
              icHi="R$ 32,41 M"
              contingency="0%"
            />
          </div>

          <MonetaryMethodsCard methods={METHODS} />
          <AnnualDisbursementCard years={DISBURSEMENT_YEARS} />
          <FanChartCard data={FAN_DATA} />

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

            <h2 className="text-[17px] font-bold text-c-text mb-5">Acesse seu relatório</h2>

            <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold tracking-widest uppercase text-c-text-2 mb-1.5">
                  Código de acesso
                </label>
                <input
                  type="text"
                  value={codeInput}
                  onChange={e => { setCodeInput(e.target.value); setCodeError(false) }}
                  placeholder="Ex: NXGOLD-2024"
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
                    Código inválido ou expirado. Verifique e tente novamente.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-[11px] bg-accent text-white font-semibold text-[0.875rem] cursor-pointer border-0 hover:opacity-90 transition-opacity duration-150"
              >
                Acessar relatório
              </button>
            </form>


          </div>
        </div>
      )}

      {/* Toast PDF */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center px-5 py-3 rounded-full bg-[#14151a] text-white text-[13px] font-semibold shadow-[0_16px_40px_-12px_rgba(20,21,26,.5)]">
          Gerando PDF…
        </div>
      )}
    </div>
  )
}
