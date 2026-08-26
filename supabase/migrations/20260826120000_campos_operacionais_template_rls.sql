-- ============================================================================
-- 20260826120000_campos_operacionais_template_rls.sql
--
-- Adiciona policies INSERT/UPDATE/DELETE na tabela `campos_operacionais_template`
-- para que o consultor possa administrar via UI (`/categorias-custo` →
-- CampoOpRow em CategoryBlock).
--
-- Contexto: a migration `20260825120000_seed_planilha_nx_gold.sql` criou a
-- tabela com apenas `select using (is_consultor())`, seguindo o padrão de
-- `itens_template` e `categorias_template` — que só tem SELECT porque toda
-- mutação passa por RPCs `security definer` (template_add_item,
-- template_update_item, etc.).
--
-- A UI implementada em 25-08 optou por acesso direto à tabela via
-- `supabase.from(...)` — mesmo padrão do fetch de `setores`. Isso é mais
-- simples que criar RPCs dedicadas, mas exige as policies de mutação
-- explicitamente aqui.
--
-- Guard: `is_consultor()` — a mesma que as RPCs usam internamente. Sem
-- afrouxamento de acesso, só reformula onde o check acontece.
-- ============================================================================

create policy campos_operacionais_template_insert_consultor
  on public.campos_operacionais_template
  for insert
  with check (public.is_consultor());

create policy campos_operacionais_template_update_consultor
  on public.campos_operacionais_template
  for update
  using (public.is_consultor())
  with check (public.is_consultor());

create policy campos_operacionais_template_delete_consultor
  on public.campos_operacionais_template
  for delete
  using (public.is_consultor());
