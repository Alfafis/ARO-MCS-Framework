import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronUp, ChevronDown, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/useLang'
import { categoriasT } from '@/i18n/categorias'
import { useProjeto } from '@/context/useProjeto'
import { maskMoedaBR, parseMoedaBR, formatMoedaBR, maskNumeroBR } from '@/lib/financeiro'
import type { Category, CategoryItem, CampoOperacional, CampoOperacionalTemplate, DesembolsoAno } from '@/types/categorias'
import type { Fase } from '@/types/setores'
import type { CategoryParam } from '@/lib/aroSimulacao'
import CategoryAroSimStatsCard from '@/components/categorias/CategoryAroSimStatsCard'

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
  // Campos operacionais template — só ativos no editor de template
  // (/categorias-custo). Ausentes = seção não renderiza.
  onAddCampoOp?:    () => void
  onRemoveCampoOp?: (campoId: string) => void
  onUpdateCampoOp?: (campoId: string, field: keyof CampoOperacionalTemplate, value: string) => void
  onSaveCampoOp?:   (campoId: string, field: keyof CampoOperacionalTemplate, value: string) => void
  // Campos operacionais do projeto — só ativos no workspace do projeto
  // (/projetos/:id/categorias). Shape diferente do template: tem `valor` livre
  // + `status` (pendente/preenchido). Ausentes = seção não renderiza.
  onAddCampoOpProjeto?:    () => void
  onRemoveCampoOpProjeto?: (campoId: string) => void
  onUpdateCampoOpProjeto?: (campoId: string, field: keyof CampoOperacional, value: string) => void
  onSaveCampoOpProjeto?:   (campoId: string, field: keyof CampoOperacional, value: string) => void
  // Moda "pela experiência" da categoria (F18 da planilha) — alimenta o
  // parâmetro `mode` da Aro Simulação Triangular. null = fallback (min+max)/2.
  onSaveCustoProvavel?: (valor: number | null) => void
  // Detalhamento de desembolso por ano do item — array `[{ano, valor}]`.
  // Se ausente, o toggle "detalhar por ano" nem aparece na linha do item.
  onSaveDesembolso?:    (itemId: string, valores: DesembolsoAno[]) => void
  // Horizonte do projeto — número de anos exibidos no detalhamento (1..N).
  // Default 10 quando não passado (compatibilidade com editor de template).
  horizonYears?:        number
  // Parâmetros da Aro Simulação desta categoria (min/mode/max já escalados pela ancoragem)
  // — quando presente, renderiza o card "Estatísticas Aro Simulação" no fim do body.
  // Ausente = card não aparece (usado só na tela de projeto, não no template).
  simParam?:             CategoryParam
}

const PREENCHE_OPTIONS: Category['preenche'][] = ['Consultor', 'Cliente', 'Ambos']
const PREENCHE_BADGE_VARIANT: Record<Category['preenche'], 'default' | 'warning' | 'accent'> = {
  Consultor: 'default',
  Cliente:   'warning',
  Ambos:     'accent',
}

