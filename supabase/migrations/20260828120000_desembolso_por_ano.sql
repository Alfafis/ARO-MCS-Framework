-- ============================================================================
-- 20260828120000_desembolso_por_ano.sql
-- ============================================================================
-- Curva de desembolso fiel à planilha (Opção 3) — Etapas 1 e 2 do
-- `_Plan_Curva_Desembolso.md`. Duas tabelas paralelas + RPCs de mutação,
-- extensão de `add_categoria` para herdar do template, e extensão do bundle
-- público `obter_relatorio_publico`.
--
-- Contexto:
-- A planilha NX Gold distribui o custo de cada item em anos discretos com
-- regras hardcoded por categoria (literais, splits assimétricos, frações).
-- Ver `_Dados_Formulas_Planilha.md` — Etapa 5. Não há fórmula uniforme, então
-- não dá pra derivar do range `ano_inicio`/`ano_fim` sozinho.
--
-- `ano` é RELATIVO ao horizonte do projeto (1..20) — o mesmo padrão de
-- `ano_inicio`/`ano_fim` em `itens_custo`. Ano-calendário fica no
-- `parametros_anuais` (ADR-009), que é global; desembolso é por-item.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

create table if not exists public.desembolso_item_ano (
  item_id   uuid     not null references public.itens_custo(id) on delete cascade,
  ano       smallint not null,
  valor     numeric(14,2) not null,
  primary key (item_id, ano),
  constraint desembolso_item_ano_valor_positivo check (valor >= 0),
  constraint desembolso_item_ano_ano_valido     check (ano between 1 and 20)
);

create table if not exists public.desembolso_item_template_ano (
  item_template_id uuid     not null references public.itens_template(id) on delete cascade,
  ano              smallint not null,
  valor            numeric(14,2) not null,
  primary key (item_template_id, ano),
  constraint desembolso_item_template_ano_valor_positivo check (valor >= 0),
  constraint desembolso_item_template_ano_ano_valido     check (ano between 1 and 20)
);

create index if not exists idx_desembolso_item_ano_item          on public.desembolso_item_ano (item_id);
create index if not exists idx_desembolso_item_template_ano_item on public.desembolso_item_template_ano (item_template_id);

-- ----------------------------------------------------------------------------
-- RLS — mesmo padrão de itens_custo / itens_template (SELECT via is_consultor,
-- mutação também via is_consultor porque UI edita direto sem RPC intermediária
-- em alguns fluxos; RPCs abaixo mantêm o mesmo gate).
-- ----------------------------------------------------------------------------

alter table public.desembolso_item_ano          enable row level security;
alter table public.desembolso_item_template_ano enable row level security;

drop policy if exists desembolso_item_ano_select_consultor on public.desembolso_item_ano;
create policy desembolso_item_ano_select_consultor on public.desembolso_item_ano
  for select using (public.is_consultor());

drop policy if exists desembolso_item_ano_insert_consultor on public.desembolso_item_ano;
create policy desembolso_item_ano_insert_consultor on public.desembolso_item_ano
  for insert with check (public.is_consultor());

drop policy if exists desembolso_item_ano_update_consultor on public.desembolso_item_ano;
create policy desembolso_item_ano_update_consultor on public.desembolso_item_ano
  for update using (public.is_consultor()) with check (public.is_consultor());

drop policy if exists desembolso_item_ano_delete_consultor on public.desembolso_item_ano;
create policy desembolso_item_ano_delete_consultor on public.desembolso_item_ano
  for delete using (public.is_consultor());

drop policy if exists desembolso_item_template_ano_select_consultor on public.desembolso_item_template_ano;
create policy desembolso_item_template_ano_select_consultor on public.desembolso_item_template_ano
  for select using (public.is_consultor());

drop policy if exists desembolso_item_template_ano_insert_consultor on public.desembolso_item_template_ano;
create policy desembolso_item_template_ano_insert_consultor on public.desembolso_item_template_ano
  for insert with check (public.is_consultor());

drop policy if exists desembolso_item_template_ano_update_consultor on public.desembolso_item_template_ano;
create policy desembolso_item_template_ano_update_consultor on public.desembolso_item_template_ano
  for update using (public.is_consultor()) with check (public.is_consultor());

drop policy if exists desembolso_item_template_ano_delete_consultor on public.desembolso_item_template_ano;
create policy desembolso_item_template_ano_delete_consultor on public.desembolso_item_template_ano
  for delete using (public.is_consultor());

-- ----------------------------------------------------------------------------
-- RPC — update_item_desembolso(item_id, valores jsonb)
--
-- p_valores é array `[{"ano": 1, "valor": 209640}, ...]`. Sincroniza a tabela
-- ao valor recebido: upsert das linhas presentes, delete das ausentes.
-- Atômica (nada de estado parcial em caso de erro).
-- ----------------------------------------------------------------------------

