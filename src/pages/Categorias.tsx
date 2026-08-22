import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FolderOpen, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { categoriasT } from '@/i18n/categorias'
import CategoryBlock from '@/components/categorias/CategoryBlock'
import { useProjeto } from '@/context/ProjetoContext'
import { CATEGORIA_TEMPLATES } from '@/data/categoria-templates'
import type { Projeto } from '@/types/clientes'

export default function Categorias() {
  const t = useT(categoriasT)
  const { projeto } = useOutletContext<{ projeto: Projeto }>()
  const {
    catalogo, tiposProjeto,
    addCategoria, removeCategoria, updateCategoria, addItem, removeItem, updateItem, saveItem,
    carregarTemplateExemplo, renomearCategoriaCatalogo,
  } = useProjeto()

  const TIPOS_COM_EXEMPLO = tiposProjeto.filter(tp => (CATEGORIA_TEMPLATES[tp.id]?.length ?? 0) > 0)

  const categories = projeto.categorias

  const [toast, setToast] = useState<string | null>(null)
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex flex-col h-full">

      <header className="flex items-start justify-between px-4 sm:px-8 py-4 sm:py-[22px] gap-4 shrink-0">
        <h1 className="text-2xl font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" onClick={() => addCategoria(projeto.id).catch(() => showToast('Não foi possível criar a categoria.'))}>{t.createCategoryBtn}</Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">
        <div className="card">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text mb-5">
            <FolderOpen size={14} color="var(--accent)" aria-hidden="true" />
            <span>{t.categoriesTitle}</span>
          </div>

          {categories.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-[0.8125rem] text-c-text-2 max-w-[420px]">{t.emptyCategoriesMessage}</p>
              {TIPOS_COM_EXEMPLO.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {TIPOS_COM_EXEMPLO.map(tp => (
                    <Button
                      key={tp.id}
                      variant="ghost"
                      onClick={() => carregarTemplateExemplo(projeto.id, tp.id).catch(() => showToast('Não foi possível carregar o exemplo.'))}
                    >
                      {t.loadExampleBtn(tp.nome)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {categories.map((cat, idx) => (
              <CategoryBlock
                key={cat.id}
                category={cat}
                nome={catalogo.find(c => c.id === cat.catalogoId)?.nome ?? '—'}
                index={idx}
                onRemove={() => removeCategoria(projeto.id, cat.id).catch(() => showToast('Não foi possível remover a categoria.'))}
                onChange={(field, value) => updateCategoria(projeto.id, cat.id, field, value).catch(() => showToast('Não foi possível salvar.'))}
                onRename={novoNome => {
                  renomearCategoriaCatalogo(cat.catalogoId, novoNome)
                    .then(() => showToast('Categoria renomeada — vale pra todos os projetos que usam esse nome.'))
                    .catch(() => showToast('Já existe uma categoria com esse nome.'))
                }}
                onCancelRename={() => showToast('Alteração cancelada.')}
                onAddItem={() => addItem(projeto.id, cat.id).catch(() => showToast('Não foi possível criar o item.'))}
                onRemoveItem={itemId => removeItem(projeto.id, cat.id, itemId).catch(() => showToast('Não foi possível remover o item.'))}
                onUpdateItem={(itemId, field, value) => updateItem(projeto.id, cat.id, itemId, field, value)}
                onSaveItem={(itemId, field, value) => saveItem(itemId, field, value).catch(() => showToast('Não foi possível salvar o item.'))}
              />
            ))}
          </div>
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
