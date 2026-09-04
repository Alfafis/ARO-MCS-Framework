-- ============================================================================
-- 20260904140000_lgpd_exportacao_exclusao.sql
-- ============================================================================
-- Pendência 🟠 da auditoria LGPD (2026-09-03): art. 18 (direitos do titular) —
-- Perfil.tsx não tinha exportação nem exclusão de dados.
--
-- Exportação é self-service e instantânea (RPC `exportar_meus_dados`).
--
-- Exclusão NÃO é `delete from auth.users` self-service. `audit_log.usuario_id`
-- referencia `auth.users(id)` SEM `on delete cascade`/`set null` (default
-- `no action`) — de propósito, é o que impede o próprio autor de uma edição
-- de apagar o rastro dela apagando a conta (ver migration do audit_log,
-- 2026-09-04). Isso significa que TODO consultor com histórico de edição
-- (praticamente todos) teria o self-delete abortado por violação de FK — e
-- relaxar essa FK pra permitir o delete destruiria a garantia de
-- accountability que o audit_log existe pra dar.
--
-- Decisão: exclusão é um fluxo de SOLICITAÇÃO (`solicitacoes_exclusao`),
-- mesmo princípio já registrado em `perfis.papel nunca é self-service` —
-- dado sensível/estrutural não muda por ação direta do próprio usuário.
-- A RPC já minimiza o dado pessoal (zera nome/profissão/telefone/foto) no
-- mesmo momento em que registra a solicitação — LGPD art. 16 permite reter
-- o mínimo necessário (aqui, só o id + email, pra login/offboarding e pra
-- manter a referência do audit_log íntegra) quando há obrigação legal ou
-- interesse legítimo de retenção (rastro de auditoria financeira).
-- ============================================================================

create table if not exists public.solicitacoes_exclusao (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  email      text not null,
  status     text not null default 'pendente' check (status in ('pendente', 'concluida')),
  criado_em  timestamptz not null default now()
);

create index if not exists solicitacoes_exclusao_usuario_id_idx on public.solicitacoes_exclusao (usuario_id);

alter table public.solicitacoes_exclusao enable row level security;

drop policy if exists solicitacoes_exclusao_select_own on public.solicitacoes_exclusao;
create policy solicitacoes_exclusao_select_own on public.solicitacoes_exclusao
  for select using (usuario_id = auth.uid());

-- Sem policy de insert/update/delete pra API — só as RPCs abaixo (security
-- definer) escrevem. Usuário não edita/apaga a própria solicitação.

create or replace function public.exportar_meus_dados()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_perfil jsonb;
  v_auth jsonb;
  v_atividade jsonb;
begin
  if v_uid is null then
    raise exception 'Sessão inválida.';
  end if;

  select to_jsonb(p) - 'foto_url' || jsonb_build_object('foto_url', p.foto_url)
    into v_perfil
  from public.perfis p
  where p.id = v_uid;

  select jsonb_build_object(
    'email', u.email,
    'criado_em', u.created_at,
    'ultimo_login', u.last_sign_in_at
  )
  into v_auth
  from auth.users u
  where u.id = v_uid;

  -- Só metadado de atividade (tabela/operação/quando) — dados_antigos/novos
  -- são o registro financeiro do PROJETO do cliente, não dado pessoal do
  -- consultor, e não pertencem a este export.
  select coalesce(jsonb_agg(jsonb_build_object('tabela', a.tabela, 'operacao', a.operacao, 'criado_em', a.criado_em) order by a.criado_em desc), '[]'::jsonb)
    into v_atividade
  from public.audit_log a
  where a.usuario_id = v_uid;

  return jsonb_build_object(
    'perfil', v_perfil,
    'conta', v_auth,
    'atividade', v_atividade,
    'gerado_em', now()
  );
end;
$function$;

create or replace function public.solicitar_exclusao_conta()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_existente public.solicitacoes_exclusao;
begin
  if v_uid is null then
    raise exception 'Sessão inválida.';
  end if;

  select * into v_existente
  from public.solicitacoes_exclusao
  where usuario_id = v_uid and status = 'pendente'
  limit 1;

  if found then
    return to_jsonb(v_existente);
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.solicitacoes_exclusao (usuario_id, email)
  values (v_uid, v_email)
  returning * into v_existente;

  update public.perfis
  set nome = null, profissao = null, telefone = null, foto_url = null
  where id = v_uid;

  return to_jsonb(v_existente);
end;
$function$;
