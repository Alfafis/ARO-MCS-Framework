-- Achado ao mapear os call sites de logo no frontend: `/logo.png` (ícone,
-- usado pequeno — Sidebar/PageLoader/Portal header) e `/BePlanned Logo.png`
-- (marca completa com tagline "Organize ahead of time" — Login hero/header
-- mobile/Portal footer) são DOIS ASSETS DISTINTOS, não o mesmo redimensionado.
-- 1 campo `logo_url` só quebraria a UI (wordmark aparecendo no slot pequeno
-- do ícone, ou ícone sem tagline aparecendo no hero do Login). Migration
-- anterior (mesma sessão, ainda não usada em produção) corrigida antes de
-- qualquer consultor configurar algo em cima do shape errado.

alter table public.configuracoes_plataforma
  rename column logo_url to logo_icone_url;

alter table public.configuracoes_plataforma
  add column if not exists logo_completo_url text;

create or replace function public.atualizar_configuracoes_plataforma(
  p_logo_icone_url text default null,
  p_logo_completo_url text default null,
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
  set logo_icone_url = p_logo_icone_url,
      logo_completo_url = p_logo_completo_url,
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
