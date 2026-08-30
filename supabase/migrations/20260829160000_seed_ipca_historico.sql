-- ============================================================================
-- Seed do IPCA histórico 2022-2025 em `parametros_anuais`
--
-- Contexto: `parametros_anuais` foi populada em 2026-08-25 (seed
-- 20260825120000) e 2026-08-27 (calendarização absoluta) cobrindo o range
-- 2026-2076 — porque só o horizonte do projeto olhava pra frente. Para a
-- ancoragem base_template (2022, NX Gold) → data_base_projeto (2023-2026+)
-- via IPCA acumulado composto, precisamos também dos anos 2022-2025.
--
-- Fontes:
--   - 2022: 5,79% — IPCA IBGE, consolidado (SGS 433)
--   - 2023: 4,62% — IPCA IBGE, consolidado (SGS 433)
--   - 2024: 4,83% — IPCA IBGE, consolidado (SGS 433, divulgado 10-01-2025)
--   - 2025: 4,83% — ESTIMATIVA (não consolidado no cutoff desta migration).
--                   Admin deve substituir por valor oficial quando divulgado
--                   via UI de /parametros-globais.
--
-- Valores populados com valor_min == valor_max porque IPCA histórico é fato
-- consumado (sem incerteza). Só a projeção de anos futuros (2027+) usa a
-- notação de range que a tabela suporta. `fonte='manual'` porque o enum do
-- CHECK só aceita 'bcb-sgs'|'manual' e o histórico foi importado offline.
--
-- Idempotente via ON CONFLICT DO NOTHING — se algum ano já existir por outro
-- caminho (admin populou antes), o valor existente prevalece.
-- ============================================================================

insert into public.parametros_anuais (chave, ano, valor_min, valor_max, fonte)
values
  ('inflacao_ipca', 2022, 5.79, 5.79, 'manual'),
  ('inflacao_ipca', 2023, 4.62, 4.62, 'manual'),
  ('inflacao_ipca', 2024, 4.83, 4.83, 'manual'),
  ('inflacao_ipca', 2025, 4.83, 4.83, 'manual')
on conflict (chave, ano) do nothing;
