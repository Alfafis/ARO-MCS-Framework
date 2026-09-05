-- ============================================================================
-- 20260905180054_clientes_email.sql
-- ============================================================================
-- Pré-requisito pros e-mails transacionais de cliente (ver spec
-- 2026-09-05-emails-transacionais-design no vault) — `clientes` não tinha
-- nenhum contato até agora (só id/nome/criado_em). 1 e-mail por cliente,
-- nullable (cliente já cadastrado sem e-mail continua funcionando, só não
-- habilita o botão de enviar por e-mail até alguém preencher).
-- ============================================================================

alter table public.clientes add column if not exists email text;

-- Escrita via RPC (RPC-first, mesmo padrão de create_cliente) — sem UPDATE
-- policy pra clientes, `.from().update()` direto seria silenciosamente
-- filtrado pelo RLS default-deny (mesma classe de bug já documentada em
-- outras ADRs deste projeto: perfis.tema, audit_log).
create or replace function public.atualizar_email_cliente(p_id uuid, p_email text)
returns public.clientes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_cliente public.clientes;
  v_email   text := nullif(trim(p_email), '');
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.clientes
  set email = v_email
  where id = p_id
  returning * into v_cliente;

  if not found then
    raise exception 'Cliente não encontrado';
  end if;

  return v_cliente;
end;
$function$;

revoke execute on function public.atualizar_email_cliente(uuid, text) from public, anon;
grant execute on function public.atualizar_email_cliente(uuid, text) to authenticated;
