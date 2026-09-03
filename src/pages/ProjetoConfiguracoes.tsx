import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import ConfigFinanceiraForm from '@/components/projeto/ConfigFinanceiraForm'
import { useProjeto } from '@/context/useProjeto'
import { useT } from '@/i18n/useLang'
import { configFinanceiraT } from '@/i18n/config-financeira'
import { projetoWorkspaceT } from '@/i18n/projeto-workspace'
import { remediacaoT } from '@/i18n/remediacao'
import type { Projeto } from '@/types/clientes'

// Único jeito de editar moeda/data base/horizonte/método/contingência depois da criação — mesmo
// formulário do step 2 do wizard (ver specs/2026-08-23-wizard-criacao-projeto-design.md).
export default function ProjetoConfiguracoes() {
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const t = useT(configFinanceiraT)
  const tW = useT(projetoWorkspaceT)
  const tRem = useT(remediacaoT)
  const { atualizarConfigFinanceira, setRemediacaoHabilitada } = useProjeto()
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={tW.configPageTitle} subtitle={tW.configPageSubtitle} />
      <div className="px-4 sm:px-8 pb-8 max-w-[480px] flex flex-col gap-4">
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
            onSalvar={async (form) => {
              try {
                await atualizarConfigFinanceira(projeto.id, form)
                showToast(t.savedToast)
              } catch {
                showToast(t.saveErrorToast)
              }
            }}
          />
        </div>

        {/* Toggle do módulo Remediação — escopo alternativo, opcional por projeto */}
        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Sprout size={14} color="var(--accent)" aria-hidden="true" className="mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-[13.5px] font-semibold text-c-text">{tRem.configToggleLabel}</span>
                <p className="text-[12px] text-c-text-2 leading-relaxed">{tRem.configToggleHint}</p>
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer shrink-0 mt-0.5">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={projeto.remediacaoHabilitada}
                onChange={(e) => void setRemediacaoHabilitada(projeto.id, e.target.checked)}
              />
              <span className="w-9 h-5 rounded-full bg-[#e0ddd9] peer-checked:bg-[color:var(--accent)] transition-colors relative">
                <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </span>
            </label>
          </div>
        </div>
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
