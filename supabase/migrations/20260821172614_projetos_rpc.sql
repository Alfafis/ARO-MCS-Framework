-- ============================================================================
-- 20260821172614_projetos_rpc.sql
-- ============================================================================
-- Fase E, fatia "Projetos": mesmo padrão da fatia Clientes — leitura via
-- .from() sob RLS, escrita via RPC. `categorias`/itens_custo continuam fora
-- (próxima fatia); todo projeto — real ou seed — nasce sem categoria, igual
-- já era o comportamento padrão pro fluxo "Novo projeto" (ver comentário no
-- schema original: "categorias nascem em branco").
-- ============================================================================

drop policy if exists projetos_select_consultor on public.projetos;
create policy projetos_select_consultor on public.projetos
  for select
  using (public.is_consultor());

create or replace function public.create_projeto(
  p_cliente_id      uuid,
  p_tipo_projeto_id text,
  p_nome            text
)
returns public.projetos
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_projeto public.projetos;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  insert into public.projetos (cliente_id, tipo_projeto_id, nome, data_base)
  values (p_cliente_id, p_tipo_projeto_id, trim(p_nome), (extract(year from now()))::text)
  returning * into v_projeto;

  return v_projeto;
end;
$function$;

revoke execute on function public.create_projeto(uuid, text, text) from public, anon;
grant execute on function public.create_projeto(uuid, text, text) to authenticated;

-- Mock tratava "arquivar" como remoção da lista, não soft-delete (não existe
-- status 'arquivado' no enum) — replica o mesmo comportamento aqui.
create or replace function public.arquivar_projeto(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.projetos where id = p_id;
end;
$function$;

revoke execute on function public.arquivar_projeto(uuid) from public, anon;
grant execute on function public.arquivar_projeto(uuid) to authenticated;

create or replace function public.concluir_projeto(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.projetos
  set status = 'concluido', atualizado_em = now()
  where id = p_id;
end;
$function$;

revoke execute on function public.concluir_projeto(uuid) from public, anon;
grant execute on function public.concluir_projeto(uuid) to authenticated;

-- Seed de projetos demo movido pra supabase/seed.sql (2026-09-04) — só roda em
-- `db reset` local, nunca em `db push`/produção. Ver _ADRs.md do vault.
