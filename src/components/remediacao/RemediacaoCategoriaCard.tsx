import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/i18n/useLang'
import { remediacaoT } from '@/i18n/remediacao'
import { formatMoedaCompact } from '@/lib/financeiro'

// Compartilhado entre Remediacao.tsx (por-projeto, `/projetos/:id/remediacao`)
// e RemediacaoPadrao.tsx (template admin, `/remediacao-padrao`) — mesmo shape
// de campos editáveis nos dois (CategoriaRemediacao/CategoriaRemediacaoTemplate
// e ItemRemediacao/ItemRemediacaoTemplate só diferem na FK, que este
// componente nunca toca). Shape mínimo via Pick-like local, não generic —
// TS permite objeto com campos extras satisfazer a prop.
export interface ItemLike {
  id: string
  descricao: string
  unidade: string
  quantidade: number
  custoUnitMin: number
  custoUnitMax: number
  fonte: string | null
}

export interface CategoriaLike {
  id: string
  nome: string
  areaHa: number | null
  items: ItemLike[]
}

// Formatação BR pra números decimais (área, quantidade). Aceita ponto e vírgula
// na entrada e devolve string com vírgula pra exibição.
const parseDecimalBR = (s: string): number | null => {
  if (s.trim() === '') return null
  const n = Number(s.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
const fmtDecimalBR = (n: number, casas = 2): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

const custoUnitMedio = (item: ItemLike): number => (item.custoUnitMin + item.custoUnitMax) / 2
const custoTotalItem = (item: ItemLike): number => item.quantidade * custoUnitMedio(item)
const custoTotalCategoria = (cat: CategoriaLike): number => cat.items.reduce((acc, i) => acc + custoTotalItem(i), 0)

interface CategoriaCardProps {
  cat: CategoriaLike
  onRenameCategoria: (nome: string) => void
  onChangeArea: (areaHa: number | null) => void
  onRemoveCategoria: () => void
  onAddItem: () => void
  onUpdateItem: (
    id: string,
    patch: Partial<Pick<ItemLike, 'descricao' | 'unidade' | 'quantidade' | 'custoUnitMin' | 'custoUnitMax' | 'fonte'>>
  ) => void
  onRemoveItem: (id: string) => void
}

export function CategoriaCard({
  cat,
  onRenameCategoria,
  onChangeArea,
  onRemoveCategoria,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: CategoriaCardProps) {
  const t = useT(remediacaoT)
  const [nome, setNome] = useState(cat.nome)
  const [areaStr, setAreaStr] = useState(cat.areaHa != null ? fmtDecimalBR(cat.areaHa) : '')
  useEffect(() => setNome(cat.nome), [cat.nome])
  useEffect(() => setAreaStr(cat.areaHa != null ? fmtDecimalBR(cat.areaHa) : ''), [cat.areaHa])

  const total = custoTotalCategoria(cat)

  return (
    <div className="card animate-[catIn_320ms_cubic-bezier(.2,.8,.2,1)]">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1 flex-1 min-w-[240px]">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-c-text-2">{t.categoriaNome}</label>
          <Input
            variant="filled"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={() => {
              if (nome.trim() && nome !== cat.nome) onRenameCategoria(nome.trim())
            }}
          />
        </div>
        <div className="flex flex-col gap-1 w-[140px]">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-c-text-2">{t.categoriaArea}</label>
          <Input
            variant="filled"
            value={areaStr}
            onChange={(e) => setAreaStr(e.target.value)}
            onBlur={() => {
              const parsed = parseDecimalBR(areaStr)
              if (parsed !== cat.areaHa) onChangeArea(parsed)
            }}
            placeholder="—"
            inputMode="decimal"
          />
        </div>
        <Button
          variant="icon-danger"
          onClick={onRemoveCategoria}
          aria-label={t.categoriaRemove}
          title={t.categoriaRemove}
        >
          <Trash2 size={14} aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-2 min-w-[880px] items-center"
          style={{ gridTemplateColumns: 'minmax(220px, 2fr) 80px 90px 120px 120px 120px minmax(120px, 1fr) 36px' }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pb-1.5">
            {t.colDescricao}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pb-1.5 text-center">
            {t.colUnidade}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pb-1.5 text-right">
            {t.colQuantidade}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pb-1.5 text-right">
            {t.colCustoUnitMin}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pb-1.5 text-right">
            {t.colCustoUnitMax}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pb-1.5 text-right">
            {t.colTotal}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-c-text-2 pb-1.5">{t.colFonte}</div>
          <div className="pb-1.5" />

          {cat.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={(patch) => onUpdateItem(item.id, patch)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-c-line">
        <Button variant="ghost" onClick={onAddItem}>
          <Plus size={13} aria-hidden="true" />
          {t.addItem}
        </Button>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-c-text-2">{t.categoriaTotal}</span>
          <span className="font-mono text-[14px] font-bold text-c-text">{formatMoedaCompact(total)}</span>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// ItemRow — 8 células dentro do grid da categoria. Blur commita cada campo.
// --------------------------------------------------------------------------
interface ItemRowProps {
  item: ItemLike
  onUpdate: (
    patch: Partial<Pick<ItemLike, 'descricao' | 'unidade' | 'quantidade' | 'custoUnitMin' | 'custoUnitMax' | 'fonte'>>
  ) => void
  onRemove: () => void
}

function ItemRow({ item, onUpdate, onRemove }: ItemRowProps) {
  const t = useT(remediacaoT)
  const [descricao, setDescricao] = useState(item.descricao)
  const [unidade, setUnidade] = useState(item.unidade)
  const [qtdStr, setQtdStr] = useState(fmtDecimalBR(item.quantidade, item.quantidade % 1 === 0 ? 0 : 3))
  const [custoMinStr, setCustoMinStr] = useState(fmtDecimalBR(item.custoUnitMin))
  const [custoMaxStr, setCustoMaxStr] = useState(fmtDecimalBR(item.custoUnitMax))
  const [fonte, setFonte] = useState(item.fonte ?? '')

  useEffect(() => setDescricao(item.descricao), [item.descricao])
  useEffect(() => setUnidade(item.unidade), [item.unidade])
  useEffect(() => setQtdStr(fmtDecimalBR(item.quantidade, item.quantidade % 1 === 0 ? 0 : 3)), [item.quantidade])
  useEffect(() => setCustoMinStr(fmtDecimalBR(item.custoUnitMin)), [item.custoUnitMin])
  useEffect(() => setCustoMaxStr(fmtDecimalBR(item.custoUnitMax)), [item.custoUnitMax])
  useEffect(() => setFonte(item.fonte ?? ''), [item.fonte])

  const commitQtd = () => {
    const n = parseDecimalBR(qtdStr) ?? 0
    if (n !== item.quantidade) onUpdate({ quantidade: n })
  }
  const commitMin = () => {
    const n = parseDecimalBR(custoMinStr) ?? 0
    if (n !== item.custoUnitMin) {
      const patch: Partial<Pick<ItemLike, 'custoUnitMin' | 'custoUnitMax'>> = { custoUnitMin: n }
      if (n > item.custoUnitMax) patch.custoUnitMax = n
      onUpdate(patch)
    }
  }
  const commitMax = () => {
    const n = parseDecimalBR(custoMaxStr) ?? 0
    if (n !== item.custoUnitMax) {
      const patch: Partial<Pick<ItemLike, 'custoUnitMax'>> = { custoUnitMax: Math.max(n, item.custoUnitMin) }
      onUpdate(patch)
    }
  }

  return (
    <>
      <Input
        variant="filled"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        onBlur={() => {
          if (descricao !== item.descricao) onUpdate({ descricao })
        }}
      />
      <Input
        variant="filled"
        value={unidade}
        onChange={(e) => setUnidade(e.target.value)}
        onBlur={() => {
          if (unidade !== item.unidade) onUpdate({ unidade })
        }}
        className="text-center"
      />
      <Input
        variant="filled"
        value={qtdStr}
        onChange={(e) => setQtdStr(e.target.value)}
        onBlur={commitQtd}
        inputMode="decimal"
        className="text-right font-mono"
      />
      <Input
        variant="filled"
        value={custoMinStr}
        onChange={(e) => setCustoMinStr(e.target.value)}
        onBlur={commitMin}
        inputMode="decimal"
        className="text-right font-mono"
      />
      <Input
        variant="filled"
        value={custoMaxStr}
        onChange={(e) => setCustoMaxStr(e.target.value)}
        onBlur={commitMax}
        inputMode="decimal"
        className="text-right font-mono"
      />
      <div className="text-right font-mono text-[12px] font-bold text-c-text px-1">
        {formatMoedaCompact(custoTotalItem(item))}
      </div>
      <Input
        variant="filled"
        value={fonte}
        onChange={(e) => setFonte(e.target.value)}
        onBlur={() => {
          if (fonte !== (item.fonte ?? '')) onUpdate({ fonte: fonte.trim() || null })
        }}
        placeholder="—"
      />
      <Button variant="icon-danger" onClick={onRemove} aria-label={t.itemRemove}>
        <Trash2 size={13} aria-hidden="true" />
      </Button>
    </>
  )
}
