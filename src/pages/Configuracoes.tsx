import { Fragment, useEffect, useRef, useState } from 'react'
import { Check, Plus, RefreshCw, Settings2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/LangContext'
import { configuracoesT } from '@/i18n/configuracoes'
import { useProjeto } from '@/context/ProjetoContext'
import type { TipoProjeto } from '@/data/categoria-templates'
import type { ParametroGlobal, ParametroGlobalChave, ParametroAnual, ParametroAnualChave } from '@/types/parametrosGlobais'
import { isNaoConfigurado } from '@/types/parametrosGlobais'
import { SERIE_BCB, SERIE_BCB_ANUAL, buscarValorBcb } from '@/lib/bcb'
import { formatRelativeTime } from '@/lib/utils'

interface TipoRowProps {
  tipo: TipoProjeto
  onRename: (novoNome: string) => Promise<void>
  onRemove: () => void
}

// Mesmo padrão de inline-rename do CategoryBlock (Categorias.tsx): campo
// sempre editável, ícones de confirmar/cancelar só aparecem com edição em
// andamento, clique fora cancela — nunca salva sozinho no blur (era o
// comportamento anterior, e escondia a ação real do usuário).
function TipoRow({ tipo, onRename, onRemove }: TipoRowProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const isEditing = editing !== null
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditing) return
    function onMouseDown(e: MouseEvent) {
      if (editRef.current?.contains(e.target as Node)) return
      setEditing(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isEditing])

  async function confirmRename() {
    const trimmed = (editing ?? '').trim()
    setEditing(null)
    if (trimmed && trimmed !== tipo.nome) await onRename(trimmed)
  }

  function cancelRename() {
    setEditing(null)
  }

  return (
    <div className="flex items-center gap-2 py-1.5" ref={editRef}>
      <Input
        variant="filled"
        value={editing ?? tipo.nome}
        onChange={e => setEditing(e.target.value)}
        onFocus={() => setEditing(tipo.nome)}
        onKeyDown={e => {
          if (e.key === 'Enter') confirmRename()
          if (e.key === 'Escape') cancelRename()
        }}
        aria-label={tipo.nome}
      />
      {isEditing && (
        <>
          <Button variant="icon-btn" onClick={confirmRename} aria-label="Confirmar novo nome">
            <Check size={14} aria-hidden="true" />
          </Button>
          <Button variant="icon-danger" onClick={cancelRename} aria-label="Cancelar alteração">
            <X size={14} aria-hidden="true" />
          </Button>
        </>
      )}
      <Button variant="icon-danger" onClick={onRemove} aria-label="Remover tipo">
        <Trash2 size={14} aria-hidden="true" />
      </Button>
    </div>
  )
}

const PARAMETRO_ORDEM: ParametroGlobalChave[] = ['cambio_usd_brl']
const PARAMETRO_ANUAL_ORDEM: ParametroAnualChave[] = ['inflacao_ipca', 'selic']
const ANOS_TABELA = Array.from({ length: 20 }, (_, i) => i + 1)

// Formato de exibição: câmbio é preço (R$ por USD), inflação/Selic são taxa —
// mesmo valor bruto do banco (4.44 = 4,44%), só muda o sufixo.
function formatParametroValor(chave: ParametroGlobalChave, valor: number): string {
  if (chave === 'cambio_usd_brl') return `R$ ${valor.toFixed(4).replace('.', ',')}`
  return `${valor.toFixed(2).replace('.', ',')}%`
}

interface ParametroRowProps {
  parametro: ParametroGlobal
  label: string
  t: typeof configuracoesT['pt-BR']
  onSalvar: (valor: number, fonte: ParametroGlobal['fonte'], serieBcb: number | null) => Promise<void>
  onValorInvalido: () => void
  onBuscaFalhou: () => void
}

