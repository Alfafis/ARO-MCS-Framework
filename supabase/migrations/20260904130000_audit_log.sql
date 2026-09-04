-- ============================================================================
-- 20260904130000_audit_log.sql
-- ============================================================================
-- Achado na auditoria de segurança (2026-09-03): nenhuma tabela financeira
-- rastreava QUEM mudou o quê — `itens_custo`/`itens_template`/
-- `campos_operacionais*`/`categorias_remediacao*` só tinham `atualizado_em`
-- (quando tinham), sem autor nenhum. `parametros_globais`/`parametros_anuais`
-- já tinham `atualizado_por` (só o ÚLTIMO editor, sem histórico de versões
-- anteriores). Se um valor errado aparecer num relatório de cliente, hoje
-- não dá pra saber quem editou nem quando.
--
-- Design: tabela única `audit_log` (append-only, sem policy de escrita pra
-- nenhum papel via API — só o trigger, `security definer`, escreve),
-- trigger genérico aplicado em toda tabela financeira/operacional real.
-- `registro_id` é best-effort (extrai `id` do jsonb da linha quando existe;
-- `parametros_anuais`/`parametros_globais` têm PK composta/não-uuid — fica
-- null nesses dois, mas o jsonb completo (`dados_antigos`/`dados_novos`) já
-- tem `chave`/`ano` dentro, suficiente pra filtrar).
--
-- Fora de escopo desta migration: UI de consulta do audit_log. O essencial
-- é o dado existir e ser consultável via SQL/futuro dashboard — construir a
-- tela de navegação (filtro, paginação, diff visual) é feature separada,
-- maior, sem pedido explícito ainda.
-- ============================================================================

create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  tabela        text not null,
  operacao      text not null check (operacao in ('INSERT', 'UPDATE', 'DELETE')),
  registro_id   text,
  usuario_id    uuid references auth.users(id),
  dados_antigos jsonb,
  dados_novos   jsonb,
  criado_em     timestamptz not null default now()
);

create index if not exists audit_log_tabela_registro_idx on public.audit_log (tabela, registro_id);
create index if not exists audit_log_criado_em_idx on public.audit_log (criado_em desc);

alter table public.audit_log enable row level security;

drop policy if exists audit_log_select_consultor on public.audit_log;
create policy audit_log_select_consultor on public.audit_log
  for select using (public.is_consultor());

-- Sem policy de insert/update/delete pra nenhum papel — só o trigger
-- (security definer, roda como dono da função) escreve. Consultor não pode
-- editar nem apagar o próprio rastro de auditoria.

create or replace function public.fn_audit_log()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_row_json jsonb;
  v_registro_id text;
begin
  v_row_json := to_jsonb(coalesce(new, old));
  v_registro_id := v_row_json ->> 'id';

  if tg_op = 'DELETE' then
    insert into public.audit_log (tabela, operacao, registro_id, usuario_id, dados_antigos)
    values (tg_table_name, tg_op, v_registro_id, auth.uid(), to_jsonb(old));
    return old;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (tabela, operacao, registro_id, usuario_id, dados_antigos, dados_novos)
    values (tg_table_name, tg_op, v_registro_id, auth.uid(), to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into public.audit_log (tabela, operacao, registro_id, usuario_id, dados_novos)
    values (tg_table_name, tg_op, v_registro_id, auth.uid(), to_jsonb(new));
    return new;
  end if;
end;
$function$;

do $$
declare
  v_tabela text;
begin
  foreach v_tabela in array array[
    'itens_custo',
    'itens_template',
    'categorias_projeto',
    'campos_operacionais',
    'campos_operacionais_template',
    'categorias_remediacao',
    'itens_remediacao',
    'categorias_remediacao_template',
    'itens_remediacao_template',
    'parametros_anuais',
    'parametros_globais'
  ]
  loop
    execute format(
      'drop trigger if exists trg_audit_log on public.%I; ' ||
      'create trigger trg_audit_log after insert or update or delete on public.%I ' ||
      'for each row execute function public.fn_audit_log();',
      v_tabela, v_tabela
    );
  end loop;
end $$;
