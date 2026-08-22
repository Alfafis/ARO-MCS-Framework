import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronUp, ChevronDown, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/LangContext'
import { categoriasT } from '@/i18n/categorias'
import type { Category, CategoryItem } from '@/types/categorias'

interface Props {
  category:     Category
  nome:         string
  index:        number
  onRemove:     () => void
  onChange:     (field: keyof Category, value: string | boolean) => void
  onRename:     (novoNome: string) => void
  onCancelRename?: () => void
  onAddItem:    () => void
  onRemoveItem: (itemId: string) => void
  onUpdateItem: (itemId: string, field: keyof CategoryItem, value: string) => void
  onSaveItem:   (itemId: string, field: keyof CategoryItem, value: string) => void
}

const PREENCHE_OPTIONS: Category['preenche'][] = ['Consultor', 'Cliente', 'Ambos']
const PREENCHE_BADGE_VARIANT: Record<Category['preenche'], 'default' | 'warning' | 'accent'> = {
  Consultor: 'default',
  Cliente:   'warning',
  Ambos:     'accent',
}

export default function CategoryBlock({ category, nome, index, onRemove, onChange, onRename, onCancelRename, onAddItem, onRemoveItem, onUpdateItem, onSaveItem }: Props) {
  const t = useT(categoriasT)
  const blockRef = useRef<HTMLDivElement>(null)
  const [highlighted, setHighlighted] = useState(category.justAdded)
  const [editingNome, setEditingNome] = useState<string | null>(null)
  const isEditingNome = editingNome !== null
  const nomeEditRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditingNome) return
    function onMouseDown(e: MouseEvent) {
      if (nomeEditRef.current?.contains(e.target as Node)) return
      setEditingNome(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isEditingNome])
  const [preencheOpen, setPreencheOpen] = useState(false)
  const [preenchePos, setPreenchePos] = useState({ top: 0, left: 0 })
  const preencheBtnRef = useRef<HTMLButtonElement>(null)
  const preencheMenuRef = useRef<HTMLDivElement>(null)

  function togglePreencheMenu() {
    if (!preencheOpen && preencheBtnRef.current) {
      const rect = preencheBtnRef.current.getBoundingClientRect()
      setPreenchePos({ top: rect.bottom + 4, left: rect.left })
    }
    setPreencheOpen(o => !o)
  }

  useEffect(() => {
    if (!preencheOpen) return
    function onMouseDown(e: MouseEvent) {
      if (preencheBtnRef.current?.contains(e.target as Node)) return
      if (preencheMenuRef.current?.contains(e.target as Node)) return
      setPreencheOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [preencheOpen])

  function confirmRename() {
    const trimmed = (editingNome ?? '').trim()
    setEditingNome(null)
    if (trimmed && trimmed !== nome) onRename(trimmed)
  }

  function cancelRename() {
    setEditingNome(null)
    onCancelRename?.()
  }

  useEffect(() => {
    if (!category.justAdded) return
    blockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    const timer = setTimeout(() => setHighlighted(false), 900)
    return () => clearTimeout(timer)
  }, [category.justAdded])

  return (
    <div
      ref={blockRef}
      className={`cat-block${category.justAdded ? ' cat-entering' : ''}${highlighted ? ' cat-highlight' : ''}`}
    >
      <div className="bg-[#faf9f8] px-4 py-3 flex items-center gap-2.5">

        <div className="flex items-center gap-2.5 flex-1 min-w-0" ref={nomeEditRef}>
          <input
            className="cat-name-input"
            value={editingNome ?? nome}
            onChange={e => setEditingNome(e.target.value)}
            onFocus={() => setEditingNome(nome)}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmRename()
              if (e.key === 'Escape') cancelRename()
            }}
            aria-label={`Nome da categoria ${index + 1}`}
          />

          {isEditingNome && (
            <>
              <Button variant="icon-btn" onClick={confirmRename} aria-label="Confirmar novo nome">
                <Check size={14} aria-hidden="true" />
              </Button>
              <Button variant="icon-danger" onClick={cancelRename} aria-label="Cancelar alteração">
                <X size={14} aria-hidden="true" />
              </Button>
            </>
          )}
        </div>

        <button
          ref={preencheBtnRef}
          type="button"
          onClick={togglePreencheMenu}
          className="cursor-pointer border-0 bg-transparent p-0 shrink-0"
          aria-label="Alterar quem preenche"
          aria-haspopup="listbox"
          aria-expanded={preencheOpen}
        >
          <Badge variant={PREENCHE_BADGE_VARIANT[category.preenche]}>
            {t.fills} {category.preenche}
          </Badge>
        </button>

        {createPortal(
          <div
            ref={preencheMenuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: preenchePos.top,
              left: preenchePos.left,
              minWidth: 130,
              zIndex: 9999,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 16px 40px -12px rgba(20,21,26,.18)',
              padding: 6,
              opacity: preencheOpen ? 1 : 0,
              transform: preencheOpen ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
              pointerEvents: preencheOpen ? 'auto' : 'none',
              transition: 'opacity 140ms ease, transform 140ms ease',
            }}
          >
            {PREENCHE_OPTIONS.map(opt => (
              <div
                key={opt}
                role="option"
                aria-selected={opt === category.preenche}
                onClick={() => { onChange('preenche', opt); setPreencheOpen(false) }}
                className={`px-3 py-1.5 rounded-[9px] text-[13px] leading-none cursor-pointer transition-colors duration-100 whitespace-nowrap ${
                  opt === category.preenche ? 'bg-accent-100 text-accent-700 font-bold' : 'text-c-text font-medium hover:bg-[#f2f2f0]'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>,
          document.body
        )}

        <Button
          variant="icon-btn"
          onClick={() => onChange('expanded', !category.expanded)}
          aria-label={category.expanded ? t.collapseCategory : t.expandCategory}
        >
          {category.expanded
            ? <ChevronUp size={14} aria-hidden="true" />
            : <ChevronDown size={14} aria-hidden="true" />}
        </Button>

        <Button variant="icon-danger" onClick={onRemove} aria-label={t.deleteCategory}>
          <Trash2 size={14} aria-hidden="true" />
        </Button>
      </div>

      {category.expanded && (
        <div className="overflow-x-auto bg-white">
          <div className="px-4 pb-3 min-w-[880px]">
          <div className="item-row item-header">
            {[t.colItem, t.colUnit, t.colCostMin, t.colCostMax, t.colSource, t.colAplicabilidade, t.colAno, ''].map(col => (
              <span key={col} className="col-label">{col}</span>
            ))}
          </div>

          {category.items.map(item => (
            <div key={item.id} className="item-row">
              <input className="row-input" value={item.name}   onChange={e => onUpdateItem(item.id, 'name',   e.target.value)} onBlur={e => onSaveItem(item.id, 'name', e.target.value)} aria-label="Nome do item" />
              <input className="row-input" value={item.unit}   onChange={e => onUpdateItem(item.id, 'unit',   e.target.value)} onBlur={e => onSaveItem(item.id, 'unit', e.target.value)} aria-label="Unidade" />
              <input className="row-input mono" value={item.min}  onChange={e => onUpdateItem(item.id, 'min',    e.target.value)} onBlur={e => onSaveItem(item.id, 'min', e.target.value)} aria-label="Custo mínimo" />
              <input className="row-input mono" value={item.max}  onChange={e => onUpdateItem(item.id, 'max',    e.target.value)} onBlur={e => onSaveItem(item.id, 'max', e.target.value)} aria-label="Custo máximo" />
              <input className="row-input" value={item.source} onChange={e => onUpdateItem(item.id, 'source', e.target.value)} onBlur={e => onSaveItem(item.id, 'source', e.target.value)} aria-label="Fonte" />
              <input className="row-input" value={item.aplicabilidade} onChange={e => onUpdateItem(item.id, 'aplicabilidade', e.target.value)} onBlur={e => onSaveItem(item.id, 'aplicabilidade', e.target.value)} aria-label="Aplicabilidade" />
              <input className="row-input" value={item.anoPrevisto}    onChange={e => onUpdateItem(item.id, 'anoPrevisto',    e.target.value)} onBlur={e => onSaveItem(item.id, 'anoPrevisto', e.target.value)} aria-label="Ano previsto" />
              <Button variant="icon-danger" onClick={() => onRemoveItem(item.id)} aria-label={t.deleteItem}>
                <Trash2 size={13} aria-hidden="true" />
              </Button>
            </div>
          ))}

          <button
            className="text-[0.8125rem] font-medium text-c-text-2 hover:text-accent transition-colors cursor-pointer bg-transparent border-none py-2 px-1.5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
            onClick={onAddItem}
          >
            {t.addItem}
          </button>
          </div>
        </div>
      )}
    </div>
  )
}
