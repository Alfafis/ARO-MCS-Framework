-- ============================================================================
-- 20260821210107_lancamentos.sql
-- ============================================================================
-- Lançamentos passa a ser por projeto (mesma decisão de Revisões) — a tela
-- mock era global, KPI somava "realizado" de todos os clientes misturados
-- num número só, sem sentido de negócio pra consultoria com clientes
-- separados.
--
-- Escopo desta fatia: `categoria` continua texto livre (não linka em
-- categorias_catalogo/itens_custo) — decisão explícita, o comparativo real
-- "esperado vs realizado" por item de custo é escopo maior, fora daqui
-- (já estava marcado como "fora de escopo" no schema original). `anexo`
-- continua texto decorativo — sem upload de arquivo real, não pedido.
-- ============================================================================

create table if not exists public.lancamentos (
  id            uuid primary key default gen_random_uuid(),
  projeto_id    uuid not null references public.projetos(id) on delete cascade,
  categoria     text not null,
  anexo         text,
  periodo       text not null,
  valor         numeric(14,2) not null default 0,
  status        text not null default 'pendente' check (status in ('pendente', 'revisao', 'validado')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_lancamentos_projeto_id on public.lancamentos (projeto_id, criado_em desc);

alter table public.lancamentos enable row level security;

drop policy if exists lancamentos_select_consultor on public.lancamentos;
create policy lancamentos_select_consultor on public.lancamentos
  for select
  using (public.is_consultor());

create or replace function public.criar_lancamento(
  p_projeto_id uuid,
  p_categoria  text,
  p_periodo    text,
  p_valor      numeric
)
returns public.lancamentos
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_lanc public.lancamentos;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  insert into public.lancamentos (projeto_id, categoria, periodo, valor)
  values (p_projeto_id, trim(p_categoria), coalesce(trim(p_periodo), ''), p_valor)
  returning * into v_lanc;

  return v_lanc;
end;
$function$;

revoke execute on function public.criar_lancamento(uuid, text, text, numeric) from public, anon;
grant execute on function public.criar_lancamento(uuid, text, text, numeric) to authenticated;

create or replace function public.atualizar_status_lancamento(p_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.lancamentos
  set status = p_status, atualizado_em = now()
  where id = p_id;
end;
$function$;

revoke execute on function public.atualizar_status_lancamento(uuid, text) from public, anon;
grant execute on function public.atualizar_status_lancamento(uuid, text) to authenticated;

create or replace function public.remover_lancamento(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.lancamentos where id = p_id;
end;
$function$;

revoke execute on function public.remover_lancamento(uuid) from public, anon;
grant execute on function public.remover_lancamento(uuid) to authenticated;
