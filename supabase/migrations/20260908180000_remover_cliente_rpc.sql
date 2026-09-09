-- ============================================================================
-- 20260908180000_remover_cliente_rpc.sql
-- ============================================================================
-- RPC para excluir cliente. Bloqueia quando o cliente tem projetos vinculados —
-- decisão explícita (opção A discutida): exclusão é hard delete, exige estado
-- limpo. Consultor precisa arquivar/excluir os projetos antes.
--
-- RPC-first (mesmo padrão de create_cliente / atualizar_email_cliente) — não
-- existe DELETE policy em clientes, `.from().delete()` direto seria filtrado
-- silenciosamente pelo RLS default-deny.
-- ============================================================================

create or replace function public.remover_cliente(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_count int;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  select count(*) into v_count from public.projetos where cliente_id = p_id;
  if v_count > 0 then
    raise exception 'Cliente possui % projeto(s) vinculado(s). Arquive-os antes de excluir o cliente.', v_count
      using errcode = 'P0001';
  end if;

  delete from public.clientes where id = p_id;
  if not found then
    raise exception 'Cliente não encontrado' using errcode = 'P0001';
  end if;
end;
$function$;

revoke execute on function public.remover_cliente(uuid) from public, anon;
grant execute on function public.remover_cliente(uuid) to authenticated;
