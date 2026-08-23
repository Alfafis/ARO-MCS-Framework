-- ============================================================================
-- 20260823180000_categorias_template.sql
-- ============================================================================
-- Subsistema 1/3 de "template de categoria administrável" (ver spec
-- 2026-08-23-template-categoria-admin-design.md). Template de categoria+item
-- sai do frontend (data/categoria-templates.ts, hardcoded) e vira dado real,
-- editável em Configurações. tipo_projeto_id é text (slug), não uuid — mesmo
-- tipo de coluna de projetos.tipo_projeto_id.
-- ============================================================================

create table if not exists public.categorias_template (
  id               uuid primary key default gen_random_uuid(),
  tipo_projeto_id  text not null references public.tipos_projeto(id) on delete cascade,
  catalogo_id      uuid not null references public.categorias_catalogo(id),
  preenche         text not null default 'Consultor'
                     check (preenche in ('Consultor', 'Cliente', 'Ambos')),
  ordem            integer not null default 0,
  criado_em        timestamptz not null default now()
);

create unique index if not exists categorias_template_unq on public.categorias_template (tipo_projeto_id, catalogo_id);

create table if not exists public.itens_template (
  id                    uuid primary key default gen_random_uuid(),
  categoria_template_id uuid not null references public.categorias_template(id) on delete cascade,
  nome                  text not null,
  unidade               text not null,
  custo_min             numeric(14,2) not null,
  custo_max             numeric(14,2) not null,
  fonte                 text,
  aplicabilidade        text,
  ano_previsto          text,
  ordem                 integer not null default 0,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),

  constraint custo_max_maior_que_min_template check (custo_max >= custo_min)
);

create index if not exists idx_itens_template_categoria_id on public.itens_template (categoria_template_id);

alter table public.categorias_template enable row level security;
alter table public.itens_template enable row level security;

drop policy if exists categorias_template_select_consultor on public.categorias_template;
create policy categorias_template_select_consultor on public.categorias_template
  for select
  using (public.is_consultor());

drop policy if exists itens_template_select_consultor on public.itens_template;
create policy itens_template_select_consultor on public.itens_template
  for select
  using (public.is_consultor());

-- ----------------------------------------------------------------------------
-- RPCs — mesmo gate is_consultor() do resto do projeto, sem tier de admin.
-- ----------------------------------------------------------------------------

create or replace function public.template_add_categoria(p_tipo_projeto_id text, p_nome text, p_preenche text default 'Consultor')
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_catalogo  public.categorias_catalogo;
  v_categoria public.categorias_template;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  v_catalogo := public.find_or_create_categoria_catalogo(p_nome);

  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
  values (p_tipo_projeto_id, v_catalogo.id, coalesce(p_preenche, 'Consultor'), 0)
  returning * into v_categoria;

  return jsonb_build_object('categoria', to_jsonb(v_categoria), 'catalogo', to_jsonb(v_catalogo));
end;
$function$;

revoke execute on function public.template_add_categoria(text, text, text) from public, anon;
grant execute on function public.template_add_categoria(text, text, text) to authenticated;

create or replace function public.template_remove_categoria(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.categorias_template where id = p_id;
end;
$function$;

revoke execute on function public.template_remove_categoria(uuid) from public, anon;
grant execute on function public.template_remove_categoria(uuid) to authenticated;

create or replace function public.template_add_item(p_categoria_template_id uuid)
returns public.itens_template
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item public.itens_template;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max)
  values (p_categoria_template_id, 'Novo item', 'verba', 0, 0)
  returning * into v_item;

  return v_item;
end;
$function$;

revoke execute on function public.template_add_item(uuid) from public, anon;
grant execute on function public.template_add_item(uuid) to authenticated;

