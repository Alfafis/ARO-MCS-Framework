import { useState } from 'react'
import {
  Download, BarChart2, Shield, DollarSign,
  ArrowLeftRight, ArrowUpRight, Calendar, TrendingUp,
} from 'lucide-react'
import OctahedronIcon from '@/components/icons/OctahedronIcon'

const CATEGORIES = [
  { order: '01', name: 'Estudos',               min: '6,55M',  max: '9,10M',  upd: '9,54M'  },
  { order: '02', name: 'Cavas',                 min: '2,27M',  max: '2,42M',  upd: '2,53M'  },
  { order: '03', name: 'Pilhas',                min: '1,72M',  max: '1,80M',  upd: '1,89M'  },
  { order: '04', name: 'Barragens',             min: '0,41M',  max: '0,43M',  upd: '0,45M'  },
  { order: '05', name: 'Planta Industrial',     min: '0,84M',  max: '0,88M',  upd: '0,92M'  },
  { order: '06', name: 'Áreas de Apoio',        min: '3,79M',  max: '3,99M',  upd: '4,18M'  },
  { order: '07', name: 'Demolição Estr. Civis', min: '4,44M',  max: '4,57M',  upd: '4,80M'  },
  { order: '08', name: 'Monitoramento',         min: '9,59M',  max: '12,01M', upd: '12,59M' },
]

const RISK_METRICS = [
  { label: 'Média',                       value: 'R$ 32.383.330' },
  { label: 'Desvio-padrão',              value: 'R$ 1.609.055'  },
  { label: 'P(x = 80%)',                 value: 'R$ 33.751.817' },
  { label: 'Prob. de excedência (x>80%)', value: '25,19%'       },
]

const METHODS = [
  { name: 'Juros simples',     rate: '10,75%/ano',           value: 'R$ 84.172.705'  },
  { name: 'Juros compostos',   rate: '10,75%/ano',           value: 'R$ 112.613.519' },
  { name: 'Inflação constante', rate: '3,4%/ano',            value: 'R$ 56.670.699'  },
  { name: 'Escalonamento',     rate: 'IPCA variável 2024–2033', value: 'R$ 55.175.062' },
]

const DISBURSEMENT = [
  { label: 'ANO 1',  value: 'R$ 0'   },
  { label: 'ANO 2',  value: '471,7k' },
  { label: 'ANO 3',  value: '314,5k' },
  { label: 'ANO 4',  value: '1,52M'  },
  { label: 'ANO 5',  value: '4,42M'  },
  { label: 'ANO 6',  value: '14,91M' },
  { label: 'ANO 7',  value: '3,15M'  },
  { label: 'ANO 8',  value: '3,15M'  },
  { label: 'ANO 9',  value: '3,15M'  },
  { label: 'ANO 10', value: '3,15M'  },
]

const CV       = 0.0497
const MAX_CUM  = 34.236
const TRACK_H  = 160

const FAN_DATA = [
  { label: 'Ano 1',  cum: 0      },
  { label: 'Ano 2',  cum: 0.4717 },
  { label: 'Ano 3',  cum: 0.7862 },
  { label: 'Ano 4',  cum: 2.3062 },
  { label: 'Ano 5',  cum: 6.726  },
  { label: 'Ano 6',  cum: 21.636 },
  { label: 'Ano 7',  cum: 24.786 },
  { label: 'Ano 8',  cum: 27.936 },
  { label: 'Ano 9',  cum: 31.086 },
  { label: 'Ano 10', cum: 34.236 },
]

function fanMetrics(cum: number) {
  const dotPx   = Math.max(0, Math.min((cum / MAX_CUM) * TRACK_H - 4.5, TRACK_H - 9))
  const bandBot = Math.max(0, (cum * (1 - CV) / MAX_CUM) * TRACK_H)
  const bandH   = Math.max(cum > 0 ? 6 : 0, (cum * CV * 2 / MAX_CUM) * TRACK_H)
  return { dotPx, bandBot, bandH }
}

