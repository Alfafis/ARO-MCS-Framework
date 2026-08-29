-- ============================================================================
-- 20260828130000_custo_provavel_categoria.sql
-- ============================================================================
-- Adiciona campo `custo_provavel` (moda "pela experiência") em
-- `categorias_projeto` e `categorias_template`.
--
-- Contexto:
-- A planilha NX Gold registra a moda por categoria (`1.Estudos!F18 =
-- 8.150.000` = valor agregado hardcoded, digitado pelo consultor), não por
-- item. Hoje `categoryParamsFromCategorias` derivava mode como `(min+max)/2`,
-- que dá um valor diferente e enviesa a Triangular do MC pro meio simétrico
-- em vez de refletir a experiência do consultor.
--
-- Nullable = fallback pra `(min+max)/2` quando o consultor não preencher
-- (garante que projetos legados continuam simulando sem intervenção).
--
-- Sem constraint `entre min e max` no banco: `min` e `max` da categoria são
-- derivados da soma dos itens, mudam a cada edição. Validação de coerência
-- fica no frontend com warning visual, sem bloquear salvar.
--
-- Ver `_Dados_Formulas_Planilha.md` (Etapa 1) e `_Session.md`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Colunas
-- ----------------------------------------------------------------------------

alter table public.categorias_projeto
  add column if not exists custo_provavel numeric(14,2) null;

alter table public.categorias_template
  add column if not exists custo_provavel numeric(14,2) null;

-- ----------------------------------------------------------------------------
-- RPCs de update — seguem o padrão single-field de
-- `template_update_categoria_preenche` (RPC específica em vez de patch jsonb,
-- porque só temos um campo mutável por ora nesta tabela).
--
-- p_valor null = "consultor removeu, volta pro fallback (min+max)/2".
-- ----------------------------------------------------------------------------

create or replace function public.update_categoria_custo_provavel(p_categoria_id uuid, p_valor numeric)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissao';
  end if;

  update public.categorias_projeto set custo_provavel = p_valor where id = p_categoria_id;
end;
$function$;

revoke execute on function public.update_categoria_custo_provavel(uuid, numeric) from public, anon;
grant  execute on function public.update_categoria_custo_provavel(uuid, numeric) to authenticated;

create or replace function public.template_update_categoria_custo_provavel(p_categoria_template_id uuid, p_valor numeric)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissao';
  end if;

  update public.categorias_template set custo_provavel = p_valor where id = p_categoria_template_id;
end;
$function$;

revoke execute on function public.template_update_categoria_custo_provavel(uuid, numeric) from public, anon;
grant  execute on function public.template_update_categoria_custo_provavel(uuid, numeric) to authenticated;

-- ----------------------------------------------------------------------------
-- Extensão de `carregar_template_exemplo` — passa a copiar `custo_provavel`
-- do template para o projeto ao instanciar. Sem isso, cada categoria criada
-- iria começar null e o consultor teria que preencher de novo.
-- Mantém a herança do desembolso ano-a-ano (adicionada em 20260828120000).
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
    raise exception 'Sem permissao';
  end if;

  delete from public.categorias_projeto where projeto_id = p_projeto_id;

  for v_ct in
    select ct.id, ct.catalogo_id, ct.preenche, ct.ordem, ct.custo_provavel
      from public.categorias_template ct
      where ct.tipo_projeto_id = p_tipo_projeto_id
      order by ct.ordem
  loop
    insert into public.categorias_projeto (projeto_id, catalogo_id, preenche, ordem, custo_provavel)
      values (p_projeto_id, v_ct.catalogo_id, v_ct.preenche, v_ct.ordem, v_ct.custo_provavel)
      returning * into v_categoria;

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
        i_novo.id  as item_id,
        d.ano      as ano,
        d.valor    as valor
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
