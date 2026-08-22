-- ============================================================================
-- 20260821180443_categorias_rpc.sql
-- ============================================================================
-- Fase E, fatia "Categorias/itens_custo". campos_operacionais fica de fora
-- (nada no app lê/escreve ainda — sem RLS/RPC, trabalho especulativo).
--
-- Estratégia de save de itens_custo: BLUR, não por tecla (decisão desta
-- sessão) — o frontend mantém o texto livre localmente enquanto digita e só
-- chama update_item_custo quando o campo perde foco. RPC nunca vê "meio
-- caractere digitado".
-- ============================================================================

drop policy if exists categorias_catalogo_select_consultor on public.categorias_catalogo;
create policy categorias_catalogo_select_consultor on public.categorias_catalogo
  for select
  using (public.is_consultor());

drop policy if exists categorias_projeto_select_consultor on public.categorias_projeto;
create policy categorias_projeto_select_consultor on public.categorias_projeto
  for select
  using (public.is_consultor());

drop policy if exists itens_custo_select_consultor on public.itens_custo;
create policy itens_custo_select_consultor on public.itens_custo
  for select
  using (public.is_consultor());

-- ----------------------------------------------------------------------------
-- Helper interno — NUNCA exposto direto ao frontend (sem GRANT authenticated).
-- Roda com o privilégio de quem o CHAMA (SECURITY DEFINER da função que
-- invoca), não precisa de EXECUTE próprio pra funções internas o chamarem.
-- ----------------------------------------------------------------------------

create or replace function public.find_or_create_categoria_catalogo(p_nome text)
returns public.categorias_catalogo
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_catalogo public.categorias_catalogo;
  v_nome     text := trim(p_nome);
begin
  select * into v_catalogo from public.categorias_catalogo where lower(nome) = lower(v_nome);
  if found then
    return v_catalogo;
  end if;

  insert into public.categorias_catalogo (nome) values (v_nome)
  returning * into v_catalogo;

  return v_catalogo;
end;
$function$;

revoke execute on function public.find_or_create_categoria_catalogo(text) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- Categoria — global (catálogo) + instância por projeto
-- ----------------------------------------------------------------------------

