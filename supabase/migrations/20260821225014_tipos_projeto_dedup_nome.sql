-- ============================================================================
-- 20260821225014_tipos_projeto_dedup_nome.sql
-- ============================================================================
-- Achado testando a migration anterior: criar_tipo_projeto gerava uma linha
-- nova a cada chamada mesmo com nome repetido (só o slug do id mudava, "-2",
-- "-3"...), resultando em duas linhas com o MESMO nome exibido — confuso pra
-- quem administra. Mesmo padrão de dedup por lower(nome) já usado em
-- create_cliente.
-- ============================================================================

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

  v_base := lower(v_nome);
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

-- renomear_tipo_projeto também precisa recusar colidir com outro nome já
-- existente (senão dois tipos podem acabar com o mesmo nome exibido por uma
-- rota diferente da criação).
create or replace function public.renomear_tipo_projeto(p_id text, p_novo_nome text)
returns public.tipos_projeto
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_tipo public.tipos_projeto;
  v_nome text := trim(p_novo_nome);
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  if v_nome = '' then
    raise exception 'Nome não pode ser vazio';
  end if;

  if exists (select 1 from public.tipos_projeto where lower(nome) = lower(v_nome) and id <> p_id) then
    raise exception 'Já existe um tipo de projeto com esse nome';
  end if;

  update public.tipos_projeto set nome = v_nome where id = p_id
  returning * into v_tipo;

  if v_tipo is null then
    raise exception 'Tipo de projeto não encontrado';
  end if;

  return v_tipo;
end;
$function$;
