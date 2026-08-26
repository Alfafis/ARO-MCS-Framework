-- ============================================================================
-- 20260825140000_relatorio_publico_setores.sql
--
-- Adiciona `setores` (tabela lookup) ao bundle retornado por
-- `obter_relatorio_publico`. Motivação: os campos estruturados novos
-- (`aplicabilidade_setores`, `fase`, `ano_inicio`, `ano_fim`) em itens_custo
-- já vêm expostos automaticamente pelo `to_jsonb(ic)` da versão anterior da
-- RPC — mas a lista de setores (id → nome) é um lookup separado. Sem ele o
-- portal público só recebe `[4,5,7]` sem saber que 4 é "Infraestrutura
-- Operacional".
--
-- Setores tem RLS `for select using (true)` (declarada em
-- 20260824120000_setores_fase_ano.sql), então já é público — mas o portal é
-- consumido por `anon` e usa a RPC como único portão de acesso. Devolver
-- `setores` no bundle evita um segundo round-trip no client.
--
-- Diff mínimo: 1 declaração + 1 select + 1 chave no jsonb_build_object.
-- Resto da RPC preservado byte-a-byte da 20260823160000.
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
  v_setores       jsonb;
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

  -- Lookup pequeno (10 seeds hoje) — carregar tudo por RPC evita segundo
  -- round-trip. Mesmo shape usado pelo ProjetoContext no admin.
  select coalesce(jsonb_agg(to_jsonb(s) order by s.id), '[]'::jsonb)
  into v_setores
  from public.setores s;

  return jsonb_build_object(
    'projeto',           to_jsonb(v_projeto),
    'cliente',           to_jsonb(v_cliente),
    'categorias',        v_categorias,
    'simulacao',         to_jsonb(v_simulacao),
    'parametrosGlobais', v_parametros,
    'parametrosAnuais',  v_anuais,
    'setores',           v_setores
  );
end;
$function$;
