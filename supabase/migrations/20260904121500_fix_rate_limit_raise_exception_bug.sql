-- ============================================================================
-- 20260904121500_fix_rate_limit_raise_exception_bug.sql
-- ============================================================================
-- Segue direto de 20260904120000_rate_limit_codigo_acesso.sql, aplicada
-- minutos antes com um bug pego em teste ao vivo (ainda na mesma sessão,
-- antes de qualquer commit): o caminho de "código errado" fazia
-- `update ... set tentativas_falhas = tentativas_falhas + 1` seguido de
-- `raise exception` — que aborta a transação inteira e desfaz o UPDATE.
-- Contador nunca persistia, lockout nunca disparava. Este arquivo reaplica
-- as duas funções já corrigidas (idempotente, `create or replace`) — a
-- migration anterior já foi editada no disco pra refletir a versão certa,
-- mas como já tinha sido marcada como aplicada no histórico remoto antes da
-- correção, precisa desta reaplicação explícita.
-- ============================================================================

create or replace function public.obter_relatorio_publico(p_projeto_id uuid, p_codigo text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_acesso     public.codigos_acesso%rowtype;
  v_projeto    public.projetos;
  v_cliente    public.clientes;
  v_categorias jsonb;
  v_simulacao  public.simulacoes;
  v_parametros jsonb;
  v_anuais     jsonb;
  v_setores    jsonb;
begin
  if not public.is_consultor() then
    select * into v_acesso from public.codigos_acesso where projeto_id = p_projeto_id;

    if v_acesso.id is null then
      raise exception 'Código de acesso inválido';
    end if;

    if v_acesso.bloqueado_ate is not null and v_acesso.bloqueado_ate > now() then
      raise exception 'Muitas tentativas. Tente novamente em alguns minutos.';
    end if;

    if upper(trim(coalesce(p_codigo, ''))) <> v_acesso.codigo then
      update public.codigos_acesso
      set tentativas_falhas = tentativas_falhas + 1,
          bloqueado_ate = case when tentativas_falhas + 1 >= 5 then now() + interval '15 minutes' else bloqueado_ate end
      where id = v_acesso.id;
      return jsonb_build_object('codigoInvalido', true);
    end if;

    update public.codigos_acesso set tentativas_falhas = 0, bloqueado_ate = null where id = v_acesso.id;
  end if;

  select * into v_projeto from public.projetos where id = p_projeto_id;
  if not found then
    raise exception 'Projeto não encontrado';
  end if;

  select * into v_cliente from public.clientes where id = v_projeto.cliente_id;

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

create or replace function public.obter_relatorio_publico_remediacao(p_projeto_id uuid, p_codigo text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_acesso public.codigos_acesso%rowtype;
  v_result jsonb;
begin
  if not public.is_consultor() then
    select * into v_acesso from public.codigos_acesso where projeto_id = p_projeto_id;

    if v_acesso.id is null then
      raise exception 'Código de acesso inválido';
    end if;

    if v_acesso.bloqueado_ate is not null and v_acesso.bloqueado_ate > now() then
      raise exception 'Muitas tentativas. Tente novamente em alguns minutos.';
    end if;

    if upper(trim(coalesce(p_codigo, ''))) <> v_acesso.codigo then
      update public.codigos_acesso
      set tentativas_falhas = tentativas_falhas + 1,
          bloqueado_ate = case when tentativas_falhas + 1 >= 5 then now() + interval '15 minutes' else bloqueado_ate end
      where id = v_acesso.id;
      return jsonb_build_object('codigoInvalido', true);
    end if;

    update public.codigos_acesso set tentativas_falhas = 0, bloqueado_ate = null where id = v_acesso.id;
  end if;

  with rev as (
    select r.incluir_remediacao
    from public.revisoes r
    where r.projeto_id = p_projeto_id
      and r.status = 'vigente'
    order by r.publicado_em desc nulls last
    limit 1
  ),
  cats as (
    select c.id, c.nome, c.area_ha, c.ordem,
      coalesce(
        (select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'descricao', i.descricao,
            'unidade', i.unidade,
            'quantidade', i.quantidade,
            'custo_unit_min', i.custo_unit_min,
            'custo_unit_max', i.custo_unit_max,
            'fonte', i.fonte,
            'ordem', i.ordem
          ) order by i.ordem
        )
        from public.itens_remediacao i where i.categoria_id = c.id), '[]'::jsonb
      ) as itens
    from public.categorias_remediacao c
    where c.projeto_id = p_projeto_id
    order by c.ordem
  )
  select case
    when not exists (select 1 from rev where incluir_remediacao) then '[]'::jsonb
    else coalesce((select jsonb_agg(
      jsonb_build_object(
        'id', id, 'nome', nome, 'area_ha', area_ha, 'ordem', ordem, 'itens', itens
      ) order by ordem
    ) from cats), '[]'::jsonb)
  end
  into v_result;

  return v_result;
end;
$function$;
