-- ============================================================================
-- Reseed do template NX Gold (fechamento-mina) para paridade com a planilha
--
-- Contexto: o seed 20260825120000_seed_planilha_nx_gold populou os itens com
-- valores reais do SINAPI/Brandt Meio Ambiente, mas a SUM(custo_min/max) por
-- categoria diverge da Tabela 1 do `_Dados_Planilha.md` em 5 das 8 categorias:
--
--   Categoria             SUM_max atual   Tabela 1 max   Δ
--   Cavas                    1.322.916      2.417.969   -1.095.053
--   Pilhas de Estéril        1.610.776      1.804.989     -194.213
--   Barragem                   302.066        430.278     -128.212
--   Planta Industrial          878.552        878.873         -321
--   Áreas de Apoio           3.550.837      3.986.290     -435.453
--   Monitoramento            8.907.671     12.007.671   -3.100.000
--
-- Estratégia: ajuste proporcional item-a-item (min e max independentes),
-- preservando os nomes, unidades, fontes SINAPI/Brandt e a proporção relativa
-- entre itens dentro de cada categoria. Fatores computados dentro da própria
-- migration via CTE (sem hardcode).
--
-- Aproveita a passagem para (a) popular `fase` a partir de `ano_inicio` — hoje
-- 0/62 itens têm fase; (b) popular `desembolso_item_template_ano` — hoje vazia
-- fora dos testes, o que é a Etapa 3 do `_Plan_Curva_Desembolso.md` (marcada
-- como PARCIALMENTE CONCLUÍDA).
--
-- Preservado sem toque: categorias_catalogo, categorias_template (incluindo
-- `custo_provavel` que já bate 100% com Tabela 1), campos_operacionais_template,
-- setores, parametros_*, projetos existentes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Section 1: Ajuste proporcional de custo_min/custo_max
--
-- Aplica um ÚNICO ratio por categoria = Tab1_max / SUM_max_atual, tanto em
-- custo_min quanto em custo_max. Consequência:
--   - SUM(custo_max) bate 100% com Tab1_max (o anchor primário — alimenta a
--     matriz de desembolso ano-a-ano e é o parâmetro superior da Triangular)
--   - SUM(custo_min) fica *aproximadamente* Tab1_min (maior desvio previsto:
--     Monitoramento, -18%). Isso é aceitável porque o custo_provavel (F18
--     hardcoded pela experiência) já bate 100% com Tab1 e é o `mode` real da
--     Triangular; o `min` afeta apenas o bound inferior, não a média.
--
-- Rejeitadas — motivo:
--   (a) Ratios independentes p/ min e max: violaria o check constraint
--       `custo_max >= custo_min` em Monitoramento (ratio_min 1.645 > ratio_max
--       1.348 empurraria min acima de max em itens estreitos).
--   (b) Transformação afim (mesmo a, mesmo b): funcionaria em Monitoramento
--       mas produziria custo_min negativo em Cavas (range Tab1 é 2× o atual;
--       itens de R$ 4.500 seriam empurrados para valores < 0).
-- ----------------------------------------------------------------------------

with alvos(nome, target_max) as (
  values
    ('Cavas',                 2417969::numeric),
    ('Pilhas de Estéril',     1804989::numeric),
    ('Barragem',               430278::numeric),
    ('Planta Industrial',      878873::numeric),
    ('Áreas de Apoio',        3986290::numeric),
    ('Monitoramento',        12007671::numeric)
),
somas as (
  select cc.nome, ct.id as ct_id,
         sum(it.custo_max) as sum_max
  from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  join categorias_catalogo cc on cc.id = ct.catalogo_id
  where ct.tipo_projeto_id = 'fechamento-mina'
  group by cc.nome, ct.id
)
update itens_template it
set custo_min = round(it.custo_min * (a.target_max / s.sum_max), 2),
    custo_max = round(it.custo_max * (a.target_max / s.sum_max), 2)
from alvos a
join somas s on s.nome = a.nome
where it.categoria_template_id = s.ct_id;

