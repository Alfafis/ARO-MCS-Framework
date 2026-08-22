-- ============================================================================
-- 20260821165630_initial_schema.sql
-- ============================================================================
-- Migração inicial — formaliza schema.db (DDL solta na raiz do repo) como
-- migration idempotente do Supabase, + tabela de perfil/papel necessária
-- pra RLS. Ver skills/supabase.md do vault (padrão RPC-first, RLS) e
-- ARO-MCS-Framework/_ADRs.md (isolamento por projeto, leak já corrigido
-- uma vez no frontend — motivo de já habilitar RLS aqui, mesmo sem policy
-- ainda: tabela sem RLS é exposta a anon/authenticated via PostgREST por
-- default).
--
-- Escopo desta migration: schema.db original + auth (perfis). RLS habilitado
-- em toda tabela, mas SEM policy ainda — isolamento fica default-deny até a
-- Fase E (RPCs de negócio) desenhar as policies certas por papel/cliente_id.
-- service_role (usado por RPCs SECURITY DEFINER e Edge Functions) ignora RLS
-- normalmente, então nada trava com policy zero.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Perfil / papel do usuário autenticado (base pra RLS futura)
-- ----------------------------------------------------------------------------

create table if not exists public.perfis (
  id         uuid primary key references auth.users(id) on delete cascade,
  papel      text not null default 'cliente' check (papel in ('consultor', 'cliente')),
  criado_em  timestamptz not null default now()
);

-- Auto-provisiona perfil no signup. Default 'cliente' — contas de consultor
-- são promovidas manualmente (não existe self-signup de consultor).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
begin
  insert into public.perfis (id, papel)
  values (new.id, coalesce(new.raw_user_meta_data->>'papel', 'cliente'));
  return new;
end;
$function$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Contexto mínimo (fora do escopo de "categorias" em si, mas necessário pra FK)
-- ----------------------------------------------------------------------------

create table if not exists public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  criado_em   timestamptz not null default now()
);
-- "initials" do frontend NÃO entra aqui — é derivado do nome, calcular na
-- camada de apresentação, não persistir dado redundante.

create table if not exists public.tipos_projeto (
  id    text primary key,   -- slug estável: 'fechamento-mina' | 'ambiental' | 'outro'
  nome  text not null
);
-- Tabela de lookup, não cresce por tenant — é a mesma pra todo o sistema.

create table if not exists public.projetos (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid not null references public.clientes(id) on delete cascade,
  tipo_projeto_id     text not null references public.tipos_projeto(id),
  nome                text not null,
  status              text not null default 'andamento'
                        check (status in ('andamento', 'aguardando', 'concluido')),
  rev                 text not null default 'Rev0',   -- hoje estático — versionamento real (hash, timeline) é escopo do módulo Revisões, ainda não religado
  moeda               text not null default 'brl',
  data_base           text not null,
  metodo_atualizacao  text not null default 'a-definir',
  contingencia_pct    numeric(5,2) not null default 0
                        check (contingencia_pct >= 0 and contingencia_pct <= 100),
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);
-- "esperado" do frontend NÃO entra aqui — é a soma calculada de itens_custo,
-- nunca armazenar valor derivado (fica desatualizado na primeira edição de item).

-- ----------------------------------------------------------------------------
-- Catálogo de categoria — compartilhado por TODO o sistema (não por projeto)
-- ----------------------------------------------------------------------------

create table if not exists public.categorias_catalogo (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null
);

drop index if exists categorias_catalogo_nome_unq;
create unique index if not exists categorias_catalogo_nome_unq on public.categorias_catalogo (lower(nome));

-- ----------------------------------------------------------------------------
-- Categoria — instância por projeto (o que de fato pertence ao projeto)
-- ----------------------------------------------------------------------------

create table if not exists public.categorias_projeto (
  id            uuid primary key default gen_random_uuid(),
  projeto_id    uuid not null references public.projetos(id) on delete cascade,
  catalogo_id   uuid not null references public.categorias_catalogo(id),
  preenche      text not null default 'Consultor'
                  check (preenche in ('Consultor', 'Cliente', 'Ambos')),
  ordem         integer not null default 0,
  criado_em     timestamptz not null default now()
);

