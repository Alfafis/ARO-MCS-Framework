import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Copy, Check, Sprout, ChevronRight, Download, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import type { Projeto } from '@/types/clientes'
import RevisionTimeline, { type RevisionTimelineItem } from '@/components/dashboard/RevisionTimeline'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import RiskMetricsCard, { type RiskScenario } from '@/components/resumo-executivo/RiskMetricsCard'
import CostCompositionCard, { type CostCompositionItem } from '@/components/resumo-executivo/CostCompositionCard'
import DisbursementLineCard from '@/components/resumo-executivo/DisbursementLineCard'
import HistogramCard from '@/components/simulacao/HistogramCard'
import RiskDriversCard from '@/components/simulacao/RiskDriversCard'
import ScenariosCard from '@/components/simulacao/ScenariosCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import AnnualDisbursementDetailedCard from '@/components/resumo-executivo/AnnualDisbursementDetailedCard'
import { ModoToggle, ViewToggle } from '@/components/resumo-executivo/DesembolsoControls'
import RelatorioPdfLayout from '@/components/relatorio/RelatorioPdfLayout'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'
import { computeDesembolsoMatrix, computeDesembolsoItemMatrix, type ModoDesembolso } from '@/lib/desembolsoAno'
import { computeFatorAncoragem } from '@/lib/ancoragem'
import { AncoragemBadge } from '@/components/resumo-executivo/AncoragemBadge'
import type { DisbursementYear, DisbursementCategory } from '@/types/relatorio'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjeto } from '@/context/useProjeto'
import { supabase } from '@/integrations/supabase/client'
import { categoryParamsFromCategorias } from '@/lib/aroSimulacao'
import { computeMonetaryValues, formatMoedaCompact, scaleSimStringValue, type MetodoAtualizacao } from '@/lib/financeiro'
import { formatDateTime } from '@/lib/utils'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { remediacaoT } from '@/i18n/remediacao'
import { custoTotalRemediacao } from '@/types/remediacao'
import type { CostCategory, CostTotals, RiskMetric } from '@/types/relatorio'
import type { SimResult } from '@/types/simulacao'
import type { RevisaoRow } from '@/types'
import { sequenciaMidpoints, sequenciaByBounds } from '@/types/parametrosGlobais'

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
  const { catalogo, parametrosAnuais, remediacaoByProjeto, fetchRemediacao, clientes } = useProjeto()
  const { config } = usePlataformaConfig()

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
  const [isExporting, setIsExporting] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)
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

  // Fator de ancoragem ano_referencia_projeto → data_base do projeto, via IPCA
  // acumulado composto (`_Dados_Formulas_Planilha.md` §Etapa 3). fator=1 se
  // data_base ausente/anterior ao ano_referencia (não desanuda pra trás) ou se
  // algum ano faltar em `parametros_anuais` — nesse caso `faltantes` lista os
  // anos e a UI mostra aviso.
  const ancoragem = useMemo(() => {
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    if (dataBaseAno == null)
      return {
        fator: 1,
        fatorMin: 1,
        fatorMid: 1,
        fatorMax: 1,
        faltantes: [],
        anoInicio: projeto.anoReferencia,
        anoFim: projeto.anoReferencia,
      }
    return computeFatorAncoragem(projeto.anoReferencia, dataBaseAno, parametrosAnuais)
  }, [projeto.dataBase, projeto.anoReferencia, parametrosAnuais])

  // categoryParams usa fator MID (midpoint IPCA) — mantém baseTotal e os
  // métodos monetários alinhados com o comportamento histórico. As bandas
  // min/max do IPCA entram só na apresentação (CostByCategoryTable) via os
  // fatores fatorMin/fatorMax (ADR-013, D15). Fatoração dupla evita rodar a
  // engine 3× e mantém a Aro Simulação intocada (opção I do alinhamento).
  const categoryParams = useMemo(
    () => categoryParamsFromCategorias(projeto.categorias, catalogo, ancoragem.fatorMid),
    [projeto.categorias, catalogo, ancoragem.fatorMid]
  )

  // Valores CRUS por categoria (fator=1) — servem pra aplicar fatorMin/fatorMax
  // uniformemente na formação das colunas min/max do CostByCategoryTable.
  const categoryParamsRaw = useMemo(
    () => categoryParamsFromCategorias(projeto.categorias, catalogo, 1),
    [projeto.categorias, catalogo]
  )

  // Base pro provisionamento: soma do ponto médio de cada categoria real —
  // mesma convenção de ProjetoContext.estimateTotal / PortalClienteRelatorio.
  const baseTotal = useMemo(() => categoryParams.reduce((acc, c) => acc + c.mode, 0), [categoryParams])
  const contingenciaPct = projeto.contingenciaPct
  const baseWithProvision = baseTotal * (1 + contingenciaPct / 100)

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
    const ipcaBounds = sequenciaByBounds(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)
    const ipcaPorAno = ipcaBounds?.mid ?? null

    const res = computeDesembolsoMatrix({
      categorias: projeto.categorias,
      catalogo,
      horizonYears: projeto.horizonteAnos,
      contingenciaPct: projeto.contingenciaPct,
      ipcaPorAno,
      modo: modoDesembolso === 'ipca' && ipcaPorAno === null ? 'provisao' : modoDesembolso,
      fatorAncoragem: ancoragem.fatorMid,
      // Bandas min/max IPCA (ADR-013, D15) — só quando modo IPCA e ancoragem completa.
      ipcaMinPorAno: ipcaBounds?.min ?? null,
      ipcaMaxPorAno: ipcaBounds?.max ?? null,
      fatorAncoragemMin: ancoragem.fatorMin,
      fatorAncoragemMax: ancoragem.fatorMax,
    })

    if (res.totalGeral === 0) return null

    const years: DisbursementYear[] = res.totaisPorAno.map((total, i) => ({
      label: `Ano ${String(i + 1).padStart(2, '0')}`,
      value: formatMoedaCompact(total, false),
      valueMin: res.totaisPorAnoMin ? formatMoedaCompact(res.totaisPorAnoMin[i], false) : undefined,
      valueMax: res.totaisPorAnoMax ? formatMoedaCompact(res.totaisPorAnoMax[i], false) : undefined,
    }))
    const categories: DisbursementCategory[] = res.categorias.map((name, ci) => ({
      name,
      values: res.matrix[ci].map((v) => (v > 0 ? formatMoedaCompact(v, false) : null)),
      valuesMin: res.matrixMin
        ? res.matrixMin[ci].map((v) => (v > 0 ? formatMoedaCompact(v, false) : null))
        : undefined,
      valuesMax: res.matrixMax
        ? res.matrixMax[ci].map((v) => (v > 0 ? formatMoedaCompact(v, false) : null))
        : undefined,
    }))
    return {
      years,
      categories,
      ipcaDisponivel: ipcaPorAno !== null,
      totalGeral: res.totalGeral,
      // Números crus por ano — alimentam o DisbursementLineCard.
      totaisPorAno: res.totaisPorAno,
    }
  }, [
    projeto.categorias,
    projeto.horizonteAnos,
    projeto.contingenciaPct,
    projeto.dataBase,
    catalogo,
    parametrosAnuais,
    modoDesembolso,
    ancoragem.fatorMid,
    ancoragem.fatorMin,
    ancoragem.fatorMax,
  ])

  // Multiplicador do modo atual pra propagar em todos os cards agregados
  // (Custo por categoria, Métricas de risco, Métodos monetários, KPIs). O
  // `disbursement.totalGeral` já reflete o modo escolhido (base/provisão/IPCA)
  // — é a fonte única do total do projeto na visão atual. `baseTotal` é o
  // denominador consistente (soma dos modes com ancoragem, sem provisão).
  const modoMultiplier = useMemo(() => {
    if (baseTotal === 0 || !disbursement) return 1
    return disbursement.totalGeral / baseTotal
  }, [baseTotal, disbursement])

  // Multiplicador IPCA acumulado — SEMPRE calculado com modo='ipca', pra usar
  // no bloco "Cenários" do card de Métricas de risco independente do modo
  // selecionado no toggle. `null` quando IPCA anual não está configurado
  // (esconde a linha "Com IPCA acumulado" no card).
  const ipcaMultiplier = useMemo(() => {
    if (baseTotal === 0 || projeto.categorias.length === 0) return null
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)
    if (!ipcaPorAno) return null
    const res = computeDesembolsoMatrix({
      categorias: projeto.categorias,
      catalogo,
      horizonYears: projeto.horizonteAnos,
      contingenciaPct: projeto.contingenciaPct,
      ipcaPorAno,
      modo: 'ipca',
      fatorAncoragem: ancoragem.fatorMid,
    })
    if (res.totalGeral === 0) return null
    return res.totalGeral / baseTotal
  }, [
    baseTotal,
    projeto.categorias,
    projeto.horizonteAnos,
    projeto.contingenciaPct,
    projeto.dataBase,
    catalogo,
    parametrosAnuais,
    ancoragem.fatorMid,
  ])

  const costCategories: CostCategory[] = useMemo(
    () =>
      categoryParamsRaw.map((c, i) => ({
        rank: String(i + 1).padStart(2, '0'),
        name: c.name,
        // MIN usa fator_min (cenário otimista IPCA baixo) e MAX usa fator_max
        // (cenário pessimista IPCA alto). `modoMultiplier` aplica em cima a
        // camada de provisão/IPCA do toggle "Modo" — bate com o total
        // mostrado no card de desembolso.
        min: formatMoedaCompact(c.min * ancoragem.fatorMin * modoMultiplier, false),
        max: formatMoedaCompact(c.max * ancoragem.fatorMax * modoMultiplier, false),
      })),
    [categoryParamsRaw, ancoragem.fatorMin, ancoragem.fatorMax, modoMultiplier]
  )

  const costTotals: CostTotals = useMemo(
    () => ({
      min: formatMoedaCompact(
        categoryParamsRaw.reduce((acc, c) => acc + c.min * ancoragem.fatorMin * modoMultiplier, 0),
        false
      ),
      max: formatMoedaCompact(
        categoryParamsRaw.reduce((acc, c) => acc + c.max * ancoragem.fatorMax * modoMultiplier, 0),
        false
      ),
    }),
    [categoryParamsRaw, ancoragem.fatorMin, ancoragem.fatorMax, modoMultiplier]
  )

  const monetaryMethods = useMemo(() => {
    if (baseTotal === 0) return []
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const selicPorAno = sequenciaMidpoints(parametrosAnuais, 'selic', anoBase, projeto.horizonteAnos)
    const inflacaoPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    // PV do método monetário = baseTotal × multiplier atual. No modo `base`,
    // sai sem provisão; em `provisao`, com; em `ipca`, com provisão + IPCA
    // acumulado (mesma total do desembolso).
    const pv = baseTotal * modoMultiplier
    return computeMonetaryValues(pv, {
      selicPorAno,
      inflacaoPorAno,
      horizonYears: projeto.horizonteAnos,
    }).map(({ metodo, valor }) => ({
      label: labelPorMetodo(metodo, t, selicPorAno, inflacaoPorAno, dataBaseAno),
      value: fmt(valor),
    }))
  }, [baseTotal, modoMultiplier, parametrosAnuais, projeto.dataBase, projeto.horizonteAnos, t])

  // Métricas de risco re-escalam pelo modo atual — probabilidade de excedência
  // não escala (é ratio, invariante a modo). Mean/stddev/percentis/IC95 são valores
  // monetários formatados; usamos `scaleSimStringValue` pra multiplicar cada
  // decimal encontrado na string preservando o formato.
  // P10/P90 só existem em simulações rodadas após 2026-09-16 — quando ausentes
  // (simulação antiga persistida), as linhas ficam ocultas.
  const riskMetrics: RiskMetric[] = simResult
    ? [
        { label: tRel.riskMean, value: scaleSimStringValue(simResult.mean, modoMultiplier) },
        { label: tRel.riskStddev, value: scaleSimStringValue(simResult.stddev, modoMultiplier) },
        ...(simResult.p10 ? [{ label: tRel.riskP10, value: scaleSimStringValue(simResult.p10, modoMultiplier) }] : []),
        { label: tRel.riskP80, value: scaleSimStringValue(simResult.p80, modoMultiplier) },
        ...(simResult.p90 ? [{ label: tRel.riskP90, value: scaleSimStringValue(simResult.p90, modoMultiplier) }] : []),
        { label: tRel.riskExceedProb, value: simResult.exceedProb },
      ]
    : []

  // Cenários — sempre derivados do `mean` BASE (cru, sem escalação de modo).
  // Contingência 0% esconde "Com provisão" (redundante com "Sem provisão").
  // IPCA acumulado só quando disponível. Se sobra só 1 linha, o card esconde
  // o bloco inteiro (regra `hasScenarios` no RiskMetricsCard).
  const riskScenarios: RiskScenario[] = useMemo(() => {
    if (!simResult) return []
    const rows: RiskScenario[] = [{ label: tRel.scenarioBase, value: simResult.mean }]
    if (contingenciaPct > 0) {
      rows.push({
        label: tRel.scenarioProvisao(contingenciaPct),
        value: scaleSimStringValue(simResult.mean, 1 + contingenciaPct / 100),
      })
    }
    if (ipcaMultiplier != null) {
      rows.push({ label: tRel.scenarioIpca, value: scaleSimStringValue(simResult.mean, ipcaMultiplier) })
    }
    return rows
  }, [simResult, contingenciaPct, ipcaMultiplier, tRel])

  // Composição — % de cada categoria no custo total (mesma matemática do
  // Portal do Cliente, usa categoryParams com ancoragem fatorMid + escala
  // pelo modoMultiplier pra bater com os outros cards).
  const compositionItems: CostCompositionItem[] = useMemo(() => {
    if (baseTotal === 0) return []
    return categoryParams.map((c) => {
      const scaled = c.mode * modoMultiplier
      return {
        name: c.name,
        value: formatMoedaCompact(scaled, false),
        percent: (c.mode / baseTotal) * 100,
      }
    })
  }, [categoryParams, baseTotal, modoMultiplier])

  const cvLabel = simResult ? `CV = ${(simResult.cv * 100).toFixed(2)}%` : tRel.simPendingSub
  const confLevel = simResult?.confidenceLevel ?? 95
  const ic95Scaled = simResult ? scaleSimStringValue(simResult.ic95, modoMultiplier) : ''
  const [icLo, icHi] = ic95Scaled ? ic95Scaled.replace('M', '').split('–') : ['—', '—']
  const icLoLabel = simResult ? tRel.icLabel(confLevel, icLo) : '—'
  const icHiLabel = simResult ? `R$ ${icHi} M` : '—'

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
      fatorAncoragem: ancoragem.fatorMid,
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

  const clienteNome = clientes.find((c) => c.id === projeto.clienteId)?.nome ?? ''

  // Nome do arquivo — sanitiza slashes/caracteres proibidos no Windows/macOS.
  const pdfFilename = `Relatório - ${projeto.projeto}${projeto.rev ? ` - ${projeto.rev}` : ''}.pdf`.replace(
    /[/\\:*?"<>|]/g,
    '-'
  )

  async function handleExportPdf() {
    if (!pdfRef.current || isExporting) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const margin = 10
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const usableHeight = pageHeight - margin * 2

      // Repete a imagem inteira em cada página, deslocada verticalmente pra
      // mostrar a fatia certa. Padrão consagrado com jsPDF + html2canvas —
      // conteúdo fica renderizado como bitmap único, então precisa desse
      // truque de posição negativa pras páginas subsequentes.
      let heightLeft = imgHeight
      let position = margin
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
      heightLeft -= usableHeight
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
        heightLeft -= usableHeight
      }
      pdf.save(pdfFilename)
    } catch (err) {
      console.error('[ExportPdf] falha ao gerar PDF:', err)
    } finally {
      setIsExporting(false)
    }
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
            <Button variant="ghost" onClick={handleExportPdf} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> {tRel.pdfGenerating}
                </>
              ) : (
                <>
                  <Download size={13} /> {t.exportPdf}
                </>
              )}
            </Button>
            <Button variant="primary" onClick={() => navigate(`/projetos/${projeto.id}/simulacao`)}>
              {t.runSimulation}
            </Button>
          </>
        }
      />

      <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-4">
        <div className="flex flex-col md:grid md:grid-cols-[1.3fr_1fr] gap-4 items-start">
          <CostByCategoryTable
            categories={costCategories}
            totals={costTotals}
            groupByPhase={false}
            ancoragem={ancoragem}
          />
          <RiskMetricsCard
            metrics={riskMetrics}
            cvLabel={cvLabel}
            icLo={icLoLabel}
            icHi={icHiLabel}
            uncertainty={simResult?.uncertainty}
            scenarios={riskScenarios}
          />
        </div>

        {/* Fase 1 do enriquecimento do relatório (item #8 do backlog cliente):
            mesmos cards espelhados no Portal do Cliente e no PDF. Composição +
            Direcionadores lado a lado, Histograma abaixo em largura total. */}
        <div className="flex flex-col md:grid md:grid-cols-[1.3fr_1fr] gap-4 md:items-start">
          <CostCompositionCard items={compositionItems} />
          {simResult && <RiskDriversCard result={simResult} />}
        </div>

        {simResult && <HistogramCard result={simResult} iterations={simResult.iterations} multiplier={modoMultiplier} />}

        {simResult && <ScenariosCard result={simResult} multiplier={modoMultiplier} />}

        {disbursement && disbursement.totaisPorAno.length > 0 && (
          <DisbursementLineCard
            totalsPorAno={disbursement.totaisPorAno}
            yearLabels={disbursement.years.map((y) => y.label)}
          />
        )}

        {disbursement && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-c-text-2">{t.modoLabel}</span>
                <ModoToggle
                  current={modoDesembolso}
                  onChange={setModoDesembolso}
                  disableIpca={!disbursement.ipcaDisponivel}
                  contingenciaPct={projeto.contingenciaPct}
                  labels={{
                    base: t.modoBase,
                    provisaoTemplate: t.modoProvisaoTemplate,
                    ipca: t.modoIpca,
                    disabledTitle: t.modoIpcaDisabledTitle,
                  }}
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
              <AncoragemBadge
                ancoragem={ancoragem}
                labels={{
                  incompleteLabel: t.ancoragemIncompleteLabel,
                  incompleteTitle: t.ancoragemIncompleteTitle,
                  label: t.ancoragemLabel,
                  title: t.ancoragemTitle,
                }}
              />
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
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-c-surface-2 text-c-text-2 font-medium">
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
              baseLabel={formatMoedaCompact(disbursement?.totalGeral ?? baseWithProvision)}
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

      {/* Camada offscreen — html2canvas precisa das dimensões reais do nó,
          então usamos `fixed` (fora do fluxo, não infla o scroll do workspace)
          + left negativo (fora da viewport). Marcado aria-hidden. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: '1040px',
          pointerEvents: 'none',
          zIndex: -1000,
        }}
      >
        <div ref={pdfRef}>
          <RelatorioPdfLayout
            projectName={projeto.projeto}
            revLabel={projeto.rev || null}
            clienteNome={clienteNome}
            simResult={simResult}
            costCategories={costCategories}
            costTotals={costTotals}
            riskMetrics={riskMetrics}
            riskScenarios={riskScenarios}
            compositionItems={compositionItems}
            cvLabel={cvLabel}
            icLoLabel={icLoLabel}
            icHiLabel={icHiLabel}
            confLevel={confLevel}
            contingenciaPct={contingenciaPct}
            baseWithProvisionOrModo={disbursement?.totalGeral ?? baseWithProvision}
            baseTotal={baseTotal}
            modoMultiplier={modoMultiplier}
            ancoragem={ancoragem}
            disbursement={
              disbursement
                ? {
                    years: disbursement.years,
                    categories: disbursement.categories,
                    totaisPorAno: disbursement.totaisPorAno,
                  }
                : null
            }
            monetaryMethods={monetaryMethods}
            horizonteAnos={projeto.horizonteAnos}
            logoUrl={config.logoCompletoUrl}
          />
        </div>
      </div>
    </>
  )
}
