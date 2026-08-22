import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import type { Projeto } from '@/types/clientes'
import RevisionTimeline from '@/components/dashboard/RevisionTimeline'
import DisbursementChart from '@/components/dashboard/DisbursementChart'
import PhaseBreakdown from '@/components/dashboard/PhaseBreakdown'
import CostByCategoryTable from '@/components/resumo-executivo/CostByCategoryTable'
import MonetaryMethodsCard from '@/components/resumo-executivo/MonetaryMethodsCard'
import RisksCard from '@/components/resumo-executivo/RisksCard'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'
import { MOCK_CATEGORIES, MOCK_TOTALS } from '@/data/relatorio-mock'
import { computeMonetaryValues, BASE_TOTAL_WITH_PROVISION } from '@/lib/financeiro'

export default function ResumoExecutivo() {
  const t = useT(resumoT)
  const navigate = useNavigate()
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const [linkCopied, setLinkCopied] = useState(false)

  const monetaryMethods = useMemo(() => {
    const [simple, compound, inflation, ipca] = computeMonetaryValues(BASE_TOTAL_WITH_PROVISION)
    const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
    return [
      { label: t.method1, value: fmt(simple)    },
      { label: t.method2, value: fmt(compound)  },
      { label: t.method3, value: fmt(inflation) },
      { label: t.method4, value: fmt(ipca)      },
    ]
  }, [t])

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <CostByCategoryTable
            className="lg:col-span-7"
            categories={MOCK_CATEGORIES}
            totals={MOCK_TOTALS}
          />
          <PhaseBreakdown className="lg:col-span-5" />
        </div>

        <DisbursementChart />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <MonetaryMethodsCard className="lg:col-span-7" methods={monetaryMethods} baseLabel="R$ 40,57 M" />
          <RevisionTimeline className="lg:col-span-5" />
        </div>

        <RisksCard />

      </div>
    </>
  )
}
