import { useEffect, useRef, useState } from 'react'
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import type { Category, CategoryItem } from '@/types/categorias'

interface Props {
  category: Category
  index: number
  onRemove: () => void
  onChange: (field: keyof Category, value: string | boolean) => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateItem: (itemId: string, field: keyof CategoryItem, value: string) => void
}

export default function CategoryBlock({ category, index, onRemove, onChange, onAddItem, onRemoveItem, onUpdateItem }: Props) {
  const blockRef = useRef<HTMLDivElement>(null)
  const [highlighted, setHighlighted] = useState(category.justAdded)

  useEffect(() => {
    if (!category.justAdded) return
    blockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    const t = setTimeout(() => setHighlighted(false), 900)
    return () => clearTimeout(t)
  }, [category.justAdded])

  const isAmbos = category.preenche === 'Ambos'

  return (
    <div
      ref={blockRef}
      className={`cat-block${category.justAdded ? ' cat-entering' : ''}${highlighted ? ' cat-highlight' : ''}`}
    >
      {/* Cabeçalho */}
      <div className="cat-head">
        <span className="cat-order">{String(index + 1).padStart(2, '0')}</span>

        <input
          className="cat-name-input"
          value={category.name}
          onChange={e => onChange('name', e.target.value)}
          aria-label={`Nome da categoria ${index + 1}`}
        />

        <span className="tag" style={{
          background: isAmbos ? 'var(--accent-100)' : '#f0eeec',
          color: isAmbos ? 'var(--accent-700)' : 'var(--c-text-2)',
          flexShrink: 0,
        }}>
          Preenche: {category.preenche}
        </span>

        <button
          className="icon-btn"
          onClick={() => onChange('expanded', !category.expanded)}
          aria-label={category.expanded ? 'Recolher categoria' : 'Expandir categoria'}
        >
          {category.expanded
            ? <ChevronUp size={14} aria-hidden="true" />
            : <ChevronDown size={14} aria-hidden="true" />}
        </button>

        <button className="icon-btn danger" onClick={onRemove} aria-label="Excluir categoria">
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Corpo — só quando expandido */}
      {category.expanded && (
        <div className="cat-body">
          {/* Cabeçalho de colunas */}
          <div className="item-row item-header">
            {['Item', 'Unidade', 'Custo Min', 'Custo Max', 'Fonte', ''].map(col => (
              <span key={col} className="col-label">{col}</span>
            ))}
          </div>

          {/* Linhas de itens */}
          {category.items.map(item => (
            <div key={item.id} className="item-row">
              <input className="row-input" value={item.name}   onChange={e => onUpdateItem(item.id, 'name',   e.target.value)} aria-label="Nome do item" />
              <input className="row-input" value={item.unit}   onChange={e => onUpdateItem(item.id, 'unit',   e.target.value)} aria-label="Unidade" />
              <input className="row-input mono" value={item.min}    onChange={e => onUpdateItem(item.id, 'min',    e.target.value)} aria-label="Custo mínimo" />
              <input className="row-input mono" value={item.max}    onChange={e => onUpdateItem(item.id, 'max',    e.target.value)} aria-label="Custo máximo" />
              <input className="row-input" value={item.source} onChange={e => onUpdateItem(item.id, 'source', e.target.value)} aria-label="Fonte" />
              <button className="icon-btn danger" onClick={() => onRemoveItem(item.id)} aria-label="Excluir item">
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </div>
          ))}

          {/* Adicionar item */}
          <button className="add-item-btn" onClick={onAddItem}>+ Adicionar item</button>
        </div>
      )}
    </div>
  )
}