function ParametroRow({ parametro, label, t, onSalvar, onValorInvalido, onBuscaFalhou }: ParametroRowProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [buscando, setBuscando] = useState(false)
  const isEditing = editing !== null
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditing) return
    function onMouseDown(e: MouseEvent) {
      if (editRef.current?.contains(e.target as Node)) return
      setEditing(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isEditing])

  async function confirmEdicao() {
    const raw = (editing ?? '').trim().replace(',', '.')
    const valor = Number(raw)
    if (raw === '' || !Number.isFinite(valor)) {
      onValorInvalido()
      return
    }
    setEditing(null)
    await onSalvar(valor, 'manual', null)
  }

  async function atualizarDaApi() {
    setBuscando(true)
    try {
      const serie = SERIE_BCB[parametro.chave]
      let valor: number
      try {
        valor = await buscarValorBcb(serie)
      } catch {
        onBuscaFalhou()
        return
      }
      await onSalvar(valor, 'bcb-sgs', serie)
    } finally {
      setBuscando(false)
    }
  }

  const naoConfigurado = isNaoConfigurado(parametro)

  return (
    <div className="flex items-center gap-2 py-2 border-b border-[rgba(20,21,26,.04)] last:border-b-0">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] font-medium text-c-text">{label}</span>
        {!naoConfigurado && (
          <span className="text-[11px] text-c-text-2">
            {parametro.fonte === 'bcb-sgs' ? t.fonteBcb : t.fonteManual} · {formatRelativeTime(parametro.atualizadoEm)}
          </span>
        )}
      </div>
      {isEditing ? (
        <div className="flex items-center gap-2" ref={editRef}>
          <Input
            variant="filled"
            className="w-28"
            autoFocus
            value={editing}
            onChange={e => setEditing(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void confirmEdicao()
              if (e.key === 'Escape') setEditing(null)
            }}
            aria-label={label}
          />
          <Button variant="icon-btn" onClick={confirmEdicao} aria-label="Confirmar valor">
            <Check size={14} aria-hidden="true" />
          </Button>
          <Button variant="icon-danger" onClick={() => setEditing(null)} aria-label="Cancelar edição">
            <X size={14} aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3" ref={editRef}>
          <button
            type="button"
            className="text-[13px] font-semibold text-c-text hover:text-[var(--accent)] transition-colors"
            onClick={() => setEditing(String(parametro.valor))}
          >
            {naoConfigurado ? t.naoConfigurado : formatParametroValor(parametro.chave, parametro.valor)}
          </button>
          <Button variant="icon-btn" disabled={buscando} onClick={atualizarDaApi} aria-label={t.atualizarDaApi} title={t.atualizarDaApi}>
            <RefreshCw size={14} className={buscando ? 'animate-spin' : ''} aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  )
}

const PARAMETRO_LABEL_KEY: Record<ParametroGlobalChave, keyof typeof configuracoesT['pt-BR']> = {
  cambio_usd_brl: 'parametroCambio',
}
const PARAMETRO_ANUAL_LABEL_KEY: Record<ParametroAnualChave, keyof typeof configuracoesT['pt-BR']> = {
  inflacao_ipca: 'parametroInflacao',
  selic: 'parametroSelic',
}

interface ParametroAnualTableProps {
  chave: ParametroAnualChave
  label: string
  linhas: ParametroAnual[]
  t: typeof configuracoesT['pt-BR']
  onSalvar: (ano: number, valorMin: number | null, valorMax: number | null, fonte: ParametroAnual['fonte']) => Promise<void>
  onValorInvalido: () => void
  onBuscaFalhou: () => void
}

