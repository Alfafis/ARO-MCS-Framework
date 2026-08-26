-- ============================================================================
-- 20260825150000_fix_ipca_percentual.sql
--
-- Corrige inconsistência de escala nos valores de `inflacao_ipca` em
-- `parametros_anuais`. O seed 20260825120000_seed_planilha_nx_gold populou os
-- anos 1..10 em **fração** (0.001..0.05), mas a convenção do sistema é
-- **percentual** — `sequenciaMidpoints` em `src/types/parametrosGlobais.ts`
-- faz `(valor_min + valor_max) / 2 / 100` esperando percentual (14 = 14%).
--
-- Evidências:
--   - `selic` anos 1..10 = 14 → sequenciaMidpoints → 0.14 (14%) ✅
--   - `inflacao_ipca` anos 1..10 = 0.001..0.05 → sequenciaMidpoints → 0.00001..0.0005 ❌ (100× menor)
--   - `inflacao_ipca` ano 11 = 3.5..5.5 (populado por outro fluxo) ✅
--   - `IPCA_RATES` hardcoded em `financeiro.ts` mantém convenção de fração
--     internamente (0.034 = 3.4%) porque nunca passa por `sequenciaMidpoints`.
--
-- Impacto do bug: card "Métodos Monetários" (`computeMonetaryValues`) usa
-- `compostoSequencial` com taxa por ano — com IPCA 100× menor, o método
-- "inflação constante" retornava valor praticamente igual ao base, mascarando
-- a correção. Selic, escalonamento hardcoded e simulação Monte Carlo não são
-- afetados.
--
-- Idempotência: multiplica por 100 apenas se valor_max < 1 (interpretável
-- como fração). Re-executar não afeta nada — ambientes já corrigidos
-- (valor_max ≥ 1) ficam intocados. Ano 11 (que já estava correto) tampouco é
-- tocado, pelo mesmo motivo.
-- ============================================================================

update public.parametros_anuais
set
  valor_min = valor_min * 100,
  valor_max = valor_max * 100
where chave = 'inflacao_ipca'
  and ano between 1 and 10
  and valor_min is not null
  and valor_max is not null
  and valor_max < 1;
