-- ============================================================================
-- 20260903151500_rpcs_update_item_formula.sql
-- ============================================================================
-- Estende `update_item_custo`/`template_update_item` (última versão:
-- 20260824130000_rpcs_update_item_setores.sql) pros 3 campos novos do motor
-- de fórmula (20260903150000_formula_campos_operacionais.sql):
--   custoUnitarioMin/Max → custo_unitario_min/max (numeric)
--   formulaQuantidade    → formula_quantidade (text)
--
-- Mesmo padrão "chave presente sobrescreve (inclusive com null), chave
-- ausente preserva" já usado pra aplicabilidadeSetores/fase/anoInicio/anoFim
-- — consultor precisa poder REMOVER uma fórmula (voltar pro item estático),
-- não só adicionar.
-- ============================================================================

create or replace function public.update_item_custo(p_id uuid, p_patch jsonb)
returns public.itens_custo
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item      public.itens_custo;
  v_setores   integer[];
  v_invalidos integer;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  if p_patch ? 'aplicabilidadeSetores' and p_patch->'aplicabilidadeSetores' is not null and jsonb_typeof(p_patch->'aplicabilidadeSetores') = 'array' then
    select array(select jsonb_array_elements_text(p_patch->'aplicabilidadeSetores')::int) into v_setores;
    select count(*) into v_invalidos
      from unnest(v_setores) s
      where not exists (select 1 from public.setores where id = s);
    if v_invalidos > 0 then
      raise exception 'aplicabilidadeSetores contém IDs inválidos';
    end if;
  end if;

  update public.itens_custo set
    nome                   = coalesce(p_patch->>'nome',                                     nome),
    unidade                = coalesce(p_patch->>'unidade',                                  unidade),
    custo_min              = coalesce((p_patch->>'custoMin')::numeric,                      custo_min),
    custo_max              = coalesce((p_patch->>'custoMax')::numeric,                      custo_max),
    fonte                  = coalesce(p_patch->>'fonte',                                    fonte),
    aplicabilidade         = coalesce(p_patch->>'aplicabilidade',                           aplicabilidade),
    ano_previsto           = coalesce(p_patch->>'anoPrevisto',                              ano_previsto),
    aplicabilidade_setores = case
                               when p_patch ? 'aplicabilidadeSetores' then v_setores
                               else aplicabilidade_setores
                             end,
    fase                   = case
                               when p_patch ? 'fase' then nullif(p_patch->>'fase', '')
                               else fase
                             end,
    ano_inicio             = case
                               when p_patch ? 'anoInicio' then nullif(p_patch->>'anoInicio', '')::smallint
                               else ano_inicio
                             end,
    ano_fim                = case
                               when p_patch ? 'anoFim' then nullif(p_patch->>'anoFim', '')::smallint
                               else ano_fim
                             end,
    custo_unitario_min     = case
                               when p_patch ? 'custoUnitarioMin' then nullif(p_patch->>'custoUnitarioMin', '')::numeric
                               else custo_unitario_min
                             end,
    custo_unitario_max     = case
                               when p_patch ? 'custoUnitarioMax' then nullif(p_patch->>'custoUnitarioMax', '')::numeric
                               else custo_unitario_max
                             end,
    formula_quantidade     = case
                               when p_patch ? 'formulaQuantidade' then nullif(p_patch->>'formulaQuantidade', '')
                               else formula_quantidade
                             end,
    atualizado_em          = now()
  where id = p_id
  returning * into v_item;

  return v_item;
end;
$function$;

revoke execute on function public.update_item_custo(uuid, jsonb) from public, anon;
grant execute on function public.update_item_custo(uuid, jsonb) to authenticated;

create or replace function public.template_update_item(p_id uuid, p_patch jsonb)
returns public.itens_template
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item      public.itens_template;
  v_setores   integer[];
  v_invalidos integer;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  if p_patch ? 'aplicabilidadeSetores' and p_patch->'aplicabilidadeSetores' is not null and jsonb_typeof(p_patch->'aplicabilidadeSetores') = 'array' then
    select array(select jsonb_array_elements_text(p_patch->'aplicabilidadeSetores')::int) into v_setores;
    select count(*) into v_invalidos
      from unnest(v_setores) s
      where not exists (select 1 from public.setores where id = s);
    if v_invalidos > 0 then
      raise exception 'aplicabilidadeSetores contém IDs inválidos';
    end if;
  end if;

  update public.itens_template set
    nome                   = coalesce(p_patch->>'nome',                                     nome),
    unidade                = coalesce(p_patch->>'unidade',                                  unidade),
    custo_min              = coalesce((p_patch->>'custoMin')::numeric,                      custo_min),
    custo_max              = coalesce((p_patch->>'custoMax')::numeric,                      custo_max),
    fonte                  = coalesce(p_patch->>'fonte',                                    fonte),
    aplicabilidade         = coalesce(p_patch->>'aplicabilidade',                           aplicabilidade),
    ano_previsto           = coalesce(p_patch->>'anoPrevisto',                              ano_previsto),
    aplicabilidade_setores = case
                               when p_patch ? 'aplicabilidadeSetores' then v_setores
                               else aplicabilidade_setores
                             end,
    fase                   = case
                               when p_patch ? 'fase' then nullif(p_patch->>'fase', '')
                               else fase
                             end,
    ano_inicio             = case
                               when p_patch ? 'anoInicio' then nullif(p_patch->>'anoInicio', '')::smallint
                               else ano_inicio
                             end,
    ano_fim                = case
                               when p_patch ? 'anoFim' then nullif(p_patch->>'anoFim', '')::smallint
                               else ano_fim
                             end,
    custo_unitario_min     = case
                               when p_patch ? 'custoUnitarioMin' then nullif(p_patch->>'custoUnitarioMin', '')::numeric
                               else custo_unitario_min
                             end,
    custo_unitario_max     = case
                               when p_patch ? 'custoUnitarioMax' then nullif(p_patch->>'custoUnitarioMax', '')::numeric
                               else custo_unitario_max
                             end,
    formula_quantidade     = case
                               when p_patch ? 'formulaQuantidade' then nullif(p_patch->>'formulaQuantidade', '')
                               else formula_quantidade
                             end,
    atualizado_em          = now()
  where id = p_id
  returning * into v_item;

  return v_item;
end;
$function$;

revoke execute on function public.template_update_item(uuid, jsonb) from public, anon;
grant execute on function public.template_update_item(uuid, jsonb) to authenticated;