export default function PortalClienteRelatorio() {
  const [toast, setToast] = useState(false)

  function handleDownload() {
    setToast(true)
    setTimeout(() => { setToast(false); window.print() }, 900)
  }

  return (
    <div className="min-h-screen bg-c-bg print:bg-white">

      {/* ── Header fixo ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[rgba(20,21,26,.08)] flex items-center justify-between px-8 py-[22px]">
        <div className="flex items-center gap-2">
          <OctahedronIcon />
          <span className="text-[16px] font-bold text-c-text">ARO-MCS</span>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f0eeec] text-c-text-2 text-[12px] font-medium">
            NX Gold — Portal do cliente
          </span>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-white border border-[rgba(20,21,26,.12)] shadow-[0_1px_2px_rgba(20,21,26,.06)] text-[13px] font-semibold text-c-text hover:bg-[#f4f3f1] transition-colors duration-150 cursor-pointer"
          >
            <Download size={13} strokeWidth={2} />
            Baixar PDF
          </button>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <div className="pt-[76px]">
        <div className="max-w-[1040px] mx-auto px-6 py-8 flex flex-col gap-5">

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
          <div className="grid grid-cols-4 gap-4">
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
          <div className="grid grid-cols-[1.3fr_1fr] gap-4 items-start">

            {/* Custo por categoria */}
            <div className="bg-white rounded-[20px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={15} strokeWidth={2} className="text-accent" />
                <span className="text-[14px] font-semibold text-c-text">Custo por categoria — 8 setores</span>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-[11px] font-semibold tracking-[0.06em] uppercase text-c-text-2 text-left pb-2 pr-3 w-7">#</th>
                    <th className="text-[11px] font-semibold tracking-[0.06em] uppercase text-c-text-2 text-left pb-2">CATEGORIA</th>
                    <th className="text-[11px] font-semibold tracking-[0.06em] uppercase text-c-text-2 text-right pb-2 px-3">MIN</th>
                    <th className="text-[11px] font-semibold tracking-[0.06em] uppercase text-c-text-2 text-right pb-2 px-3">MAX</th>
                    <th className="text-[11px] font-semibold tracking-[0.06em] uppercase text-c-text-2 text-right pb-2 whitespace-nowrap">ATUALIZ. 2023</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => (
                    <tr key={cat.order} className="border-t border-[rgba(20,21,26,.06)]">
                      <td className="py-2.5 pr-3 text-[12px] font-mono text-c-text-2">{cat.order}</td>
                      <td className="py-2.5 text-[13px] text-c-text max-w-[130px] truncate">{cat.name}</td>
                      <td className="py-2.5 px-3 text-[13px] font-mono text-c-text-2 text-right">{cat.min}</td>
                      <td className="py-2.5 px-3 text-[13px] font-mono text-c-text-2 text-right">{cat.max}</td>
                      <td className="py-2.5 text-[13px] font-mono font-bold text-c-text text-right">{cat.upd}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[rgba(20,21,26,.16)]">
                    <td className="pt-3 pb-1 pr-3" />
                    <td className="pt-3 pb-1 text-[13px] font-bold text-c-text">Total geral</td>
                    <td className="pt-3 pb-1 px-3 text-[13px] font-mono font-bold text-c-text text-right">29,61M</td>
                    <td className="pt-3 pb-1 px-3 text-[13px] font-mono font-bold text-c-text text-right">35,20M</td>
                    <td className="pt-3 pb-1 text-[13px] font-mono font-bold text-c-text text-right">36,90M</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Métricas de risco */}
            <div className="bg-white rounded-[20px] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Shield size={15} strokeWidth={2} className="text-accent" />
                <span className="text-[14px] font-semibold text-c-text">Métricas de risco</span>
              </div>

              {/* IC 95% bar */}
              <div>
                <div className="relative h-1.5 bg-[#f0eeec] rounded-full mb-2">
                  <div className="absolute h-1.5 bg-accent rounded-full" style={{ left: '30%', width: '40%' }} />
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[11px] text-c-text-2">IC 95%: R$ 32,35 M</span>
                  <span className="font-mono text-[11px] text-c-text-2">R$ 32,41 M</span>
                </div>
              </div>

              <div className="h-px bg-[rgba(20,21,26,.08)]" />

              <div className="flex flex-col gap-2.5">
                {RISK_METRICS.map(m => (
                  <div key={m.label} className="flex justify-between items-baseline gap-4">
                    <span className="text-[13px] text-c-text-2">{m.label}</span>
                    <span className="font-mono text-[13px] font-semibold text-c-text whitespace-nowrap">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[rgba(20,21,26,.08)]" />

              <div className="flex justify-between items-baseline">
                <span className="text-[13px] text-c-text-2">Contingência aplicada</span>
                <span className="font-mono text-[13px] font-semibold text-c-text">0%</span>
              </div>
            </div>
          </div>

          {/* Métodos de atualização monetária */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={15} strokeWidth={2} className="text-accent" />
              <span className="text-[14px] font-semibold text-c-text">
                Métodos de atualização monetária{' '}
                <span className="font-normal text-c-text-2">(10 anos, sobre R$ 40,57 M)</span>
              </span>
            </div>
            <div>
              {METHODS.map((m, i) => (
                <div
                  key={m.name}
                  className={`flex justify-between items-center py-4 ${i > 0 ? 'border-t border-[rgba(20,21,26,.08)]' : ''}`}
                >
                  <span className="text-[13px] text-c-text">
                    {m.name}{' '}
                    <span className="text-c-text-2">— {m.rate}</span>
                  </span>
                  <span className="font-mono text-[13px] font-bold text-c-text">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Desembolso projetado por ano */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Calendar size={15} strokeWidth={2} className="text-accent" />
              <span className="text-[14px] font-semibold text-c-text">Desembolso projetado por ano — Total Geral</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {DISBURSEMENT.map(d => (
                <div key={d.label} className="bg-[#f4f3f1] rounded-[8px] px-3 py-2.5 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-[0.06em] uppercase text-c-text-2">{d.label}</span>
                  <span className="font-mono text-[12px] font-bold text-c-text">{d.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-c-text-2 mt-3 leading-relaxed">
              Apenas Estudos, Áreas de Apoio, Demolição e Monitoramento têm valores lançados por ano; as demais categorias não têm essa quebra temporal na planilha.
            </p>
          </div>

          {/* Fan chart */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={15} strokeWidth={2} className="text-accent" />
              <span className="text-[14px] font-semibold text-c-text">Leque de confiança (fan chart) — desembolso acumulado por ano</span>
            </div>
            <div className="flex items-end gap-4 px-2">
              {FAN_DATA.map(d => {
                const { dotPx, bandBot, bandH } = fanMetrics(d.cum)
                return (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-4" style={{ height: TRACK_H }}>
                      {/* track */}
                      <div className="absolute inset-0 bg-[#ebebea] rounded-full" />
                      {/* confidence band */}
                      {d.cum > 0 && (
                        <div
                          className="absolute inset-x-0 bg-accent-100 rounded-full"
                          style={{ bottom: bandBot, height: bandH }}
                        />
                      )}
                      {/* mean dot */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 w-[9px] h-[9px] rounded-full bg-accent ring-2 ring-white"
                        style={{ bottom: dotPx }}
                      />
                    </div>
                    <span className="text-[11px] text-c-text-2 whitespace-nowrap">{d.label}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-[11.5px] text-c-text-2 mt-4 leading-relaxed">
              Faixa estimada a partir do coeficiente de variação da simulação (4,97%) aplicado ao desembolso{' '}
              <span className="underline">acumulado</span> por ano.
            </p>
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] inline-flex items-center px-5 py-3 rounded-full bg-[#14151a] text-white text-[13px] font-semibold shadow-[0_16px_40px_-12px_rgba(20,21,26,.5)]">
          Gerando PDF…
        </div>
      )}
    </div>
  )
}
