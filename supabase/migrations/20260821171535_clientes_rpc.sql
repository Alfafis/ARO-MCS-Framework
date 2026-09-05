-- ============================================================================
-- 20260821171535_clientes_rpc.sql
-- ============================================================================
-- Fase E, fatia "só Clientes": helper de papel, RLS de leitura, RPC de escrita
-- e seed dos 5 clientes demo (antes só existiam no mock em memória do
-- frontend, ProjetoContext.tsx/seedClientes). RPC-first — escrita nunca via
-- `.from()` direto (ver skills/supabase.md do vault).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper de papel — reutilizado por toda policy/RPC que exige consultor
-- ----------------------------------------------------------------------------

create or replace function public.is_consultor()
returns boolean
language sql
security definer
set search_path to 'public'
stable
as $function$
  select exists (
    select 1 from public.perfis where id = (select auth.uid()) and papel = 'consultor'
  );
$function$;

-- ----------------------------------------------------------------------------
-- Leitura simples de clientes via .from() é aceitável (RPC-first é sobre
-- ESCRITA); consultor lê a lista inteira.
-- ----------------------------------------------------------------------------

drop policy if exists clientes_select_consultor on public.clientes;
create policy clientes_select_consultor on public.clientes
  for select
  using (public.is_consultor());

-- Nome de cliente único (case-insensitive) — já era a regra no mock
-- (criarCliente deduplicava por nome antes de inserir); formaliza no banco.
create unique index if not exists clientes_nome_unq on public.clientes (lower(nome));

-- ----------------------------------------------------------------------------
-- Escrita — RPC. Dedup por nome preserva o comportamento do mock: nome
-- repetido retorna a linha existente em vez de duplicar.
-- ----------------------------------------------------------------------------

create or replace function public.create_cliente(p_nome text)
returns public.clientes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_cliente public.clientes;
  v_nome    text := trim(p_nome);
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  select * into v_cliente from public.clientes where lower(nome) = lower(v_nome);
  if found then
    return v_cliente;
  end if;

  insert into public.clientes (nome) values (v_nome)
  returning * into v_cliente;

  return v_cliente;
end;
$function$;

revoke execute on function public.create_cliente(text) from public, anon;
grant execute on function public.create_cliente(text) to authenticated;

-- Seed de clientes demo movido pra supabase/seed.sql (2026-09-04) — só roda em
-- `db reset` local, nunca em `db push`/produção. Ver _ADRs.md do vault.
