import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronUp, ChevronDown, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/useLang'
import { categoriasT } from '@/i18n/categorias'
import { useProjeto } from '@/context/useProjeto'
import { maskMoedaBR, parseMoedaBR, formatMoedaBR } from '@/lib/financeiro'
import type { Category, CategoryItem } from '@/types/categorias'
import type { Fase } from '@/types/setores'

// Enum canônico de unidades — valores retirados da planilha NX Gold
// (aba 1..8 de categorias). Ordem por frequência de uso na planilha.
const UNIDADES: string[] = ['vb', 'ha', 'm', 'm²', 'm³', 't', 'km']

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
  onUpdateItem: (itemId: string, field: keyof CategoryItem, value: unknown) => void
  onSaveItem:   (itemId: string, field: keyof CategoryItem, value: unknown) => void
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
          <div className="px-4 pb-3 min-w-[1054px]">
          <div className="item-row item-header">
            {[t.colItem, t.colUnit, t.colCostMin, t.colCostMax, t.colSource, t.colSetores, t.colFase, t.colAno, ''].map(col => (
              <span key={col} className="col-label">{col}</span>
            ))}
          </div>

          {category.items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              t={t}
              onUpdateItem={onUpdateItem}
              onSaveItem={onSaveItem}
              onRemoveItem={onRemoveItem}
            />
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

// ============================================================================
// ItemRow — uma linha da tabela de itens. Extraída pra encapsular estado local
// dos selects (multi-select de setores) sem poluir o CategoryBlock.
// ============================================================================
interface ItemRowProps {
  item:         CategoryItem
  t:            typeof categoriasT['pt-BR']
  onUpdateItem: (itemId: string, field: keyof CategoryItem, value: unknown) => void
  onSaveItem:   (itemId: string, field: keyof CategoryItem, value: unknown) => void
  onRemoveItem: (itemId: string) => void
}

function ItemRow({ item, t, onUpdateItem, onSaveItem, onRemoveItem }: ItemRowProps) {
  // Save + update em um passo — usado em controles que emitem valor final
  // (select, multi-select, input number). Diferente de digitação livre, aqui
  // não faz sentido separar update local e save no blur.
  function commit<K extends keyof CategoryItem>(field: K, value: unknown) {
    onUpdateItem(item.id, field, value)
    onSaveItem(item.id, field, value)
  }

  return (
    <div className="item-row">
      {/* Item — texto livre */}
      <input
        className="row-input"
        value={item.name}
        onChange={e => onUpdateItem(item.id, 'name', e.target.value)}
        onBlur={e => onSaveItem(item.id, 'name', e.target.value)}
        aria-label="Nome do item"
      />

      {/* Unidade — select nativo com enum canônico */}
      <select
        className="row-input cursor-pointer bg-transparent"
        value={UNIDADES.includes(item.unit) ? item.unit : ''}
        onChange={e => commit('unit', e.target.value)}
        aria-label="Unidade"
      >
        <option value=""></option>
        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
      </select>

      {/* Custo Min / Max — máscara de moeda BR: bloqueia letras/símbolos,
          separador de milhar automático, decimal com vírgula (máx 2 dígitos).
          No blur, normaliza para o formato canônico ("R$ 1.234,56") via
          parseMoedaBR → formatMoedaBR. */}
      <input
        className="row-input mono"
        value={item.min}
        inputMode="decimal"
        onChange={e => onUpdateItem(item.id, 'min', maskMoedaBR(e.target.value))}
        onBlur={e => {
          const normalized = formatMoedaBR(parseMoedaBR(e.target.value))
          onUpdateItem(item.id, 'min', normalized)
          onSaveItem(item.id, 'min', normalized)
        }}
        aria-label="Custo mínimo"
      />
      <input
        className="row-input mono"
        value={item.max}
        inputMode="decimal"
        onChange={e => onUpdateItem(item.id, 'max', maskMoedaBR(e.target.value))}
        onBlur={e => {
          const normalized = formatMoedaBR(parseMoedaBR(e.target.value))
          onUpdateItem(item.id, 'max', normalized)
          onSaveItem(item.id, 'max', normalized)
        }}
        aria-label="Custo máximo"
      />

      {/* Fonte — texto livre (lookup futuro) */}
      <input
        className="row-input"
        value={item.source}
        onChange={e => onUpdateItem(item.id, 'source', e.target.value)}
        onBlur={e => onSaveItem(item.id, 'source', e.target.value)}
        aria-label="Fonte"
      />

      {/* Setores — multi-select portal */}
      <SetoresPicker
        selected={item.aplicabilidadeSetores}
        onChange={valor => commit('aplicabilidadeSetores', valor)}
        t={t}
      />

      {/* Fase — select nativo */}
      <select
        className="row-input cursor-pointer bg-transparent"
        value={item.fase ?? ''}
        onChange={e => commit('fase', e.target.value === '' ? null : (e.target.value as Fase))}
        aria-label="Fase do planejamento"
      >
        <option value="">{t.fasePlaceholder}</option>
        <option value="pre-fechamento">{t.fasePre}</option>
        <option value="fechamento">{t.faseExec}</option>
        <option value="pos-fechamento">{t.fasePos}</option>
      </select>

      {/* Ano início → fim — dois inputs number pequenos */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={1}
          max={20}
          className="row-input mono text-center w-14"
          value={item.anoInicio ?? ''}
          placeholder={t.anoInicioPh}
          onChange={e => onUpdateItem(item.id, 'anoInicio', e.target.value === '' ? null : parseInt(e.target.value, 10))}
          onBlur={e => onSaveItem(item.id, 'anoInicio', e.target.value === '' ? null : parseInt(e.target.value, 10))}
          aria-label="Ano de início"
        />
        <span className="text-c-text-2 text-[11px]">→</span>
        <input
          type="number"
          min={1}
          max={20}
          className="row-input mono text-center w-14"
          value={item.anoFim ?? ''}
          placeholder={t.anoFimPh}
          onChange={e => onUpdateItem(item.id, 'anoFim', e.target.value === '' ? null : parseInt(e.target.value, 10))}
          onBlur={e => onSaveItem(item.id, 'anoFim', e.target.value === '' ? null : parseInt(e.target.value, 10))}
          aria-label="Ano de fim"
        />
      </div>

      <Button variant="icon-danger" onClick={() => onRemoveItem(item.id)} aria-label={t.deleteItem}>
        <Trash2 size={13} aria-hidden="true" />
      </Button>
    </div>
  )
}

// ============================================================================
// SetoresPicker — botão + portal com checkboxes. null = "Todos os setores"
// (semântica da planilha: item sem lista específica se aplica a todos).
// ============================================================================
interface SetoresPickerProps {
  selected: number[] | null
  onChange: (valor: number[] | null) => void
  t:        typeof categoriasT['pt-BR']
}

function SetoresPicker({ selected, onChange, t }: SetoresPickerProps) {
  const { setores } = useProjeto()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left })
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return
      if (menuRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  function toggleSetor(id: number) {
    if (selected === null) {
      // Sair de "todos os setores" e criar lista com um único
      onChange([id])
      return
    }
    if (selected.includes(id)) {
      const next = selected.filter(s => s !== id)
      // Lista vazia = "todos os setores" (não faz sentido item sem setor)
      onChange(next.length === 0 ? null : next)
    } else {
      onChange([...selected, id].sort((a, b) => a - b))
    }
  }

  function marcarTodos() {
    onChange(null)
  }

  const label = selected === null
    ? t.setoresTodos
    : selected.length <= 3
      ? selected.map(s => `S${s}`).join(', ')
      : t.setoresNSelecionados(selected.length)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className="row-input text-left text-[0.8125rem] cursor-pointer truncate"
        aria-label="Setores de aplicabilidade"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
      </button>

      {createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            minWidth: 240,
            zIndex: 9999,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 16px 40px -12px rgba(20,21,26,.18)',
            padding: 6,
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity 140ms ease, transform 140ms ease',
          }}
        >
          {/* "Todos os setores" — opção especial que zera a lista */}
          <div
            role="option"
            aria-selected={selected === null}
            onClick={marcarTodos}
            className={`px-3 py-1.5 rounded-[9px] text-[13px] leading-none cursor-pointer transition-colors duration-100 whitespace-nowrap ${
              selected === null ? 'bg-accent-100 text-accent-700 font-bold' : 'text-c-text font-medium hover:bg-[#f2f2f0]'
            }`}
          >
            {t.setoresTodos}
          </div>
          <div className="h-px bg-[rgba(20,21,26,.08)] my-1" />
          {setores.map(s => {
            const marcado = selected?.includes(s.id) ?? false
            return (
              <div
                key={s.id}
                role="option"
                aria-selected={marcado}
                onClick={() => toggleSetor(s.id)}
                className={`px-3 py-1.5 rounded-[9px] text-[13px] leading-none cursor-pointer transition-colors duration-100 whitespace-nowrap flex items-center gap-2 ${
                  marcado ? 'bg-accent-100 text-accent-700 font-medium' : 'text-c-text hover:bg-[#f2f2f0]'
                }`}
              >
                <span
                  className={`inline-block w-3.5 h-3.5 rounded-[4px] border ${
                    marcado ? 'bg-accent border-accent' : 'border-[rgba(20,21,26,.24)]'
                  } flex items-center justify-center`}
                >
                  {marcado && <Check size={10} color="#fff" />}
                </span>
                <span className="truncate">Setor {s.id} — {s.nome}</span>
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </>
  )
}