create or replace function public.update_item_desembolso(p_item_id uuid, p_valores jsonb)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_anos_recebidos smallint[];
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  if jsonb_typeof(p_valores) <> 'array' then
    raise exception 'p_valores deve ser array';
  end if;

  -- Upsert de cada (ano, valor) recebido
  insert into public.desembolso_item_ano (item_id, ano, valor)
  select
    p_item_id,
    (elem->>'ano')::smallint,
    (elem->>'valor')::numeric
  from jsonb_array_elements(p_valores) elem
  on conflict (item_id, ano) do update set valor = excluded.valor;

  -- Coleta os anos que sobreviveram
  select array_agg((elem->>'ano')::smallint)
    into v_anos_recebidos
    from jsonb_array_elements(p_valores) elem;

  -- Delete dos anos ausentes (se recebemos array vazio, apaga tudo)
  if v_anos_recebidos is null then
    delete from public.desembolso_item_ano where item_id = p_item_id;
  else
    delete from public.desembolso_item_ano
    where item_id = p_item_id
      and not (ano = any(v_anos_recebidos));
  end if;
end;
$function$;

revoke execute on function public.update_item_desembolso(uuid, jsonb) from public, anon;
grant  execute on function public.update_item_desembolso(uuid, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- RPC — template_update_item_desembolso(item_template_id, valores jsonb)
-- Estrutura idêntica à acima, para o admin de templates.
-- ----------------------------------------------------------------------------

create or replace function public.template_update_item_desembolso(p_item_template_id uuid, p_valores jsonb)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_anos_recebidos smallint[];
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  if jsonb_typeof(p_valores) <> 'array' then
    raise exception 'p_valores deve ser array';
  end if;

  insert into public.desembolso_item_template_ano (item_template_id, ano, valor)
  select
    p_item_template_id,
    (elem->>'ano')::smallint,
    (elem->>'valor')::numeric
  from jsonb_array_elements(p_valores) elem
  on conflict (item_template_id, ano) do update set valor = excluded.valor;

  select array_agg((elem->>'ano')::smallint)
    into v_anos_recebidos
    from jsonb_array_elements(p_valores) elem;

  if v_anos_recebidos is null then
    delete from public.desembolso_item_template_ano where item_template_id = p_item_template_id;
  else
    delete from public.desembolso_item_template_ano
    where item_template_id = p_item_template_id
      and not (ano = any(v_anos_recebidos));
  end if;
end;
$function$;

revoke execute on function public.template_update_item_desembolso(uuid, jsonb) from public, anon;
grant  execute on function public.template_update_item_desembolso(uuid, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- Herança — carregar_template_exemplo (RPC que instancia projeto do template)
-- passa a copiar os desembolsos do template pra `desembolso_item_ano`.
--
-- Toda a lógica anterior fica igual; o único acréscimo é o `insert into
-- desembolso_item_ano ... from ... join desembolso_item_template_ano ...`
-- feito para cada item recém-criado. A correspondência item_template→item_custo
-- é feita por `nome + unidade + custo_min + custo_max` (única forma robusta,
-- porque a RPC atual não expõe o item_template_id de origem no item de projeto).
-- ----------------------------------------------------------------------------

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

  -- Limpa o projeto (mesmo padrão anterior)
  delete from public.categorias_projeto where projeto_id = p_projeto_id;

  for v_ct in
    select ct.id, ct.catalogo_id, ct.preenche, ct.ordem
      from public.categorias_template ct
      where ct.tipo_projeto_id = p_tipo_projeto_id
      order by ct.ordem
  loop
    insert into public.categorias_projeto (projeto_id, catalogo_id, preenche, ordem)
      values (p_projeto_id, v_ct.catalogo_id, v_ct.preenche, v_ct.ordem)
      returning * into v_categoria;

    -- Cria itens copiando do template E copia o desembolso ano-a-ano
    with itens_novos as (
      insert into public.itens_custo (
        categoria_projeto_id, nome, unidade, custo_min, custo_max,
        fonte, aplicabilidade, ano_previsto, ordem
      )
      select v_categoria.id, it.nome, it.unidade, it.custo_min, it.custo_max,
             it.fonte, it.aplicabilidade, it.ano_previsto, it.ordem
        from public.itens_template it
        where it.categoria_template_id = v_ct.id
      returning id, nome, unidade, custo_min, custo_max
    ),
    template_pareado as (
      select
        i_novo.id                             as item_id,
        d.ano                                 as ano,
        d.valor                               as valor
      from itens_novos i_novo
      join public.itens_template it
        on it.categoria_template_id = v_ct.id
       and it.nome      = i_novo.nome
       and it.unidade   = i_novo.unidade
       and it.custo_min = i_novo.custo_min
       and it.custo_max = i_novo.custo_max
      join public.desembolso_item_template_ano d
        on d.item_template_id = it.id
    )
    insert into public.desembolso_item_ano (item_id, ano, valor)
    select item_id, ano, valor from template_pareado
    on conflict (item_id, ano) do nothing;
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
grant  execute on function public.carregar_template_exemplo(uuid, text) to authenticated;
