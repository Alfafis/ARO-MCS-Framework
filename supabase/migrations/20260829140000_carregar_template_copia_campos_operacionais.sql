-- ============================================================================
-- carregar_template_exemplo passa a copiar campos_operacionais_template
--
-- Contexto: a tabela `campos_operacionais_template` foi introduzida em
-- 25-08 (seed 20260825120000) com 22 registros para o template `fechamento-mina`
-- (perímetro/área/volume/tonelagem/densidade por categoria), mas a RPC de
-- herança nunca foi estendida para copiá-los. Consequência: todo projeto novo
-- criado do template vem com 0 campos operacionais — o consultor precisa
-- redigitar os 22 defaults a cada projeto.
--
-- Correção: no mesmo loop de categorias da RPC, após criar `categorias_projeto`
-- e antes de inserir os itens, insere também os `campos_operacionais` do
-- projeto a partir dos `campos_operacionais_template` da categoria template
-- correspondente, ordenados por `ordem` do template (a tabela projeto não tem
-- coluna `ordem` — a UI ordena por `criado_em`, então a ordem de INSERT
-- preserva a semântica).
--
-- Semântica dos campos herdados:
--   - `label`   ← template.label
--   - `unidade` ← template.unidade
--   - `valor`   ← template.valor_referencia (o default sugerido)
--   - `status`  ← 'pendente' (default do schema; consultor precisa validar
--                 mesmo com valor default antes de marcar como 'preenchido')
--
-- Toda a lógica restante da RPC é preservada idêntica à versão anterior
-- (migration 20260829120000).
-- ============================================================================

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

    -- Copia campos operacionais do template pra projeto (novo em 2026-08-29)
    insert into public.campos_operacionais (categoria_projeto_id, label, valor, unidade, status)
    select v_categoria.id, cot.label, cot.valor_referencia, cot.unidade, 'pendente'
      from public.campos_operacionais_template cot
      where cot.categoria_template_id = v_ct.id
      order by cot.ordem;

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