export default function CategoryBlock({ category, nome, index, onRemove, onChange, onRename, onCancelRename, onAddItem, onRemoveItem, onUpdateItem, onSaveItem, onAddCampoOp, onRemoveCampoOp, onUpdateCampoOp, onSaveCampoOp, onAddCampoOpProjeto, onRemoveCampoOpProjeto, onUpdateCampoOpProjeto, onSaveCampoOpProjeto, onSaveCustoProvavel, onSaveDesembolso, horizonYears, simParam }: Props) {
  const camposOpEnabled = !!(onAddCampoOp && onRemoveCampoOp && onUpdateCampoOp && onSaveCampoOp)
  const camposOpProjetoEnabled = !!(onAddCampoOpProjeto && onRemoveCampoOpProjeto && onUpdateCampoOpProjeto && onSaveCampoOpProjeto)
  const camposOp = category.camposOperacionaisTemplate ?? []
  const camposOpProjeto = category.camposOperacionais ?? []
  const horizon = horizonYears ?? 10
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

          {onSaveCustoProvavel && (
            <CustoProvavelRow
              value={category.custoProvavel}
              onSave={onSaveCustoProvavel}
              label={t.custoProvavelLabel}
              placeholder={t.custoProvavelPh}
              hint={t.custoProvavelHint}
            />
          )}

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
              horizon={horizon}
              onUpdateItem={onUpdateItem}
              onSaveItem={onSaveItem}
              onRemoveItem={onRemoveItem}
              onSaveDesembolso={onSaveDesembolso}
            />
          ))}

          <button
            className="text-[0.8125rem] font-medium text-c-text-2 hover:text-accent transition-colors cursor-pointer bg-transparent border-none py-2 px-1.5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
            onClick={onAddItem}
          >
            {t.addItem}
          </button>

          {camposOpEnabled && (
            <div className="mt-4 pt-3 border-t border-[rgba(20,21,26,.08)] flex flex-col gap-1.5">
              <div className="text-[0.75rem] font-semibold tracking-wide uppercase text-c-text-2 mb-1">
                {t.camposOpTitle}
              </div>

              <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_28px] gap-2 px-1 pb-1 text-[0.7rem] font-semibold tracking-wide uppercase text-c-text-2">
                <span>{t.camposOpColLabel}</span>
                <span>{t.camposOpColUnidade}</span>
                <span>{t.camposOpColValorRef}</span>
                <span></span>
              </div>

              {camposOp.map(campo => (
                <CampoOpRow
                  key={campo.id}
                  campo={campo}
                  onUpdate={(field, value) => onUpdateCampoOp!(campo.id, field, value)}
                  onSave={(field, value) => onSaveCampoOp!(campo.id, field, value)}
                  onRemove={() => onRemoveCampoOp!(campo.id)}
                  removeLabel={t.camposOpRemove}
                />
              ))}

              <button
                className="text-[0.8125rem] font-medium text-c-text-2 hover:text-accent transition-colors cursor-pointer bg-transparent border-none py-2 px-1.5 self-start focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
                onClick={onAddCampoOp}
              >
                {t.camposOpAdd}
              </button>
            </div>
          )}

          {camposOpProjetoEnabled && (
            <div className="mt-4 pt-3 border-t border-[rgba(20,21,26,.08)] flex flex-col gap-1.5">
              <div className="text-[0.75rem] font-semibold tracking-wide uppercase text-c-text-2 mb-1">
                {t.camposOpTitle}
              </div>

              <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_28px] gap-2 px-1 pb-1 text-[0.7rem] font-semibold tracking-wide uppercase text-c-text-2">
                <span>{t.camposOpColLabel}</span>
                <span>{t.camposOpColUnidade}</span>
                <span>{t.camposOpColValor}</span>
                <span>{t.camposOpColStatus}</span>
                <span></span>
              </div>

              {camposOpProjeto.map(campo => (
                <CampoOpProjetoRow
                  key={campo.id}
                  campo={campo}
                  onUpdate={(field, value) => onUpdateCampoOpProjeto!(campo.id, field, value)}
                  onSave={(field, value) => onSaveCampoOpProjeto!(campo.id, field, value)}
                  onRemove={() => onRemoveCampoOpProjeto!(campo.id)}
                  removeLabel={t.camposOpRemove}
                  statusPendenteLabel={t.camposOpStatusPendente}
                  statusPreenchidoLabel={t.camposOpStatusPreenchido}
                />
              ))}

              <button
                className="text-[0.8125rem] font-medium text-c-text-2 hover:text-accent transition-colors cursor-pointer bg-transparent border-none py-2 px-1.5 self-start focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
                onClick={onAddCampoOpProjeto}
              >
                {t.camposOpAdd}
              </button>
            </div>
          )}

          {simParam && <CategoryAroSimStatsCard param={simParam} />}
          </div>
        </div>
      )}
    </div>
  )
}

