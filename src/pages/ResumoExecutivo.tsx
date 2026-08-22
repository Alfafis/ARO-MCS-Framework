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
import { useProjeto } from '@/context/ProjetoContext'
import { supabase } from '@/integrations/supabase/client'
import { categoryParamsFromCategorias } from '@/lib/monteCarlo'
import { computeMonetaryValues } from '@/lib/financeiro'
import { formatDateTime } from '@/lib/utils'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import type { CostCategory, CostTotals, RiskMetric } from '@/types/relatorio'
import type { SimResult } from '@/types/simulacao'
import type { RevisaoRow } from '@/types'

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
  const { catalogo } = useProjeto()
  const [linkCopied, setLinkCopied] = useState(false)
  const [simResult, setSimResult] = useState<SimResult | null>(null)
  const [revisoes, setRevisoes] = useState<RevisaoRow[]>([])

  useEffect(() => {
    supabase.from('simulacoes').select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setSimResult(data[0].resultado as unknown as SimResult)
        else setSimResult(null)
      })
    supabase.from('revisoes').select('*')
      .eq('projeto_id', projeto.id)
      .order('criado_em', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setRevisoes([...data].reverse())
      })
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
    const [simple, compound, inflation, ipca] = computeMonetaryValues(baseWithProvision)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    return [
      { label: t.method1, value: fmt(simple)    },
      { label: t.method2, value: fmt(compound)  },
      { label: t.method3, value: fmt(inflation) },
      { label: t.method4, value: fmt(ipca)      },
    ]
  }, [baseTotal, baseWithProvision, t])

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {monetaryMethods.length > 0 && (
            <MonetaryMethodsCard className="lg:col-span-7" methods={monetaryMethods} baseLabel={fmtM(baseWithProvision)} />
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
