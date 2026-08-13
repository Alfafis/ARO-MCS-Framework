import { useState, useCallback } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { categoriasT } from '@/i18n/categorias'
import ProjectDataCard from '@/components/categorias/ProjectDataCard'
import CategoryBlock from '@/components/categorias/CategoryBlock'
import type { Category, CategoryItem } from '@/types/categorias'

const uid = () => Math.random().toString(36).slice(2)

const makeItem = (): CategoryItem => ({ id: uid(), name: 'Novo item', unit: 'verba', min: '', max: '', source: '' })

const INITIAL: Category[] = [
  {
    id: uid(), name: 'Estudos', preenche: 'Consultor', expanded: true, justAdded: false,
    items: [
      { id: uid(), name: 'Estudo de estabilidade geotécnica', unit: 'verba', min: 'R$ 480.000', max: 'R$ 720.000', source: 'SINAPI 2021' },
      { id: uid(), name: 'Modelagem hidrogeológica',         unit: 'verba', min: 'R$ 310.000', max: 'R$ 540.000', source: 'Brandt Meio Amb.' },
    ],
  },
  {
    id: uid(), name: 'Barragem', preenche: 'Ambos', expanded: true, justAdded: false,
    items: [
      { id: uid(), name: 'Descomissionamento estrutural', unit: 'm²',    min: 'R$ 2.100.000', max: 'R$ 3.050.000', source: 'SINAPI 2021' },
      { id: uid(), name: 'Recomposição de talude',       unit: 'm²',    min: 'R$ 1.400.000', max: 'R$ 2.100.000', source: 'Brandt Meio Amb.' },
      { id: uid(), name: 'Monitoramento pós-obra',       unit: 'verba', min: 'R$ 900.000',   max: 'R$ 1.350.000', source: 'SINAPI 2021' },
    ],
  },
  { id: uid(), name: 'Monitoramento', preenche: 'Consultor', expanded: false, justAdded: false, items: [] },
]

export default function Categorias() {
  const t = useT(categoriasT)
  const [categories, setCategories] = useState<Category[]>(INITIAL)

  const addCategory = useCallback(() => {
    const nova: Category = { id: uid(), name: 'Nova categoria', preenche: 'Consultor', expanded: true, justAdded: true, items: [] }
    setCategories(prev => [nova, ...prev])
    setTimeout(() => {
      setCategories(prev => prev.map(c => c.id === nova.id ? { ...c, justAdded: false } : c))
    }, 900)
  }, [])

  const removeCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  const updateCategory = useCallback((id: string, field: keyof Category, value: string | boolean) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }, [])

  const addItem = useCallback((catId: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: [...c.items, makeItem()] } : c))
  }, [])

  const removeItem = useCallback((catId: string, itemId: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c))
  }, [])

  const updateItem = useCallback((catId: string, itemId: string, field: keyof CategoryItem, value: string) => {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
      : c
    ))
  }, [])

  return (
    <div className="flex flex-col h-full">

      <header className="flex items-start justify-between px-8 py-[22px] gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-c-text tracking-tight leading-tight">{t.headerTitle}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f0eeec] text-c-text-2 text-xs font-semibold font-mono">Rev0</span>
          </div>
          <p className="text-[13px] text-c-text-2">{t.headerSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost">{t.saveDraft}</Button>
          <Button variant="primary">{t.saveAndContinue}</Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-8 pb-8 overflow-y-auto flex-1">
        <ProjectDataCard />

        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
              <FolderOpen size={14} color="var(--accent)" aria-hidden="true" />
              <span>{t.categoriesTitle}</span>
            </div>
            <button
              className="text-[0.8125rem] font-semibold text-c-text-2 hover:text-accent transition-colors cursor-pointer bg-transparent border-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4 rounded"
              onClick={addCategory}
            >
              {t.newCategory}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {categories.map((cat, idx) => (
              <CategoryBlock
                key={cat.id}
                category={cat}
                index={idx}
                onRemove={() => removeCategory(cat.id)}
                onChange={(field, value) => updateCategory(cat.id, field, value)}
                onAddItem={() => addItem(cat.id)}
                onRemoveItem={itemId => removeItem(cat.id, itemId)}
                onUpdateItem={(itemId, field, value) => updateItem(cat.id, itemId, field, value)}
              />
            ))}
          </div>

          <button
            className="mt-4 w-full py-3.5 bg-[#f6f5f3] rounded-[14px] border-none text-[0.8125rem] font-medium text-c-text-2 hover:text-accent hover:bg-[#efece9] transition-colors cursor-pointer text-center focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            onClick={addCategory}
          >
            {t.newCategoryBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
