-- ============================================================================
-- 20260823160000_relatorio_publico_parametros_anuais.sql
-- ============================================================================
-- Subsistema A2: inflação/Selic saíram de parametros_globais e viraram
-- parametros_anuais — RPC pública precisa incluir a tabela nova pelo mesmo
-- motivo já registrado na migration anterior (Portal do Cliente é anon).
-- ============================================================================

create or replace function public.obter_relatorio_publico(p_projeto_id uuid, p_codigo text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_codigo_valido text;
  v_projeto       public.projetos;
  v_cliente       public.clientes;
  v_categorias    jsonb;
  v_simulacao     public.simulacoes;
  v_parametros    jsonb;
  v_anuais        jsonb;
begin
  select codigo into v_codigo_valido from public.codigos_acesso where projeto_id = p_projeto_id;

  if not (public.is_consultor() or (v_codigo_valido is not null and upper(trim(coalesce(p_codigo, ''))) = v_codigo_valido)) then
    raise exception 'Código de acesso inválido';
  end if;

  select * into v_projeto from public.projetos where id = p_projeto_id;
  if not found then
    raise exception 'Projeto não encontrado';
  end if;

  select * into v_cliente from public.clientes where id = v_projeto.cliente_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'categoria', to_jsonb(cp),
    'catalogo',  to_jsonb(cc),
    'itens',     (select coalesce(jsonb_agg(to_jsonb(ic) order by ic.criado_em), '[]'::jsonb)
                  from public.itens_custo ic where ic.categoria_projeto_id = cp.id)
  ) order by cp.ordem), '[]'::jsonb)
  into v_categorias
  from public.categorias_projeto cp
  join public.categorias_catalogo cc on cc.id = cp.catalogo_id
  where cp.projeto_id = p_projeto_id;

  select * into v_simulacao from public.simulacoes
  where projeto_id = p_projeto_id
  order by criado_em desc
  limit 1;

  select coalesce(jsonb_agg(to_jsonb(pg)), '[]'::jsonb)
  into v_parametros
  from public.parametros_globais pg;

  select coalesce(jsonb_agg(to_jsonb(pa) order by pa.chave, pa.ano), '[]'::jsonb)
  into v_anuais
  from public.parametros_anuais pa;

  return jsonb_build_object(
    'projeto',           to_jsonb(v_projeto),
    'cliente',           to_jsonb(v_cliente),
    'categorias',        v_categorias,
    'simulacao',         to_jsonb(v_simulacao),
    'parametrosGlobais', v_parametros,
    'parametrosAnuais',  v_anuais
  );
end;
$function$;
