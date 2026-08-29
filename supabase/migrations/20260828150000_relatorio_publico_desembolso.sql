-- ============================================================================
-- 20260828150000_relatorio_publico_desembolso.sql
-- ============================================================================
-- Estende `obter_relatorio_publico` para incluir `desembolso_item_ano` no
-- bundle público, aninhado dentro de cada item de custo.
--
-- Contexto:
-- A migration `20260828120000_desembolso_por_ano.sql` criou a tabela
-- `desembolso_item_ano` (tabela por-item), e a UI do `AnnualDisbursementCard`
-- consome esse detalhamento. Sem estender a RPC, o portal público
-- (`/relatorio/:id`) recebe apenas `to_jsonb(ic)`, que não inclui embeds — e
-- o card fica sem os splits assimétricos que só existem no detalhamento.
--
-- `custo_provavel` da categoria já vem naturalmente via `to_jsonb(cp)`.
--
-- Diff mínimo: só a subquery `itens` mudou (jsonb_build_object + subquery
-- lateral do desembolso por item). Resto preservado.
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

  -- Cada item vira `to_jsonb(ic)` + `desembolso_item_ano` embutido como array
  -- ordenado por ano. Ausência = `[]` (json vazio, não null) — o mapper do
  -- frontend trata `length === 0` como "sem detalhamento" e cai no fallback
  -- (anoInicio/anoFim).
  select coalesce(jsonb_agg(jsonb_build_object(
    'categoria', to_jsonb(cp),
    'catalogo',  to_jsonb(cc),
    'itens',     (
      select coalesce(jsonb_agg(
        to_jsonb(ic) || jsonb_build_object(
          'desembolso_item_ano',
          coalesce((
            select jsonb_agg(jsonb_build_object('ano', d.ano, 'valor', d.valor) order by d.ano)
            from public.desembolso_item_ano d
            where d.item_id = ic.id
          ), '[]'::jsonb)
        )
        order by ic.criado_em
      ), '[]'::jsonb)
      from public.itens_custo ic where ic.categoria_projeto_id = cp.id
    )
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
