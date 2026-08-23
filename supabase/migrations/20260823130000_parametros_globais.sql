-- ============================================================================
-- 20260823130000_parametros_globais.sql
-- ============================================================================
-- Subsistema A (ver spec segundo-cerebro/.../specs/2026-08-23-parametros-globais-design.md):
-- inflação/câmbio/Selic, configurados pelo consultor, alimentados por API pública
-- do Banco Central (fetch feito no frontend). Snapshot, não referência viva —
-- cálculo de projeto (Subsistema B, futuro) grava o valor usado junto ao próprio
-- resultado, nunca lê este valor retroativamente.
-- ============================================================================

create table public.parametros_globais (
  chave          text primary key
                   check (chave in ('inflacao_ipca', 'cambio_usd_brl', 'selic')),
  valor          numeric not null,
  fonte          text not null default 'manual'
                   check (fonte in ('bcb-sgs', 'manual')),
  serie_bcb      integer,              -- código SGS usado no último fetch (null se fonte='manual')
  atualizado_em  timestamptz not null default now(),
  atualizado_por uuid references public.perfis(id)
);

insert into public.parametros_globais (chave, valor, fonte) values
  ('inflacao_ipca',  0, 'manual'),
  ('cambio_usd_brl', 0, 'manual'),
  ('selic',          0, 'manual')
on conflict (chave) do nothing;

alter table public.parametros_globais enable row level security;

create policy parametros_globais_select_consultor on public.parametros_globais
  for select
  using (public.is_consultor());

create or replace function public.atualizar_parametro_global(
  p_chave     text,
  p_valor     numeric,
  p_fonte     text,
  p_serie_bcb integer default null
)
returns public.parametros_globais
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_param public.parametros_globais;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;
  if p_fonte not in ('bcb-sgs', 'manual') then
    raise exception 'Fonte inválida: %', p_fonte;
  end if;

  update public.parametros_globais
  set valor = p_valor, fonte = p_fonte, serie_bcb = p_serie_bcb,
      atualizado_em = now(), atualizado_por = auth.uid()
  where chave = p_chave
  returning * into v_param;

  if v_param is null then
    raise exception 'Parâmetro desconhecido: %', p_chave;
  end if;

  return v_param;
end;
$function$;

revoke execute on function public.atualizar_parametro_global(text, numeric, text, integer) from public, anon;
grant execute on function public.atualizar_parametro_global(text, numeric, text, integer) to authenticated;
