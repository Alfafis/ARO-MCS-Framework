import { useState } from 'react'
import { Check, FolderTree, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/layout/PageHeader'
import CategoryBlock from '@/components/categorias/CategoryBlock'
import { useT } from '@/i18n/LangContext'
import { categoriasCustoT } from '@/i18n/categorias-custo'
import { useProjeto } from '@/context/ProjetoContext'
import type { TipoProjeto } from '@/types/tiposProjeto'

// Editor de template de categoria por tipo_projeto — reaproveita CategoryBlock
// (mesmo componente de edição usado em Categorias.tsx pra categoria de
// projeto real), só trocando as funções de mutação pelas `template*` do
// context. Seleção de tipo é local à página — busca sob demanda ao trocar de
// tipo, cacheada em `templates` (context) pra não rebuscar ao voltar.
interface TemplateEditorProps {
  tipos:   TipoProjeto[]
  t:       typeof categoriasCustoT['pt-BR']
  onToast: (msg: string) => void
}

function TemplateEditor({ tipos, t, onToast }: TemplateEditorProps) {
  const {
    catalogo, templates, fetchTemplateCategorias,
    templateAddCategoria, templateRemoveCategoria, templateUpdateCategoria,
    templateAddItem, templateRemoveItem, templateUpdateItem, templateSaveItem,
    renomearCategoriaCatalogo,
  } = useProjeto()
  const [tipoSelecionadoId, setTipoSelecionadoId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function selecionarTipo(id: string) {
    setTipoSelecionadoId(id)
    if (templates[id]) return
    setCarregando(true)
    try {
      await fetchTemplateCategorias(id)
    } finally {
      setCarregando(false)
    }
  }

  const categorias = tipoSelecionadoId ? (templates[tipoSelecionadoId] ?? []) : []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tipos.map(tipo => (
          <button
            key={tipo.id}
            type="button"
            onClick={() => void selecionarTipo(tipo.id)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer border ${
              tipoSelecionadoId === tipo.id
                ? 'bg-accent-100 text-accent-700 border-accent-100'
                : 'bg-white text-c-text-2 border-[rgba(20,21,26,.08)] hover:text-c-text'
            }`}
          >
            {tipo.nome}
          </button>
        ))}
      </div>

      {!tipoSelecionadoId && (
        <p className="text-[12.5px] text-c-text-2">{t.selectTypeHint}</p>
      )}

      {tipoSelecionadoId && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => templateAddCategoria(tipoSelecionadoId).catch(() => onToast(t.addCategoriaErrorToast))}
            >
              <Plus size={14} aria-hidden="true" />
              {t.addCategoriaBtn}
            </Button>
          </div>

          {carregando && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          )}

          {!carregando && categorias.length === 0 && (
            <p className="text-[12.5px] text-c-text-2 text-center py-6">{t.empty}</p>
          )}

          {!carregando && categorias.map((cat, idx) => (
            <CategoryBlock
              key={cat.id}
              category={cat}
              nome={catalogo.find(c => c.id === cat.catalogoId)?.nome ?? '—'}
              index={idx}
              onRemove={() => templateRemoveCategoria(tipoSelecionadoId, cat.id).catch(() => onToast(t.removeCategoriaErrorToast))}
              onChange={(field, value) => templateUpdateCategoria(tipoSelecionadoId, cat.id, field, value).catch(() => onToast(t.saveErrorToast))}
              onRename={novoNome => {
                renomearCategoriaCatalogo(cat.catalogoId, novoNome)
                  .then(() => onToast(t.renameSavedToast))
                  .catch(() => onToast(t.renameErrorToast))
              }}
              onAddItem={() => templateAddItem(tipoSelecionadoId, cat.id).catch(() => onToast(t.saveErrorToast))}
              onRemoveItem={itemId => templateRemoveItem(tipoSelecionadoId, cat.id, itemId).catch(() => onToast(t.saveErrorToast))}
              onUpdateItem={(itemId, field, value) => templateUpdateItem(tipoSelecionadoId, cat.id, itemId, field, value)}
              onSaveItem={(itemId, field, value) => templateSaveItem(itemId, field, value).catch(() => onToast(t.saveErrorToast))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoriasCusto() {
  const t = useT(categoriasCustoT)
  const { tiposProjeto, loading } = useProjeto()
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="px-4 sm:px-8 pb-8 overflow-y-auto flex-1">
        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
            <FolderTree size={14} color="var(--accent)" aria-hidden="true" />
            <span>{t.headerTitle}</span>
          </div>

          {loading && (
            <div className="flex flex-col gap-2 py-1">
              {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-8 w-32" />)}
            </div>
          )}
          {!loading && <TemplateEditor tipos={tiposProjeto} t={t} onToast={showToast} />}
        </div>
      </div>

      <div
        style={{
          position:   'fixed',
          bottom:     24,
          right:      24,
          display:    'flex',
          alignItems: 'center',
          gap:        6,
          background: '#14151a',
          color:      '#fff',
          fontSize:   13,
          fontWeight: 500,
          padding:    '8px 14px',
          borderRadius: 10,
          maxWidth:   360,
          opacity:    toast ? 1 : 0,
          transform:  toast ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          pointerEvents: 'none',
        }}
      >
        <Check size={13} className="shrink-0" />
        {toast}
      </div>
    </div>
  )
}
