-- ============================================================================
-- 20260909180000_remover_projeto_rpc.sql
-- ============================================================================
-- RPC para excluir projeto. Bloqueia se houver revisões ou lançamentos vinculados
-- (indica trabalho real feito). Mesmo padrão de remover_cliente: hard delete exige
-- estado limpo; Arquivar cobre "não quero mais ver esse projeto".
--
-- Cascade nativo cuida do resto: categorias_projeto (→ campos_operacionais,
-- itens_custo), categorias_remediacao (→ itens_remediacao), codigos_acesso,
-- simulacoes — todas com ON DELETE CASCADE.
--
-- audit_log.registro_id é texto sem FK (não cascateia) — registros de auditoria
-- do projeto ficam órfãos por design, preservando o rastro histórico.
--
-- RPC-first (mesmo padrão de create_projeto / remover_cliente): não existe DELETE
-- policy em projetos, `.from().delete()` direto seria filtrado silenciosamente
-- pelo RLS default-deny.
-- ============================================================================

create or replace function public.remover_projeto(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_rev int;
  v_lan int;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  select count(*) into v_rev from public.revisoes where projeto_id = p_id;
  select count(*) into v_lan from public.lancamentos where projeto_id = p_id;

  if v_rev + v_lan > 0 then
    raise exception 'Projeto possui % revisão(ões) e % lançamento(s). Arquive o projeto em vez de excluir.', v_rev, v_lan
      using errcode = 'P0001';
  end if;

  delete from public.projetos where id = p_id;
  if not found then
    raise exception 'Projeto não encontrado' using errcode = 'P0001';
  end if;
end;
$function$;

revoke execute on function public.remover_projeto(uuid) from public, anon;
grant execute on function public.remover_projeto(uuid) to authenticated;
