import { useState, useCallback } from 'react'
import { FolderOpen } from 'lucide-react'
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
      { id: uid(), name: 'Descomissionamento estrutural', unit: 'm²',   min: 'R$ 2.100.000', max: 'R$ 3.050.000', source: 'SINAPI 2021' },
      { id: uid(), name: 'Recomposição de talude',       unit: 'm²',   min: 'R$ 1.400.000', max: 'R$ 2.100.000', source: 'Brandt Meio Amb.' },
      { id: uid(), name: 'Monitoramento pós-obra',       unit: 'verba', min: 'R$ 900.000',   max: 'R$ 1.350.000', source: 'SINAPI 2021' },
    ],
  },
  { id: uid(), name: 'Monitoramento', preenche: 'Consultor', expanded: false, justAdded: false, items: [] },
]

export default function Categorias() {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">
            <h1>Fechamento de Mina — ARO</h1>
            <span className="rev-tag">Rev0</span>
          </div>
          <p className="topbar-sub">NX Gold · Categorias de custo e itens</p>
        </div>
        <div className="topbar-actions">
          <button className="btn-ghost">Salvar rascunho</button>
          <button className="btn-primary">Salvar e continuar</button>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <div className="content">
        <ProjectDataCard />

        {/* Card de categorias */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="card-section-title">
              <FolderOpen size={14} color="var(--accent)" aria-hidden="true" />
              <span>Categorias de custo</span>
            </div>
            <button className="add-cat-header-btn" onClick={addCategory}>+ Nova categoria</button>
          </div>

          {/* Lista */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

          {/* Rodapé */}
          <button className="add-cat-footer" style={{ marginTop: 16 }} onClick={addCategory}>
            + Nova categoria de custo
          </button>
        </div>
      </div>
    </div>
  )
}
