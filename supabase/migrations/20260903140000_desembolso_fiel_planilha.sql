-- ============================================================================
-- 20260903140000_desembolso_fiel_planilha.sql
-- ============================================================================
-- Subsistema 2 (spec 2026-09-03-timing-formula-campos-operacionais-design.md).
-- `20260829130000_reseed_planilha_nx_gold.sql` (Section 3) populou
-- `desembolso_item_template_ano` com distribuição UNIFORME entre
-- ano_inicio..ano_fim — aproximação aceita na hora, nunca comparada contra a
-- planilha real. Achado ao investigar: a curva real está em duas abas —
--
-- - "9. Síntese Por Atividade": item-a-item, mas só cobre os itens da
--   categoria Estudos (as outras 7 categorias não têm detalhamento item-a-item
--   em lugar nenhum da planilha).
-- - "0. Síntese Por Setor": por categoria (não por item) — é essa aba que
--   alimenta a simulação real (aba "Sim"), confirma que é a fonte "oficial".
--
-- Frações extraídas via openpyxl (ver sessão), conferidas por soma exata bater
-- com o total da categoria/item na própria planilha:
--
--   Estudos            → item-a-item, ver CTE abaixo
--   Cavas              → 100% ano 6
--   Pilhas de Estéril  → 100% ano 6
--   Barragem           → 100% ano 6
--   Planta Industrial  → 100% ano 6
--   Áreas de Apoio     → 39,569055356982% ano 5 · 60,430944643018% ano 6
--   Demolição Estr. Civis → 25% ano 5 · 75% ano 6
--   Monitoramento      → 25% em cada um de ano 7/8/9/10
--
-- `computeDesembolsoMatrix` (src/lib/desembolsoAno.ts) já prioriza
-- `desembolso_item_ano`/`_template_ano` sobre a distribuição uniforme — zero
-- mudança de código, só dado.
--
-- Retroage nos 2 projetos que já existem com tipo fechamento-mina ("Teste",
-- "Teste 2") — confirmado antes de escrever esta migration que são os ÚNICOS
-- projetos desse tipo hoje, ambos de teste, criados 2026-08-29. Sem coluna de
-- proveniência em desembolso_item_ano (achado registrado no spec) — retroagir
-- é seguro NESTE caso específico só porque não há projeto real ainda; não é
-- prática segura de se repetir sem essa checagem.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Section 1: Template (desembolso_item_template_ano) — fechamento-mina
-- ----------------------------------------------------------------------------

delete from desembolso_item_template_ano
where item_template_id in (
  select it.id from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  where ct.tipo_projeto_id = 'fechamento-mina'
);

-- Estudos — item-a-item, fração da própria "9. Síntese Por Atividade"
with fracoes_estudos(nome, ano, fracao) as (
  values
    ('Implantação de sistema de planejamento de fechamento', 3, 0.5),
    ('Implantação de sistema de planejamento de fechamento', 4, 0.5),
    ('Revisão do PRAD para fechamento',                       4, 1.0),
    ('Elaboração do Plano de Desmobilização',                 3, 0.5),
    ('Elaboração do Plano de Desmobilização',                 4, 0.5),
    ('Elaboração do Plano de Gerenciamento de Resíduos',       4, 1.0),
    ('Elaboração do Plano de Comunicação e Envolvimento',      4, 1.0),
    ('Atualização do PFM',                                     4, 1.0),
    ('Gestão e acondicionamento final de resíduos',            5, 0.5),
    ('Gestão e acondicionamento final de resíduos',            6, 0.5),
    ('Atualização do levantamento topográfico',                6, 1.0),
    ('Ações executivas gerais de estabilização',               5, 0.5),
    ('Ações executivas gerais de estabilização',               6, 0.5),
    ('Elaboração do Plano de estabilização física',            2, 1.0),
    ('Execução do Plano de Comunicação e Envolvimento',        6, 1.0),
    ('Adequação das estruturas remanescentes',                 6, 1.0)
)
insert into desembolso_item_template_ano (item_template_id, ano, valor)
select it.id, f.ano, round(it.custo_max * f.fracao, 2)
  from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  join categorias_catalogo cc on cc.id = ct.catalogo_id
  join fracoes_estudos f on f.nome = it.nome
 where ct.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Estudos';