-- "+ categoria" sempre nasce com nome placeholder. Unique index em lower(nome)
-- (já existia) rejeitaria a 2ª "Nova categoria" sem renomear — gera sufixo
-- numérico automático em vez de deixar a RPC estourar.
create or replace function public.add_categoria(p_projeto_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_catalogo  public.categorias_catalogo;
  v_categoria public.categorias_projeto;
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
    v_n := v_n + 1;
    v_nome := 'Nova categoria ' || v_n;
  end loop;

  insert into public.categorias_projeto (projeto_id, catalogo_id, preenche, ordem)
  values (p_projeto_id, v_catalogo.id, 'Consultor', 0)
  returning * into v_categoria;

  return jsonb_build_object('categoria', to_jsonb(v_categoria), 'catalogo', to_jsonb(v_catalogo));
end;
$function$;

revoke execute on function public.add_categoria(uuid) from public, anon;
grant execute on function public.add_categoria(uuid) to authenticated;

-- Remove só a instância do projeto — nome no catálogo permanece (outros
-- projetos podem estar usando).
create or replace function public.remover_categoria_projeto(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.categorias_projeto where id = p_id;
end;
$function$;

revoke execute on function public.remover_categoria_projeto(uuid) from public, anon;
grant execute on function public.remover_categoria_projeto(uuid) to authenticated;

create or replace function public.update_categoria_preenche(p_id uuid, p_preenche text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.categorias_projeto set preenche = p_preenche where id = p_id;
end;
$function$;

revoke execute on function public.update_categoria_preenche(uuid, text) from public, anon;
grant execute on function public.update_categoria_preenche(uuid, text) to authenticated;

-- Rename do catálogo é global — colisão de nome (unique index) sobe como erro
-- pro frontend em vez de ser engolida aqui. É o comportamento correto: dois
-- ids com o mesmo nome exibido é o bug que o índice existe pra evitar.
create or replace function public.renomear_categoria_catalogo(p_id uuid, p_novo_nome text)
returns public.categorias_catalogo
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_catalogo public.categorias_catalogo;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.categorias_catalogo set nome = trim(p_novo_nome) where id = p_id
  returning * into v_catalogo;

  return v_catalogo;
end;
$function$;

revoke execute on function public.renomear_categoria_catalogo(uuid, text) from public, anon;
grant execute on function public.renomear_categoria_catalogo(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- Item de custo
-- ----------------------------------------------------------------------------

create or replace function public.add_item_custo(p_categoria_projeto_id uuid)
returns public.itens_custo
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item public.itens_custo;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  insert into public.itens_custo (categoria_projeto_id, nome, unidade, custo_min, custo_max)
  values (p_categoria_projeto_id, 'Novo item', 'verba', 0, 0)
  returning * into v_item;

  return v_item;
end;
$function$;

revoke execute on function public.add_item_custo(uuid) from public, anon;
grant execute on function public.add_item_custo(uuid) to authenticated;

create or replace function public.remove_item_custo(p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.itens_custo where id = p_id;
end;
$function$;

revoke execute on function public.remove_item_custo(uuid) from public, anon;
grant execute on function public.remove_item_custo(uuid) to authenticated;

-- Save-on-blur: p_patch só traz os campos que o frontend quer alterar
-- (coalesce preserva o resto). Chave presente com string vazia ainda
-- sobrescreve — só chave AUSENTE preserva o valor antigo.
create or replace function public.update_item_custo(p_id uuid, p_patch jsonb)
returns public.itens_custo
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item public.itens_custo;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  update public.itens_custo set
    nome           = coalesce(p_patch->>'nome', nome),
    unidade        = coalesce(p_patch->>'unidade', unidade),
    custo_min      = coalesce((p_patch->>'custoMin')::numeric, custo_min),
    custo_max      = coalesce((p_patch->>'custoMax')::numeric, custo_max),
    fonte          = coalesce(p_patch->>'fonte', fonte),
    aplicabilidade = coalesce(p_patch->>'aplicabilidade', aplicabilidade),
    ano_previsto   = coalesce(p_patch->>'anoPrevisto', ano_previsto),
    atualizado_em  = now()
  where id = p_id
  returning * into v_item;

  return v_item;
end;
$function$;

revoke execute on function public.update_item_custo(uuid, jsonb) from public, anon;
grant execute on function public.update_item_custo(uuid, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- Template de exemplo — substitui TODAS as categorias do projeto (mesmo
-- comportamento do mock: carregar de novo descarta o que já tinha). Template
-- em si continua vivendo no frontend (categoria-templates.ts) — decisão já
-- registrada no schema original; a RPC só persiste o que o frontend manda.
-- ----------------------------------------------------------------------------

create or replace function public.carregar_template_exemplo(p_projeto_id uuid, p_categorias jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_cat       jsonb;
  v_item      jsonb;
  v_catalogo  public.categorias_catalogo;
  v_categoria public.categorias_projeto;
  v_ordem     int := 0;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  delete from public.categorias_projeto where projeto_id = p_projeto_id;

  for v_cat in select * from jsonb_array_elements(p_categorias)
  loop
    v_catalogo := public.find_or_create_categoria_catalogo(v_cat->>'catalogoNome');

    insert into public.categorias_projeto (projeto_id, catalogo_id, preenche, ordem)
    values (p_projeto_id, v_catalogo.id, coalesce(v_cat->>'preenche', 'Consultor'), v_ordem)
    returning * into v_categoria;

    v_ordem := v_ordem + 1;

    for v_item in select * from jsonb_array_elements(coalesce(v_cat->'itens', '[]'::jsonb))
    loop
      insert into public.itens_custo (categoria_projeto_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto)
      values (
        v_categoria.id,
        v_item->>'nome',
        v_item->>'unidade',
        coalesce((v_item->>'custoMin')::numeric, 0),
        coalesce((v_item->>'custoMax')::numeric, 0),
        v_item->>'fonte',
        v_item->>'aplicabilidade',
        v_item->>'anoPrevisto'
      );
    end loop;
  end loop;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'categoria', to_jsonb(cp),
      'catalogo',  to_jsonb(cc),
      'itens',     (select coalesce(jsonb_agg(to_jsonb(ic) order by ic.criado_em), '[]'::jsonb)
                    from public.itens_custo ic where ic.categoria_projeto_id = cp.id)
    ) order by cp.ordem)
    from public.categorias_projeto cp
    join public.categorias_catalogo cc on cc.id = cp.catalogo_id
    where cp.projeto_id = p_projeto_id
  ), '[]'::jsonb);
end;
$function$;

revoke execute on function public.carregar_template_exemplo(uuid, jsonb) from public, anon;
grant execute on function public.carregar_template_exemplo(uuid, jsonb) to authenticated;
