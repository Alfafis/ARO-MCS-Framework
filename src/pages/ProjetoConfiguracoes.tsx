import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'
import ConfigFinanceiraForm from '@/components/projeto/ConfigFinanceiraForm'
import { useProjeto } from '@/context/ProjetoContext'
import { useT } from '@/i18n/LangContext'
import { configFinanceiraT } from '@/i18n/config-financeira'
import { projetoWorkspaceT } from '@/i18n/projeto-workspace'
import type { Projeto } from '@/types/clientes'

// Único jeito de editar moeda/data base/horizonte/método/contingência depois da criação — mesmo
// formulário do step 2 do wizard (ver specs/2026-08-23-wizard-criacao-projeto-design.md).
export default function ProjetoConfiguracoes() {
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const t = useT(configFinanceiraT)
  const tW = useT(projetoWorkspaceT)
  const { atualizarConfigFinanceira } = useProjeto()
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={tW.configPageTitle} subtitle={tW.configPageSubtitle} />
      <div className="px-4 sm:px-8 pb-8 max-w-[480px]">
        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6">
          <ConfigFinanceiraForm
            initial={{
              moeda: projeto.moeda,
              dataBase: projeto.dataBase,
              horizonteAnos: projeto.horizonteAnos,
              metodoAtualizacao: projeto.metodoAtualizacao,
              contingenciaPct: projeto.contingenciaPct,
            }}
            primaryLabel={tW.salvar}
            onValorInvalido={() => showToast(t.valorInvalidoToast)}
            onSalvar={async form => {
              try {
                await atualizarConfigFinanceira(projeto.id, form)
                showToast(t.savedToast)
              } catch {
                showToast(t.saveErrorToast)
              }
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'fixed', bottom: 24, right: 24, display: 'flex', alignItems: 'center', gap: 6,
          background: '#14151a', color: '#fff', fontSize: 13, fontWeight: 500, padding: '8px 14px',
          borderRadius: 10, maxWidth: 360, opacity: toast ? 1 : 0,
          transform: toast ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 180ms ease, transform 180ms ease', pointerEvents: 'none',
        }}
      >
        {toast}
      </div>
    </div>
  )
}
