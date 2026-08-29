-- ----------------------------------------------------------------------------
-- Fix — `carregar_template_exemplo` passa a copiar os 4 campos estruturados
-- introduzidos pelo commit 7db1dd8 (2026-08-24, migration 20260824120000_setores_fase_ano):
--   `aplicabilidade_setores`, `fase`, `ano_inicio`, `ano_fim`.
--
-- Estado anterior: a RPC copiava só `nome`, `unidade`, `custo_min`, `custo_max`,
-- `fonte`, `aplicabilidade`, `ano_previsto`, `ordem` — deixava os 4 novos campos
-- como null em qualquer projeto instanciado desde 24-08. Consequência: o motor
-- `computeDesembolsoMatrix` (2026-08-28) caía sempre no fallback "Ano 1" para
-- itens herdados do template, quebrando a curva de desembolso.
--
-- Todo o resto da lógica (herança de `custo_provavel` e de
-- `desembolso_item_ano`) é preservado idêntico ao estado atual (última
-- reescrita foi na migration 20260828130000_custo_provavel_categoria).
-- ----------------------------------------------------------------------------

create or replace function public.carregar_template_exemplo(p_projeto_id uuid, p_tipo_projeto_id text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_ct        record;
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
        fonte, aplicabilidade, ano_previsto, ordem,
        aplicabilidade_setores, fase, ano_inicio, ano_fim
      )
      select v_categoria.id, it.nome, it.unidade, it.custo_min, it.custo_max,
             it.fonte, it.aplicabilidade, it.ano_previsto, it.ordem,
             it.aplicabilidade_setores, it.fase, it.ano_inicio, it.ano_fim
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
