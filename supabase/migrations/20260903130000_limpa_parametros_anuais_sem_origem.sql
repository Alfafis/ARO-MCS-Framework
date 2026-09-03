-- ============================================================================
-- 20260903130000_limpa_parametros_anuais_sem_origem.sql
-- ============================================================================
-- Achado ao investigar a pendência "valores de teste em parametros_anuais":
-- não era só teste. IPCA anos 2026-2035 (ano-calendário) vinha do seed
-- 20260825120000_seed_planilha_nx_gold.sql — dado REAL da planilha de UM
-- cliente (NX Gold), sem rótulo, servindo como default silencioso de
-- inflação pra TODO projeto de TODO cliente da plataforma desde 25/08. Selic
-- 2026-2035 era um flat "14/14" sem origem em migration nenhuma (grep vazio
-- em supabase/migrations/*.sql) — digitado direto na UI em algum teste.
-- IPCA 2036 é sobra de um ano que o seed nunca cobriu (só ia até ano 10).
--
-- 2026-2030 NÃO entra aqui — já foi sobrescrito com Boletim Focus real
-- (migration 20260903120000_bcb_focus_fonte.sql + fonte='bcb-focus').
--
-- Decisão (aprovada pelo usuário, 2026-09-03): zerar 2031-2036 em vez de
-- deixar dado emprestado/sem origem passar por default neutro. Mesma
-- doutrina já aplicada em outros lugares do projeto — dado não disponível
-- fica vazio, nunca mockado ou herdado silenciosamente de um cliente
-- específico. `sequenciaMidpoints` (types/parametrosGlobais.ts) já trata
-- null com segurança — retorna null pro cálculo inteiro em vez de calcular
-- com buraco no meio.
-- ============================================================================

update public.parametros_anuais
set valor_min = null, valor_max = null, fonte = 'manual'
where chave in ('inflacao_ipca', 'selic')
  and ano between 2031 and 2036;