-- Cavas, Pilhas de Estéril, Barragem, Planta Industrial — 100% ano 6
insert into desembolso_item_template_ano (item_template_id, ano, valor)
select it.id, 6, it.custo_max
  from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  join categorias_catalogo cc on cc.id = ct.catalogo_id
 where ct.tipo_projeto_id = 'fechamento-mina'
   and cc.nome in ('Cavas', 'Pilhas de Estéril', 'Barragem', 'Planta Industrial');

-- Áreas de Apoio — 39,569055356982% ano 5 / 60,430944643018% ano 6
insert into desembolso_item_template_ano (item_template_id, ano, valor)
select it.id, ano, round(it.custo_max * fracao, 2)
  from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  join categorias_catalogo cc on cc.id = ct.catalogo_id
  cross join lateral (values (5, 0.39569055356982), (6, 0.60430944643018)) as f(ano, fracao)
 where ct.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Áreas de Apoio';

-- Demolição Estr. Civis — 25% ano 5 / 75% ano 6
insert into desembolso_item_template_ano (item_template_id, ano, valor)
select it.id, ano, round(it.custo_max * fracao, 2)
  from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  join categorias_catalogo cc on cc.id = ct.catalogo_id
  cross join lateral (values (5, 0.25), (6, 0.75)) as f(ano, fracao)
 where ct.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Demolição Estr. Civis';

-- Monitoramento — 25% em cada um de ano 7/8/9/10
insert into desembolso_item_template_ano (item_template_id, ano, valor)
select it.id, ano, round(it.custo_max * 0.25, 2)
  from itens_template it
  join categorias_template ct on ct.id = it.categoria_template_id
  join categorias_catalogo cc on cc.id = ct.catalogo_id
  cross join lateral generate_series(7, 10) as ano
 where ct.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Monitoramento';

-- ----------------------------------------------------------------------------
-- Section 2: Retroage nos 2 projetos reais existentes do tipo fechamento-mina
-- Mesma lógica, mesma fonte, só troca a tabela-alvo (desembolso_item_ano) e o
-- filtro (projetos com tipo_projeto_id = 'fechamento-mina' em vez do template).
-- ----------------------------------------------------------------------------

delete from desembolso_item_ano
where item_id in (
  select ic.id
    from itens_custo ic
    join categorias_projeto cp on cp.id = ic.categoria_projeto_id
    join projetos p on p.id = cp.projeto_id
   where p.tipo_projeto_id = 'fechamento-mina'
);

with fracoes_estudos(nome, ano, fracao) as (
  values
    ('Implantação de sistema de planejamento de fechamento', 3, 0.5),
    ('Implantação de sistema de planejamento de fechamento', 4, 0.5),
    ('Revisão do PRAD para fechamento',                       4, 1.0),
    ('Elaboração do Plano de Desmobilização',                 3, 0.5),
    ('Elaboração do Plano de Desmobilização',                 4, 0.5),
    ('Elaboração do Plano de Gerenciamento de Resíduos',       4, 1.0),
    ('Elaboração do Plano de Comunicação e Envolvimento',      4, 1.0),
    ('Atualização do PFM',                                     4, 1.0),
    ('Gestão e acondicionamento final de resíduos',            5, 0.5),
    ('Gestão e acondicionamento final de resíduos',            6, 0.5),
    ('Atualização do levantamento topográfico',                6, 1.0),
    ('Ações executivas gerais de estabilização',               5, 0.5),
    ('Ações executivas gerais de estabilização',               6, 0.5),
    ('Elaboração do Plano de estabilização física',            2, 1.0),
    ('Execução do Plano de Comunicação e Envolvimento',        6, 1.0),
    ('Adequação das estruturas remanescentes',                 6, 1.0)
)
insert into desembolso_item_ano (item_id, ano, valor)
select ic.id, f.ano, round(ic.custo_max * f.fracao, 2)
  from itens_custo ic
  join categorias_projeto cp on cp.id = ic.categoria_projeto_id
  join categorias_catalogo cc on cc.id = cp.catalogo_id
  join projetos p on p.id = cp.projeto_id
  join fracoes_estudos f on f.nome = ic.nome
 where p.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Estudos';

