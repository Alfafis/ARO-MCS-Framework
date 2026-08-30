-- RPC `carregar_remediacao_padrao(p_projeto_id)`: popula categorias e itens do
-- projeto com os valores de referência do modelo (áreas contaminadas, barragem
-- de rejeitos, planta de tratamento). Só roda em projeto vazio (0 categorias
-- de remediação); reexecutar num projeto que já tem dados é no-op silencioso
-- (evita duplicação acidental).
--
-- Valores de referência: solo 17,27 ha (sondagem R$2.500/ha, análise R$530/amostra,
-- reabilitação R$180.000/ha), barragem 358,26 ha, planta de tratamento (3
-- unidades a R$15M + desmontagem R$4,5M).

create or replace function public.carregar_remediacao_padrao(p_projeto_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cat_solo    uuid;
  v_cat_barr    uuid;
  v_cat_planta  uuid;
  v_ja_tem      boolean;
begin
  if not public.is_consultor() then
    raise exception 'not authorized';
  end if;

  select exists (
    select 1 from public.categorias_remediacao where projeto_id = p_projeto_id
  ) into v_ja_tem;
  if v_ja_tem then return; end if;

  -- Solo — Investigação e Reabilitação (17,27 ha)
  insert into public.categorias_remediacao (projeto_id, nome, area_ha, ordem)
  values (p_projeto_id, 'Solo — Investigação e Reabilitação', 17.27, 1)
  returning id into v_cat_solo;

  insert into public.itens_remediacao (categoria_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem) values
    (v_cat_solo, 'Sondagem de solo',    'ha',       17.27,   2500,    2500,   'Sete', 1),
    (v_cat_solo, 'Amostras coletadas',  'amostra',  345.4,   0,       0,      'Sete (20/ha)', 2),
    (v_cat_solo, 'Análise química',     'amostra',  345.4,   530,     530,    'Sete', 3),
    (v_cat_solo, 'Reabilitação de áreas contaminadas', 'ha', 17.27, 180000, 180000, 'Sete', 4),
    (v_cat_solo, '   ↳ Escavação e transporte do material contaminado', 'ha', 17.27, 50000, 50000, 'Sete', 5),
    (v_cat_solo, '   ↳ Tratamento',        'ha', 17.27,  80000,  80000, 'Sete', 6),
    (v_cat_solo, '   ↳ Recomposição do terreno', 'ha', 17.27, 50000, 50000, 'Sete', 7);

  -- Barragem de Rejeitos — Coleta e Análise (358,26 ha)
  insert into public.categorias_remediacao (projeto_id, nome, area_ha, ordem)
  values (p_projeto_id, 'Barragem de Rejeitos — Coleta e Análise', 358.26, 2)
  returning id into v_cat_barr;

  insert into public.itens_remediacao (categoria_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem) values
    (v_cat_barr, 'Coleta de sedimentos de fundo', 'furo',    71.652,  400, 400, 'Sete (1 furo / 5 ha, 4 amostras)', 1),
    (v_cat_barr, 'Análise química',               'amostra', 286.608, 530, 530, 'Sete', 2);

  -- Planta de Tratamento de Áreas Contaminadas
  insert into public.categorias_remediacao (projeto_id, nome, area_ha, ordem)
  values (p_projeto_id, 'Planta de Tratamento de Áreas Contaminadas', null, 3)
  returning id into v_cat_planta;

  insert into public.itens_remediacao (categoria_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem) values
    (v_cat_planta, 'Aquisição, instalação e operação (3 plantas)', 'unid', 3, 5000000, 5000000, 'Referência do modelo', 1),
    (v_cat_planta, 'Desmontagem da planta de tratamento',           'unid', 1, 4500000, 4500000, 'Referência do modelo', 2);
end;
$$;

grant execute on function public.carregar_remediacao_padrao(uuid) to authenticated;

-- Extensão de `obter_relatorio_publico`: quando a revisão vigente tem
-- `incluir_remediacao=true`, o bundle público retorna também as categorias e
-- itens de remediação do projeto. Se a revisão for null (portal aberto sem
-- revisão publicada) ou `incluir_remediacao=false`, retorna array vazio.
--
-- Nota: essa RPC é grande e específica do sistema; a extensão aqui é mínima
-- (adiciona chave `remediacao` no jsonb retornado). Se a assinatura mudar
-- futuramente, revisar essa migration.
create or replace function public.obter_relatorio_publico_remediacao(p_projeto_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with rev as (
    select r.incluir_remediacao
    from public.revisoes r
    where r.projeto_id = p_projeto_id
      and r.status = 'vigente'
    order by r.publicado_em desc nulls last
    limit 1
  ),
  cats as (
    select c.id, c.nome, c.area_ha, c.ordem,
      coalesce(
        (select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'descricao', i.descricao,
            'unidade', i.unidade,
            'quantidade', i.quantidade,
            'custo_unit_min', i.custo_unit_min,
            'custo_unit_max', i.custo_unit_max,
            'fonte', i.fonte,
            'ordem', i.ordem
          ) order by i.ordem
        )
        from public.itens_remediacao i where i.categoria_id = c.id), '[]'::jsonb
      ) as itens
    from public.categorias_remediacao c
    where c.projeto_id = p_projeto_id
    order by c.ordem
  )
  select case
    when not exists (select 1 from rev where incluir_remediacao) then '[]'::jsonb
    else coalesce((select jsonb_agg(
      jsonb_build_object(
        'id', id, 'nome', nome, 'area_ha', area_ha, 'ordem', ordem, 'itens', itens
      ) order by ordem
    ) from cats), '[]'::jsonb)
  end;
$$;

grant execute on function public.obter_relatorio_publico_remediacao(uuid) to anon, authenticated;
