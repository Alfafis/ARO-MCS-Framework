-- ============================================================================
-- 20260823150000_parametros_anuais.sql
-- ============================================================================
-- Subsistema A2 (reabre Subsistema A): inflação e Selic deixam de ser valor
-- spot único e viram tabela ano-a-ano (min/max), 20 linhas fixas — cobre com
-- folga o horizonte de qualquer projeto (10 anos na planilha de referência).
-- Câmbio continua spot único em parametros_globais (não tem tabela ano-a-ano
-- pedida, e câmbio não alimenta computeMonetaryValues de qualquer forma).
--
-- "Ano" aqui é relativo ao projeto (ano 1 = 1º ano do horizonte de fechamento
-- daquele projeto, seja qual for o ano-calendário), não ano-calendário fixo —
-- mesma convenção da aba "Escalation Rate" da planilha de referência.
-- ============================================================================

delete from public.parametros_globais where chave in ('inflacao_ipca', 'selic');

alter table public.parametros_globais drop constraint parametros_globais_chave_check;
alter table public.parametros_globais add constraint parametros_globais_chave_check
  check (chave in ('cambio_usd_brl'));

create table public.parametros_anuais (
  chave          text not null check (chave in ('inflacao_ipca', 'selic')),
  ano            integer not null check (ano between 1 and 20),
  valor_min      numeric,
  valor_max      numeric,
  fonte          text not null default 'manual'
                   check (fonte in ('bcb-sgs', 'manual')),
  atualizado_em  timestamptz not null default now(),
  atualizado_por uuid references public.perfis(id),
  primary key (chave, ano),
  constraint valor_max_maior_que_min check (valor_max is null or valor_min is null or valor_max >= valor_min)
);

insert into public.parametros_anuais (chave, ano)
select chave, ano
from unnest(array['inflacao_ipca', 'selic']) as chave
cross join generate_series(1, 20) as ano;

alter table public.parametros_anuais enable row level security;

create policy parametros_anuais_select_consultor on public.parametros_anuais
  for select
  using (public.is_consultor());

create or replace function public.atualizar_parametro_anual(
  p_chave     text,
  p_ano       integer,
  p_valor_min numeric,
  p_valor_max numeric,
  p_fonte     text default 'manual'
)
returns public.parametros_anuais
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_param public.parametros_anuais;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;
  if p_fonte not in ('bcb-sgs', 'manual') then
    raise exception 'Fonte inválida: %', p_fonte;
  end if;
  if p_valor_min is not null and p_valor_max is not null and p_valor_max < p_valor_min then
    raise exception 'Valor máximo não pode ser menor que o mínimo';
  end if;

  update public.parametros_anuais
  set valor_min = p_valor_min, valor_max = p_valor_max, fonte = p_fonte,
      atualizado_em = now(), atualizado_por = auth.uid()
  where chave = p_chave and ano = p_ano
  returning * into v_param;

  if v_param is null then
    raise exception 'Parâmetro/ano desconhecido: %/%', p_chave, p_ano;
  end if;

  return v_param;
end;
$function$;

revoke execute on function public.atualizar_parametro_anual(text, integer, numeric, numeric, text) from public, anon;
grant execute on function public.atualizar_parametro_anual(text, integer, numeric, numeric, text) to authenticated;
