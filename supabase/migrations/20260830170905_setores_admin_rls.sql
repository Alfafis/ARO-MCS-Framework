-- ============================================================================
-- 20260830170905_setores_admin_rls.sql
-- ============================================================================
-- Habilita mutações administradas na tabela `setores` — hoje só tem policy de
-- SELECT (migration 20260824120000). Consultor precisa renomear Setor 5 e
-- Setor 10 (não descobertos na planilha, ficaram provisórios) e eventualmente
-- adicionar/remover setores conforme novos projetos entram.
--
-- Mesmo padrão de `campos_operacionais_template` (migration
-- 20260826120000_campos_operacionais_template_rls): mutação direta via
-- supabase.from('setores') com policies `is_consultor()` explícitas
-- (opção B do Feedback do vault — tabela lookup simples, não vale RPC).
-- ============================================================================

-- INSERT — consultor pode adicionar setor novo. ID deve ser fornecido pelo
-- cliente (não usa serial pois queremos preservar a numeração humana da
-- planilha, ex.: "Setor 11").
drop policy if exists setores_insert_consultor on public.setores;
create policy setores_insert_consultor on public.setores
  for insert
  with check (public.is_consultor());

-- UPDATE — consultor pode renomear qualquer setor. O `id` (PK) fica
-- imutável em prática porque a policy WITH CHECK usa o mesmo predicado
-- (impede escalation/troca de id). Client só faz UPDATE de `nome`.
drop policy if exists setores_update_consultor on public.setores;
create policy setores_update_consultor on public.setores
  for update
  using (public.is_consultor())
  with check (public.is_consultor());

-- DELETE — consultor pode remover setor. FK de `itens_custo` e
-- `itens_template` usa smallint[] (`aplicabilidade_setores`), não FK física;
-- guardas de "setor em uso" ficam a cargo do frontend antes de tentar delete
-- (mostra tooltip explicando).
drop policy if exists setores_delete_consultor on public.setores;
create policy setores_delete_consultor on public.setores
  for delete
  using (public.is_consultor());
