-- ============================================================================
-- RLS policies para `campos_operacionais` (por projeto)
--
-- Bug pré-existente: a tabela foi criada com RLS habilitada e sem qualquer
-- policy (deny all). Consequência: nem o consultor autenticado conseguia ler
-- os campos operacionais do projeto — a tabela vinha inerte desde o commit
-- inicial do schema.
--
-- Sem consequência visível até agora porque:
--   (a) o INSERT do template rodava via RPC `carregar_template_exemplo`
--       (SECURITY DEFINER, bypassa RLS na escrita), mas
--   (b) a RPC não estava copiando `campos_operacionais_template` até a
--       migration 20260829140000 (aplicada nesta sessão), então a tabela
--       ficava vazia mesmo, e
--   (c) o `fetchProjetos` do frontend nunca leu essa tabela — o embed no
--       SELECT nunca foi feito. Consumo pelo frontend será wired na mesma
--       sessão (extensão do embed em ProjetoContext).
--
-- Policies adotam o mesmo padrão de `desembolso_item_ano`, `itens_custo` e
-- outras tabelas "por projeto": guard `is_consultor()` em SELECT/INSERT/
-- UPDATE/DELETE, com WITH CHECK apropriado em INSERT/UPDATE.
-- ============================================================================

create policy "campos_operacionais_select_consultor"
  on public.campos_operacionais
  for select
  using (public.is_consultor());

create policy "campos_operacionais_insert_consultor"
  on public.campos_operacionais
  for insert
  with check (public.is_consultor());

create policy "campos_operacionais_update_consultor"
  on public.campos_operacionais
  for update
  using (public.is_consultor())
  with check (public.is_consultor());

create policy "campos_operacionais_delete_consultor"
  on public.campos_operacionais
  for delete
  using (public.is_consultor());
