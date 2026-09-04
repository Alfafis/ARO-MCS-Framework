import { useEffect, useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useT, useLang } from '@/i18n/useLang'
import { auditoriaT } from '@/i18n/auditoria'
import { supabase } from '@/integrations/supabase/client'

const TABELAS = [
  'itens_custo',
  'itens_template',
  'categorias_projeto',
  'campos_operacionais',
  'campos_operacionais_template',
  'categorias_remediacao',
  'itens_remediacao',
  'categorias_remediacao_template',
  'itens_remediacao_template',
  'parametros_anuais',
  'parametros_globais',
  'configuracoes_plataforma',
] as const

const OPERACOES = ['INSERT', 'UPDATE', 'DELETE'] as const

const PAGE_SIZE = 50

interface LogRow {
  id: string
  tabela: string
  operacao: string
  registro_id: string | null
  usuario_id: string | null
  usuario_nome: string | null
  criado_em: string
}

const selectClass =
  'rounded-[11px] border border-c-line bg-c-card px-[13px] py-[9px] text-[0.875rem] text-c-text outline-none cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/20'

export default function Auditoria() {
  const t = useT(auditoriaT)
  const { lang } = useLang()

  const [tabela, setTabela] = useState('')
  const [operacao, setOperacao] = useState('')
  const [desde, setDesde] = useState('')
  const [ate, setAte] = useState('')
  const [page, setPage] = useState(0)

  const [rows, setRows] = useState<LogRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    supabase
      .rpc('listar_audit_log', {
        // RPC args nullable no banco (default null); o gerador de tipos do
        // Supabase não marca arg `text`/`timestamptz` simples como nullable
        // — mesmo padrão já registrado em ProjetoContext.atualizarParametroAnual.
        p_tabela: (tabela || null) as unknown as string,
        p_operacao: (operacao || null) as unknown as string,
        p_desde: (desde ? new Date(desde).toISOString() : null) as unknown as string,
        p_ate: (ate ? new Date(`${ate}T23:59:59`).toISOString() : null) as unknown as string,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return
        if (rpcError || !data) {
          setError(true)
          setLoading(false)
          return
        }
        const parsed = data as unknown as { rows: LogRow[]; total: number }
        setRows(parsed.rows)
        setTotal(parsed.total)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tabela, operacao, desde, ate, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const dateFmt = new Intl.DateTimeFormat(lang, { dateStyle: 'short', timeStyle: 'short' })

  const operacaoVariant: Record<string, 'success' | 'accent' | 'danger'> = {
    INSERT: 'success',
    UPDATE: 'accent',
    DELETE: 'danger',
  }
  const operacaoLabel: Record<string, string> = {
    INSERT: t.operacaoInsert,
    UPDATE: t.operacaoUpdate,
    DELETE: t.operacaoDelete,
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="flex flex-col gap-4 px-4 sm:px-8 pb-6 sm:pb-8 overflow-y-auto flex-1">
        <div className="flex flex-wrap gap-2">
          <select
            id="auditoria-filtro-tabela"
            name="tabela"
            className={selectClass}
            value={tabela}
            onChange={(e) => {
              setTabela(e.target.value)
              setPage(0)
            }}
            aria-label={t.filterTabela}
          >
            <option value="">{t.filterTabelaAll}</option>
            {TABELAS.map((tb) => (
              <option key={tb} value={tb}>
                {t.tabelaLabels[tb] ?? tb}
              </option>
            ))}
          </select>

          <select
            id="auditoria-filtro-operacao"
            name="operacao"
            className={selectClass}
            value={operacao}
            onChange={(e) => {
              setOperacao(e.target.value)
              setPage(0)
            }}
            aria-label={t.filterOperacao}
          >
            <option value="">{t.filterOperacaoAll}</option>
            {OPERACOES.map((op) => (
              <option key={op} value={op}>
                {operacaoLabel[op]}
              </option>
            ))}
          </select>

          <input
            type="date"
            id="auditoria-filtro-desde"
            name="desde"
            className={selectClass}
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value)
              setPage(0)
            }}
            aria-label={t.filterDesde}
          />
          <input
            type="date"
            id="auditoria-filtro-ate"
            name="ate"
            className={selectClass}
            value={ate}
            onChange={(e) => {
              setAte(e.target.value)
              setPage(0)
            }}
            aria-label={t.filterAte}
          />
        </div>

        <div className="overflow-x-auto rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1fr_100px_140px_160px_140px] gap-2 px-4 py-3 text-[12px] font-semibold text-c-text-2 border-b border-c-line">
              <span>{t.colTabela}</span>
              <span>{t.colOperacao}</span>
              <span>{t.colRegistro}</span>
              <span>{t.colUsuario}</span>
              <span>{t.colQuando}</span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-px p-3">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center text-[0.875rem] text-c-text-2">{t.loadErrorToast}</div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-[0.875rem] text-c-text-2">{t.empty}</div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_100px_140px_160px_140px] gap-2 px-4 py-3 text-[0.875rem] text-c-text border-b border-[rgba(20,21,26,.04)] last:border-0"
                >
                  <span>{t.tabelaLabels[row.tabela] ?? row.tabela}</span>
                  <Badge variant={operacaoVariant[row.operacao] ?? 'default'} className="w-fit">
                    {operacaoLabel[row.operacao] ?? row.operacao}
                  </Badge>
                  <span className="font-mono text-[12px] text-c-text-2 truncate" title={row.registro_id ?? ''}>
                    {row.registro_id ? row.registro_id.slice(0, 8) : '—'}
                  </span>
                  <span className="truncate">{row.usuario_nome ?? t.usuarioDesconhecido}</span>
                  <span className="text-c-text-2">{dateFmt.format(new Date(row.criado_em))}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {!loading && !error && rows.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-c-text-2">{t.pageInfo(page + 1, totalPages, total)}</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex items-center justify-center gap-2 font-semibold cursor-pointer disabled:cursor-not-allowed bg-c-card rounded-full px-5 py-[11px] text-[13.5px] whitespace-nowrap shadow-[0_1px_3px_rgba(20,21,26,.08)] hover:shadow-[0_4px_12px_rgba(20,21,26,.14)] hover:-translate-y-px transition-[box-shadow,transform] duration-[220ms] disabled:hover:shadow-[0_1px_3px_rgba(20,21,26,.08)] disabled:hover:translate-y-0"
              >
                <span className={page === 0 ? 'text-c-text-2' : 'text-c-text'}>{t.prev}</span>
              </button>
              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center justify-center gap-2 font-semibold cursor-pointer disabled:cursor-not-allowed bg-c-card rounded-full px-5 py-[11px] text-[13.5px] whitespace-nowrap shadow-[0_1px_3px_rgba(20,21,26,.08)] hover:shadow-[0_4px_12px_rgba(20,21,26,.14)] hover:-translate-y-px transition-[box-shadow,transform] duration-[220ms] disabled:hover:shadow-[0_1px_3px_rgba(20,21,26,.08)] disabled:hover:translate-y-0"
              >
                <span className={page + 1 >= totalPages ? 'text-c-text-2' : 'text-c-text'}>{t.next}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
