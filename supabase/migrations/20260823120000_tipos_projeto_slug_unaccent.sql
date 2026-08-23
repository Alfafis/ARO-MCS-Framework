-- ============================================================================
-- 20260823120000_tipos_projeto_slug_unaccent.sql
-- ============================================================================
-- criar_tipo_projeto gerava slug descartando acento em vez de transliterar —
-- "Água" virava id "gua" (o "á" cai no [^a-z0-9] e é substituído por "-", que
-- o trim de bordas remove). unaccent() resolve isso normalizando pra ASCII
-- antes do regexp: "Água" -> "agua" -> id "agua".
-- ============================================================================

create extension if not exists unaccent;

create or replace function public.criar_tipo_projeto(p_nome text)
returns public.tipos_projeto
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_tipo  public.tipos_projeto;
  v_nome  text := trim(p_nome);
  v_base  text;
  v_id    text;
  v_n     int := 1;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  if v_nome = '' then
    raise exception 'Nome não pode ser vazio';
  end if;

  select * into v_tipo from public.tipos_projeto where lower(nome) = lower(v_nome);
  if found then
    return v_tipo;
  end if;

  v_base := unaccent(lower(v_nome));
  v_base := regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
  v_base := regexp_replace(v_base, '(^-+|-+$)', '', 'g');
  if v_base = '' then
    v_base := 'tipo';
  end if;

  v_id := v_base;
  loop
    if not exists (select 1 from public.tipos_projeto where id = v_id) then
      exit;
    end if;
    v_n := v_n + 1;
    v_id := v_base || '-' || v_n;
  end loop;

  insert into public.tipos_projeto (id, nome) values (v_id, v_nome)
  returning * into v_tipo;

  return v_tipo;
end;
$function$;