interface CampoOpRowProps {
  campo:       CampoOperacionalTemplate
  onUpdate:    (field: keyof CampoOperacionalTemplate, value: string) => void
  onSave:      (field: keyof CampoOperacionalTemplate, value: string) => void
  onRemove:    () => void
  removeLabel: string
}

function CampoOpRow({ campo, onUpdate, onSave, onRemove, removeLabel }: CampoOpRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_28px] gap-2 items-center">
      <input
        className="row-input"
        value={campo.label}
        onChange={e => onUpdate('label', e.target.value)}
        onBlur={e => onSave('label', e.target.value)}
        aria-label="Nome do campo operacional"
      />
      <select
        className="row-input cursor-pointer bg-transparent"
        value={UNIDADES.includes(campo.unidade) ? campo.unidade : ''}
        onChange={e => { onUpdate('unidade', e.target.value); onSave('unidade', e.target.value) }}
        aria-label="Unidade do campo"
      >
        <option value=""></option>
        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <input
        className="row-input mono"
        value={campo.valorReferencia}
        inputMode="decimal"
        onChange={e => onUpdate('valorReferencia', maskNumeroBR(e.target.value))}
        onBlur={e => onSave('valorReferencia', maskNumeroBR(e.target.value))}
        aria-label="Valor de referência"
      />
      <Button variant="icon-danger" onClick={onRemove} aria-label={removeLabel}>
        <Trash2 size={13} aria-hidden="true" />
      </Button>
    </div>
  )
}

interface CampoOpProjetoRowProps {
  campo:                  CampoOperacional
  onUpdate:               (field: keyof CampoOperacional, value: string) => void
  onSave:                 (field: keyof CampoOperacional, value: string) => void
  onRemove:               () => void
  removeLabel:            string
  statusPendenteLabel:    string
  statusPreenchidoLabel:  string
}

function CampoOpProjetoRow({ campo, onUpdate, onSave, onRemove, removeLabel, statusPendenteLabel, statusPreenchidoLabel }: CampoOpProjetoRowProps) {
  function toggleStatus() {
    const proximo: CampoOperacional['status'] = campo.status === 'preenchido' ? 'pendente' : 'preenchido'
    onUpdate('status', proximo)
    onSave('status', proximo)
  }
  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_28px] gap-2 items-center">
      <input
        className="row-input"
        value={campo.label}
        onChange={e => onUpdate('label', e.target.value)}
        onBlur={e => onSave('label', e.target.value)}
        aria-label="Nome do campo operacional"
      />
      <select
        className="row-input cursor-pointer bg-transparent"
        value={UNIDADES.includes(campo.unidade) ? campo.unidade : ''}
        onChange={e => { onUpdate('unidade', e.target.value); onSave('unidade', e.target.value) }}
        aria-label="Unidade do campo"
      >
        <option value=""></option>
        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <input
        className="row-input mono"
        value={campo.valor}
        inputMode="decimal"
        onChange={e => onUpdate('valor', maskNumeroBR(e.target.value))}
        onBlur={e => onSave('valor', maskNumeroBR(e.target.value))}
        aria-label="Valor preenchido"
      />
      <button
        type="button"
        onClick={toggleStatus}
        className="cursor-pointer bg-transparent border-none p-0 text-left focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
        aria-label="Alternar status"
      >
        <Badge variant={campo.status === 'preenchido' ? 'accent' : 'warning'}>
          {campo.status === 'preenchido' ? statusPreenchidoLabel : statusPendenteLabel}
        </Badge>
      </button>
      <Button variant="icon-danger" onClick={onRemove} aria-label={removeLabel}>
        <Trash2 size={13} aria-hidden="true" />
      </Button>
    </div>
  )
}

