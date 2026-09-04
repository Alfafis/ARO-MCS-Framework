import { useEffect, useMemo } from 'react'
import { Plus, Sparkles, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/useLang'
import { remediacaoT } from '@/i18n/remediacao'
import { remediacaoPadraoT } from '@/i18n/remediacao-padrao'
import { useProjeto } from '@/context/useProjeto'
import { formatMoedaCompact } from '@/lib/financeiro'
import { custoTotalRemediacao } from '@/types/remediacao'
import { CategoriaCard } from '@/components/remediacao/RemediacaoCategoriaCard'

export default function RemediacaoPadrao() {
  const t = useT(remediacaoT)
  const tPadrao = useT(remediacaoPadraoT)
  const {
    remediacaoTemplate,
    remediacaoTemplateLoading,
    fetchRemediacaoTemplate,
    addRemediacaoTemplateCategoria,
    updateRemediacaoTemplateCategoria,
    removeRemediacaoTemplateCategoria,
    addRemediacaoTemplateItem,
    updateRemediacaoTemplateItem,
    removeRemediacaoTemplateItem,
  } = useProjeto()

  const carregado = remediacaoTemplate !== undefined

  useEffect(() => {
    if (!carregado) void fetchRemediacaoTemplate()
  }, [carregado, fetchRemediacaoTemplate])

  const totalGeral = useMemo(() => custoTotalRemediacao(remediacaoTemplate ?? []), [remediacaoTemplate])

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={tPadrao.headerTitle}
        subtitle={tPadrao.headerSubtitle}
        actions={
          carregado && remediacaoTemplate.length > 0 ? (
            <Button variant="ghost" onClick={() => void addRemediacaoTemplateCategoria('Nova categoria', null)}>
              <Plus size={13} aria-hidden="true" />
              {t.addCategoria}
            </Button>
          ) : null
        }
      />

      <div className="px-4 sm:px-8 pb-8 flex flex-col gap-4">
        {remediacaoTemplateLoading && !carregado && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {carregado && remediacaoTemplate.length === 0 && (
          <div className="rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line p-8 flex flex-col items-start gap-4 max-w-[640px]">
            <Sparkles size={16} color="var(--accent)" aria-hidden="true" />
            <h2 className="text-[16px] font-bold text-c-text">{tPadrao.emptyStateTitle}</h2>
            <p className="text-[13px] text-c-text-2 leading-relaxed">{tPadrao.emptyStateBody}</p>
            <Button variant="primary" onClick={() => void addRemediacaoTemplateCategoria('Nova categoria', null)}>
              <Plus size={13} aria-hidden="true" />
              {t.addCategoria}
            </Button>
          </div>
        )}

        {carregado && remediacaoTemplate.length > 0 && (
          <>
            {remediacaoTemplate.map((cat) => (
              <CategoriaCard
                key={cat.id}
                cat={cat}
                onRenameCategoria={(nome) => void updateRemediacaoTemplateCategoria(cat.id, { nome })}
                onChangeArea={(areaHa) => void updateRemediacaoTemplateCategoria(cat.id, { areaHa })}
                onRemoveCategoria={() => {
                  if (confirm(t.removeCategoriaConfirm)) void removeRemediacaoTemplateCategoria(cat.id)
                }}
                onAddItem={() => void addRemediacaoTemplateItem(cat.id)}
                onUpdateItem={(id, patch) => void updateRemediacaoTemplateItem(id, patch)}
                onRemoveItem={(id) => {
                  if (confirm(t.removeItemConfirm)) void removeRemediacaoTemplateItem(cat.id, id)
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
