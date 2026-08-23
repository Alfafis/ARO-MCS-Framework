-- ============================================================================
-- 20260823170000_config_financeira_projeto.sql
-- ============================================================================
-- Subsistema C (wizard de criação de projeto): horizonte do projeto deixa de
-- ser HORIZON_YEARS hardcoded em lib/financeiro.ts e vira coluna real, editável
-- no step 2 do wizard e na aba "Configurações" do workspace do projeto.
-- ============================================================================

alter table public.projetos
  add column horizonte_anos integer not null default 10
    check (horizonte_anos between 1 and 20);

create or replace function public.atualizar_config_financeira(
  p_projeto_id         uuid,
  p_moeda              text,
  p_data_base          text,
  p_horizonte_anos     integer,
  p_metodo_atualizacao text,
  p_contingencia_pct   numeric
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

  update public.projetos
  set moeda = p_moeda, data_base = p_data_base, horizonte_anos = p_horizonte_anos,
      metodo_atualizacao = p_metodo_atualizacao, contingencia_pct = p_contingencia_pct,
      atualizado_em = now()
  where id = p_projeto_id
  returning * into v_projeto;

  if v_projeto is null then
    raise exception 'Projeto não encontrado';
  end if;

  return v_projeto;
end;
$function$;

revoke execute on function public.atualizar_config_financeira(uuid, text, text, integer, text, numeric) from public, anon;
grant execute on function public.atualizar_config_financeira(uuid, text, text, integer, text, numeric) to authenticated;
