-- ============================================================================
-- 20260903120000_bcb_focus_fonte.sql
-- ============================================================================
-- Item 2 do "o que falta" (2026-09-03): IPCA/Selic anos 2+ ganham projeção
-- consensual do Boletim Focus (BCB, série "Expectativas de Mercado Anuais"),
-- mesma fonte confiável já usada pro câmbio via SGS spot (ano atual). Focus
-- só publica consenso pros próximos ~5 anos — além disso continua manual,
-- não é regressão: mercado não projeta 20 anos à frente.
--
-- Nova fonte 'bcb-focus' entra ao lado de 'bcb-sgs'/'manual' já existentes.
-- ============================================================================

alter table public.parametros_anuais drop constraint parametros_anuais_fonte_check;
alter table public.parametros_anuais add constraint parametros_anuais_fonte_check
  check (fonte in ('bcb-sgs', 'bcb-focus', 'manual'));

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
  if p_fonte not in ('bcb-sgs', 'bcb-focus', 'manual') then
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
