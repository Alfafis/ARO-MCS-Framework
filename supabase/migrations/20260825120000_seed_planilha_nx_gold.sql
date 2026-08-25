-- ============================================================================
-- 20260825120000_seed_planilha_nx_gold.sql
-- ============================================================================
-- Seed em massa extraído da planilha NX Gold — Provisionamento Financeiro
-- (Khaled 1). Três blocos independentes:
--
-- 1. IPCA anual (aba "0. Síntese Por Setor", linhas 13-14)
--    → UPDATE em parametros_anuais para anos 1-10 da chave 'inflacao_ipca'
--
-- 2. Campos operacionais template (nova tabela `campos_operacionais_template`,
--    paralela à `campos_operacionais` já existente para projetos reais)
--    → labels + unidades por categoria, valores tipo "referência NX Gold"
--
-- 3. Template detalhado do tipo 'fechamento-mina'
--    → substitui os 8 items genéricos do template atual (do seed
--    20260823180000_categorias_template.sql) por 40+ items reais com fonte
--    granular ("Brandt Meio Ambiente", "SINAPI 2021"), sub-grupos preservados
--    no campo `aplicabilidade` como prefixo (ex: "[2.1 Retaludamento] Perfuração")
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BLOCO 1 — IPCA anual (índices min/max, anos 1..10)
-- Origem: aba "0. Síntese Por Setor", linhas "Índice de IPCA Min/Max"
-- Anos 11..20 permanecem null (a planilha só projeta até ano 10)
-- ----------------------------------------------------------------------------
update public.parametros_anuais set valor_min = 0.001,  valor_max = 0.010,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 1;
update public.parametros_anuais set valor_min = 0.020,  valor_max = 0.022,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 2;
update public.parametros_anuais set valor_min = 0.005,  valor_max = 0.010,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 3;
update public.parametros_anuais set valor_min = 0.020,  valor_max = 0.022,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 4;
update public.parametros_anuais set valor_min = 0.040,  valor_max = 0.050,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 5;
update public.parametros_anuais set valor_min = 0.038,  valor_max = 0.040,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 6;
update public.parametros_anuais set valor_min = 0.031,  valor_max = 0.0325, fonte = 'manual' where chave = 'inflacao_ipca' and ano = 7;
update public.parametros_anuais set valor_min = 0.021,  valor_max = 0.022,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 8;
update public.parametros_anuais set valor_min = 0.013,  valor_max = 0.015,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 9;
update public.parametros_anuais set valor_min = 0.031,  valor_max = 0.035,  fonte = 'manual' where chave = 'inflacao_ipca' and ano = 10;

-- ----------------------------------------------------------------------------
-- BLOCO 2 — Tabela `campos_operacionais_template` + seed do fechamento-mina
-- Estrutura paralela à `campos_operacionais` (que fica por-projeto). Cada
-- categoria do template tem 1..N campos que o cliente vai preencher no portal
-- (perímetro, área, volume, tonelagem, etc.). Valores default aqui são
-- valores de REFERÊNCIA da NX Gold — o cliente pode substituir pelos números
-- reais dele durante o preenchimento.
-- ----------------------------------------------------------------------------
create table if not exists public.campos_operacionais_template (
  id                     uuid primary key default gen_random_uuid(),
  categoria_template_id  uuid not null references public.categorias_template(id) on delete cascade,
  label                  text not null,
  unidade                text,
  valor_referencia       text,
  ordem                  integer not null default 0,
  criado_em              timestamptz not null default now()
);

create index if not exists idx_campos_operacionais_template_categoria_id
  on public.campos_operacionais_template (categoria_template_id);

alter table public.campos_operacionais_template enable row level security;

drop policy if exists campos_operacionais_template_select_consultor
  on public.campos_operacionais_template;
create policy campos_operacionais_template_select_consultor
  on public.campos_operacionais_template
  for select
  using (public.is_consultor());

