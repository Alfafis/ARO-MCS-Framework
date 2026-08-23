-- ============================================================================
-- 20260823191500_template_update_preenche.sql
-- ============================================================================
-- Faltava no design original: CategoryBlock (reaproveitado pro editor de
-- template) tem toggle de "preenche" (Consultor/Cliente/Ambos) — sem RPC
-- própria, o toggle ficaria clicável sem persistir. Mesmo padrão de
-- update_categoria_preenche, só que na tabela de template.
-- ============================================================================

create or replace function public.template_update_categoria_preenche(p_id uuid, p_preenche text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.categorias_template set preenche = p_preenche where id = p_id;
end;
$function$;

revoke execute on function public.template_update_categoria_preenche(uuid, text) from public, anon;
grant execute on function public.template_update_categoria_preenche(uuid, text) to authenticated;
