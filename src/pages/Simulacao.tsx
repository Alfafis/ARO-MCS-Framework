import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useSimulation } from '@/context/useSimulation'
import { FileText } from 'lucide-react'
import { useProjeto } from '@/context/useProjeto'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { simulacaoT } from '@/i18n/simulacao'
import type { Projeto } from '@/types/clientes'
import ParamsCard from '@/components/simulacao/ParamsCard'
import ResultCard from '@/components/simulacao/ResultCard'
import HistogramCard from '@/components/simulacao/HistogramCard'
import UncertaintyCard from '@/components/simulacao/UncertaintyCard'
import HistoryModal from '@/components/simulacao/HistoryModal'
import SensibilidadeAno10Card from '@/components/simulacao/SensibilidadeAno10Card'
import { runAroSimulacao, categoryParamsFromCategorias, parseIterationsNumber, type CategoryParam } from '@/lib/aroSimulacao'
import { computeDesembolsoMatrix } from '@/lib/desembolsoAno'
import { computeFatorAncoragem, ANO_BASE_TEMPLATE } from '@/lib/ancoragem'
import { sequenciaMidpoints } from '@/types/parametrosGlobais'
import type { Distribution, HistoryRun, SimResult, UncertaintyLevel } from '@/types/simulacao'

function computeResult(dist: Distribution, n: number, categoryParams: CategoryParam[], activeCategories: Set<string>, confidence: number): Omit<SimResult, 'status' | 'iterations' | 'distribution'> {
  const sim  = runAroSimulacao(dist, n, categoryParams, activeCategories, confidence)
  const toM = (v: number) => v / 1_000_000
  const fmt = (v: number) => `R$ ${toM(v).toFixed(1).replace('.', ',')}M`
  const rng = (v: number) => toM(v).toFixed(1).replace('.', ',')
  const rangeNum    = sim.cv * 100
  const uncertainty: UncertaintyLevel = rangeNum < 3 ? 'baixo' : rangeNum < 5 ? 'moderado' : 'alto'
  return {
    mean:           fmt(sim.mean),
    stddev:         `R$ ${toM(sim.stddev).toFixed(1).replace('.', ',')}M`,
    p10p90:         `${rng(sim.p10)}–${rng(sim.p90)}M`,
    ic95:           `${rng(sim.icLo)}–${rng(sim.icHi)}M`,
    min:            fmt(sim.minVal),
    max:            fmt(sim.maxVal),
    uncertainty,
    range:           `±${rangeNum.toFixed(1)}%`,
    bars:            sim.bars,
    cv:              sim.cv,
    confidenceLevel: confidence,
    p80:             fmt(sim.p80),
    exceedProb:      `${(sim.exceedProb * 100).toFixed(2).replace('.', ',')}%`,
  }
}


