import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, Copy, Check, KeyRound, Sun, Moon, Loader2 } from 'lucide-react'
import { DollarSign, ArrowLeftRight, Plus } from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import LangSelector from '@/components/layout/LangSelector'
import CodigoAcessoModal from '@/components/clientes/CodigoAcessoModal'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import RiskMetricsCard, { type RiskScenario } from '@/components/resumo-executivo/RiskMetricsCard'
import AnnualDisbursementCard from '@/components/resumo-executivo/AnnualDisbursementCard'
import AnnualDisbursementDetailedCard from '@/components/resumo-executivo/AnnualDisbursementDetailedCard'
import RelatorioPdfLayout from '@/components/relatorio/RelatorioPdfLayout'
import { computeDesembolsoMatrix, computeDesembolsoItemMatrix, type ModoDesembolso } from '@/lib/desembolsoAno'
import { ModoToggle, ViewToggle } from '@/components/resumo-executivo/DesembolsoControls'
import { Sprout } from 'lucide-react'
import { remediacaoT } from '@/i18n/remediacao'
import { computeFatorAncoragem } from '@/lib/ancoragem'
import { AncoragemBadge } from '@/components/resumo-executivo/AncoragemBadge'
import type { DisbursementYear, DisbursementCategory } from '@/types/relatorio'
import { supabase } from '@/integrations/supabase/client'
import { mapItemCustoRow } from '@/lib/categoriaMappers'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'
import { categoryParamsFromCategorias } from '@/lib/aroSimulacao'
import { computeMonetaryValues, formatMoedaCompact, scaleSimStringValue, type MetodoAtualizacao } from '@/lib/financeiro'
import { useT } from '@/i18n/useLang'
import { relatorioClienteT } from '@/i18n/relatorio-cliente'
import { resumoT } from '@/i18n/resumo-executivo'
import type { CostCategory, CostTotals, RiskMetric } from '@/types/relatorio'
import type { Category, CategoriaCatalogo } from '@/types/categorias'
import type { SimResult } from '@/types/simulacao'
import type { RelatorioPublicoReturns } from '@/types'
import { sequenciaMidpoints, sequenciaByBounds, mapParametroAnualRow } from '@/types/parametrosGlobais'

type ResumoT = (typeof resumoT)['pt-BR']

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

function sessionKey(id: string) {
  return `aro_portal_${id}`
}

