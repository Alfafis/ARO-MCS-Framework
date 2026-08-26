-- ============================================================================
-- 20260825130000_backfill_setores_ano.sql
--
-- Backfill one-off dos campos estruturados (aplicabilidade_setores, ano_inicio,
-- ano_fim) a partir dos legados em texto (aplicabilidade, ano_previsto) — em
-- itens_custo e itens_template.
--
-- Contexto: a migration 20260824120000_setores_fase_ano.sql introduziu as
-- colunas estruturadas mantendo as legadas nullable como fallback durante
-- rollout. O seed 20260825120000_seed_planilha_nx_gold populou 62 itens
-- template (e projetos existentes têm 10 itens_custo) só com o texto legado.
-- Esta migration parseia esses textos para preencher os campos estruturados,
-- deixando o legado intacto — drop das colunas antigas fica pra fase 2.
--
-- Padrões cobertos (universo real do banco em 25-08):
--
--   aplicabilidade → aplicabilidade_setores (smallint[])
--     "Setor 1"                         → [1]
--     "Setor 7"                         → [7]
--     "Setores 2, 3 e 4"                → [2,3,4]
--     "Setor 4, 5, 6, 7, 8 e 9"         → [4,5,6,7,8,9]
--     "Setor 4, 6, 8, 9"                → [4,6,8,9]
--     "Setor 4, 5, 6, 7, 8 e 10"        → [4,5,6,7,8,10]
--     "Todos os setores"                → null (semântica: aplica a todos)
--     "Todos os setores internos ..."   → null (idem)
--
--   ano_previsto → ano_inicio, ano_fim (smallint)
--     "Ano N"                           → (N, N)
--     "Anos A-B"                        → (A, B)
--
-- fase: não há legado em texto — permanece null. Admin preenche pela UI.
--
-- Idempotência: WHERE campo_estruturado IS NULL — re-rodar não sobrescreve
-- ajustes manuais posteriores.
-- ============================================================================

-- itens_template: aplicabilidade → aplicabilidade_setores
update public.itens_template as it
set aplicabilidade_setores = case
  when it.aplicabilidade ilike 'todos os setores%' then null
  else (
    select array_agg((m[1])::smallint order by (m[1])::smallint)
    from regexp_matches(it.aplicabilidade, '\d+', 'g') as m
  )
end
where it.aplicabilidade_setores is null
  and it.aplicabilidade is not null
  and it.aplicabilidade <> ''
  and it.aplicabilidade not ilike 'todos os setores%'; -- "Todos" já é null, evita UPDATE noop

-- itens_template: ano_previsto → ano_inicio / ano_fim
update public.itens_template as it
set
  ano_inicio = (regexp_match(it.ano_previsto, '(\d+)(?:\D+(\d+))?'))[1]::smallint,
  ano_fim = coalesce(
    (regexp_match(it.ano_previsto, '(\d+)(?:\D+(\d+))?'))[2],
    (regexp_match(it.ano_previsto, '(\d+)(?:\D+(\d+))?'))[1]
  )::smallint
where it.ano_inicio is null
  and it.ano_fim is null
  and it.ano_previsto is not null
  and it.ano_previsto <> ''
  and it.ano_previsto ~ '\d';

-- itens_custo: aplicabilidade → aplicabilidade_setores
update public.itens_custo as ic
set aplicabilidade_setores = case
  when ic.aplicabilidade ilike 'todos os setores%' then null
  else (
    select array_agg((m[1])::smallint order by (m[1])::smallint)
    from regexp_matches(ic.aplicabilidade, '\d+', 'g') as m
  )
end
where ic.aplicabilidade_setores is null
  and ic.aplicabilidade is not null
  and ic.aplicabilidade <> ''
  and ic.aplicabilidade not ilike 'todos os setores%';

-- itens_custo: ano_previsto → ano_inicio / ano_fim
update public.itens_custo as ic
set
  ano_inicio = (regexp_match(ic.ano_previsto, '(\d+)(?:\D+(\d+))?'))[1]::smallint,
  ano_fim = coalesce(
    (regexp_match(ic.ano_previsto, '(\d+)(?:\D+(\d+))?'))[2],
    (regexp_match(ic.ano_previsto, '(\d+)(?:\D+(\d+))?'))[1]
  )::smallint
where ic.ano_inicio is null
  and ic.ano_fim is null
  and ic.ano_previsto is not null
  and ic.ano_previsto <> ''
  and ic.ano_previsto ~ '\d';
