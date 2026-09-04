-- ============================================================================
-- 20260904150000_listar_audit_log.sql
-- ============================================================================
-- UI de consulta do audit_log (deixada de fora de propósito na migration
-- original, 2026-09-04 — "feature separada, sem pedido explícito ainda").
-- Pedido agora: tabela simples + filtro, sem diff visual ainda.
--
-- RPC única (não `.from()` direto) porque precisa juntar `perfis.nome` (só
-- tem FK pra auth.users, não dá pra fazer embed via PostgREST) e devolver
-- total de linhas junto da página, num round-trip só.
-- ============================================================================

create or replace function public.listar_audit_log(
  p_tabela text default null,
  p_operacao text default null,
  p_desde timestamptz default null,
  p_ate timestamptz default null,
  p_limit int default 50,
  p_offset int default 0
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_rows jsonb;
  v_total bigint;
begin
  if not public.is_consultor() then
    raise exception 'Acesso restrito a consultores.';
  end if;

  select coalesce(jsonb_agg(row_data), '[]'::jsonb), coalesce(max(total), 0)
  into v_rows, v_total
  from (
    select
      count(*) over() as total,
      jsonb_build_object(
        'id', a.id,
        'tabela', a.tabela,
        'operacao', a.operacao,
        'registro_id', a.registro_id,
        'usuario_id', a.usuario_id,
        'usuario_nome', p.nome,
        'criado_em', a.criado_em
      ) as row_data
    from public.audit_log a
    left join public.perfis p on p.id = a.usuario_id
    where (p_tabela is null or a.tabela = p_tabela)
      and (p_operacao is null or a.operacao = p_operacao)
      and (p_desde is null or a.criado_em >= p_desde)
      and (p_ate is null or a.criado_em <= p_ate)
    order by a.criado_em desc
    limit p_limit offset p_offset
  ) sub;

  return jsonb_build_object('rows', v_rows, 'total', v_total);
end;
$function$;
