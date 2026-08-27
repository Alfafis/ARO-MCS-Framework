import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/useLang'
import { parametrosGlobaisT } from '@/i18n/parametros-globais'
import { useProjeto } from '@/context/useProjeto'
import type { ParametroGlobal, ParametroGlobalChave, ParametroAnual, ParametroAnualChave } from '@/types/parametrosGlobais'
import { isNaoConfigurado } from '@/types/parametrosGlobais'
import { SERIE_BCB, SERIE_BCB_ANUAL, buscarValorBcb } from '@/lib/bcb'
import { formatRelativeTime } from '@/lib/utils'

const PARAMETRO_ORDEM: ParametroGlobalChave[] = ['cambio_usd_brl']
const PARAMETRO_ANUAL_ORDEM: ParametroAnualChave[] = ['inflacao_ipca', 'selic']

// Range default do UI: ano-calendário atual + 50 anos à frente (51 linhas).
// Migration 20260827120000_parametros_anuais_calendario troca a semântica de
// `ano` (era 1..20 relativo ao projeto) pra calendário absoluto. Botão "Ver
// anos anteriores" expande pra trás quando o consultor precisa editar dado
// histórico ou revisar seed antigo.
const YEARS_AHEAD = 50
const YEARS_LOOKBACK_DEFAULT = 10

// Formato de exibição: câmbio é preço (R$ por USD), inflação/Selic são taxa —
// mesmo valor bruto do banco (4.44 = 4,44%), só muda o sufixo.
function formatParametroValor(chave: ParametroGlobalChave, valor: number): string {
  if (chave === 'cambio_usd_brl') return `R$ ${valor.toFixed(4).replace('.', ',')}`
  return `${valor.toFixed(2).replace('.', ',')}%`
}

interface ParametroRowProps {
  parametro: ParametroGlobal
  label: string
  t: typeof parametrosGlobaisT['pt-BR']
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

const PARAMETRO_LABEL_KEY: Record<ParametroGlobalChave, keyof typeof parametrosGlobaisT['pt-BR']> = {
  cambio_usd_brl: 'parametroCambio',
}
const PARAMETRO_ANUAL_LABEL_KEY: Record<ParametroAnualChave, keyof typeof parametrosGlobaisT['pt-BR']> = {
  inflacao_ipca: 'parametroInflacao',
  selic: 'parametroSelic',
}

interface ParametroAnualTableProps {
  chave: ParametroAnualChave
  label: string
  linhas: ParametroAnual[]
  t: typeof parametrosGlobaisT['pt-BR']
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
  const [buscandoAnoAtual, setBuscandoAnoAtual] = useState(false)
  const [edicoes, setEdicoes] = useState<Record<number, { min?: string, max?: string }>>({})
  const [mostrarAnteriores, setMostrarAnteriores] = useState(false)

  const currentYear = new Date().getFullYear()
  const anosFuturos = useMemo(
    () => Array.from({ length: YEARS_AHEAD + 1 }, (_, i) => currentYear + i),
    [currentYear],
  )
  const configurados = anosFuturos.filter(ano => {
    const l = porAno.get(ano)
    return l && l.valorMin !== null && l.valorMax !== null
  }).length

  // Anos anteriores: min(currentYear - 10, menor ano com dado preenchido) até
  // currentYear - 1. Se não houver dado antigo, usa currentYear - 10 fixo pra
  // dar espaço de edição. Se houver dado mais antigo, estende até lá pra não
  // esconder linha preenchida.
  const anosAnteriores = useMemo(() => {
    if (!mostrarAnteriores) return []
    const anosComDadoPassado = linhas
      .filter(l => l.ano < currentYear)
      .map(l => l.ano)
    const menorComDado = anosComDadoPassado.length > 0 ? Math.min(...anosComDadoPassado) : currentYear - YEARS_LOOKBACK_DEFAULT
    const inicio = Math.min(currentYear - YEARS_LOOKBACK_DEFAULT, menorComDado)
    return Array.from({ length: currentYear - inicio }, (_, i) => inicio + i)
  }, [mostrarAnteriores, linhas, currentYear])

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

  async function atualizarAnoAtualDaApi() {
    setBuscandoAnoAtual(true)
    try {
      const serie = SERIE_BCB_ANUAL[chave]
      let valor: number
      try {
        valor = await buscarValorBcb(serie)
      } catch {
        onBuscaFalhou()
        return
      }
      await onSalvar(currentYear, valor, valor, 'bcb-sgs')
    } finally {
      setBuscandoAnoAtual(false)
    }
  }

