import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import ConfigFinanceiraForm from '@/components/projeto/ConfigFinanceiraForm'
import { useProjeto } from '@/context/useProjeto'
import { useT } from '@/i18n/useLang'
import { clientesT } from '@/i18n/clientes'
import { configFinanceiraT } from '@/i18n/config-financeira'

// Step 2 do wizard — rota por :projetoId (não estado local): projeto já existe de verdade desde
// o step 1, então um F5 aqui continua o fluxo no mesmo projeto em vez de reiniciar o wizard.
export default function ProjetoConfigInicial() {
  const { projetoId = '' } = useParams<{ projetoId: string }>()
  const navigate = useNavigate()
  const t = useT(clientesT)
  const tCf = useT(configFinanceiraT)
  const { projetos, loading, atualizarConfigFinanceira } = useProjeto()
  const [toast, setToast] = useState<string | null>(null)

  const projeto = projetos.find((p) => p.id === projetoId)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function irParaWorkspace() {
    navigate(`/projetos/${projetoId}/dashboard`)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full max-w-[480px]" />
      </div>
    )
  }

  if (!projeto) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-center px-4">
        <p className="text-[15px] font-bold text-c-text">{t.empty}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.wizardStep2Title} />
      <div className="px-4 sm:px-8 pb-8 max-w-[480px]">
        <ConfigFinanceiraForm
          variant="default"
          initial={{
            moeda: projeto.moeda,
            dataBase: projeto.dataBase,
            horizonteAnos: projeto.horizonteAnos,
            metodoAtualizacao: projeto.metodoAtualizacao,
            contingenciaPct: projeto.contingenciaPct,
          }}
          primaryLabel={t.concluir}
          secondaryAction={{ label: t.pularPorAgora, onClick: irParaWorkspace }}
          onValorInvalido={() => showToast(tCf.valorInvalidoToast)}
          onSalvar={async (form) => {
            try {
              await atualizarConfigFinanceira(projetoId, form)
              irParaWorkspace()
            } catch {
              showToast(tCf.saveErrorToast)
            }
          }}
        />
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#14151a',
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 14px',
          borderRadius: 10,
          maxWidth: 360,
          opacity: toast ? 1 : 0,
          transform: toast ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          pointerEvents: 'none',
        }}
      >
        {toast}
      </div>
    </div>
  )
}