// Grade de 20 anos (min/max) — salva no blur de cada célula, mesmo padrão já
// usado pros custos de item em CategoryBlock.tsx (dado tabular numérico
// repetitivo, não identidade/nome como TipoRow — não precisa de confirmar/
// cancelar explícito). "Ano 1" ganha botão de API (spot); anos 2-20 são
// sempre manuais (planilha de referência não publica projeção futura).
//
// Estado local (`edicoes`) é necessário, não só decorativo: min/max da mesma
// linha são 2 inputs/2 saves independentes, e a RPC grava os dois campos
// juntos a cada chamada. Sem estado local, editar min e blurar, depois editar
// max e blurar (rápido, antes do primeiro RPC+setState do context terminar)
// faz o segundo save ler `linha` ainda desatualizada via prop e sobrescrever o
// min recém-salvo com null — reproduzido e confirmado ao vivo antes deste fix.
function ParametroAnualTable({ chave, label, linhas, t, onSalvar, onValorInvalido, onBuscaFalhou }: ParametroAnualTableProps) {
  const porAno = new Map(linhas.map(l => [l.ano, l]))
  const [buscandoAno1, setBuscandoAno1] = useState(false)
  const [edicoes, setEdicoes] = useState<Record<number, { min?: string, max?: string }>>({})
  const configurados = linhas.filter(l => l.valorMin !== null && l.valorMax !== null).length

  function parseCell(raw: string): number | null {
    const trimmed = raw.trim()
    if (trimmed === '') return null
    const valor = Number(trimmed.replace(',', '.'))
    return Number.isFinite(valor) ? valor : NaN
  }

  function valorAtual(ano: number, campo: 'min' | 'max'): string {
    const local = edicoes[ano]?.[campo]
    if (local !== undefined) return local
    const linha = porAno.get(ano)
    const valor = campo === 'min' ? linha?.valorMin : linha?.valorMax
    return valor === null || valor === undefined ? '' : String(valor)
  }

  async function salvarCelula(ano: number, campo: 'min' | 'max', raw: string) {
    setEdicoes(prev => ({ ...prev, [ano]: { ...prev[ano], [campo]: raw } }))
    const novoValor = parseCell(raw)
    if (Number.isNaN(novoValor)) { onValorInvalido(); return }
    const outroCampo = campo === 'min' ? 'max' : 'min'
    const outroValor = parseCell(valorAtual(ano, outroCampo))
    const valorMin = campo === 'min' ? novoValor : outroValor
    const valorMax = campo === 'max' ? novoValor : outroValor
    await onSalvar(ano, Number.isNaN(valorMin) ? null : valorMin, Number.isNaN(valorMax) ? null : valorMax, 'manual')
  }

  async function atualizarAno1DaApi() {
    setBuscandoAno1(true)
    try {
      const serie = SERIE_BCB_ANUAL[chave]
      let valor: number
      try {
        valor = await buscarValorBcb(serie)
      } catch {
        onBuscaFalhou()
        return
      }
      await onSalvar(1, valor, valor, 'bcb-sgs')
    } finally {
      setBuscandoAno1(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 py-2 border-b border-[rgba(20,21,26,.04)] last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-c-text">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-c-text-2">{configurados}/20</span>
          <Button variant="icon-btn" disabled={buscandoAno1} onClick={atualizarAno1DaApi} aria-label={t.atualizarDaApi} title={t.atualizarAno1Title}>
            <RefreshCw size={14} className={buscandoAno1 ? 'animate-spin' : ''} aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-[11px] bg-[#f6f5f3]">
        <div className="grid grid-cols-[64px_1fr_1fr] gap-x-2 gap-y-1 p-2 text-[11.5px]">
          <span className="text-c-text-2 font-medium">{t.colAno}</span>
          <span className="text-c-text-2 font-medium">{t.colMinPct}</span>
          <span className="text-c-text-2 font-medium">{t.colMaxPct}</span>
          {ANOS_TABELA.map(ano => (
            <Fragment key={ano}>
              <span className="flex items-center text-c-text">{ano}</span>
              <input
                className="row-input"
                value={valorAtual(ano, 'min')}
                onChange={e => setEdicoes(prev => ({ ...prev, [ano]: { ...prev[ano], min: e.target.value } }))}
                onBlur={e => void salvarCelula(ano, 'min', e.target.value)}
                aria-label={`${label} ano ${ano} mínimo`}
              />
              <input
                className="row-input"
                value={valorAtual(ano, 'max')}
                onChange={e => setEdicoes(prev => ({ ...prev, [ano]: { ...prev[ano], max: e.target.value } }))}
                onBlur={e => void salvarCelula(ano, 'max', e.target.value)}
                aria-label={`${label} ano ${ano} máximo`}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Configuracoes() {
  const t = useT(configuracoesT)
  const {
    tiposProjeto, criarTipoProjeto, renomearTipoProjeto, removerTipoProjeto,
    parametrosGlobais, atualizarParametroGlobal,
    parametrosAnuais, atualizarParametroAnual, loading,
  } = useProjeto()

  const [novoNome, setNovoNome] = useState('')
  const [criando, setCriando]   = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleAdicionar() {
    const nome = novoNome.trim()
    if (!nome) {
      showToast(t.emptyNomeError)
      return
    }
    setCriando(true)
    try {
      await criarTipoProjeto(nome)
      setNovoNome('')
      showToast(t.createdToast)
    } catch {
      showToast(t.createErrorToast)
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="flex flex-col gap-6 px-4 sm:px-8 pb-8 overflow-y-auto flex-1 max-w-[560px]">
        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
            <Settings2 size={14} color="var(--accent)" aria-hidden="true" />
            <span>{t.tiposSectionTitle}</span>
          </div>
          <p className="text-[12px] text-c-text-2 -mt-2">{t.tiposSectionHint}</p>

          <div className="flex flex-col">
            {loading && (
              <div className="flex flex-col gap-2 py-1">
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}
              </div>
            )}
            {!loading && tiposProjeto.map(tipo => (
              <TipoRow
                key={tipo.id}
                tipo={tipo}
                onRename={async novoNome => {
                  try {
                    await renomearTipoProjeto(tipo.id, novoNome)
                    showToast(t.renameSavedToast)
                  } catch {
                    showToast(t.renameErrorToast)
                  }
                }}
                onRemove={() => removerTipoProjeto(tipo.id)
                  .catch(err => showToast(err?.message || t.deleteErrorToast))}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[rgba(20,21,26,.06)]">
            <Input
              variant="filled"
              placeholder={t.placeholderNovoTipo}
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleAdicionar() }}
            />
            <Button variant="ghost" disabled={criando} onClick={handleAdicionar}>
              <Plus size={14} aria-hidden="true" />
              {t.addTipo}
            </Button>
          </div>
        </div>

        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
            <Settings2 size={14} color="var(--accent)" aria-hidden="true" />
            <span>{t.parametrosSectionTitle}</span>
          </div>
          <p className="text-[12px] text-c-text-2 -mt-2">{t.parametrosSectionHint}</p>

          <div className="flex flex-col">
            {loading && (
              <div className="flex flex-col gap-2 py-1">
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-9 w-full" />)}
              </div>
            )}
            {!loading && PARAMETRO_ORDEM.map(chave => {
              const parametro = parametrosGlobais.find(p => p.chave === chave)
              if (!parametro) return null
              return (
                <ParametroRow
                  key={chave}
                  parametro={parametro}
                  label={t[PARAMETRO_LABEL_KEY[chave]]}
                  t={t}
                  onValorInvalido={() => showToast(t.valorInvalidoToast)}
                  onBuscaFalhou={() => showToast(t.buscarErroToast)}
                  onSalvar={async (valor, fonte, serieBcb) => {
                    try {
                      await atualizarParametroGlobal(chave, valor, fonte, serieBcb)
                      showToast(t.atualizadoToast)
                    } catch {
                      showToast(t.atualizarErroToast)
                    }
                  }}
                />
              )
            })}
            {!loading && PARAMETRO_ANUAL_ORDEM.map(chave => (
              <ParametroAnualTable
                key={chave}
                chave={chave}
                label={t[PARAMETRO_ANUAL_LABEL_KEY[chave]]}
                linhas={parametrosAnuais.filter(p => p.chave === chave)}
                t={t}
                onValorInvalido={() => showToast(t.valorInvalidoToast)}
                onBuscaFalhou={() => showToast(t.buscarErroToast)}
                onSalvar={async (ano, valorMin, valorMax, fonte) => {
                  try {
                    await atualizarParametroAnual(chave, ano, valorMin, valorMax, fonte)
                    showToast(t.atualizadoToast)
                  } catch {
                    showToast(t.atualizarErroToast)
                  }
                }}
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
