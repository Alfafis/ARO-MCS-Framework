-- ============================================================================
-- 20260827120000_parametros_anuais_calendario.sql
-- ============================================================================
-- Troca a semântica de `parametros_anuais.ano` de RELATIVO (1..20, ano do
-- horizonte do projeto) para ABSOLUTO (ano-calendário, ex.: 2026, 2027...).
--
-- Motivação:
--   - IPCA e Selic são medidas indexadas por ano-calendário por natureza
--     (FOCUS, BCB, expectativa de mercado). Persistir como relativo cria
--     duplicação e divergência entre projetos com diferentes anos de partida.
--   - Bug latente: parametros_anuais é global mas com semântica relativa —
--     Projeto A começando em 2026 e Projeto B em 2028 compartilham a mesma
--     linha "Ano 5" pra significados diferentes (2030 vs 2032).
--
-- Backfill: qualquer linha com valor_min OU valor_max não-null é preservada,
-- mapeando `ano_antigo → 2025 + ano_antigo` (Ano 1 = 2026). Isso cobre o seed
-- NX Gold (IPCA 1..10 = 2026..2035), IPCA ano 11 = 2036, e Selic 1..10 =
-- 2026..2035, assumindo que o projeto NX Gold começa em 2026.
--
-- Range escolhido:
--   2000..2200 na constraint (folgado). O UI vai mostrar `currentYear..+50`
--   como default, com botão pra ver anos anteriores até 10 atrás ou até o
--   ano mais antigo com dado (o que for menor).
-- ============================================================================

-- 1. Backup de qualquer linha com dado (não só IPCA 1..10 do seed)
create temporary table _pa_backup on commit drop as
  select chave, ano, valor_min, valor_max, fonte, atualizado_em, atualizado_por
  from public.parametros_anuais
  where valor_min is not null or valor_max is not null;

-- 2. Wipe da tabela — todas as 40 linhas atuais (2 chaves × 20 anos) somem
delete from public.parametros_anuais;

-- 3. Troca constraint pra ano-calendário
alter table public.parametros_anuais drop constraint parametros_anuais_ano_check;
alter table public.parametros_anuais add constraint parametros_anuais_ano_check
  check (ano between 2000 and 2200);

-- 4. Insert do range default 2026..2076 (51 anos) para ambas chaves
insert into public.parametros_anuais (chave, ano)
select chave, ano
from unnest(array['inflacao_ipca', 'selic']) as chave
cross join generate_series(2026, 2076) as ano;

-- 5. Restaura valores do backup: ano antigo N → ano-calendário 2025 + N
--    (Ano 1 = 2026, Ano 2 = 2027, ..., Ano 11 = 2036, ..., Ano 20 = 2045).
--    Como todas as linhas do range default já existem (passo 4), usa update
--    direto por chave + ano-alvo em vez de insert-on-conflict.
update public.parametros_anuais pa
set valor_min      = b.valor_min,
    valor_max      = b.valor_max,
    fonte          = b.fonte,
    atualizado_em  = b.atualizado_em,
    atualizado_por = b.atualizado_por
from _pa_backup b
where pa.chave = b.chave
  and pa.ano   = 2025 + b.ano;