create or replace function public.template_remove_item(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.itens_template where id = p_id;
end;
$function$;

revoke execute on function public.template_remove_item(uuid) from public, anon;
grant execute on function public.template_remove_item(uuid) to authenticated;

-- Save-on-blur, mesmo padrão de update_item_custo — p_patch só traz os campos
-- que o frontend quer alterar (coalesce preserva o resto).
create or replace function public.template_update_item(p_id uuid, p_patch jsonb)
returns public.itens_template
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item public.itens_template;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.itens_template set
    nome           = coalesce(p_patch->>'nome', nome),
    unidade        = coalesce(p_patch->>'unidade', unidade),
    custo_min      = coalesce((p_patch->>'custoMin')::numeric, custo_min),
    custo_max      = coalesce((p_patch->>'custoMax')::numeric, custo_max),
    fonte          = coalesce(p_patch->>'fonte', fonte),
    aplicabilidade = coalesce(p_patch->>'aplicabilidade', aplicabilidade),
    ano_previsto   = coalesce(p_patch->>'anoPrevisto', ano_previsto),
    atualizado_em  = now()
  where id = p_id
  returning * into v_item;

  return v_item;
end;
$function$;

revoke execute on function public.template_update_item(uuid, jsonb) from public, anon;
grant execute on function public.template_update_item(uuid, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- carregar_template_exemplo — assinatura muda: para de receber p_categorias
-- jsonb montado pelo frontend, passa a ler categorias_template/itens_template
-- no servidor a partir de p_tipo_projeto_id. Fecha trust boundary: client não
-- manda mais nome/preço arbitrário pra dentro da RPC.
-- ----------------------------------------------------------------------------

drop function if exists public.carregar_template_exemplo(uuid, jsonb);

create or replace function public.carregar_template_exemplo(p_projeto_id uuid, p_tipo_projeto_id text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_ct    record;
  v_categoria public.categorias_projeto;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.categorias_projeto where projeto_id = p_projeto_id;

  for v_ct in
    select * from public.categorias_template where tipo_projeto_id = p_tipo_projeto_id order by ordem
  loop
    insert into public.categorias_projeto (projeto_id, catalogo_id, preenche, ordem)
    values (p_projeto_id, v_ct.catalogo_id, v_ct.preenche, v_ct.ordem)
    returning * into v_categoria;

    insert into public.itens_custo (categoria_projeto_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem)
    select v_categoria.id, it.nome, it.unidade, it.custo_min, it.custo_max, it.fonte, it.aplicabilidade, it.ano_previsto, it.ordem
    from public.itens_template it
    where it.categoria_template_id = v_ct.id;
  end loop;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'categoria', to_jsonb(cp),
      'catalogo',  to_jsonb(cc),
      'itens',     (select coalesce(jsonb_agg(to_jsonb(ic) order by ic.criado_em), '[]'::jsonb)
                    from public.itens_custo ic where ic.categoria_projeto_id = cp.id)
    ) order by cp.ordem)
    from public.categorias_projeto cp
    join public.categorias_catalogo cc on cc.id = cp.catalogo_id
    where cp.projeto_id = p_projeto_id
  ), '[]'::jsonb);
end;
$function$;

revoke execute on function public.carregar_template_exemplo(uuid, text) from public, anon;
grant execute on function public.carregar_template_exemplo(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- Seed: migra FECHAMENTO_MINA de categoria-templates.ts pro banco, valores
-- NX Gold inclusos (decisão explícita do usuário — ver spec).
-- ----------------------------------------------------------------------------

do $$
declare
  v_tipo text := 'fechamento-mina';
  v_cat  public.categorias_catalogo;
  v_ct   public.categorias_template;
begin
  -- Estudos
  v_cat := public.find_or_create_categoria_catalogo('Estudos');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 0) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Estudos e ações gerais — Fase de Pré-Fechamento', 'verba', 6550000, 9100000, 'SINAPI 2021', 'Todos os setores', 'Anos 2–6', 0);

  -- Cavas
  v_cat := public.find_or_create_categoria_catalogo('Cavas');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 1) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Recuperação de cavas', 'verba', 2272500, 2418000, 'Brandt Meio Amb.', 'Setor 7', 'Ano 6', 0);

  -- Pilhas de Estéril
  v_cat := public.find_or_create_categoria_catalogo('Pilhas de Estéril');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 2) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Recuperação de pilhas de estéril', 'verba', 1718800, 1805500, 'Brandt Meio Amb.', 'Setor 2', 'Ano 6', 0);

  -- Barragem (3 itens)
  v_cat := public.find_or_create_categoria_catalogo('Barragem');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Ambos', 3) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Descomissionamento estrutural', 'm²',    2100000, 3050000, 'SINAPI 2021',     'Setor 1', 'Ano 6',      0),
    (v_ct.id, 'Recomposição de talude',         'm²',    1400000, 2100000, 'Brandt Meio Amb.', 'Setor 1', 'Ano 6',      1),
    (v_ct.id, 'Monitoramento pós-obra',         'verba',  900000, 1350000, 'SINAPI 2021',     'Setor 1', 'Anos 7–10', 2);

  -- Planta Industrial
  v_cat := public.find_or_create_categoria_catalogo('Planta Industrial');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 4) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Desmontagem da planta industrial', 'verba', 840600, 878900, 'SINAPI 2021', 'Setor 3', 'Ano 6', 0);

  -- Áreas de Apoio
  v_cat := public.find_or_create_categoria_catalogo('Áreas de Apoio');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 5) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Desmobilização de áreas de apoio', 'verba', 3788800, 3986300, 'SINAPI 2021', 'Setor 4, 6, 8, 9', 'Anos 5–6', 0);

  -- Demolição Estr. Civis
  v_cat := public.find_or_create_categoria_catalogo('Demolição Estr. Civis');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 6) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Demolição de estruturas civis', 'm²', 4437700, 4574600, 'SINAPI 2021', 'Setor 4, 5, 6, 7, 8, 9', 'Anos 5–6', 0);

  -- Monitoramento
  v_cat := public.find_or_create_categoria_catalogo('Monitoramento');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Ambos', 7) returning * into v_ct;
  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_ct.id, 'Monitoramento pós-fechamento', 'verba', 9589100, 12007700, 'SINAPI 2021', 'Todos os setores', 'Anos 7–10', 0);
end $$;
