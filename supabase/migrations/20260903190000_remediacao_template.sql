-- ============================================================================
-- 20260903190000_remediacao_template.sql
-- ============================================================================
-- Módulo Remediação não tinha tabela `_template` nenhuma — os valores de
-- referência (sondagem R$2.500/ha, reabilitação R$180.000/ha, planta de
-- tratamento R$5M/unidade...) viviam hardcoded dentro de
-- `carregar_remediacao_padrao()`, achado na auditoria de hardcode
-- (2026-09-03). Diferente do resto do template administrável
-- (categorias_template/itens_template), mudar um preço aqui exigia migration
-- nova. Fix: mesmo padrão de `categorias_template`/`itens_template`, só que
-- SEM `tipo_projeto_id` — o módulo é opt-in por projeto
-- (`projetos.remediacao_habilitada`), não por tipo de projeto, então existe
-- um único conjunto de referência global, não um por tipo.
--
-- RLS: mesma convenção de `categorias_remediacao`/`itens_remediacao` — CRUD
-- direto via `is_consultor()`, sem RPC. Diferente de `itens_custo` (que
-- precisa de RPC pra INSERT por causa da validação de setor/fase/ano), o
-- shape de Remediação não tem esses campos condicionais, então RLS direta é
-- suficiente e mais simples — mesma doutrina já registrada ("RPC só quando o
-- filtro de autorização é condicional").
-- ============================================================================

create table if not exists public.categorias_remediacao_template (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  area_ha       numeric(10,2),
  ordem         smallint not null default 1 check (ordem between 1 and 999),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists categorias_remediacao_template_ordem_idx
  on public.categorias_remediacao_template (ordem);

alter table public.categorias_remediacao_template enable row level security;

drop policy if exists categorias_remediacao_template_select_consultor on public.categorias_remediacao_template;
create policy categorias_remediacao_template_select_consultor on public.categorias_remediacao_template
  for select using (public.is_consultor());

drop policy if exists categorias_remediacao_template_insert_consultor on public.categorias_remediacao_template;
create policy categorias_remediacao_template_insert_consultor on public.categorias_remediacao_template
  for insert with check (public.is_consultor());

drop policy if exists categorias_remediacao_template_update_consultor on public.categorias_remediacao_template;
create policy categorias_remediacao_template_update_consultor on public.categorias_remediacao_template
  for update using (public.is_consultor()) with check (public.is_consultor());

drop policy if exists categorias_remediacao_template_delete_consultor on public.categorias_remediacao_template;
create policy categorias_remediacao_template_delete_consultor on public.categorias_remediacao_template
  for delete using (public.is_consultor());

create table if not exists public.itens_remediacao_template (
  id                     uuid primary key default gen_random_uuid(),
  categoria_template_id  uuid not null references public.categorias_remediacao_template(id) on delete cascade,
  descricao              text not null,
  unidade                text not null,
  quantidade             numeric(14,4) not null default 1 check (quantidade >= 0),
  custo_unit_min         numeric(16,2) not null default 0 check (custo_unit_min >= 0),
  custo_unit_max         numeric(16,2) not null default 0 check (custo_unit_max >= custo_unit_min),
  fonte                  text,
  ordem                  smallint not null default 1 check (ordem between 1 and 999),
  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now()
);
create index if not exists itens_remediacao_template_categoria_ordem_idx
  on public.itens_remediacao_template (categoria_template_id, ordem);

alter table public.itens_remediacao_template enable row level security;

drop policy if exists itens_remediacao_template_select_consultor on public.itens_remediacao_template;
create policy itens_remediacao_template_select_consultor on public.itens_remediacao_template
  for select using (public.is_consultor());

drop policy if exists itens_remediacao_template_insert_consultor on public.itens_remediacao_template;
create policy itens_remediacao_template_insert_consultor on public.itens_remediacao_template
  for insert with check (public.is_consultor());

drop policy if exists itens_remediacao_template_update_consultor on public.itens_remediacao_template;
create policy itens_remediacao_template_update_consultor on public.itens_remediacao_template
  for update using (public.is_consultor()) with check (public.is_consultor());

drop policy if exists itens_remediacao_template_delete_consultor on public.itens_remediacao_template;
create policy itens_remediacao_template_delete_consultor on public.itens_remediacao_template
  for delete using (public.is_consultor());

drop trigger if exists categorias_remediacao_template_atualizado_em on public.categorias_remediacao_template;
create trigger categorias_remediacao_template_atualizado_em
  before update on public.categorias_remediacao_template
  for each row execute function public.bump_atualizado_em();

drop trigger if exists itens_remediacao_template_atualizado_em on public.itens_remediacao_template;
create trigger itens_remediacao_template_atualizado_em
  before update on public.itens_remediacao_template
  for each row execute function public.bump_atualizado_em();

-- ----------------------------------------------------------------------------
-- Seed — exatamente os valores que hoje estavam hardcoded em
-- carregar_remediacao_padrao (migration 20260830192608). Roda só se a tabela
-- estiver vazia (idempotente, seguro reaplicar).
-- ----------------------------------------------------------------------------
do $$
declare
  v_cat_solo   uuid;
  v_cat_barr   uuid;
  v_cat_planta uuid;
begin
  if exists (select 1 from public.categorias_remediacao_template) then return; end if;

  insert into public.categorias_remediacao_template (nome, area_ha, ordem)
  values ('Solo — Investigação e Reabilitação', 17.27, 1)
  returning id into v_cat_solo;

  insert into public.itens_remediacao_template
    (categoria_template_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem) values
    (v_cat_solo, 'Sondagem de solo',    'ha',       17.27,   2500,    2500,   'Sete', 1),
    (v_cat_solo, 'Amostras coletadas',  'amostra',  345.4,   0,       0,      'Sete (20/ha)', 2),
    (v_cat_solo, 'Análise química',     'amostra',  345.4,   530,     530,    'Sete', 3),
    (v_cat_solo, 'Reabilitação de áreas contaminadas', 'ha', 17.27, 180000, 180000, 'Sete', 4),
    (v_cat_solo, '   ↳ Escavação e transporte do material contaminado', 'ha', 17.27, 50000, 50000, 'Sete', 5),
    (v_cat_solo, '   ↳ Tratamento',        'ha', 17.27,  80000,  80000, 'Sete', 6),
    (v_cat_solo, '   ↳ Recomposição do terreno', 'ha', 17.27, 50000, 50000, 'Sete', 7);

  insert into public.categorias_remediacao_template (nome, area_ha, ordem)
  values ('Barragem de Rejeitos — Coleta e Análise', 358.26, 2)
  returning id into v_cat_barr;

  insert into public.itens_remediacao_template
    (categoria_template_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem) values
    (v_cat_barr, 'Coleta de sedimentos de fundo', 'furo',    71.652,  400, 400, 'Sete (1 furo / 5 ha, 4 amostras)', 1),
    (v_cat_barr, 'Análise química',               'amostra', 286.608, 530, 530, 'Sete', 2);

  insert into public.categorias_remediacao_template (nome, area_ha, ordem)
  values ('Planta de Tratamento de Áreas Contaminadas', null, 3)
  returning id into v_cat_planta;

  insert into public.itens_remediacao_template
    (categoria_template_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem) values
    (v_cat_planta, 'Aquisição, instalação e operação (3 plantas)', 'unid', 3, 5000000, 5000000, 'Referência do modelo', 1),
    (v_cat_planta, 'Desmontagem da planta de tratamento',           'unid', 1, 4500000, 4500000, 'Referência do modelo', 2);
end $$;

-- ----------------------------------------------------------------------------
-- Reescreve carregar_remediacao_padrao pra copiar do template em vez de
-- literal hardcoded — mesmo guard de sempre (só roda em projeto vazio).
-- ----------------------------------------------------------------------------
create or replace function public.carregar_remediacao_padrao(p_projeto_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ja_tem boolean;
  v_cat    record;
  v_novo_cat_id uuid;
begin
  if not public.is_consultor() then
    raise exception 'not authorized';
  end if;

  select exists (
    select 1 from public.categorias_remediacao where projeto_id = p_projeto_id
  ) into v_ja_tem;
  if v_ja_tem then return; end if;

  for v_cat in
    select id, nome, area_ha, ordem from public.categorias_remediacao_template order by ordem
  loop
    insert into public.categorias_remediacao (projeto_id, nome, area_ha, ordem)
    values (p_projeto_id, v_cat.nome, v_cat.area_ha, v_cat.ordem)
    returning id into v_novo_cat_id;

    insert into public.itens_remediacao
      (categoria_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem)
    select v_novo_cat_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem
      from public.itens_remediacao_template
     where categoria_template_id = v_cat.id
     order by ordem;
  end loop;
end;
$$;