create unique index if not exists categorias_projeto_unq on public.categorias_projeto (projeto_id, catalogo_id);

-- ----------------------------------------------------------------------------
-- Item de custo — estimativa do consultor (min/max), exclusivo do projeto
-- ----------------------------------------------------------------------------

create table if not exists public.itens_custo (
  id                   uuid primary key default gen_random_uuid(),
  categoria_projeto_id uuid not null references public.categorias_projeto(id) on delete cascade,
  nome                 text not null,
  unidade              text not null,
  custo_min            numeric(14,2) not null,
  custo_max            numeric(14,2) not null,
  fonte                text,
  aplicabilidade       text,
  ano_previsto         text,
  ordem                integer not null default 0,
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),

  constraint custo_max_maior_que_min check (custo_max >= custo_min)
);

-- ----------------------------------------------------------------------------
-- Campo operacional — fato preenchido pelo cliente (área, perímetro, etc.)
-- ----------------------------------------------------------------------------

create table if not exists public.campos_operacionais (
  id                    uuid primary key default gen_random_uuid(),
  categoria_projeto_id  uuid not null references public.categorias_projeto(id) on delete cascade,
  label                 text not null,
  valor                 text,
  unidade               text,
  status                text not null default 'pendente'
                          check (status in ('pendente', 'preenchido')),
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Índices de acesso
-- ----------------------------------------------------------------------------

create index if not exists idx_categorias_projeto_projeto_id on public.categorias_projeto (projeto_id);
create index if not exists idx_itens_custo_categoria_id on public.itens_custo (categoria_projeto_id);
create index if not exists idx_campos_operacionais_categoria_id on public.campos_operacionais (categoria_projeto_id);
create index if not exists idx_projetos_cliente_id on public.projetos (cliente_id);

-- ----------------------------------------------------------------------------
-- RLS — habilitado em toda tabela de negócio, sem policy ainda (default-deny
-- pra authenticated/anon; service_role continua irrestrito). Policies reais
-- entram na Fase E, junto com as RPCs.
-- ----------------------------------------------------------------------------

alter table public.perfis                enable row level security;
alter table public.clientes              enable row level security;
alter table public.tipos_projeto         enable row level security;
alter table public.projetos              enable row level security;
alter table public.categorias_catalogo   enable row level security;
alter table public.categorias_projeto    enable row level security;
alter table public.itens_custo           enable row level security;
alter table public.campos_operacionais   enable row level security;

-- Único acesso liberado por ora: usuário lê o próprio perfil (necessário pro
-- frontend saber o papel logo após login, antes de qualquer RPC existir).
drop policy if exists perfis_select_own on public.perfis;
create policy perfis_select_own on public.perfis
  for select
  using ((select auth.uid()) = id);

-- ----------------------------------------------------------------------------
-- Seed mínimo — tipos_projeto (lookup, não muda por tenant)
-- ----------------------------------------------------------------------------

insert into public.tipos_projeto (id, nome) values
  ('fechamento-mina', 'Fechamento de Mina (ARO)'),
  ('ambiental',       'Ambiental'),
  ('outro',           'Outro')
on conflict (id) do nothing;

-- ============================================================================
-- Fora de escopo aqui, propositalmente:
--  - Policies de negócio (Fase E, junto com RPCs)
--  - Templates de categoria por tipo de projeto (código: categoria-templates.ts)
--  - Simulação Monte Carlo (resultados, histórico de rodadas)
--  - Lançamentos realizados (comparativo expectativa vs. realidade)
--  - Revisões (hash de ancoragem real — hoje é Math.random(), achado de
--    segurança já registrado)
--  - Vínculo perfil↔cliente_id pra papel='cliente' (portal do cliente via
--    código de acesso — precisa de design próprio, não é RLS simples)
-- ============================================================================
