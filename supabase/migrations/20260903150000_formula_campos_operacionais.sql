-- ============================================================================
-- 20260903150000_formula_campos_operacionais.sql
-- ============================================================================
-- Subsistema 3 (spec 2026-09-03-timing-formula-campos-operacionais-design.md).
--
-- Hoje campos operacionais derivados (ex.: Volume = Perímetro × Largura ×
-- Altura, na planilha NX Gold) são gravados como número ESTÁTICO — editar
-- Perímetro não recalcula Volume. `itens_custo`/`itens_template` guardam só o
-- total já multiplicado (custo_min/custo_max), sem custo_unitário nem a
-- fórmula de quantidade.
--
-- Todas as colunas são aditivas e nullable — item/campo sem fórmula continua
-- usando o valor estático exatamente como hoje. `formula`/`formula_quantidade`
-- só são escritas por consultor (mesma RLS is_consultor() já existente nas 4
-- tabelas — sem RPC nova, mutação direta via .from() update).
-- ============================================================================

alter table public.campos_operacionais
  add column if not exists formula text; -- null = folha (valor digitado); preenchida = derivado

alter table public.campos_operacionais_template
  add column if not exists formula text;

alter table public.itens_custo
  add column if not exists custo_unitario_min numeric(14,4),
  add column if not exists custo_unitario_max numeric(14,4),
  add column if not exists formula_quantidade text; -- expressão referenciando label de campo_operacional

alter table public.itens_template
  add column if not exists custo_unitario_min numeric(14,4),
  add column if not exists custo_unitario_max numeric(14,4),
  add column if not exists formula_quantidade text;
