-- ============================================================================
-- 20260821215356_perfil_consultor.sql
-- ============================================================================
-- Ver spec: {VAULT}/projetos/betech/ARO-MCS-Framework/specs/2026-08-22-perfil-consultor-design.md
--
-- Nome/profissão/telefone/foto editáveis pelo próprio usuário (dono-da-linha,
-- não is_consultor() — um papel='cliente' com sessão também poderia editar o
-- próprio nome, se algum dia tiver login). Foto vai pro Storage, não base64
-- na coluna nem arquivo em public/ do frontend (decisão já registrada na
-- spec — public/ é build estático, sem runtime pra receber upload).
-- ============================================================================

alter table public.perfis
  add column if not exists nome text,
  add column if not exists profissao text,
  add column if not exists telefone text,
  add column if not exists foto_url text;

-- ----------------------------------------------------------------------------
-- Storage — bucket público pra leitura (foto de perfil não é dado sensível
-- como o financeiro; cacheável por URL). Escrita/delete restrita à própria
-- pasta {auth.uid()}/.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_owner_write on storage.objects;
create policy avatars_owner_write on storage.objects
  for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- RPCs — sempre sobre auth.uid(), nunca recebem id (não existe "editar
-- perfil de outro" por desenho).
-- ----------------------------------------------------------------------------

create or replace function public.atualizar_meu_perfil(p_nome text, p_profissao text, p_telefone text)
returns public.perfis
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_perfil public.perfis;
begin
  if auth.uid() is null then
    raise exception 'Sem permissão';
  end if;

  update public.perfis
  set nome = trim(p_nome), profissao = trim(p_profissao), telefone = trim(p_telefone)
  where id = auth.uid()
  returning * into v_perfil;

  return v_perfil;
end;
$function$;

revoke execute on function public.atualizar_meu_perfil(text, text, text) from public, anon;
grant execute on function public.atualizar_meu_perfil(text, text, text) to authenticated;

create or replace function public.atualizar_foto_perfil(p_foto_url text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if auth.uid() is null then
    raise exception 'Sem permissão';
  end if;

  update public.perfis set foto_url = p_foto_url where id = auth.uid();
end;
$function$;

revoke execute on function public.atualizar_foto_perfil(text) from public, anon;
grant execute on function public.atualizar_foto_perfil(text) to authenticated;
