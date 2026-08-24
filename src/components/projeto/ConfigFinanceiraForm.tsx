import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CustomSelect from '@/components/categorias/CustomSelect'
import { useT } from '@/i18n/useLang'
import { configFinanceiraT } from '@/i18n/config-financeira'
import type { ConfigFinanceiraForm as ConfigFinanceiraFormValue } from '@/context/ProjetoContext'

const MOEDA_OPTIONS = [
  { value: 'brl', label: 'BRL — Real' },
  { value: 'usd', label: 'USD — Dólar' },
]

interface Props {
  initial: ConfigFinanceiraFormValue
  onSalvar: (form: ConfigFinanceiraFormValue) => Promise<void>
  primaryLabel: string
  secondaryAction?: { label: string, onClick: () => void }
  onValorInvalido: () => void
  // 'filled' (default) é pra dentro de card branco (aba Configurações) — mesmo fundo cinza usado
  // em todo formulário sobre card. 'default' é pra tela cheia sem card (wizard): fundo branco +
  // borda, senão o campo desaparece contra o cinza da página (mesmo bug já corrigido uma vez,
  // ver ADR "input sem contraste"). CustomSelect (moeda/método) não muda — já é branco+sombra,
  // desenhado pra contrastar direto contra a página cinza, não precisa de variant.
  variant?: 'filled' | 'default'
}

// Formulário compartilhado entre o step 2 do wizard (/projetos/:id/config-inicial) e a aba
// "Configurações" do workspace do projeto — mesmos campos, mesma RPC, só muda o rótulo do botão
// principal e se existe uma ação secundária (o wizard tem "Pular por agora", a aba de edição não).
export default function ConfigFinanceiraForm({ initial, onSalvar, primaryLabel, secondaryAction, onValorInvalido, variant = 'filled' }: Props) {
  const t = useT(configFinanceiraT)
  const METODO_OPTIONS = [
    { value: 'a-definir', label: t.metodoADefinir },
    { value: 'simples', label: t.metodoSimples },
    { value: 'compostos', label: t.metodoCompostos },
    { value: 'inflacao', label: t.metodoInflacao },
    { value: 'escalonamento', label: t.metodoEscalonamento },
  ]

  const [moeda, setMoeda] = useState(initial.moeda)
  const [dataBase, setDataBase] = useState(initial.dataBase)
  const [horizonteAnos, setHorizonteAnos] = useState(String(initial.horizonteAnos))
  const [metodoAtualizacao, setMetodoAtualizacao] = useState(initial.metodoAtualizacao)
  const [contingenciaPct, setContingenciaPct] = useState(String(initial.contingenciaPct))
  const [salvando, setSalvando] = useState(false)
  const [moedaOpen, setMoedaOpen] = useState(false)
  const [metodoOpen, setMetodoOpen] = useState(false)
  const moedaRef = useRef<HTMLDivElement>(null)
  const metodoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!moedaRef.current?.contains(e.target as Node)) setMoedaOpen(false)
      if (!metodoRef.current?.contains(e.target as Node)) setMetodoOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  async function handleSalvar() {
    const horizonte = Number(horizonteAnos)
    const contingencia = Number(contingenciaPct.replace(',', '.'))
    if (!Number.isFinite(horizonte) || horizonte < 1 || horizonte > 20) return onValorInvalido()
    if (!Number.isFinite(contingencia) || contingencia < 0 || contingencia > 100) return onValorInvalido()
    if (!/^\d{4}$/.test(dataBase)) return onValorInvalido()

    setSalvando(true)
    try {
      await onSalvar({
        moeda, dataBase, horizonteAnos: horizonte, metodoAtualizacao, contingenciaPct: contingencia,
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5" ref={moedaRef}>
        <Label htmlFor="cf-moeda">{t.labelMoeda}</Label>
        <CustomSelect
          id="cf-moeda"
          options={MOEDA_OPTIONS}
          value={moeda}
          onChange={setMoeda}
          isOpen={moedaOpen}
          onToggle={() => setMoedaOpen(o => !o)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-data-base">{t.labelDataBase}</Label>
        <Input
          id="cf-data-base"
          variant={variant}
          inputMode="numeric"
          maxLength={4}
          value={dataBase}
          onChange={e => setDataBase(e.target.value.replace(/\D/g, ''))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-horizonte">{t.labelHorizonte}</Label>
        <Input
          id="cf-horizonte"
          variant={variant}
          inputMode="numeric"
          value={horizonteAnos}
          onChange={e => setHorizonteAnos(e.target.value.replace(/\D/g, ''))}
        />
        <p className="text-[11.5px] text-c-text-2">{t.helpHorizonte}</p>
      </div>

      <div className="flex flex-col gap-1.5" ref={metodoRef}>
        <Label htmlFor="cf-metodo">{t.labelMetodo}</Label>
        <CustomSelect
          id="cf-metodo"
          options={METODO_OPTIONS}
          value={metodoAtualizacao}
          onChange={setMetodoAtualizacao}
          isOpen={metodoOpen}
          onToggle={() => setMetodoOpen(o => !o)}
        />
        <p className="text-[11.5px] text-c-text-2">{t.helpMetodo}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-contingencia">{t.labelContingencia}</Label>
        <Input
          id="cf-contingencia"
          variant={variant}
          inputMode="decimal"
          value={contingenciaPct}
          onChange={e => setContingenciaPct(e.target.value.replace(/[^\d,.-]/g, ''))}
        />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        {secondaryAction && (
          <Button variant="ghost" disabled={salvando} onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
        <Button variant="primary" disabled={salvando} onClick={handleSalvar}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}
