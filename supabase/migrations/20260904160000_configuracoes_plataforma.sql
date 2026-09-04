-- ============================================================================
-- 20260904160000_configuracoes_plataforma.sql
-- ============================================================================
-- Personalização de plataforma (logo, cor primária, fundo) — 1 config GLOBAL,
-- não por cliente/white-label (decisão explícita do usuário, 2026-09-04:
-- produto é single-tenant, "Be Planned" único). Singleton (id fixo = 1).
--
-- Leitura é PÚBLICA de propósito — diferente de toda outra tabela deste
-- projeto (que segue "dado público só sai por RPC única"). Aqui não há dado
-- sensível: logo/cor/fundo já são visíveis a qualquer visitante no HTML/CSS
-- renderizado, inclusive no Portal do Cliente (anon) — RLS aberta é
-- consistente com o que já é público por natureza, não um vazamento novo.
--
-- `cor_primaria` guarda só a cor base (hex) — os tons derivados (escuro/claro,
-- hoje --accent-700/--accent-100) são calculados no FRONTEND a partir dela
-- (src/lib/color.ts), nunca persistidos: 1 fonte de verdade, sem risco de
-- dessincronizar 3 valores relacionados.
-- ============================================================================

create table if not exists public.configuracoes_plataforma (
  id            smallint primary key default 1 check (id = 1),
  logo_url      text,
  cor_primaria  text check (cor_primaria ~ '^#[0-9a-fA-F]{6}$'),
  fundo_url     text,
  fundo_ativo   boolean not null default true,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references auth.users(id)
);

insert into public.configuracoes_plataforma (id) values (1)
  on conflict (id) do nothing;

alter table public.configuracoes_plataforma enable row level security;

drop policy if exists configuracoes_plataforma_select_public on public.configuracoes_plataforma;
create policy configuracoes_plataforma_select_public on public.configuracoes_plataforma
  for select using (true);

-- Sem policy de insert/update/delete pra API — só a RPC (security definer)
-- escreve, gateada por is_consultor() (leitura é pública, escrita não).

create or replace function public.atualizar_configuracoes_plataforma(
  p_logo_url text default null,
  p_cor_primaria text default null,
  p_fundo_url text default null,
  p_fundo_ativo boolean default true
)
returns public.configuracoes_plataforma
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_row public.configuracoes_plataforma;
begin
  if not public.is_consultor() then
    raise exception 'Acesso restrito a consultores.';
  end if;

  if p_cor_primaria is not null and p_cor_primaria !~ '^#[0-9a-fA-F]{6}$' then
    raise exception 'Cor inválida — use o formato #RRGGBB.';
  end if;

  update public.configuracoes_plataforma
  set logo_url = p_logo_url,
      cor_primaria = p_cor_primaria,
      fundo_url = p_fundo_url,
      fundo_ativo = p_fundo_ativo,
      atualizado_em = now(),
      atualizado_por = auth.uid()
  where id = 1
  returning * into v_row;

  return v_row;
end;
$function$;

-- Audit trail — mesmo padrão das outras 11 tabelas (2026-09-04), branding
-- também é dado editável por consultor que vale rastrear.
drop trigger if exists trg_audit_log on public.configuracoes_plataforma;
create trigger trg_audit_log after insert or update or delete on public.configuracoes_plataforma
  for each row execute function public.fn_audit_log();

-- Storage — bucket público pra leitura (mesmo padrão de avatars, 2026-08-21),
-- escrita gateada por is_consultor() (não owner-scoped — é asset compartilhado
-- da plataforma, não de um usuário).
insert into storage.buckets (id, name, public)
values ('plataforma', 'plataforma', true)
on conflict (id) do nothing;

drop policy if exists plataforma_public_read on storage.objects;
create policy plataforma_public_read on storage.objects
  for select
  using (bucket_id = 'plataforma');

drop policy if exists plataforma_consultor_write on storage.objects;
create policy plataforma_consultor_write on storage.objects
  for insert
  with check (bucket_id = 'plataforma' and public.is_consultor());

drop policy if exists plataforma_consultor_update on storage.objects;
create policy plataforma_consultor_update on storage.objects
  for update
  using (bucket_id = 'plataforma' and public.is_consultor());

drop policy if exists plataforma_consultor_delete on storage.objects;
create policy plataforma_consultor_delete on storage.objects
  for delete
  using (bucket_id = 'plataforma' and public.is_consultor());
