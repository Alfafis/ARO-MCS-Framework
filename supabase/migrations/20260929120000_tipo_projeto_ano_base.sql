-- ============================================================================
-- 20260929120000_tipo_projeto_ano_base.sql
-- ============================================================================
-- Fecha o buraco aberto pela migration 20260915180000 (ano_referencia por
-- projeto): `projetos.ano_referencia` nasce com o ANO CORRENTE, mas
-- `carregar_template_exemplo` copia valores de `itens_template`, que estão na
-- base de um ano anterior. Resultado: projeto novo + "carregar template" ficava
-- com ano_referencia = ano corrente, fator de ancoragem = 1 e NENHUMA correção
-- de IPCA entre a base do template e a data-base do projeto — em silêncio,
-- porque a AncoragemBadge só aparece quando o fator é diferente de 1.
--
-- O ano-base passa a ser declarado no TIPO de projeto (é ele que agrupa o
-- template, via categorias_template.tipo_projeto_id) — exatamente o desenho
-- previsto no comentário original de src/lib/ancoragem.ts.
--
-- `null` = template sem ano-base declarado. Nesse caso a RPC não mexe no
-- ano_referencia do projeto: sem saber a base, não corrigir é mais seguro que
-- corrigir errado (mesmo princípio de sequenciaMidpoints e computeFatorAncoragem,
-- que devolvem fator 1 + aviso quando falta IPCA de algum ano).
-- ============================================================================

alter table public.tipos_projeto
  add column if not exists ano_base integer
    check (ano_base is null or ano_base between 2000 and 2100);

comment on column public.tipos_projeto.ano_base is
  'Ano-base dos valores de categorias_template/itens_template deste tipo. Copiado para projetos.ano_referencia ao carregar o template. NULL = base não declarada, não altera o projeto.';

-- O template de Fechamento de Mina (ARO) veio da planilha de referência em
-- base 2022 — mesmo valor que vivia hardcoded em ANO_BASE_TEMPLATE até
-- 20260915180000 removê-lo. Os outros tipos não têm conteúdo real por trás
-- (ver ADR "Landing pública reposicionada"), então ficam null.
update public.tipos_projeto set ano_base = 2022 where id = 'fechamento-mina';

create or replace function public.carregar_template_exemplo(p_projeto_id uuid, p_tipo_projeto_id text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_ct        record;
  v_categoria public.categorias_projeto;
  v_ano_base  integer;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissao';
  end if;

  delete from public.categorias_projeto where projeto_id = p_projeto_id;

  for v_ct in
    select ct.id, ct.catalogo_id, ct.preenche, ct.ordem, ct.custo_provavel
      from public.categorias_template ct
      where ct.tipo_projeto_id = p_tipo_projeto_id
      order by ct.ordem
  loop
    insert into public.categorias_projeto (projeto_id, catalogo_id, preenche, ordem, custo_provavel)
      values (p_projeto_id, v_ct.catalogo_id, v_ct.preenche, v_ct.ordem, v_ct.custo_provavel)
      returning * into v_categoria;

    insert into public.campos_operacionais (categoria_projeto_id, label, valor, unidade, status)
    select v_categoria.id, cot.label, cot.valor_referencia, cot.unidade, 'pendente'
      from public.campos_operacionais_template cot
      where cot.categoria_template_id = v_ct.id
      order by cot.ordem;

    with itens_novos as (
      insert into public.itens_custo (
        categoria_projeto_id, nome, unidade, custo_min, custo_max,
        fonte, aplicabilidade, ano_previsto, ordem,
        aplicabilidade_setores, fase, ano_inicio, ano_fim
      )
      select v_categoria.id, it.nome, it.unidade, it.custo_min, it.custo_max,
             it.fonte, it.aplicabilidade, it.ano_previsto, it.ordem,
             it.aplicabilidade_setores, it.fase, it.ano_inicio, it.ano_fim
        from public.itens_template it
        where it.categoria_template_id = v_ct.id
      returning id, nome, unidade, custo_min, custo_max
    ),
    template_pareado as (
      select
        i_novo.id  as item_id,
        d.ano      as ano,
        d.valor    as valor
      from itens_novos i_novo
      join public.itens_template it
        on it.categoria_template_id = v_ct.id
       and it.nome      = i_novo.nome
       and it.unidade   = i_novo.unidade
       and it.custo_min = i_novo.custo_min
       and it.custo_max = i_novo.custo_max
      join public.desembolso_item_template_ano d
        on d.item_template_id = it.id
    )
    insert into public.desembolso_item_ano (item_id, ano, valor)
    select item_id, ano, valor from template_pareado
    on conflict (item_id, ano) do nothing;
  end loop;

  -- Ancoragem: os valores recém-copiados estão na base do template, não na
  -- data-base do projeto. Sem esta linha o projeto herdava valor de outro ano
  -- sem nenhuma correção temporal, e nada na UI denunciava isso.
  select tp.ano_base into v_ano_base
    from public.tipos_projeto tp
    where tp.id = p_tipo_projeto_id;

  if v_ano_base is not null then
    update public.projetos
      set ano_referencia = v_ano_base,
          atualizado_em  = now()
      where id = p_projeto_id;
  end if;

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

revoke execute on function public.carregar_template_exemplo(uuid, text) from public, anon;
grant  execute on function public.carregar_template_exemplo(uuid, text) to authenticated;