insert into desembolso_item_ano (item_id, ano, valor)
select ic.id, 6, ic.custo_max
  from itens_custo ic
  join categorias_projeto cp on cp.id = ic.categoria_projeto_id
  join categorias_catalogo cc on cc.id = cp.catalogo_id
  join projetos p on p.id = cp.projeto_id
 where p.tipo_projeto_id = 'fechamento-mina'
   and cc.nome in ('Cavas', 'Pilhas de Estéril', 'Barragem', 'Planta Industrial');

insert into desembolso_item_ano (item_id, ano, valor)
select ic.id, ano, round(ic.custo_max * fracao, 2)
  from itens_custo ic
  join categorias_projeto cp on cp.id = ic.categoria_projeto_id
  join categorias_catalogo cc on cc.id = cp.catalogo_id
  join projetos p on p.id = cp.projeto_id
  cross join lateral (values (5, 0.39569055356982), (6, 0.60430944643018)) as f(ano, fracao)
 where p.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Áreas de Apoio';

insert into desembolso_item_ano (item_id, ano, valor)
select ic.id, ano, round(ic.custo_max * fracao, 2)
  from itens_custo ic
  join categorias_projeto cp on cp.id = ic.categoria_projeto_id
  join categorias_catalogo cc on cc.id = cp.catalogo_id
  join projetos p on p.id = cp.projeto_id
  cross join lateral (values (5, 0.25), (6, 0.75)) as f(ano, fracao)
 where p.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Demolição Estr. Civis';

insert into desembolso_item_ano (item_id, ano, valor)
select ic.id, ano, round(ic.custo_max * 0.25, 2)
  from itens_custo ic
  join categorias_projeto cp on cp.id = ic.categoria_projeto_id
  join categorias_catalogo cc on cc.id = cp.catalogo_id
  join projetos p on p.id = cp.projeto_id
  cross join lateral generate_series(7, 10) as ano
 where p.tipo_projeto_id = 'fechamento-mina'
   and cc.nome = 'Monitoramento';

-- ----------------------------------------------------------------------------
-- Section 3: Cross-check — fail-fast se algum item de fechamento-mina (template
-- ou projeto real) ficar sem NENHUMA linha de desembolso (regressão: item que
-- tinha uniforme e não bateu em nenhum dos CASE acima, silenciosamente sumiria
-- do gráfico de desembolso).
-- ----------------------------------------------------------------------------

do $$
declare
  n_template int;
  n_projeto int;
begin
  select count(*) into n_template
    from itens_template it
    join categorias_template ct on ct.id = it.categoria_template_id
   where ct.tipo_projeto_id = 'fechamento-mina'
     and it.custo_max > 0
     and not exists (
       select 1 from desembolso_item_template_ano d where d.item_template_id = it.id
     );

  select count(*) into n_projeto
    from itens_custo ic
    join categorias_projeto cp on cp.id = ic.categoria_projeto_id
    join projetos p on p.id = cp.projeto_id
   where p.tipo_projeto_id = 'fechamento-mina'
     and ic.custo_max > 0
     and not exists (
       select 1 from desembolso_item_ano d where d.item_id = ic.id
     );

  if n_template > 0 or n_projeto > 0 then
    raise exception 'Reseed de desembolso deixou % item(ns) de template e % item(ns) de projeto sem nenhuma linha de desembolso_item_ano — categoria não coberta pelo CASE de frações', n_template, n_projeto;
  end if;
end $$;
