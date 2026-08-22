-- ============================================================================
-- 20260821204451_revisoes.sql
-- ============================================================================
-- Revisões passa a ser por projeto (bate com `projetos.rev`, já existente) —
-- a tela mock era uma lista ÚNICA global, sem projeto_id nenhum, apesar do
-- badge "Rev0"/"Rev1" já ser por-projeto em toda outra tela. Decisão desta
-- sessão: mover pra dentro do workspace do projeto, não persistir o modelo
-- global antigo.
--
-- Hash deixa de ser Math.random() decorativo — sha256 real do conteúdo dos
-- itens, calculado no servidor no momento da publicação. Não é
-- "OpenTimestamps"/blockchain (a cópia do frontend precisa parar de afirmar
-- isso) — é hash de conteúdo verificável, que é o que dá pra entregar sem
-- integrar um serviço de ancoragem externo de verdade.
-- ============================================================================

create table if not exists public.revisoes (
  id            uuid primary key default gen_random_uuid(),
  projeto_id    uuid not null references public.projetos(id) on delete cascade,
  codigo        text not null,          -- 'R0', 'R1', 'R2'...
  status        text not null default 'rascunho' check (status in ('rascunho', 'vigente', 'substituida')),
  itens         text[] not null default '{}',
  hash          text,                   -- só existe depois de publicar
  publicado_em  timestamptz,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index if not exists revisoes_projeto_codigo_unq on public.revisoes (projeto_id, codigo);
create index if not exists idx_revisoes_projeto_id on public.revisoes (projeto_id, criado_em);

alter table public.revisoes enable row level security;

drop policy if exists revisoes_select_consultor on public.revisoes;
create policy revisoes_select_consultor on public.revisoes
  for select
  using (public.is_consultor());

create or replace function public.criar_revisao_rascunho(p_projeto_id uuid)
returns public.revisoes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_max    int;
  v_codigo text;
  v_rev    public.revisoes;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  select coalesce(max((regexp_replace(codigo, '\D', '', 'g'))::int), -1)
  into v_max
  from public.revisoes where projeto_id = p_projeto_id;

  v_codigo := 'R' || (v_max + 1);

  insert into public.revisoes (projeto_id, codigo, status)
  values (p_projeto_id, v_codigo, 'rascunho')
  returning * into v_rev;

  return v_rev;
end;
$function$;

revoke execute on function public.criar_revisao_rascunho(uuid) from public, anon;
grant execute on function public.criar_revisao_rascunho(uuid) to authenticated;

create or replace function public.salvar_rascunho_revisao(p_id uuid, p_itens text[])
returns public.revisoes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_rev public.revisoes;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.revisoes
  set itens = p_itens, atualizado_em = now()
  where id = p_id and status = 'rascunho'
  returning * into v_rev;

  if not found then
    raise exception 'Revisão não encontrada ou já publicada';
  end if;

  return v_rev;
end;
$function$;

revoke execute on function public.salvar_rascunho_revisao(uuid, text[]) from public, anon;
grant execute on function public.salvar_rascunho_revisao(uuid, text[]) to authenticated;

-- Publica: hash real do conteúdo, demove a vigente anterior (se houver) pra
-- substituída, e sincroniza projetos.rev — é o mesmo código que o badge de
-- toda outra tela do projeto já lê.
create or replace function public.publicar_revisao(p_id uuid, p_itens text[])
returns public.revisoes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_rev  public.revisoes;
  v_hash text;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  select * into v_rev from public.revisoes where id = p_id;
  if not found then
    raise exception 'Revisão não encontrada';
  end if;
  if v_rev.status != 'rascunho' then
    raise exception 'Só é possível publicar uma revisão em rascunho';
  end if;

  -- pgcrypto vive no schema "extensions" no Supabase, não em "public" — o
  -- search_path restrito desta função (só 'public', de propósito, contra
  -- search_path injection) não acha digest() sem qualificar o schema.
  v_hash := encode(extensions.digest(convert_to(array_to_string(p_itens, E'\n'), 'UTF8'), 'sha256'), 'hex');

  update public.revisoes
  set status = 'substituida', atualizado_em = now()
  where projeto_id = v_rev.projeto_id and status = 'vigente';

  update public.revisoes
  set itens = p_itens, status = 'vigente', hash = v_hash, publicado_em = now(), atualizado_em = now()
  where id = p_id
  returning * into v_rev;

  -- projetos.rev usa "Rev0"/"Rev1" (badge em toda outra tela do projeto);
  -- revisoes.codigo usa "R0"/"R1" (badge só da própria tela de Revisões) —
  -- os dois formatos já coexistiam assim no mock original, não é inconsistência
  -- introduzida aqui.
  update public.projetos
  set rev = 'Rev' || regexp_replace(v_rev.codigo, '\D', '', 'g'), atualizado_em = now()
  where id = v_rev.projeto_id;

  return v_rev;
end;
$function$;

revoke execute on function public.publicar_revisao(uuid, text[]) from public, anon;
grant execute on function public.publicar_revisao(uuid, text[]) to authenticated;