export default function Simulacao() {
  const t = useT(simulacaoT)
  const navigate = useNavigate()
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const { getSimState, loadSimState, setSimulation, previewResult } = useSimulation()
  const { catalogo, parametrosAnuais } = useProjeto()
  // Ancoragem base_template → data_base do projeto para a Aro Simulação. Sem isso os
  // resultados (média, P80, IC 95%) saem em base 2022, subestimando ~N anos
  // de IPCA. Ver src/lib/ancoragem.ts.
  const ancoragem = useMemo(() => {
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    if (dataBaseAno == null) return { fator: 1, faltantes: [], anoInicio: ANO_BASE_TEMPLATE, anoFim: ANO_BASE_TEMPLATE }
    return computeFatorAncoragem(ANO_BASE_TEMPLATE, dataBaseAno, parametrosAnuais)
  }, [projeto.dataBase, parametrosAnuais])
  const categoryParams = useMemo(() => categoryParamsFromCategorias(projeto.categorias, catalogo, ancoragem.fator), [projeto.categorias, catalogo, ancoragem.fator])
  const categoryNames  = useMemo(() => categoryParams.map(c => c.name), [categoryParams])

  // Base do Ano 10 pra sensibilidade final da Aro Simulação (aba `Simulation` da planilha
  // NX Gold — `_Dados_Formulas_Planilha.md` §Etapa 6). Usa modo `ipca` como
  // fidelidade à planilha; se IPCA anual não estiver configurado, cai pra
  // `provisao` como no `AnnualDisbursementCard`. Sensibilidade não faz
  // sentido em modo `base` (a taxa de escalação já é IPCA + custo real).
  const sensBase = useMemo(() => {
    if (projeto.categorias.length === 0) return null
    const dataBaseAno = Number.isNaN(Number(projeto.dataBase)) ? null : Number(projeto.dataBase)
    const anoBase = dataBaseAno ?? new Date().getFullYear()
    const ipcaPorAno = sequenciaMidpoints(parametrosAnuais, 'inflacao_ipca', anoBase, projeto.horizonteAnos)
    const modo = ipcaPorAno !== null ? 'ipca' : 'provisao'
    const res = computeDesembolsoMatrix({
      categorias:      projeto.categorias,
      catalogo,
      horizonYears:    projeto.horizonteAnos,
      contingenciaPct: projeto.contingenciaPct,
      ipcaPorAno,
      modo,
      fatorAncoragem:  ancoragem.fator,
    })
    if (res.totalGeral === 0) return null
    return {
      baseAno10:         res.totaisPorAno[projeto.horizonteAnos - 1] ?? 0,
      modoIpcaDisponivel: ipcaPorAno !== null,
    }
  }, [projeto.categorias, projeto.horizonteAnos, projeto.contingenciaPct, projeto.dataBase, catalogo, parametrosAnuais, ancoragem.fator])

  useEffect(() => { loadSimState(projeto.id) }, [projeto.id, loadSimState])

  const simState = getSimState(projeto.id)
  const result   = simState.result
  const history  = simState.history
  const hasRun   = result !== null

  const [dist,             setDist]             = useState<Distribution>('Triangular')
  const [iterations,       setIterations]       = useState('10.000')
  const [confidence,       setConfidence]       = useState('95')
  const [running,          setRunning]          = useState(false)
  const [historyOpen,      setHistoryOpen]      = useState(false)
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(categoryNames))

  const runSimulation = useCallback(() => {
    if (categoryParams.length === 0) return
    setRunning(true)
    setTimeout(async () => {
      const n    = parseIterationsNumber(iterations)
      const conf = parseInt(confidence, 10) || 95
      const next: SimResult = {
        ...computeResult(dist, n, categoryParams, activeCategories, conf),
        status:       t.justFinished,
        iterations,
        distribution: dist,
      }
      try {
        await setSimulation(projeto.id, next, [...activeCategories])
      } finally {
        setRunning(false)
      }
    }, 1300)
  }, [dist, iterations, confidence, activeCategories, categoryParams, t, projeto.id, setSimulation])

  const loadHistoryRun = useCallback((run: HistoryRun) => {
    previewResult(projeto.id, { mean: run.mean, status: `${t.runFrom} ${run.date}` })
    setHistoryOpen(false)
  }, [t, projeto.id, previewResult])

  return (
    <div className="flex flex-col h-full">

      <header className="flex items-start justify-between px-4 sm:px-8 py-4 sm:py-[22px] gap-4 shrink-0">
        <h1 className="text-2xl font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" onClick={() => setHistoryOpen(true)}>
            {t.seeHistory}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4 items-start">
          <ParamsCard
            key={projeto.id}
            dist={dist}
            iterations={iterations}
            confidence={confidence}
            running={running}
            disabled={categoryParams.length === 0}
            categoryNames={categoryNames}
            onDistChange={setDist}
            onIterationsChange={setIterations}
            onConfidenceChange={setConfidence}
            onRun={runSimulation}
            onCategoriesChange={setActiveCategories}
          />
          <div className="flex flex-col gap-4">
            {categoryParams.length === 0 && (
              <div className="card text-[0.8125rem] text-c-text-2">
                Este projeto ainda não tem categorias de custo cadastradas — sem itens com custo min/max, não há o que simular. Cadastre em "Categorias de custo".
              </div>
            )}
            <ResultCard result={result} />
            <HistogramCard result={result} iterations={iterations} />
            <UncertaintyCard result={result} dist={dist} activeCategories={activeCategories} categoryParams={categoryParams} />
            {hasRun && (
              <div className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-accent-100 flex items-center justify-center shrink-0">
                    <FileText size={15} color="var(--accent)" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-c-text leading-tight">Simulação aplicada ao relatório</p>
                    <p className="text-[12px] text-c-text-2 mt-0.5">Visualize o resultado do ponto de vista do cliente.</p>
                  </div>
                </div>
                <Button variant="primary" onClick={() => navigate(`/relatorio/${projeto.id}`)}>
                  Ver relatório
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sensibilidade sobre taxa — Aro Simulação independente da principal. Fica em
            seção própria (fora da coluna de "resultado da última rodada")
            porque roda direto do valor determinístico do Ano 10, sem
            depender do botão "Rodar simulação". */}
        {sensBase && sensBase.baseAno10 > 0 && (
          <section className="flex flex-col gap-3 pt-2 mt-2 border-t border-[rgba(20,21,26,.08)]">
            <div className="flex flex-col gap-1">
              <h2 className="text-[15px] font-bold text-c-text tracking-tight leading-tight">
                Sensibilidade sobre a taxa de escalação
              </h2>
              <p className="text-[12.5px] text-c-text-2 leading-snug max-w-[720px]">
                Aro Simulação <strong>independente</strong> sobre o valor do Ano 10 — roda automaticamente com base nas categorias cadastradas, sem depender do botão "Rodar simulação" acima. Mede a incerteza da <em>taxa</em> de escalação futura, complementar à incerteza de <em>escopo</em> da Aro Simulação principal.
              </p>
            </div>
            <SensibilidadeAno10Card
              baseAno10={sensBase.baseAno10}
              modoIpcaDisponivel={sensBase.modoIpcaDisponivel}
            />
          </section>
        )}
      </div>

      {historyOpen && (
        <HistoryModal
          history={history}
          onSelect={loadHistoryRun}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  )
}
