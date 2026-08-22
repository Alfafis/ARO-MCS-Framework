-- ============================================================================
-- 20260821224838_tipos_projeto_admin.sql
-- ============================================================================
-- Tipos de projeto deixam de ser array hardcoded no frontend
-- (src/data/categoria-templates.ts) e passam a ser geridos por qualquer
-- consultor (mesmo gate de create_cliente/create_projeto — não existe tier de
-- admin separado hoje). `id` é slug estável, gerado a partir do nome na
-- criação, e nunca editado depois — CATEGORIA_TEMPLATES (frontend) continua
-- referenciando os 3 slugs seed por essa chave.
-- ============================================================================

drop policy if exists tipos_projeto_select_consultor on public.tipos_projeto;
create policy tipos_projeto_select_consultor on public.tipos_projeto
  for select
  using (public.is_consultor());

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

revoke execute on function public.criar_tipo_projeto(text) from public, anon;
grant execute on function public.criar_tipo_projeto(text) to authenticated;

-- `id` nunca muda — é a chave que CATEGORIA_TEMPLATES (frontend) usa pra
-- ligar um tipo ao blueprint de categoria de exemplo. Só o nome exibido é
-- editável.
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

  update public.tipos_projeto set nome = v_nome where id = p_id
  returning * into v_tipo;

  if v_tipo is null then
    raise exception 'Tipo de projeto não encontrado';
  end if;

  return v_tipo;
end;
$function$;

revoke execute on function public.renomear_tipo_projeto(text, text) from public, anon;
grant execute on function public.renomear_tipo_projeto(text, text) to authenticated;

-- Bloqueado por FK (projetos.tipo_projeto_id) se algum projeto usa o tipo —
-- comportamento padrão do Postgres, só traduzido pra mensagem amigável.
create or replace function public.remover_tipo_projeto(p_id text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  begin
    delete from public.tipos_projeto where id = p_id;
  exception when foreign_key_violation then
    raise exception 'Não é possível excluir: existem projetos usando este tipo.';
  end;
end;
$function$;

revoke execute on function public.remover_tipo_projeto(text) from public, anon;
grant execute on function public.remover_tipo_projeto(text) to authenticated;
