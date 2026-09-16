-- ============================================================================
-- 20260915180000_ano_referencia_projeto.sql
-- ============================================================================
-- Substitui o hardcode `ANO_BASE_TEMPLATE = 2022` (em src/lib/ancoragem.ts)
-- por uma coluna por-projeto. O consultor passa a definir em que ano estão
-- os valores dos itens de custo do projeto — se digitou hoje, o default é
-- o ano corrente e a ancoragem IPCA fica desligada (fator = 1). Se carregou
-- um template com valores de anos anteriores, ajusta na aba Configurações.
--
-- Backfill: TODOS os projetos existentes recebem `ano_referencia = 2022`
-- (comportamento atual — a UI hoje ancora tudo em 2022). Projetos novos
-- criados a partir daqui ficam com `ano_referencia = ano corrente`.
-- ============================================================================

alter table public.projetos
  add column ano_referencia integer not null default extract(year from now())::integer
    check (ano_referencia between 2000 and 2100);

-- Preserva os totais visíveis hoje. Projetos criados antes desta migration
-- rodavam sob `ANO_BASE_TEMPLATE = 2022` — mantemos essa referência pros
-- números não pularem sem aviso pro consultor.
update public.projetos set ano_referencia = 2022;

create or replace function public.atualizar_config_financeira(
  p_projeto_id         uuid,
  p_moeda              text,
  p_data_base          text,
  p_horizonte_anos     integer,
  p_metodo_atualizacao text,
  p_contingencia_pct   numeric,
  p_ano_referencia     integer
)
returns public.projetos
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_projeto public.projetos;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;
  if p_horizonte_anos < 1 or p_horizonte_anos > 20 then
    raise exception 'Horizonte deve ser entre 1 e 20 anos';
  end if;
  if p_contingencia_pct < 0 or p_contingencia_pct > 100 then
    raise exception 'Contingência deve ser entre 0 e 100';
  end if;
  if p_ano_referencia < 2000 or p_ano_referencia > 2100 then
    raise exception 'Ano de referência deve estar entre 2000 e 2100';
  end if;

  update public.projetos
  set moeda = p_moeda, data_base = p_data_base, horizonte_anos = p_horizonte_anos,
      metodo_atualizacao = p_metodo_atualizacao, contingencia_pct = p_contingencia_pct,
      ano_referencia = p_ano_referencia,
      atualizado_em = now()
  where id = p_projeto_id
  returning * into v_projeto;

  if v_projeto is null then
    raise exception 'Projeto não encontrado';
  end if;

  return v_projeto;
end;
$function$;

-- Assinatura mudou: a anterior (6 args, sem p_ano_referencia) precisa ser
-- descartada explicitamente pra não deixar ambiguidade no schema.
drop function if exists public.atualizar_config_financeira(uuid, text, text, integer, text, numeric);

revoke execute on function public.atualizar_config_financeira(uuid, text, text, integer, text, numeric, integer) from public, anon;
grant execute on function public.atualizar_config_financeira(uuid, text, text, integer, text, numeric, integer) to authenticated;
