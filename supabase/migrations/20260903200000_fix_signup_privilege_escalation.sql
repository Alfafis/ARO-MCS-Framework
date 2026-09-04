-- ============================================================================
-- 20260903200000_fix_signup_privilege_escalation.sql
-- ============================================================================
-- Achado CRÍTICO na auditoria de segurança (2026-09-03): handle_new_user()
-- (migration 20260821165630) lia `papel` direto de
-- `new.raw_user_meta_data->>'papel'` — campo controlado pelo CLIENTE no
-- payload de `auth.signUp()`. Qualquer holder da anon key (pública por
-- design) podia chamar `POST /auth/v1/signup` com
-- `data: {papel: "consultor"}` e virar consultor instantâneo — acesso total
-- a todo cliente/projeto/dado financeiro da plataforma via `is_consultor()`.
--
-- O comentário original ("consultor não tem self-signup, promoção é manual")
-- descrevia intenção, não o que o trigger de fato impunha. Fix: `papel`
-- sempre 'cliente' no signup, ignorando qualquer metadata enviada pelo
-- client. Promoção a consultor continua 100% manual (update direto no
-- banco) — nada no app depende de `papel` vir preenchido no momento do
-- signup, zero regressão de fluxo real.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
begin
  insert into public.perfis (id, papel)
  values (new.id, 'cliente');
  return new;
end;
$function$;
