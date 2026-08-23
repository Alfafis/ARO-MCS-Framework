-- ============================================================================
-- 20260823140000_relatorio_publico_parametros_globais.sql
-- ============================================================================
-- Subsistema B (motor de cálculo): `parametros_globais` tem RLS is_consultor(),
-- então o Portal do Cliente (anon, RPC única — ver ADR "Dado público só sai por
-- uma RPC única, nunca por RLS de tabela pra anon") nunca conseguiria ler esses
-- valores via .from() direto. Sem isso, PortalClienteRelatorio mostraria só o
-- método "Escalonamento" (não depende de parâmetro global) e omitiria
-- simples/compostos/inflação pra todo visitante anônimo — divergindo
-- silenciosamente do ResumoExecutivo (aba interna do consultor), mesma classe
-- de bug já registrada nas ADRs deste projeto.
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

  return jsonb_build_object(
    'projeto',           to_jsonb(v_projeto),
    'cliente',           to_jsonb(v_cliente),
    'categorias',        v_categorias,
    'simulacao',         to_jsonb(v_simulacao),
    'parametrosGlobais', v_parametros
  );
end;
$function$;