// ============================================================================
// ItemRow — uma linha da tabela de itens. Extraída pra encapsular estado local
// dos selects (multi-select de setores) sem poluir o CategoryBlock.
// ============================================================================
interface ItemRowProps {
  item:              CategoryItem
  t:                 typeof categoriasT['pt-BR']
  horizon:           number
  onUpdateItem:      (itemId: string, field: keyof CategoryItem, value: unknown) => void
  onSaveItem:        (itemId: string, field: keyof CategoryItem, value: unknown) => void
  onRemoveItem:      (itemId: string) => void
  onSaveDesembolso?: (itemId: string, valores: DesembolsoAno[]) => void
}

function ItemRow({ item, t, horizon, onUpdateItem, onSaveItem, onRemoveItem, onSaveDesembolso }: ItemRowProps) {
  const detalhamentoAtivo = !!item.desembolsoPorAno && item.desembolsoPorAno.length > 0
  const [detalhamentoAberto, setDetalhamentoAberto] = useState(detalhamentoAtivo)

  // Save + update em um passo — usado em controles que emitem valor final
  // (select, multi-select, input number). Diferente de digitação livre, aqui
  // não faz sentido separar update local e save no blur.
  function commit<K extends keyof CategoryItem>(field: K, value: unknown) {
    onUpdateItem(item.id, field, value)
    onSaveItem(item.id, field, value)
  }

  return (
    <div className="flex flex-col">
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

    {onSaveDesembolso && (
      <DesembolsoToggleAndPanel
        item={item}
        t={t}
        horizon={horizon}
        aberto={detalhamentoAberto}
        onToggleAberto={() => setDetalhamentoAberto(a => !a)}
        onSave={valores => onSaveDesembolso(item.id, valores)}
      />
    )}
    </div>
  )
}

// ============================================================================
// CustoProvavelRow — input de moda "pela experiência" da categoria.
// Renderizado uma vez por categoria (não por item), aparece só quando o
// consumidor passa `onSaveCustoProvavel`. Máscara BR + parse ao salvar.
// ============================================================================
interface CustoProvavelRowProps {
  value:       number | null
  onSave:      (valor: number | null) => void
  label:       string
  placeholder: string
  hint:        string
}

function CustoProvavelRow({ value, onSave, label, placeholder, hint }: CustoProvavelRowProps) {
  const [texto, setTexto] = useState(value === null ? '' : formatMoedaBR(value))

  // Sincroniza quando o valor externo muda (ex: carregar template)
  useEffect(() => {
    setTexto(value === null ? '' : formatMoedaBR(value))
  }, [value])

  function commit() {
    const parsed = parseMoedaBR(texto)
    if (texto.trim() === '' || parsed === 0) {
      setTexto('')
      onSave(null)
      return
    }
    setTexto(formatMoedaBR(parsed))
    onSave(parsed)
  }

  return (
    <div className="flex items-center gap-2 py-2 mb-2 border-b border-[rgba(20,21,26,.06)]">
      <label className="text-[0.75rem] font-semibold uppercase tracking-wide text-c-text-2">
        {label}
      </label>
      <input
        className="row-input mono max-w-[180px]"
        value={texto}
        inputMode="decimal"
        placeholder={placeholder}
        onChange={e => setTexto(maskMoedaBR(e.target.value))}
        onBlur={commit}
        aria-label={label}
      />
      <span className="text-[0.7rem] text-c-text-2/70 truncate">{hint}</span>
    </div>
  )
}

// ============================================================================
// DesembolsoToggleAndPanel — botão "Detalhar por ano" + painel expandido com N
// inputs de moeda (N = horizon). Fecha sozinho se limpar todos os valores.
// Ao salvar, envia sempre o array completo dos anos com valor > 0.
// ============================================================================
interface DesembolsoToggleAndPanelProps {
  item:           CategoryItem
  t:              typeof categoriasT['pt-BR']
  horizon:        number
  aberto:         boolean
  onToggleAberto: () => void
  onSave:         (valores: DesembolsoAno[]) => void
}