-- ----------------------------------------------------------------------------
-- Section 2: Popular `fase` a partir de ano_inicio
-- Convenção alinhada com o breakdown por fase de Tabela 5:
--   pre-fechamento: Anos 1-4  (estudos, planejamento)
--   fechamento:     Anos 5-6  (execução)
--   pos-fechamento: Anos 7+   (monitoramento, manutenção)
-- ----------------------------------------------------------------------------

update itens_template it
set fase = case
  when it.ano_inicio is null then null
  when it.ano_inicio <= 4  then 'pre-fechamento'
  when it.ano_inicio <= 6  then 'fechamento'
  else                          'pos-fechamento'
end
where it.categoria_template_id in (
  select ct.id from categorias_template ct
  where ct.tipo_projeto_id = 'fechamento-mina'
);

-- ----------------------------------------------------------------------------
-- Section 3: Popular desembolso_item_template_ano
-- Distribuição uniforme entre ano_inicio..ano_fim usando `custo_max` já
-- ajustado pela Section 1. Cross-check no fim garante que SUM(valor) por item
-- = custo_max daquele item (idempotente).
-- ----------------------------------------------------------------------------

delete from desembolso_item_template_ano
where item_template_id in (
  select it.id from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  where ct.tipo_projeto_id = 'fechamento-mina'
);

insert into desembolso_item_template_ano (item_template_id, ano, valor)
select it.id,
       ano::smallint,
       round(it.custo_max / (it.ano_fim - it.ano_inicio + 1), 2)
  from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  cross join lateral generate_series(it.ano_inicio::int, it.ano_fim::int) ano
 where ct.tipo_projeto_id = 'fechamento-mina'
   and it.ano_inicio is not null
   and it.ano_fim    is not null;

-- ----------------------------------------------------------------------------
-- Section 4: Cross-check — fail-fast se SUM(custo_max) divergir de Tab1
-- Tolerância de R$ 10,00 para acomodar arredondamento a 2 casas em Section 1.
-- SUM(custo_min) NÃO é validado aqui (diverge por design — ver Section 1).
-- ----------------------------------------------------------------------------

do $$
declare
  rec record;
  msg text := '';
begin
  for rec in
    with somas as (
      select cc.nome, sum(it.custo_max) as sx
        from itens_template it
        join categorias_template ct on ct.id = it.categoria_template_id
        join categorias_catalogo cc on cc.id = ct.catalogo_id
       where ct.tipo_projeto_id = 'fechamento-mina'
       group by cc.nome
    ),
    alvos(nome, target_max) as (
      values
        ('Estudos',               9100000::numeric),
        ('Cavas',                 2417969::numeric),
        ('Pilhas de Estéril',     1804989::numeric),
        ('Barragem',               430278::numeric),
        ('Planta Industrial',      878873::numeric),
        ('Áreas de Apoio',        3986290::numeric),
        ('Demolição Estr. Civis', 4574700::numeric),
        ('Monitoramento',        12007671::numeric)
    )
    select s.nome, s.sx, a.target_max,
           abs(s.sx - a.target_max) as diff_max
      from somas s
      join alvos a on a.nome = s.nome
  loop
    if rec.diff_max > 10 then
      msg := msg || format(E'\n  %s: sum_max=%s alvo=%s Δ=%s',
                          rec.nome, rec.sx, rec.target_max, rec.diff_max);
    end if;
  end loop;

  if msg <> '' then
    raise exception 'Cross-check de Tabela 1 (max) falhou:%', msg;
  end if;
end $$;

-- Cross-check adicional: SUM(desembolso) por item = custo_max do item
do $$
declare
  n_divergentes int;
begin
  select count(*) into n_divergentes
    from (
      select it.id,
             it.custo_max,
             coalesce(sum(d.valor), 0) as sum_d
        from itens_template it
        join categorias_template ct on ct.id = it.categoria_template_id
        left join desembolso_item_template_ano d on d.item_template_id = it.id
       where ct.tipo_projeto_id = 'fechamento-mina'
         and it.ano_inicio is not null and it.ano_fim is not null
       group by it.id, it.custo_max
      having abs(coalesce(sum(d.valor), 0) - it.custo_max) > 5
    ) sub;

  if n_divergentes > 0 then
    raise exception 'Cross-check de desembolso falhou: % itens com SUM(desembolso) ≠ custo_max', n_divergentes;
  end if;
end $$;