  function renderLinha(ano: number, passado: boolean) {
    return (
      <Fragment key={ano}>
        <span className={`flex items-center ${passado ? 'text-c-text-2' : 'text-c-text'}`}>{ano}</span>
        <Input
          variant="filled"
          className={`h-7 px-2 py-0 text-[11.5px] ${passado ? 'opacity-70' : ''}`}
          value={valorAtual(ano, 'min')}
          onChange={e => setEdicoes(prev => ({ ...prev, [ano]: { ...prev[ano], min: e.target.value } }))}
          onBlur={e => void salvarCelula(ano, 'min', e.target.value)}
          aria-label={`${label} ano ${ano} mínimo`}
        />
        <Input
          variant="filled"
          className={`h-7 px-2 py-0 text-[11.5px] ${passado ? 'opacity-70' : ''}`}
          value={valorAtual(ano, 'max')}
          onChange={e => setEdicoes(prev => ({ ...prev, [ano]: { ...prev[ano], max: e.target.value } }))}
          onBlur={e => void salvarCelula(ano, 'max', e.target.value)}
          aria-label={`${label} ano ${ano} máximo`}
        />
      </Fragment>
    )
  }

  return (
    <div className="flex flex-col gap-2 py-2 border-b border-[rgba(20,21,26,.04)] last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-c-text">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-c-text-2">{configurados}/{anosFuturos.length}</span>
          <Button variant="icon-btn" disabled={buscandoAnoAtual} onClick={atualizarAnoAtualDaApi} aria-label={t.atualizarDaApi} title={t.atualizarAnoAtualTitle}>
            <RefreshCw size={14} className={buscandoAnoAtual ? 'animate-spin' : ''} aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-[11px] border border-[rgba(20,21,26,.06)]">
        <button
          type="button"
          onClick={() => setMostrarAnteriores(v => !v)}
          className="flex items-center justify-center gap-1 w-full py-1.5 text-[11px] font-medium text-c-text-2 hover:text-c-text hover:bg-[rgba(20,21,26,.03)] transition-colors border-b border-[rgba(20,21,26,.06)]"
        >
          {mostrarAnteriores ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
          {mostrarAnteriores ? t.ocultarAnosAnteriores : t.verAnosAnteriores}
        </button>
        <div className="grid grid-cols-[64px_1fr_1fr] gap-x-2 gap-y-1.5 p-2 text-[11.5px]">
          <span className="text-c-text-2 font-medium">{t.colAno}</span>
          <span className="text-c-text-2 font-medium">{t.colMinPct}</span>
          <span className="text-c-text-2 font-medium">{t.colMaxPct}</span>
          {mostrarAnteriores && anosAnteriores.length > 0 && (
            <span style={{ gridColumn: '1 / -1' }} className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 pt-1">
              {t.anosAnterioresHeader}
            </span>
          )}
          {anosAnteriores.map(ano => renderLinha(ano, true))}
          {anosFuturos.map(ano => renderLinha(ano, false))}
        </div>
      </div>
    </div>
  )
}

const AUTO_REFRESH_STALENESS_MS = 60 * 60 * 1000

export default function ParametrosGlobais() {
  const t = useT(parametrosGlobaisT)
  const { parametrosGlobais, atualizarParametroGlobal, parametrosAnuais, atualizarParametroAnual, loading } = useProjeto()

  const [toast, setToast] = useState<string | null>(null)

  // Refresh silencioso do câmbio ao acessar a tela — se o valor no banco é
  // mais velho que 1h (ou nunca configurado), busca o spot da PTAX no BCB e
  // salva. Falha da API mantém o valor antigo sem toast (usuário não pediu).
  const jaTentouRef = useRef(false)
  useEffect(() => {
    if (loading || jaTentouRef.current) return
    const cambio = parametrosGlobais.find(p => p.chave === 'cambio_usd_brl')
    if (!cambio) return
    const idadeMs = Date.now() - new Date(cambio.atualizadoEm).getTime()
    if (!isNaoConfigurado(cambio) && idadeMs < AUTO_REFRESH_STALENESS_MS) return
    jaTentouRef.current = true
    void (async () => {
      try {
        const valor = await buscarValorBcb(SERIE_BCB.cambio_usd_brl)
        await atualizarParametroGlobal('cambio_usd_brl', valor, 'bcb-sgs', SERIE_BCB.cambio_usd_brl)
      } catch { /* silencioso — mantém valor antigo */ }
    })()
  }, [loading, parametrosGlobais, atualizarParametroGlobal])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="px-4 sm:px-8 pb-8 overflow-y-auto flex-1">
        <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-4 max-w-[560px]">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-c-text">
            <SlidersHorizontal size={14} color="var(--accent)" aria-hidden="true" />
            <span>{t.headerTitle}</span>
          </div>

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
