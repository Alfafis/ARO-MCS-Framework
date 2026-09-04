import { useEffect, useMemo } from 'react'
import { NavLink, useOutletContext } from 'react-router-dom'
import { Sprout, Plus, Sparkles, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/useLang'
import { remediacaoT } from '@/i18n/remediacao'
import { useProjeto } from '@/context/useProjeto'
import { formatMoedaCompact } from '@/lib/financeiro'
import type { Projeto } from '@/types/clientes'
import { custoTotalRemediacao } from '@/types/remediacao'
import { CategoriaCard } from '@/components/remediacao/RemediacaoCategoriaCard'

export default function Remediacao() {
  const t = useT(remediacaoT)
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const {
    remediacaoByProjeto,
    remediacaoLoading,
    fetchRemediacao,
    setRemediacaoHabilitada,
    carregarRemediacaoPadrao,
    addRemediacaoCategoria,
    updateRemediacaoCategoria,
    removeRemediacaoCategoria,
    addRemediacaoItem,
    updateRemediacaoItem,
    removeRemediacaoItem,
  } = useProjeto()

  const categorias = remediacaoByProjeto[projeto.id]
  const carregado = categorias !== undefined

  useEffect(() => {
    if (projeto.remediacaoHabilitada && !carregado) void fetchRemediacao(projeto.id)
  }, [projeto.id, projeto.remediacaoHabilitada, carregado, fetchRemediacao])

  const totalGeral = useMemo(() => custoTotalRemediacao(categorias ?? []), [categorias])

  // -- Estado desabilitado ------------------------------------------------
  if (!projeto.remediacaoHabilitada) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />
        <div className="px-4 sm:px-8 pb-8">
          <div className="rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line p-8 flex flex-col items-start gap-4 max-w-[640px]">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-c-text-2 uppercase tracking-widest">
              <Sprout size={14} color="var(--accent)" aria-hidden="true" />
              {t.moduleTag}
            </div>
            <h2 className="text-[18px] font-bold text-c-text tracking-tight">{t.disabledStateTitle}</h2>
            <p className="text-[13px] text-c-text-2 leading-relaxed">{t.disabledStateBody}</p>
            <Button variant="primary" onClick={() => setRemediacaoHabilitada(projeto.id, true)}>
              {t.disabledStateEnable}
            </Button>
            <NavLink
              to={`/projetos/${projeto.id}/config`}
              className="text-[12.5px] font-medium text-c-text-2 hover:text-accent transition-colors"
            >
              → {t.configToggleLabel}
            </NavLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        actions={
          carregado && categorias.length > 0 ? (
            <Button variant="ghost" onClick={() => void addRemediacaoCategoria(projeto.id, 'Nova categoria', null)}>
              <Plus size={13} aria-hidden="true" />
              {t.addCategoria}
            </Button>
          ) : null
        }
      />

      <div className="px-4 sm:px-8 pb-8 flex flex-col gap-4">
        {remediacaoLoading && !carregado && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {carregado && categorias.length === 0 && (
          <div className="rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line p-8 flex flex-col items-start gap-4 max-w-[640px]">
            <Sparkles size={16} color="var(--accent)" aria-hidden="true" />
            <h2 className="text-[16px] font-bold text-c-text">{t.emptyStateTitle}</h2>
            <p className="text-[13px] text-c-text-2 leading-relaxed">{t.emptyStateBody}</p>
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={() => void carregarRemediacaoPadrao(projeto.id)}>
                <Sparkles size={13} aria-hidden="true" />
                {t.emptyStateSeed}
              </Button>
              <Button variant="ghost" onClick={() => void addRemediacaoCategoria(projeto.id, 'Nova categoria', null)}>
                <Plus size={13} aria-hidden="true" />
                {t.emptyStateAddManual}
              </Button>
            </div>
          </div>
        )}

        {carregado && categorias.length > 0 && (
          <>
            {categorias.map((cat) => (
              <CategoriaCard
                key={cat.id}
                cat={cat}
                onRenameCategoria={(nome) => void updateRemediacaoCategoria(cat.id, { nome })}
                onChangeArea={(areaHa) => void updateRemediacaoCategoria(cat.id, { areaHa })}
                onRemoveCategoria={() => {
                  if (confirm(t.removeCategoriaConfirm)) void removeRemediacaoCategoria(projeto.id, cat.id)
                }}
                onAddItem={() => void addRemediacaoItem(cat.id)}
                onUpdateItem={(id, patch) => void updateRemediacaoItem(id, patch)}
                onRemoveItem={(id) => {
                  if (confirm(t.removeItemConfirm)) void removeRemediacaoItem(cat.id, id)
                }}
              />
            ))}

            <div className="card flex items-center justify-between gap-4 border-t-2 border-[color:var(--accent)]/40">
              <div className="flex items-center gap-2">
                <Info size={14} color="var(--accent)" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-c-text">{t.totalGeral}</span>
              </div>
              <span className="font-mono text-[16px] font-bold text-c-text">{formatMoedaCompact(totalGeral)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
