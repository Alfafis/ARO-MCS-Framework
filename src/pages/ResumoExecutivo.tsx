import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import type { Projeto } from '@/types/clientes'
import RevisionTimeline, { type RevisionTimelineItem } from '@/components/dashboard/RevisionTimeline'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import RiskMetricsCard from '@/components/resumo-executivo/RiskMetricsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import { computeDesembolsoMatrix, type ModoDesembolso } from '@/lib/desembolsoAno'
import type { DisbursementYear, DisbursementCategory } from '@/types/relatorio'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjeto } from '@/context/useProjeto'
import { supabase } from '@/integrations/supabase/client'
import { categoryParamsFromCategorias } from '@/lib/monteCarlo'
import { computeMonetaryValues, type MetodoAtualizacao } from '@/lib/financeiro'
import { formatDateTime } from '@/lib/utils'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import type { CostCategory, CostTotals, RiskMetric } from '@/types/relatorio'
import type { SimResult } from '@/types/simulacao'
import type { RevisaoRow } from '@/types'
import { sequenciaMidpoints } from '@/types/parametrosGlobais'

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

// "34,2" (compacto, sem "R$") — mesma convenção do Portal do Cliente pra
// célula de tabela, onde o prefixo já vem da coluna/título ao redor.
function fmtCompact(v: number) {
  return `${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
}

function fmtM(v: number) {
  return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} M`
}

type ResumoT = typeof resumoT['pt-BR']

function revisaoToTimelineItem(rev: RevisaoRow, t: ResumoT): RevisionTimelineItem {
  const numero = rev.codigo.replace(/\D/g, '')
  const ocorridoEm = rev.publicado_em ?? rev.criado_em
  const desc = rev.status === 'rascunho'
    ? t.revDraftDesc
    : rev.status === 'vigente'
      ? t.revCurrentDesc
      : t.revReplacedDesc
  return {
    id:    rev.id,
    title: `Rev${numero}`,
    date:  formatDateTime(ocorridoEm),
    done:  rev.status !== 'rascunho',
    tag:   rev.status === 'vigente' ? t.revCurrent : null,
    desc,
  }
}

