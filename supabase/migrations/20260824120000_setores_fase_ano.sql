-- ============================================================================
-- 20260824120000_setores_fase_ano.sql
-- ============================================================================
-- Estrutura os campos `aplicabilidade` e `ano_previsto` (hoje `text` livre) em
-- dados tipados, com base na planilha NX Gold — Provisionamento Financeiro.
-- Referências:
--   - Aba "0. Síntese Por Setor"    → mapa Categoria → Setor(es) da mina
--   - Aba "9. Síntese Por Atividade" → mapa Item → Fase + distribuição por ano
--
-- Escopo desta migration:
--   1. Tabela lookup `setores` (áreas físicas/funcionais da mina)
--   2. Colunas novas em `itens_custo` e `itens_template`:
--        - aplicabilidade_setores (smallint[])  — null = "todos os setores"
--        - fase                   (text enum-like via check)
--        - ano_inicio, ano_fim    (smallint 1..20) — range de execução
--   3. Colunas legadas `aplicabilidade` (text) e `ano_previsto` (text) ficam
--      MANTIDAS por ora, nullable, como fallback durante rollout. Serão
--      dropadas em migration futura (fase 2) após migração de dados.
--
-- Validação do array `aplicabilidade_setores` (cada elemento existe em
-- `setores`) fica na RPC de update — coerente com o padrão do projeto
-- (validação de negócio em RPC, não em check constraint com função STABLE).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Setores — lookup de áreas físicas/funcionais da mina.
-- IDs numéricos preservam a numeração original da planilha ("Setor 1", "2"...).
-- ----------------------------------------------------------------------------
create table if not exists public.setores (
  id         smallint primary key check (id between 1 and 99),
  nome       text not null unique,
  criado_em  timestamptz not null default now()
);

-- Seed inicial extraído da planilha NX Gold — Provisionamento Financeiro.
-- IDs seguem a numeração da coluna "Setores de Análise Metodológica *¹" da
-- aba "0. Síntese Por Setor" (síntese oficial). Labels descritivos vieram do
-- cruzamento com as colunas laterais da aba "6. Áreas de Apoio" — quando
-- havia conflito de numeração entre abas, priorizou-se a aba 0 (síntese).
--
-- Setor 5 e Setor 10 não têm nome descoberto na planilha (aparecem só em
-- listas de aplicabilidade tipo "Setor 4, 5, 6, 7, 8 e 9"). Provisoriamente
-- ficam nomeados só pelo número — usuário admin pode renomear em UI futura
-- (tela `/tipos-projeto` ou dedicada de setores).
insert into public.setores (id, nome) values
  (1,  'Barragens'),
  (2,  'Pilhas de estéril / rejeito'),
  (3,  'Planta Industrial'),
  (4,  'Infraestrutura de Apoio Operacional'),
  (5,  'Setor 5 (não identificado na planilha)'),
  (6,  'Infraestrutura de Apoio Administrativo'),
  (7,  'Cavas'),
  (8,  'Áreas em Recuperação'),
  (9,  'Sistemas de Locomoção e fornecimento de água/energia'),
  (10, 'Setor 10 (não identificado na planilha)')
on conflict (id) do nothing;

alter table public.setores enable row level security;

-- Setores é lookup semi-público — todo usuário autenticado (consultor OU
-- cliente logado) precisa ler pra montar UI de multi-select e legendas do
-- relatório. Portal público (`anon`) não usa direto: RPC obter_relatorio_publico
-- expõe só os setores efetivamente usados pelo projeto via join.
drop policy if exists setores_select_authenticated on public.setores;
create policy setores_select_authenticated on public.setores
  for select
  using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- itens_custo — colunas novas estruturadas
-- ----------------------------------------------------------------------------
alter table public.itens_custo
  add column if not exists aplicabilidade_setores smallint[],
  add column if not exists fase                   text
    check (fase is null or fase in ('pre-fechamento', 'fechamento', 'pos-fechamento')),
  add column if not exists ano_inicio             smallint
    check (ano_inicio is null or ano_inicio between 1 and 20),
  add column if not exists ano_fim                smallint
    check (ano_fim is null or ano_fim between 1 and 20);

-- ano_fim >= ano_inicio quando ambos preenchidos
alter table public.itens_custo
  drop constraint if exists itens_custo_ano_fim_maior_igual_inicio;
alter table public.itens_custo
  add constraint itens_custo_ano_fim_maior_igual_inicio
    check (ano_fim is null or ano_inicio is null or ano_fim >= ano_inicio);

-- Índices pra queries de MC/relatório (agregação por fase, filtro por ano)
create index if not exists idx_itens_custo_fase       on public.itens_custo (fase);
create index if not exists idx_itens_custo_ano_inicio on public.itens_custo (ano_inicio);

-- ----------------------------------------------------------------------------
-- itens_template — mesmo shape que itens_custo
-- ----------------------------------------------------------------------------
alter table public.itens_template
  add column if not exists aplicabilidade_setores smallint[],
  add column if not exists fase                   text
    check (fase is null or fase in ('pre-fechamento', 'fechamento', 'pos-fechamento')),
  add column if not exists ano_inicio             smallint
    check (ano_inicio is null or ano_inicio between 1 and 20),
  add column if not exists ano_fim                smallint
    check (ano_fim is null or ano_fim between 1 and 20);

alter table public.itens_template
  drop constraint if exists itens_template_ano_fim_maior_igual_inicio;
alter table public.itens_template
  add constraint itens_template_ano_fim_maior_igual_inicio
    check (ano_fim is null or ano_inicio is null or ano_fim >= ano_inicio);

create index if not exists idx_itens_template_fase       on public.itens_template (fase);
create index if not exists idx_itens_template_ano_inicio on public.itens_template (ano_inicio);

-- ============================================================================
-- FASE 2 (migration futura, fora deste arquivo):
--   - Popular novos campos a partir dos legados via script one-off
--     (parser das strings existentes: "Setor 4, 5 e 7" → array, "Ano 3-5" →
--     ano_inicio=3, ano_fim=5)
--   - Depois: alter table drop column aplicabilidade, drop column ano_previsto
--   - Atualizar RPCs update_item_custo, template_update_item pra remover as
--     chaves antigas do patch jsonb
-- ============================================================================

-- ============================================================================
-- Pendente para esta feature entrar em produção (fora do escopo desta migration):
--
-- 1. RPCs de update:
--    - update_item_custo (patch jsonb) → aceitar chaves novas:
--        'aplicabilidadeSetores' → aplicabilidade_setores (validar cada id existe
--         em public.setores, ou aceitar null = "todos os setores")
--        'fase'                  → fase
--        'anoInicio'             → ano_inicio
--        'anoFim'                → ano_fim
--    - template_update_item — mesma coisa
--
-- 2. Frontend:
--    - types/categorias.ts (novos campos + type Fase + type Setor)
--    - context/ProjetoContext.ITEM_FIELD_TO_PATCH_KEY (novos mapeamentos)
--    - CategoryBlock — inputs livres viram <select> (fase, setores multi),
--      inputs numéricos (anoInicio, anoFim); layout mantém 7 colunas ou
--      reagrupa em duas linhas
--
-- 3. Portal público:
--    - obter_relatorio_publico expor `setores` do projeto via join agregado
-- ============================================================================
