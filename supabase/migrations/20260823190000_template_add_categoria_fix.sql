-- ============================================================================
-- 20260823190000_template_add_categoria_fix.sql
-- ============================================================================
-- Fix: template_add_categoria original pedia p_nome/p_preenche explícitos —
-- UX de "+ nova categoria" no admin não deveria exigir nome antes de criar
-- (mesmo padrão de add_categoria: nasce "Nova categoria", renomeia depois via
-- CategoryBlock inline-rename). Reescrito pra gerar nome com sufixo
-- incremental como add_categoria já faz, só que checando colisão contra
-- categorias_template (chave é tipo_projeto_id+catalogo_id, não catalogo_id
-- sozinho — reaproveitar um catalogo_id já usado por OUTRO tipo é normal).
-- ============================================================================

drop function if exists public.template_add_categoria(text, text, text);

create or replace function public.template_add_categoria(p_tipo_projeto_id text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_catalogo  public.categorias_catalogo;
  v_categoria public.categorias_template;
  v_nome      text := 'Nova categoria';
  v_n         int  := 1;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  loop
    select * into v_catalogo from public.categorias_catalogo where lower(nome) = lower(v_nome);
    if not found then
      insert into public.categorias_catalogo (nome) values (v_nome) returning * into v_catalogo;
      exit;
    end if;
    exit when not exists (
      select 1 from public.categorias_template ct
      where ct.tipo_projeto_id = p_tipo_projeto_id and ct.catalogo_id = v_catalogo.id
    );
    v_n := v_n + 1;
    v_nome := 'Nova categoria ' || v_n;
  end loop;

  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
  values (p_tipo_projeto_id, v_catalogo.id, 'Consultor', 0)
  returning * into v_categoria;

  return jsonb_build_object('categoria', to_jsonb(v_categoria), 'catalogo', to_jsonb(v_catalogo));
end;
$function$;

revoke execute on function public.template_add_categoria(text) from public, anon;
grant execute on function public.template_add_categoria(text) to authenticated;