export default function ResumoExecutivo() {
  const t   = useT(resumoT)
  const tRel = useT(relatorioClienteT)
  const navigate = useNavigate()
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const { catalogo, parametrosAnuais } = useProjeto()
  const [linkCopied, setLinkCopied] = useState(false)
  const [simResult, setSimResult] = useState<SimResult | null>(null)
  const [revisoes, setRevisoes] = useState<RevisaoRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetchSim = supabase.from('simulacoes').select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setSimResult(data[0].resultado as unknown as SimResult)
        else setSimResult(null)
      })
    const fetchRev = supabase.from('revisoes').select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setRevisoes([...data].reverse())
      })
    Promise.allSettled([fetchSim, fetchRev]).then(() => setLoading(false))
  }, [projeto.id])

  const categoryParams = useMemo(
    () => categoryParamsFromCategorias(projeto.categorias, catalogo),
    [projeto.categorias, catalogo]
  )

  const costCategories: CostCategory[] = useMemo(
    () => categoryParams.map((c, i) => ({
      rank: String(i + 1).padStart(2, '0'),
      name: c.name,
      min:  fmtCompact(c.min),
      max:  fmtCompact(c.max),
    })),
    [categoryParams]
  )

  const costTotals: CostTotals = useMemo(() => ({
    min: fmtCompact(categoryParams.reduce((acc, c) => acc + c.min, 0)),
    max: fmtCompact(categoryParams.reduce((acc, c) => acc + c.max, 0)),
  }), [categoryParams])

  // Base pro provisionamento: soma do ponto médio de cada categoria real —
  // mesma convenção de ProjetoContext.estimateTotal / PortalClienteRelatorio.
  const baseTotal         = useMemo(() => categoryParams.reduce((acc, c) => acc + c.mode, 0), [categoryParams])
  const contingenciaPct   = projeto.contingenciaPct
  const baseWithProvision = baseTotal * (1 + contingenciaPct / 100)

  const monetaryMethods = useMemo(() => {
    if (baseTotal === 0) return []
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const selicPorAno    = sequenciaMidpoints(parametrosAnuais, 'selic', anoBase, projeto.horizonteAnos)
    const inflacaoPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    return computeMonetaryValues(baseWithProvision, { selicPorAno, inflacaoPorAno, horizonYears: projeto.horizonteAnos }).map(({ metodo, valor }) => ({
      label: labelPorMetodo(metodo, t, selicPorAno, inflacaoPorAno, dataBaseAno),
      value: fmt(valor),
    }))
  }, [baseTotal, baseWithProvision, parametrosAnuais, projeto.dataBase, projeto.horizonteAnos, t])

  const riskMetrics: RiskMetric[] = simResult ? [
    { label: tRel.riskMean,       value: simResult.mean       },
    { label: tRel.riskStddev,     value: simResult.stddev     },
    { label: tRel.riskP80,        value: simResult.p80        },
    { label: tRel.riskExceedProb, value: simResult.exceedProb },
  ] : []

  const cvLabel   = simResult ? `CV = ${(simResult.cv * 100).toFixed(2)}%` : tRel.simPendingSub
  const confLevel = simResult?.confidenceLevel ?? 95
  const [icLo, icHi] = simResult ? simResult.ic95.replace('M', '').split('–') : ['—', '—']
  const icLoLabel = simResult ? tRel.icLabel(confLevel, icLo) : '—'
  const icHiLabel = simResult ? `R$ ${icHi} M` : '—'

  const revisionItems = useMemo(() => revisoes.map(r => revisaoToTimelineItem(r, t)), [revisoes, t])

  // Curva de desembolso ano-a-ano — matriz por categoria com 3 modos de
  // visualização (Etapa 4 do `_Plan_Curva_Desembolso.md`, `_Dados_Formulas_Planilha.md`).
  const [modoDesembolso, setModoDesembolso] = useState<ModoDesembolso>('base')
  const disbursement = useMemo(() => {
    if (projeto.categorias.length === 0) return null
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)

    const res = computeDesembolsoMatrix({
      categorias:      projeto.categorias,
      catalogo,
      horizonYears:    projeto.horizonteAnos,
      contingenciaPct: projeto.contingenciaPct,
      ipcaPorAno,
      modo:            modoDesembolso === 'ipca' && ipcaPorAno === null ? 'provisao' : modoDesembolso,
    })

    if (res.totalGeral === 0) return null

    const years: DisbursementYear[] = res.totaisPorAno.map((total, i) => ({
      label: `Ano ${String(i + 1).padStart(2, '0')}`,
      value: fmtCompact(total),
    }))
    const categories: DisbursementCategory[] = res.categorias.map((name, ci) => ({
      name,
      values: res.matrix[ci].map(v => v > 0 ? fmtCompact(v) : null),
    }))
    return { years, categories, ipcaDisponivel: ipcaPorAno !== null }
  }, [projeto.categorias, projeto.horizonteAnos, projeto.contingenciaPct, projeto.dataBase, catalogo, parametrosAnuais, modoDesembolso])

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
              {linkCopied
                ? <><Check size={13} /> Link copiado!</>
                : <><Copy size={13} /> Gerar link do cliente</>}
            </Button>
            <Button variant="ghost">{t.exportPdf}</Button>
            <Button variant="primary" onClick={() => navigate(`/projetos/${projeto.id}/simulacao`)}>{t.runSimulation}</Button>
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-c-text-2">Modo:</span>
              <ModoToggle current={modoDesembolso} onChange={setModoDesembolso} disableIpca={!disbursement.ipcaDisponivel} />
            </div>
            <AnnualDisbursementCard years={disbursement.years} categories={disbursement.categories} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {monetaryMethods.length > 0 && (
            <MonetaryMethodsCard className="lg:col-span-7" methods={monetaryMethods} baseLabel={fmtM(baseWithProvision)} horizonYears={projeto.horizonteAnos} />
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

// Toggle dos 3 modos do card de desembolso ano-a-ano (`_Plan_Curva_Desembolso.md`).
// `disableIpca` esconde o modo IPCA quando `parametros_anuais` não tem série
// completa configurada (evita render de matriz idêntica à provisão sem aviso).
interface ModoToggleProps {
  current:     ModoDesembolso
  onChange:    (m: ModoDesembolso) => void
  disableIpca: boolean
}

function ModoToggle({ current, onChange, disableIpca }: ModoToggleProps) {
  const opts: { key: ModoDesembolso; label: string }[] = [
    { key: 'base',     label: 'Sem provisão' },
    { key: 'provisao', label: 'Com provisão 20%' },
    { key: 'ipca',     label: 'Com IPCA acumulado' },
  ]
  return (
    <div className="inline-flex rounded-full bg-[#f6f5f3] p-1 gap-1">
      {opts.map(opt => {
        const disabled = opt.key === 'ipca' && disableIpca
        const active = current === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors cursor-pointer border-0 ${
              active
                ? 'bg-white text-c-text shadow-sm'
                : disabled
                  ? 'text-c-text-2/40 cursor-not-allowed'
                  : 'text-c-text-2 hover:text-c-text'
            }`}
            title={disabled ? 'IPCA anual não configurado em Parâmetros Globais' : undefined}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