-- ----------------------------------------------------------------------------
-- BLOCO 3 — Reset + repopulação do template 'fechamento-mina' com detalhe
-- Preserva o catálogo compartilhado (renome de categoria continua global),
-- só limpa e recria as instâncias de template do tipo 'fechamento-mina'.
-- ----------------------------------------------------------------------------
do $$
declare
  v_tipo text := 'fechamento-mina';
  v_cat  public.categorias_catalogo;
  v_ct   public.categorias_template;
  v_est  public.categorias_template;
  v_cav  public.categorias_template;
  v_pil  public.categorias_template;
  v_bar  public.categorias_template;
  v_pla  public.categorias_template;
  v_are  public.categorias_template;
  v_dem  public.categorias_template;
  v_mon  public.categorias_template;
begin
  -- Limpa template atual do tipo (não toca no catálogo compartilhado)
  delete from public.categorias_template where tipo_projeto_id = v_tipo;

  -- ============================================================
  -- 1. Estudos e ações gerais — Pré-fechamento
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Estudos');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 0) returning * into v_est;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_est.id, 'Implantação de sistema de planejamento de fechamento',  'vb',  400000,  500000, 'Brandt Meio Ambiente', 'Todos os setores', 'Anos 3-4', 0),
    (v_est.id, 'Revisão do PRAD para fechamento',                        'vb',  350000,  400000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 4',   1),
    (v_est.id, 'Elaboração do Plano de Desmobilização',                  'vb',  200000,  220000, 'Brandt Meio Ambiente', 'Setor 4, 5, 6, 7, 8 e 9', 'Anos 3-4', 2),
    (v_est.id, 'Elaboração do Plano de Gerenciamento de Resíduos',       'vb',  300000,  310000, 'Brandt Meio Ambiente', 'Setor 4, 5, 6, 7, 8 e 10', 'Ano 4', 3),
    (v_est.id, 'Elaboração do Plano de Comunicação e Envolvimento',      'vb',  300000,  450000, 'Brandt Meio Ambiente', 'Todos os setores internos à empresa e comunidade externa', 'Ano 4', 4),
    (v_est.id, 'Atualização do PFM',                                     'vb',  200000,  230000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 4', 5),
    (v_est.id, 'Gestão e acondicionamento final de resíduos',            'vb',  600000,  700000, 'Brandt Meio Ambiente', 'Setores 2, 3 e 4', 'Anos 5-6', 6),
    (v_est.id, 'Atualização do levantamento topográfico',                'vb',  200000,  240000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 4', 7),
    (v_est.id, 'Ações executivas gerais de estabilização',               'vb', 3000000, 3500000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 5', 8),
    (v_est.id, 'Elaboração do Plano de estabilização física',            'vb',  450000,  500000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 2', 9),
    (v_est.id, 'Execução do Plano de Comunicação e Envolvimento',        'vb',  150000, 1600000, 'Brandt Meio Ambiente', 'Todos os setores internos à empresa e comunidade externa', 'Anos 5-6', 10),
    (v_est.id, 'Adequação das estruturas remanescentes',                 'vb',  400000,  450000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 5', 11);

  -- ============================================================
  -- 2. Cavas — Retaludamento + Drenagem + Revegetação
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Cavas');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 1) returning * into v_cav;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    -- 2.1 Retaludamento
    (v_cav.id, '[Retaludamento] Perfuração',                                    't',  426060,  443102, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 0),
    (v_cav.id, '[Retaludamento] Desmontagem',                                   't',  511272,  536835, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 1),
    (v_cav.id, '[Retaludamento] Construção de proteção para segurança',         'm',   35505,   39213, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 2),
    -- 2.2 Drenagem
    (v_cav.id, '[Drenagem] Escavação mecanizada de vala (≤1,5m)',              'm³',  102570,  117166, 'SINAPI 2021',          'Setor 7', 'Ano 6', 3),
    -- 2.3 Revegetação (área 6 ha)
    (v_cav.id, '[Revegetação] Descompactação de solo',                         'ha',   49800,   51000, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 4),
    (v_cav.id, '[Revegetação] Aplicação de solo orgânico',                     'ha',   31200,   33000, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 5),
    (v_cav.id, '[Revegetação] Insumos (adubos e corretivos)',                  'ha',    4500,    4800, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 6),
    (v_cav.id, '[Revegetação] Adubação verde, semeadura (gramíneas)',          'ha',   15000,   16800, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 7),
    (v_cav.id, '[Revegetação] Plantio de mudas (625/ha)',                      'ha',   42000,   45000, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 8),
    (v_cav.id, '[Revegetação] Manutenção e replantio',                         'ha',   22800,   24000, 'Brandt Meio Ambiente', 'Setor 7', 'Anos 7-10', 9),
    (v_cav.id, '[Revegetação] Serviço, mão de obra',                           'ha',   10500,   12000, 'Brandt Meio Ambiente', 'Setor 7', 'Ano 6', 10);

  -- Campos operacionais Cavas
  insert into public.campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem) values
    (v_cav.id, 'Perímetro',      'km',   '7,89',       0),
    (v_cav.id, 'Largura Berma',  'm',    '4',          1),
    (v_cav.id, 'Altura Bancada', 'm',    '10',         2),
    (v_cav.id, 'Volume',         'm³',   '315.600',    3),
    (v_cav.id, 'Tonelagem',      't',    '852.120',    4),
    (v_cav.id, 'Área',           'ha',   '56,7384',    5);

  -- ============================================================
  -- 3. Pilhas de Estéril
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Pilhas de Estéril');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 2) returning * into v_pil;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_pil.id, '[Retaludamento] Reconformação topográfica',                'm²',    6490,    7375, 'Brandt Meio Ambiente', 'Setor 2', 'Ano 6', 0),
    (v_pil.id, '[Retaludamento] Escavação, carga, transporte, descarga',    't', 1082221, 1120549, 'Brandt Meio Ambiente', 'Setor 2', 'Ano 6', 1),
    (v_pil.id, '[Drenagem] Escavação mecanizada de vala (≤1,5m)',           'm³',   35823,   37201, 'SINAPI 2021',          'Setor 2', 'Ano 6', 2),
    (v_pil.id, '[Revegetação] Descompactação de solo',                     'ha',  165869,  169867, 'Brandt Meio Ambiente', 'Setor 2', 'Ano 6', 3),
    (v_pil.id, '[Revegetação] Aplicação de solo orgânico',                 'ha',  103919,  109914, 'Brandt Meio Ambiente', 'Setor 2', 'Ano 6', 4),
    (v_pil.id, '[Revegetação] Insumos (adubos e corretivos)',              'ha',   14988,   15987, 'Brandt Meio Ambiente', 'Setor 2', 'Ano 6', 5),
    (v_pil.id, '[Revegetação] Plantio de mudas + manutenção',              'ha',  139891,  149883, 'Brandt Meio Ambiente', 'Setor 2', 'Anos 6-10', 6);

  insert into public.campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem) values
    (v_pil.id, 'Perímetro',      'm',    '2.505,14',   0),
    (v_pil.id, 'Volume',         'm³',   '250.514',    1),
    (v_pil.id, 'Tonelagem',      't',    '676.388',    2),
    (v_pil.id, 'Área',           'ha',   '19,9844',    3),
    (v_pil.id, 'Densidade',      't/m³', '2,7',        4);

  -- ============================================================
  -- 4. Barragem
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Barragem');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Ambos', 3) returning * into v_bar;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_bar.id, '[Recobrimento] Camada de estéril/drenante (0,5m)',         't',      63,      64, 'Brandt Meio Ambiente e SINAPI 2021', 'Setor 1', 'Ano 6', 0),
    (v_bar.id, '[Recobrimento] Camada de solo (0,3m)',                    'm³',     116,     127, 'Brandt Meio Ambiente e SINAPI 2021', 'Setor 1', 'Ano 6', 1),
    (v_bar.id, '[Recobrimento] Camada de proteção (0,4m)',                'm³',     116,     127, 'Brandt Meio Ambiente e SINAPI 2021', 'Setor 1', 'Ano 6', 2),
    (v_bar.id, '[Recobrimento] Sistema de drenagem (escavação)',          'm³',   23002,   24398, 'SINAPI 2021',                        'Setor 1', 'Ano 6', 3),
    (v_bar.id, '[Revegetação] Descompactação de solo',                    'ha',  106425,  109650, 'Brandt Meio Ambiente',               'Setor 1', 'Ano 6', 4),
    (v_bar.id, '[Revegetação] Aplicação de solo orgânico',                'ha',   68370,   70950, 'Brandt Meio Ambiente',               'Setor 1', 'Ano 6', 5),
    (v_bar.id, '[Revegetação] Plantio de mudas + manutenção',             'ha',   90300,   96750, 'Brandt Meio Ambiente',               'Setor 1', 'Anos 6-10', 6);

  insert into public.campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem) values
    (v_bar.id, 'Perímetro',      'm',    '1.643',      0),
    (v_bar.id, 'Área',           'ha',   '12,9',       1),
    (v_bar.id, 'Densidade',      't/m³', '1,4',        2);

  -- ============================================================
  -- 5. Planta Industrial
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Planta Industrial');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 4) returning * into v_pla;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_pla.id, '[Desativação] Desmontagem dos equipamentos',              't',   268000,  272435, 'Brandt Meio Ambiente', 'Setor 3', 'Ano 6', 0),
    (v_pla.id, '[Desativação] Sistema elétrico',                          'm',    50000,   52200, 'Brandt Meio Ambiente', 'Setor 3', 'Ano 6', 1),
    (v_pla.id, '[Desativação] Desmontagem de tubulação',                  'm',    92000,  103944, 'Brandt Meio Ambiente', 'Setor 3', 'Ano 6', 2),
    (v_pla.id, '[Desativação] Desmontagem de estrutura metálica',         't',   162000,  163461, 'Brandt Meio Ambiente', 'Setor 3', 'Ano 6', 3),
    (v_pla.id, '[Desativação] Demolição - concreto armado',              'm³',   100000,  109000, 'Brandt Meio Ambiente', 'Setor 3', 'Ano 6', 4),
    (v_pla.id, '[Desativação] Transporte de entulhos',                   'm³',     7000,    7716, 'Brandt Meio Ambiente', 'Setor 3', 'Ano 6', 5),
    (v_pla.id, '[Revegetação] Descompactação + solo orgânico + mudas',   'ha',   161100,  169796, 'Brandt Meio Ambiente', 'Setor 3', 'Anos 6-10', 6);

  insert into public.campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem) values
    (v_pla.id, 'Área',           'ha',   '5,47',       0),
    (v_pla.id, 'Perímetro',      'm',    '933',        1);

  -- ============================================================
  -- 6. Áreas de Apoio
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Áreas de Apoio');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 5) returning * into v_are;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_are.id, '[Revegetação] Descompactação de solo',                    'ha',  766635,  771171, 'Brandt Meio Ambiente', 'Setor 4, 6, 8, 9', 'Anos 5-6', 0),
    (v_are.id, '[Revegetação] Aplicação de solo orgânico',                'ha',  480848,  498993, 'Brandt Meio Ambiente', 'Setor 4, 6, 8, 9', 'Anos 5-6', 1),
    (v_are.id, '[Revegetação] Insumos (adubos e corretivos)',             'ha',   63508,   72581, 'Brandt Meio Ambiente', 'Setor 4, 6, 8, 9', 'Anos 5-6', 2),
    (v_are.id, '[Revegetação] Plantio de mudas + manutenção',             'ha',  975287, 1043381, 'Brandt Meio Ambiente', 'Setor 4, 6, 8, 9', 'Anos 5-10', 3),
    (v_are.id, '[Desmontagem] Sistema elétrico',                          'm',    52500,   56377, 'Brandt Meio Ambiente', 'Setor 4, 6, 8, 9', 'Anos 5-6', 4),
    (v_are.id, '[Desmontagem] Demolição de estruturas civis',            'm³',   963000,  999000, 'Brandt Meio Ambiente', 'Setor 4, 6, 8, 9', 'Anos 5-6', 5),
    (v_are.id, '[Desmontagem] Transporte de entulhos',                   't',   101493,  109334, 'Brandt Meio Ambiente', 'Setor 4, 6, 8, 9', 'Anos 5-6', 6);

  insert into public.campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem) values
    (v_are.id, 'Área total',     'ha',   '90,726',     0),
    (v_are.id, 'Perímetro total','m',    '32.425',     1);

  -- ============================================================
  -- 7. Demolição de Estruturas Civis
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Demolição Estr. Civis');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Consultor', 6) returning * into v_dem;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_dem.id, 'Demolição de paredes (concreto e blocos)',                'm³',  169968,  179883, 'SINAPI 2021',          'Setor 4, 5, 6, 7, 8 e 9', 'Anos 5-6', 0),
    (v_dem.id, 'Demolição de cobertura (concreto)',                       'm³', 2487659, 2576031, 'SINAPI 2021',          'Setor 4, 5, 6, 7, 8 e 9', 'Anos 5-6', 1),
    (v_dem.id, 'Demolição de telhado (cerâmica)',                         'm²',  289748,  318722, 'SINAPI 2021',          'Setor 4, 5, 6, 7, 8 e 9', 'Anos 5-6', 2),
    (v_dem.id, 'Demolição de piso (concreto)',                            'm²', 1490130, 1500064, 'SINAPI 2021',          'Setor 4, 5, 6, 7, 8 e 9', 'Anos 5-6', 3);

  insert into public.campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem) values
    (v_dem.id, 'Área construída',        'm²', '82.785',    0),
    (v_dem.id, 'Perímetro',              'm',  '4.721,6',   1),
    (v_dem.id, 'Volume de paredes',      'm³', '56.659',    2),
    (v_dem.id, 'Volume de cobertura',    'm³', '20.696',    3);

  -- ============================================================
  -- 8. Monitoramento
  -- ============================================================
  v_cat := public.find_or_create_categoria_catalogo('Monitoramento');
  insert into public.categorias_template (tipo_projeto_id, catalogo_id, preenche, ordem)
    values (v_tipo, v_cat.id, 'Ambos', 7) returning * into v_mon;

  insert into public.itens_template (categoria_template_id, nome, unidade, custo_min, custo_max, fonte, aplicabilidade, ano_previsto, ordem) values
    (v_mon.id, '[Segurança] Bloqueio de acessos ao empreendimento',       'vb',  900000, 1000000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 7', 0),
    (v_mon.id, '[Segurança] Proteção dos limites da propriedade',         'm',   564073,  607671, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 7', 1),
    (v_mon.id, '[Segurança] Manutenção de vigilância',                    'vb',  280000,  300000, 'Brandt Meio Ambiente', 'Todos os setores', 'Anos 7-10', 2),
    (v_mon.id, '[Qualidade Água] Monitoramento água subterrânea e sup.',  'vb',  280000, 3000000, 'Brandt Meio Ambiente', 'Todos os setores', 'Anos 7-10', 3),
    (v_mon.id, '[Estabilidade Física] Instalação sistema de drenagem',    'vb',  480000,  500000, 'Brandt Meio Ambiente', 'Todos os setores', 'Ano 7', 4),
    (v_mon.id, '[Estabilidade Física] Manutenção do sistema de drenagem', 'vb', 2375000, 2500000, 'Brandt Meio Ambiente', 'Todos os setores', 'Anos 7-10', 5),
    (v_mon.id, '[Estabilidade Química] Monitoramento dos terrenos',       'vb',  950000, 1000000, 'Brandt Meio Ambiente', 'Todos os setores', 'Anos 7-10', 6);
end $$;