function DesembolsoToggleAndPanel({ item, t, horizon, aberto, onToggleAberto, onSave }: DesembolsoToggleAndPanelProps) {
  // State local por ano: string livre pra permitir digitação com máscara.
  // Inicializa do item.desembolsoPorAno se existir; senão, string vazia.
  const [textos, setTextos] = useState<string[]>(() => {
    const arr = new Array<string>(horizon).fill('')
    for (const d of item.desembolsoPorAno ?? []) {
      if (d.ano >= 1 && d.ano <= horizon) arr[d.ano - 1] = formatMoedaBR(d.valor)
    }
    return arr
  })

  // Se `horizon` ou `item.desembolsoPorAno` mudarem por baixo (mudou config
  // do projeto ou save otimista), re-sincroniza.
  useEffect(() => {
    const arr = new Array<string>(horizon).fill('')
    for (const d of item.desembolsoPorAno ?? []) {
      if (d.ano >= 1 && d.ano <= horizon) arr[d.ano - 1] = formatMoedaBR(d.valor)
    }
    setTextos(arr)
  }, [item.desembolsoPorAno, horizon])

  function saveAll(next: string[]) {
    const valores: DesembolsoAno[] = []
    for (let i = 0; i < next.length; i++) {
      const v = parseMoedaBR(next[i])
      if (v > 0) valores.push({ ano: i + 1, valor: v })
    }
    onSave(valores)
  }

  function updateAno(index: number, valor: string) {
    setTextos(prev => {
      const next = [...prev]
      next[index] = valor
      return next
    })
  }

  function commitAno(index: number) {
    const parsed = parseMoedaBR(textos[index])
    const normalized = parsed === 0 ? '' : formatMoedaBR(parsed)
    const next = [...textos]
    next[index] = normalized
    setTextos(next)
    saveAll(next)
  }

  function clearAll() {
    const cleared = new Array<string>(horizon).fill('')
    setTextos(cleared)
    saveAll(cleared)
  }

  const custoMax = parseMoedaBR(item.max)
  const soma = textos.reduce((acc, txt) => acc + parseMoedaBR(txt), 0)
  const diff = custoMax - soma
  const somaEmDinheiro = formatMoedaBR(soma)
  const status = custoMax > 0
    ? (Math.abs(diff) < 0.5 ? t.desembolsoTargetOk : t.desembolsoMismatch(formatMoedaBR(Math.abs(diff))))
    : ''

  return (
    <div className="pl-2 pr-2 pb-2">
      <button
        type="button"
        onClick={onToggleAberto}
        className="text-[0.72rem] font-medium text-c-text-2 hover:text-accent transition-colors cursor-pointer bg-transparent border-none py-1 px-1 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
        aria-expanded={aberto}
      >
        {aberto ? '▾ ' : '▸ '}{t.desembolsoToggle}
      </button>

      {aberto && (
        <div className="mt-2 p-3 rounded-[8px] bg-[#faf9f8] border border-[rgba(20,21,26,.06)]">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(horizon, 5)}, minmax(0, 1fr))` }}>
            {textos.map((valor, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-semibold uppercase tracking-wide text-c-text-2">
                  {t.desembolsoLabel(i + 1)}
                </label>
                <input
                  className="row-input mono"
                  value={valor}
                  inputMode="decimal"
                  onChange={e => updateAno(i, maskMoedaBR(e.target.value))}
                  onBlur={() => commitAno(i)}
                  aria-label={t.desembolsoLabel(i + 1)}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-[rgba(20,21,26,.06)] flex items-center gap-3 flex-wrap">
            <span className="text-[0.72rem] text-c-text-2">
              <strong className="text-c-text font-semibold">{t.desembolsoSum}:</strong>{' '}
              <span className="font-mono">{somaEmDinheiro}</span>
            </span>
            {status && (
              <span className={`text-[0.7rem] ${Math.abs(diff) < 0.5 ? 'text-emerald-600' : 'text-amber-700'}`}>
                {status}
              </span>
            )}
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto text-[0.7rem] font-medium text-c-text-2 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none px-2 py-1 rounded focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {t.desembolsoClearAll}
            </button>
          </div>
        </div>
      )}
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
