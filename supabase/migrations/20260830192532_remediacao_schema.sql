-- Módulo Remediação: escopo alternativo separado do provisionamento principal.
-- Cada projeto pode habilitar/desabilitar o módulo individualmente. Quando
-- habilitado, categorias e itens ficam num modelo próprio (área em ha,
-- quantidade × custo unitário), não no shape genérico min/max de itens_custo.
-- Portal público: opt-in por revisão via revisoes.incluir_remediacao.

alter table public.projetos
  add column if not exists remediacao_habilitada boolean not null default false;

alter table public.revisoes
  add column if not exists incluir_remediacao boolean not null default false;

-- ----------------------------------------------------------------------------
-- categorias_remediacao — agrupam itens por área/domínio (Solo, Barragem,
-- Planta de Tratamento). Coluna `area_ha` é opcional — só faz sentido pra
-- categorias com área física identificada; Planta de Tratamento tem area=null.
-- ----------------------------------------------------------------------------
create table if not exists public.categorias_remediacao (
  id            uuid primary key default gen_random_uuid(),
  projeto_id    uuid not null references public.projetos(id) on delete cascade,
  nome          text not null,
  area_ha       numeric(10,2),
  ordem         smallint not null default 1 check (ordem between 1 and 999),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists categorias_remediacao_projeto_ordem_idx
  on public.categorias_remediacao (projeto_id, ordem);

alter table public.categorias_remediacao enable row level security;

drop policy if exists categorias_remediacao_select_consultor on public.categorias_remediacao;
create policy categorias_remediacao_select_consultor on public.categorias_remediacao
  for select using (public.is_consultor());

drop policy if exists categorias_remediacao_insert_consultor on public.categorias_remediacao;
create policy categorias_remediacao_insert_consultor on public.categorias_remediacao
  for insert with check (public.is_consultor());

drop policy if exists categorias_remediacao_update_consultor on public.categorias_remediacao;
create policy categorias_remediacao_update_consultor on public.categorias_remediacao
  for update using (public.is_consultor()) with check (public.is_consultor());

drop policy if exists categorias_remediacao_delete_consultor on public.categorias_remediacao;
create policy categorias_remediacao_delete_consultor on public.categorias_remediacao
  for delete using (public.is_consultor());

-- ----------------------------------------------------------------------------
-- itens_remediacao — cada item tem quantidade × custo unitário. Custo total é
-- derivado no runtime (quantidade × (custo_unit_min+max)/2 pro ponto médio).
-- min == max = ponto estimado; range permite modelar incerteza no futuro sem
-- migração adicional.
-- ----------------------------------------------------------------------------
create table if not exists public.itens_remediacao (
  id                uuid primary key default gen_random_uuid(),
  categoria_id      uuid not null references public.categorias_remediacao(id) on delete cascade,
  descricao         text not null,
  unidade           text not null,
  quantidade        numeric(14,4) not null default 1 check (quantidade >= 0),
  custo_unit_min    numeric(16,2) not null default 0 check (custo_unit_min >= 0),
  custo_unit_max    numeric(16,2) not null default 0 check (custo_unit_max >= custo_unit_min),
  fonte             text,
  ordem             smallint not null default 1 check (ordem between 1 and 999),
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);
create index if not exists itens_remediacao_categoria_ordem_idx
  on public.itens_remediacao (categoria_id, ordem);

alter table public.itens_remediacao enable row level security;

drop policy if exists itens_remediacao_select_consultor on public.itens_remediacao;
create policy itens_remediacao_select_consultor on public.itens_remediacao
  for select using (public.is_consultor());

drop policy if exists itens_remediacao_insert_consultor on public.itens_remediacao;
create policy itens_remediacao_insert_consultor on public.itens_remediacao
  for insert with check (public.is_consultor());

drop policy if exists itens_remediacao_update_consultor on public.itens_remediacao;
create policy itens_remediacao_update_consultor on public.itens_remediacao
  for update using (public.is_consultor()) with check (public.is_consultor());

drop policy if exists itens_remediacao_delete_consultor on public.itens_remediacao;
create policy itens_remediacao_delete_consultor on public.itens_remediacao
  for delete using (public.is_consultor());

-- ----------------------------------------------------------------------------
-- Trigger de atualizado_em (mesma helper `bump_atualizado_em` usada por outras
-- tabelas). Verifica se existe antes de criar para não quebrar em CI local.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'bump_atualizado_em' and pronamespace = 'public'::regnamespace
  ) then
    create function public.bump_atualizado_em() returns trigger language plpgsql as $body$
    begin
      new.atualizado_em = now();
      return new;
    end;
    $body$;
  end if;
end $$;

drop trigger if exists categorias_remediacao_atualizado_em on public.categorias_remediacao;
create trigger categorias_remediacao_atualizado_em
  before update on public.categorias_remediacao
  for each row execute function public.bump_atualizado_em();

drop trigger if exists itens_remediacao_atualizado_em on public.itens_remediacao;
create trigger itens_remediacao_atualizado_em
  before update on public.itens_remediacao
  for each row execute function public.bump_atualizado_em();