// Sem sessão de admin nem código: nada é buscado. A RPC obter_relatorio_publico
// é o único portão — sem ela validar (código certo OU is_consultor()), o dado
// nunca chega no cliente, nem em memória. Diferente do mock antigo, onde o
// modal de código era só um overlay visual sobre dado já carregado.
export default function PortalClienteRelatorio() {
  const { id: projetoId = '' } = useParams<{ id: string }>()
  const t = useT(relatorioClienteT)
  const tBase = useT(resumoT)
  const { config } = usePlataformaConfig()

  const [status, setStatus] = useState<'loading' | 'need-code' | 'not-found' | 'ready'>('loading')
  const [bundle, setBundle] = useState<RelatorioPublicoReturns | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [remediacaoData, setRemediacaoData] = useState<
    Array<{
      id: string
      nome: string
      area_ha: number | null
      ordem: number
      itens: Array<{
        id: string
        descricao: string
        unidade: string
        quantidade: number | string
        custo_unit_min: number | string
        custo_unit_max: number | string
        fonte: string | null
        ordem: number
      }>
    }>
  >([])

  // Retorno discriminado — desde o fix de rate limiting (2026-09-04), código
  // errado (com tentativas ainda disponíveis) não é mais exceção do Postgres
  // (o UPDATE que incrementa o contador seria desfeito junto com o
  // `raise exception` na mesma transação), é `{ codigoInvalido: true }` num
  // retorno normal — distinguir aqui de "bloqueado" (exceção real, sem
  // contador pra preservar) e "projeto não existe".
  const fetchRelatorio = useCallback(
    async (codigo?: string): Promise<'ok' | 'wrong-code' | 'locked' | 'not-found'> => {
      const { data, error } = await supabase.rpc('obter_relatorio_publico', {
        p_projeto_id: projetoId,
        p_codigo: codigo,
      })
      if (error) {
        if (error.message.includes('não encontrado')) return 'not-found'
        if (error.message.includes('Muitas tentativas')) return 'locked'
        return 'wrong-code'
      }
      if (!data || (data as { codigoInvalido?: boolean }).codigoInvalido) return 'wrong-code'
      setBundle(data as unknown as RelatorioPublicoReturns)
      setStatus('ready')
      return 'ok'
    },
    [projetoId]
  )

  // Portal do Cliente ignora perfis.tema/localStorage — cliente anon não tem
  // perfil, e o localStorage pode ter a preferência do consultor que logou no
  // mesmo browser. Toggle abaixo é local e efêmero (useState puro, nunca lê
  // nem grava aro-tema/perfis.tema): default light, some ao sair da página.
  // Restaura o tema real do browser (consultor logado ou não) ao desmontar.
  const [temaPortal, setTemaPortal] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const eraDark = document.documentElement.classList.contains('dark')
    return () => {
      document.documentElement.classList.toggle('dark', eraDark)
    }
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', temaPortal === 'dark')
  }, [temaPortal])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session))
    const stored = sessionStorage.getItem(sessionKey(projetoId))
    fetchRelatorio(stored ?? undefined).then((result) => {
      if (result === 'ok') return
      if (stored) sessionStorage.removeItem(sessionKey(projetoId))
      setStatus(result === 'not-found' ? 'not-found' : 'need-code')
      if (result === 'locked') setCodeLockedMsg(t.modalCodeLocked)
    })
  }, [projetoId, fetchRelatorio, t.modalCodeLocked])

  // Bundle de remediação — RPC própria, respeita o flag incluir_remediacao
  // da revisão vigente. Se a revisão não marcou opt-in, devolve array vazio.
  // Exige o MESMO código de acesso do relatório principal (achado de
  // segurança 2026-09-04: RPC antes não validava nada, bastava conhecer a
  // URL) — reaproveita o código já validado em sessionStorage, sem pedir
  // de novo ao visitante.
  useEffect(() => {
    if (status !== 'ready') return
    const codigo = sessionStorage.getItem(sessionKey(projetoId)) ?? undefined
    supabase
      .rpc('obter_relatorio_publico_remediacao', { p_projeto_id: projetoId, p_codigo: codigo })
      .then(({ data, error }) => {
        if (error || !data) return
        setRemediacaoData(data as never)
      })
  }, [projetoId, status])

  const projeto = bundle?.projeto
  const cliente = bundle?.cliente

  const categorias: Category[] = useMemo(
    () =>
      (bundle?.categorias ?? []).map(({ categoria, itens }) => ({
        id: categoria.id,
        catalogoId: categoria.catalogo_id,
        preenche: categoria.preenche as Category['preenche'],
        expanded: false,
        justAdded: false,
        items: itens.map(mapItemCustoRow),
        camposOperacionais: [],
        custoProvavel: categoria.custo_provavel,
      })),
    [bundle]
  )

  const catalogo: CategoriaCatalogo[] = useMemo(() => {
    const seen = new Map<string, string>()
    for (const { catalogo: cat } of bundle?.categorias ?? []) seen.set(cat.id, cat.nome)
    return [...seen.entries()].map(([id, nome]) => ({ id, nome }))
  }, [bundle])

  const simResult = (bundle?.simulacao?.id ? bundle.simulacao.resultado : null) as unknown as SimResult | null
  const activeCatSet = useMemo(() => new Set(bundle?.simulacao?.active_categories ?? []), [bundle])

  const parametrosAnuais = useMemo(() => (bundle?.parametrosAnuais ?? []).map(mapParametroAnualRow), [bundle])

  // Fator de ancoragem ano_referencia_projeto → data_base do projeto — mesmo
  // pattern do ResumoExecutivo, ver src/lib/ancoragem.ts. Quando o consultor
  // digitou os valores no próprio ano da data-base, fator = 1 e a badge some.
  const anoReferencia = projeto?.ano_referencia ?? new Date().getFullYear()
  const ancoragem = useMemo(() => {
    const dataBaseAno =
      projeto?.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    if (dataBaseAno == null)
      return {
        fator: 1,
        fatorMin: 1,
        fatorMid: 1,
        fatorMax: 1,
        faltantes: [],
        anoInicio: anoReferencia,
        anoFim: anoReferencia,
      }
    return computeFatorAncoragem(anoReferencia, dataBaseAno, parametrosAnuais)
  }, [projeto?.data_base, anoReferencia, parametrosAnuais])

  // categoryParams usa fator MID — mantém baseTotal e métodos monetários
  // alinhados ao histórico. As bandas min/max do IPCA entram só na
  // apresentação (CostByCategoryTable) via ancoragem.fatorMin/fatorMax
  // (ADR-013, D15). Ver comentário equivalente em ResumoExecutivo.
  const categoryParams = useMemo(
    () => categoryParamsFromCategorias(categorias, catalogo, ancoragem.fatorMid),
    [categorias, catalogo, ancoragem.fatorMid]
  )

  const categoryParamsRaw = useMemo(
    () => categoryParamsFromCategorias(categorias, catalogo, 1),
    [categorias, catalogo]
  )

  const filteredParams = useMemo(
    () => (activeCatSet.size === 0 ? categoryParams : categoryParams.filter((c) => activeCatSet.has(c.name))),
    [categoryParams, activeCatSet]
  )

  const filteredParamsRaw = useMemo(
    () => (activeCatSet.size === 0 ? categoryParamsRaw : categoryParamsRaw.filter((c) => activeCatSet.has(c.name))),
    [categoryParamsRaw, activeCatSet]
  )

  // Base pro provisionamento: soma do ponto médio (min+max)/2 de cada categoria real —
  // mesma convenção usada em ProjetoContext.estimateTotal. "Valor atualizado" por
  // categoria (juros/inflação aplicados individualmente) é gap de modelagem, não existe
  // ainda — ver spec 2026-08-21-simulacao-isolamento-relatorio-design.
  const baseTotal = useMemo(() => filteredParams.reduce((acc, c) => acc + c.mode, 0), [filteredParams])
  const contingenciaPct = projeto?.contingencia_pct ?? 0
  const baseWithProvision = baseTotal * (1 + contingenciaPct / 100)

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
    const ipcaBounds = sequenciaByBounds(parametrosAnuais, 'inflacao_ipca', anoBase, horizonYears)
    const ipcaPorAno = ipcaBounds?.mid ?? null

    const res = computeDesembolsoMatrix({
      categorias,
      catalogo,
      horizonYears,
      contingenciaPct: projeto.contingencia_pct ?? 0,
      ipcaPorAno,
      modo: modoDesembolso === 'ipca' && ipcaPorAno === null ? 'provisao' : modoDesembolso,
      fatorAncoragem: ancoragem.fatorMid,
      // Bandas min/max IPCA (ADR-013, D15).
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
    const cats: DisbursementCategory[] = res.categorias.map((name, ci) => ({
      name,
      values: res.matrix[ci].map((v) => (v > 0 ? formatMoedaCompact(v, false) : null)),
      valuesMin: res.matrixMin
        ? res.matrixMin[ci].map((v) => (v > 0 ? formatMoedaCompact(v, false) : null))
        : undefined,
      valuesMax: res.matrixMax
        ? res.matrixMax[ci].map((v) => (v > 0 ? formatMoedaCompact(v, false) : null))
        : undefined,
    }))
    return { years, categories: cats, ipcaDisponivel: ipcaPorAno !== null, totalGeral: res.totalGeral }
  }, [projeto, categorias, catalogo, parametrosAnuais, modoDesembolso, ancoragem.fatorMid, ancoragem.fatorMin, ancoragem.fatorMax])

  // Multiplicador do modo atual pra propagar em todos os cards agregados
  // (Custo por categoria, Métricas de risco, KPIs, Métodos monetários). O
  // `disbursement.totalGeral` já reflete o modo escolhido — usar como fonte
  // única do total do projeto na visão atual. Ver comentário equivalente em
  // ResumoExecutivo.tsx.
  const modoMultiplier = useMemo(() => {
    if (baseTotal === 0 || !disbursement) return 1
    return disbursement.totalGeral / baseTotal
  }, [baseTotal, disbursement])

  // Multiplicador IPCA acumulado — SEMPRE com modo='ipca', pra usar no bloco
  // "Cenários" do card de Métricas de risco independente do modo do toggle.
  // `null` esconde a linha "Com IPCA acumulado" (IPCA anual não configurado).
  const ipcaMultiplier = useMemo(() => {
    if (!projeto || baseTotal === 0 || categorias.length === 0) return null
    const horizonYears = projeto.horizonte_anos ?? 10
    const dataBaseAno = projeto.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, horizonYears)
    if (!ipcaPorAno) return null
    const res = computeDesembolsoMatrix({
      categorias,
      catalogo,
      horizonYears,
      contingenciaPct: projeto.contingencia_pct ?? 0,
      ipcaPorAno,
      modo: 'ipca',
      fatorAncoragem: ancoragem.fatorMid,
    })
    if (res.totalGeral === 0) return null
    return res.totalGeral / baseTotal
  }, [projeto, baseTotal, categorias, catalogo, parametrosAnuais, ancoragem.fatorMid])

  const costCategories: CostCategory[] = useMemo(
    () =>
      filteredParamsRaw.map((c, i) => ({
        rank: String(i + 1).padStart(2, '0'),
        name: c.name,
        min: formatMoedaCompact(c.min * ancoragem.fatorMin * modoMultiplier, false),
        max: formatMoedaCompact(c.max * ancoragem.fatorMax * modoMultiplier, false),
      })),
    [filteredParamsRaw, ancoragem.fatorMin, ancoragem.fatorMax, modoMultiplier]
  )

  const costTotals: CostTotals = useMemo(
    () => ({
      min: formatMoedaCompact(
        filteredParamsRaw.reduce((acc, c) => acc + c.min * ancoragem.fatorMin * modoMultiplier, 0),
        false
      ),
      max: formatMoedaCompact(
        filteredParamsRaw.reduce((acc, c) => acc + c.max * ancoragem.fatorMax * modoMultiplier, 0),
        false
      ),
    }),
    [filteredParamsRaw, ancoragem.fatorMin, ancoragem.fatorMax, modoMultiplier]
  )

  const monetaryMethods = useMemo(() => {
    if (baseTotal === 0) return []
    const horizonYears = projeto?.horizonte_anos ?? 10
    const dataBaseAno =
      projeto?.data_base && !Number.isNaN(Number(projeto.data_base)) ? Number(projeto.data_base) : null
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const selicPorAno = sequenciaMidpoints(parametrosAnuais, 'selic', anoBase, horizonYears)
    const inflacaoPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, horizonYears)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    // PV do método = baseTotal × multiplier atual (base/provisão/IPCA). Ver
    // comentário equivalente em ResumoExecutivo.tsx.
    const pv = baseTotal * modoMultiplier
    return computeMonetaryValues(pv, { selicPorAno, inflacaoPorAno, horizonYears }).map(
      ({ metodo, valor }) => ({
        label: labelPorMetodo(metodo, tBase, selicPorAno, inflacaoPorAno, dataBaseAno),
        value: fmt(valor),
      })
    )
  }, [baseTotal, modoMultiplier, parametrosAnuais, projeto?.data_base, projeto?.horizonte_anos, tBase])

  // P10/P90 opcionais — simulações persistidas antes de 2026-09-16 não têm
  // esses campos, e o card esconde as linhas correspondentes quando ausentes.
  const riskMetrics: RiskMetric[] = simResult
    ? [
        { label: t.riskMean, value: scaleSimStringValue(simResult.mean, modoMultiplier) },
        { label: t.riskStddev, value: scaleSimStringValue(simResult.stddev, modoMultiplier) },
        ...(simResult.p10 ? [{ label: t.riskP10, value: scaleSimStringValue(simResult.p10, modoMultiplier) }] : []),
        { label: t.riskP80, value: scaleSimStringValue(simResult.p80, modoMultiplier) },
        ...(simResult.p90 ? [{ label: t.riskP90, value: scaleSimStringValue(simResult.p90, modoMultiplier) }] : []),
        { label: t.riskExceedProb, value: simResult.exceedProb },
      ]
    : []

  // Cenários — sempre derivados do `mean` BASE (independente do toggle Modo,
  // que reescala as métricas acima). Contingência 0% esconde "Com provisão";
  // IPCA acumulado só quando disponível. Card esconde o bloco se sobra <2 linhas.
  const riskScenarios: RiskScenario[] = useMemo(() => {
    if (!simResult) return []
    const rows: RiskScenario[] = [{ label: t.scenarioBase, value: simResult.mean }]
    if (contingenciaPct > 0) {
      rows.push({
        label: t.scenarioProvisao(contingenciaPct),
        value: scaleSimStringValue(simResult.mean, 1 + contingenciaPct / 100),
      })
    }
    if (ipcaMultiplier != null) {
      rows.push({ label: t.scenarioIpca, value: scaleSimStringValue(simResult.mean, ipcaMultiplier) })
    }
    return rows
  }, [simResult, contingenciaPct, ipcaMultiplier, t])

  const cvPercent = simResult ? (simResult.cv * 100).toFixed(2) : null
  const cvLabel = simResult ? `CV = ${cvPercent}%` : t.simPendingSub
  const confLevel = simResult?.confidenceLevel ?? 95
  const ic95Scaled = simResult ? scaleSimStringValue(simResult.ic95, modoMultiplier) : ''
  const [icLo, icHi] = ic95Scaled ? ic95Scaled.replace('M', '').split('–') : ['—', '—']
  const icLoLabel = simResult ? t.icLabel(confLevel, icLo) : '—'
  const icHiLabel = simResult ? `R$ ${icHi} M` : '—'

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
      fatorAncoragem: ancoragem.fatorMid,
    })
    if (res.totalGeral === 0) return null
    const yearsLabels = Array.from({ length: horizonYears }, (_, i) => ({
      label: `Ano ${String(i + 1).padStart(2, '0')}`,
    }))
    return { ...res, years: yearsLabels }
  }, [viewDesembolso, modoDesembolso, projeto, categorias, catalogo, parametrosAnuais, ancoragem.fatorMid])

  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [codeLockedMsg, setCodeLockedMsg] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

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
    setCodeLockedMsg(null)
    const result = await fetchRelatorio(codeInput)
    if (result === 'ok') {
      sessionStorage.setItem(sessionKey(projetoId), codeInput)
      setCodeError(false)
      return
    }
    if (result === 'locked') {
      setCodeLockedMsg(t.modalCodeLocked)
      return
    }
    setCodeError(true)
  }

  const pdfFilename = `Relatório - ${projeto?.nome ?? 'projeto'}${projeto?.rev ? ` - ${projeto.rev}` : ''}.pdf`.replace(
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

  if (status === 'not-found') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-[420px] text-center flex flex-col items-center gap-3">
          <img src={config.logoIconeUrl} alt="Be Planned" className="h-12 w-auto object-contain" />
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
        <div className="w-full max-w-[400px] bg-c-card rounded-[20px] shadow-[0_24px_64px_-12px_rgba(20,21,26,.28)] p-7">
          <div className="flex items-center mb-5">
            <img src={config.logoCompletoUrl} alt="Be Planned" className="h-9 w-auto object-contain" />
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
                onChange={(e) => {
                  setCodeInput(e.target.value)
                  setCodeError(false)
                }}
                placeholder={t.modalCodePlaceholder}
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
                className={[
                  'w-full bg-c-surface-2 rounded-[11px] px-[13px] py-[10px] text-[0.875rem] text-c-text font-mono tracking-wider outline-none border transition-colors duration-150',
                  codeError ? 'border-[#f44] focus:border-[#f44]' : 'border-transparent focus:border-accent',
                ].join(' ')}
              />
              {codeError && <p className="text-[12px] text-[#e33] mt-1.5">{t.modalCodeError}</p>}
              {codeLockedMsg && <p className="text-[12px] text-[#e33] mt-1.5">{codeLockedMsg}</p>}
            </div>
            <button
              type="submit"
              disabled={!!codeLockedMsg}
              className="w-full py-2.5 rounded-[11px] bg-accent text-white font-semibold text-[0.875rem] cursor-pointer border-0 hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
      {/* ── Header sticky ──
          `sticky` em vez de `fixed` — ocupa espaço no fluxo, então a altura
          se ajusta automaticamente quando o wrap dos botões cria 2 ou 3 linhas,
          sem precisar de `pt-` calculado no conteúdo. Wrap explícito: em telas
          estreitas a área de ações (`w-full sm:w-auto`) quebra pra uma segunda
          linha alinhada à direita, evitando overflow horizontal quando os 4-5
          botões + langselector + toggle não cabem na mesma linha do logo. */}
      <header className="sticky top-0 z-50 bg-c-card border-b border-c-line flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 sm:px-8 py-3 sm:py-[22px]">
        <img src={config.logoCompletoUrl} alt="Be Planned" className="h-10 w-auto object-contain" />
        <div className="flex flex-wrap items-center justify-end gap-2 print:hidden w-full sm:w-auto">
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-c-surface-2-hover text-c-text-2 text-[12px] font-medium">
            {cliente.nome} — {t.portalPill}
          </span>
          {isAdmin && (
            <button
              onClick={() => setCodeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-c-card border border-c-line shadow-[var(--shadow-1)] text-[13px] font-semibold text-c-text hover:bg-c-surface-2-hover transition-colors duration-150 cursor-pointer"
            >
              <KeyRound size={13} strokeWidth={2} />
              {t.accessCodeBtn}
            </button>
          )}
          <button
            onClick={handleGerarLink}
            className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-c-card border border-c-line shadow-[var(--shadow-1)] text-[13px] font-semibold text-c-text hover:bg-c-surface-2-hover transition-colors duration-150 cursor-pointer"
          >
            {linkCopied ? (
              <>
                <Check size={13} strokeWidth={2} /> {t.linkCopiedBtn}
              </>
            ) : (
              <>
                <Copy size={13} strokeWidth={2} /> {t.copyLinkBtn}
              </>
            )}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-c-card border border-c-line shadow-[var(--shadow-1)] text-[13px] font-semibold text-c-text hover:bg-c-surface-2-hover transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                {t.pdfGenerating}
              </>
            ) : (
              <>
                <Download size={13} strokeWidth={2} />
                {t.downloadPdfBtn}
              </>
            )}
          </button>
          <LangSelector ariaLabel={t.selectLang} />
          <button
            type="button"
            onClick={() => setTemaPortal((v) => (v === 'dark' ? 'light' : 'dark'))}
            aria-label={temaPortal === 'dark' ? t.themeSwitchToLight : t.themeSwitchToDark}
            title={temaPortal === 'dark' ? t.themeSwitchToLight : t.themeSwitchToDark}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-c-card border border-c-line shadow-[var(--shadow-1)] text-c-text hover:bg-c-surface-2-hover transition-colors duration-150 cursor-pointer"
          >
            {temaPortal === 'dark' ? (
              <Sun size={14} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Moon size={14} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* ── Relatório ──
          Sem `pt-` no wrapper (header agora é sticky e reserva seu próprio
          espaço no fluxo). `px-2` em mobile maximiza o espaço horizontal dos
          cards (padding original `px-4` desperdiçava largura em telas pequenas). */}
      <div>
        <div className="max-w-[1040px] mx-auto px-2 sm:px-6 py-4 sm:py-8 flex flex-col gap-5">
          {/* Cabeçalho do relatório */}
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-[22px] font-bold text-c-text">
                {t.reportTitle} — {projeto.nome}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-c-surface-2-hover text-c-text-2 text-[11px] font-semibold">
                {projeto.rev} · {t.reportRevisionCurrent}
              </span>
            </div>
            <p className="text-[13px] text-c-text-2">
              {t.reportSubtitleBase(cliente.nome)}
              {simResult && t.reportSubtitleSim(simResult.iterations, simResult.distribution)}
            </p>
          </div>

          {/* KPI cards — todos os valores respeitam o modo do toggle
              (base/provisão/IPCA) via `modoMultiplier`. "Provisão base" usa
              o total do desembolso quando disponível (fonte única do total
              projeto na visão atual) — cai pra baseWithProvision se ainda
              não há desembolso computado. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <DollarSign size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiAvgCost,
                value: simResult ? scaleSimStringValue(simResult.mean, modoMultiplier) : '—',
                sub: simResult ? t.kpiAvgCostSubSim(simResult.status) : t.simPendingSub,
              },
              {
                icon: <ArrowLeftRight size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiMinMaxRange,
                value: simResult ? scaleSimStringValue(simResult.p10p90, modoMultiplier) : '—',
                sub: simResult ? t.kpiMinMaxSubIC(confLevel, ic95Scaled) : t.simPendingSub,
              },
              {
                icon: <Plus size={14} strokeWidth={2} className="text-accent-700" />,
                label: t.kpiBaseProvision,
                value: baseTotal > 0 ? formatMoedaCompact(disbursement?.totalGeral ?? baseWithProvision) : '—',
                sub: t.kpiBaseSub(contingenciaPct),
              },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-c-card rounded-[20px] p-6 flex flex-col gap-3">
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

          {/* Custo por categoria + Métricas de risco.
              `items-start` só no breakpoint md+ — em mobile queremos os cards
              esticando (align-items: stretch, o default) pra ocuparem toda a
              largura da coluna. */}
          <div className="flex flex-col md:grid md:grid-cols-[1.3fr_1fr] gap-4 md:items-start">
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

          {disbursement && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-c-text-2">{tBase.modoLabel}</span>
                  <ModoToggle
                    current={modoDesembolso}
                    onChange={setModoDesembolso}
                    disableIpca={!disbursement.ipcaDisponivel}
                    contingenciaPct={contingenciaPct}
                    labels={{
                      base: tBase.modoBase,
                      provisaoTemplate: tBase.modoProvisaoTemplate,
                      ipca: tBase.modoIpca,
                      disabledTitle: tBase.modoIpcaDisabledTitle,
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-c-text-2">
                    {tBase.viewLabel}
                  </span>
                  <ViewToggle
                    current={viewDesembolso}
                    onChange={setViewDesembolso}
                    labels={{ agregado: tBase.viewAggregated, detalhado: tBase.viewDetailed }}
                  />
                </div>
                <AncoragemBadge
                  ancoragem={ancoragem}
                  labels={{
                    incompleteLabel: tBase.ancoragemIncompleteLabel,
                    incompleteTitle: tBase.ancoragemIncompleteTitle,
                    label: tBase.ancoragemLabel,
                    title: tBase.ancoragemTitle,
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

          {monetaryMethods.length > 0 && (
            <MonetaryMethodsCard
              methods={monetaryMethods}
              baseLabel={formatMoedaCompact(disbursement?.totalGeral ?? baseWithProvision)}
              horizonYears={projeto?.horizonte_anos ?? 10}
            />
          )}

          {/* Seção Remediação — só aparece se a revisão vigente marcou opt-in.
              Escopo alternativo, totais não somam ao provisionamento principal. */}
          {remediacaoData.length > 0 && <RemediacaoSection categorias={remediacaoData} />}
        </div>
      </div>

      {/* Modal código de acesso (admin) */}
      {codeModalOpen && (
        <CodigoAcessoModal
          reportId={projetoId}
          clienteId={cliente.id}
          clientName={cliente.nome}
          projectName={projeto.nome}
          onClose={() => setCodeModalOpen(false)}
        />
      )}

      <div className="flex justify-center pb-8">
        <Link to="/privacidade" className="text-[12px] text-c-text-2 hover:text-accent transition-colors">
          Política de Privacidade
        </Link>
      </div>

      {/* Camada offscreen — html2canvas precisa das dimensões reais do nó,
          então usamos `fixed` (fora do fluxo, não infla o scroll do relatório)
          + left negativo (fora da viewport). Marcado aria-hidden.
          Consome as MESMAS props/derivações já calculadas acima — mesmo padrão
          do ResumoExecutivo.tsx (commit 5ba5a3c). */}
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
            projectName={projeto.nome}
            revLabel={projeto.rev || null}
            clienteNome={cliente.nome}
            simResult={simResult}
            costCategories={costCategories}
            costTotals={costTotals}
            riskMetrics={riskMetrics}
            riskScenarios={riskScenarios}
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
              disbursement ? { years: disbursement.years, categories: disbursement.categories } : null
            }
            monetaryMethods={monetaryMethods}
            horizonteAnos={projeto.horizonte_anos ?? 10}
            logoUrl={config.logoCompletoUrl}
          />
        </div>
      </div>
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
    id: string
    nome: string
    area_ha: number | null
    ordem: number
    itens: Array<{
      id: string
      descricao: string
      unidade: string
      quantidade: number | string
      custo_unit_min: number | string
      custo_unit_max: number | string
      fonte: string | null
      ordem: number
    }>
  }>
}

function RemediacaoSection({ categorias }: RemediacaoSectionProps) {
  const t = useT(remediacaoT)
  const toNum = (v: number | string | null): number => (v == null ? 0 : typeof v === 'number' ? v : Number(v))
  const custoTotalItem = (item: RemediacaoSectionProps['categorias'][number]['itens'][number]): number => {
    const qtd = toNum(item.quantidade)
    const med = (toNum(item.custo_unit_min) + toNum(item.custo_unit_max)) / 2
    return qtd * med
  }
  const totalCategoria = (c: RemediacaoSectionProps['categorias'][number]): number =>
    c.itens.reduce((acc, i) => acc + custoTotalItem(i), 0)
  const totalGeral = categorias.reduce((acc, c) => acc + totalCategoria(c), 0)

  return (
    <section className="flex flex-col gap-3 pt-2 mt-2 border-t border-c-line">
      <div className="flex items-center gap-2">
        <Sprout size={14} color="var(--accent)" aria-hidden="true" />
        <h2 className="text-[15px] font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-c-surface-2 text-c-text-2 font-medium">
          {t.moduleTag}
        </span>
      </div>
      <p className="text-[12.5px] text-c-text-2 leading-snug max-w-[720px]">{t.headerSubtitle}</p>

      {categorias.map((cat) => (
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
            <span className="font-mono text-[13px] font-bold text-c-text">
              {formatMoedaCompact(totalCategoria(cat))}
            </span>
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
                {cat.itens.map((item) => (
                  <tr key={item.id} className="border-t border-[rgba(20,21,26,.04)]">
                    <td className="py-1.5 pr-3 text-c-text">{item.descricao}</td>
                    <td className="py-1.5 pr-3 text-center text-c-text-2 font-mono text-[11px]">{item.unidade}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-c-text-2">
                      {toNum(item.quantidade).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
                    </td>
                    <td className="py-1.5 pr-3 text-right font-mono text-c-text-2">
                      {formatMoedaCompact(toNum(item.custo_unit_min), false)}
                    </td>
                    <td className="py-1.5 pr-3 text-right font-mono text-c-text-2">
                      {formatMoedaCompact(toNum(item.custo_unit_max), false)}
                    </td>
                    <td className="py-1.5 pr-3 text-right font-mono font-bold text-c-text">
                      {formatMoedaCompact(custoTotalItem(item), false)}
                    </td>
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
