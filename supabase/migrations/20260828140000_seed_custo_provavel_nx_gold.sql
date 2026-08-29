-- ============================================================================
-- 20260828140000_seed_custo_provavel_nx_gold.sql
-- ============================================================================
-- Seed do `custo_provavel` (moda "pela experiência") por categoria do
-- template `fechamento-mina`, extraído das células F18/H50/H45/H70/H26/H26/H21/H38
-- das abas 1..8 da planilha NX Gold.
--
-- Valores são a moda hardcoded pelo consultor original da planilha ("Provavelmente
-- (Pela experiência)"), NÃO derivados de (min+max)/2. Ver `_Dados_Formulas_Planilha.md`.
--
-- Também replica os valores nos projetos existentes desse tipo — assim o
-- consultor não precisa reabrir cada projeto pra preencher manualmente.
--
-- Idempotente: `is null` no update evita sobrescrever se o consultor já
-- ajustou o valor manualmente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Modas do template fechamento-mina
-- ----------------------------------------------------------------------------

update public.categorias_template ct
   set custo_provavel = 8150000.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'estudos'
   and ct.custo_provavel is null;

update public.categorias_template ct
   set custo_provavel = 2350000.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'cavas'
   and ct.custo_provavel is null;

update public.categorias_template ct
   set custo_provavel = 1780000.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'pilhas de estéril'
   and ct.custo_provavel is null;

update public.categorias_template ct
   set custo_provavel = 425000.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'barragem'
   and ct.custo_provavel is null;

update public.categorias_template ct
   set custo_provavel = 865500.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'planta industrial'
   and ct.custo_provavel is null;

update public.categorias_template ct
   set custo_provavel = 3885500.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'áreas de apoio'
   and ct.custo_provavel is null;

update public.categorias_template ct
   set custo_provavel = 4550000.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'demolição estr. civis'
   and ct.custo_provavel is null;

update public.categorias_template ct
   set custo_provavel = 11300000.00
  from public.categorias_catalogo cc
 where cc.id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and lower(cc.nome) = 'monitoramento'
   and ct.custo_provavel is null;

-- ----------------------------------------------------------------------------
-- Propaga pros projetos já criados desse tipo (categorias_projeto que
-- correspondem a categorias_template desse tipo_projeto). Só toca quem estiver
-- null (não sobrescreve ajuste manual).
-- ----------------------------------------------------------------------------

update public.categorias_projeto cp
   set custo_provavel = ct.custo_provavel
  from public.categorias_template ct,
       public.projetos p
 where p.id = cp.projeto_id
   and p.tipo_projeto_id = ct.tipo_projeto_id
   and cp.catalogo_id = ct.catalogo_id
   and ct.tipo_projeto_id = 'fechamento-mina'
   and ct.custo_provavel is not null
   and cp.custo_provavel is null;
