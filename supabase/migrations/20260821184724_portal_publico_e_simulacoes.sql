-- ============================================================================
-- 20260821184724_portal_publico_e_simulacoes.sql
-- ============================================================================
-- Duas coisas nesta migration, entrelaçadas de propósito:
--
-- 1. Persistir Simulação (tabela simulacoes) — hoje 100% em memória
--    (SimulationContext), some ao trocar de aba/dispositivo.
--
-- 2. Corrigir o Portal do Cliente, que HOJE NÃO FUNCIONA pra acesso externo
--    real, por dois motivos independentes:
--    a) Código de acesso vive em localStorage do navegador do CONSULTOR
--       (src/data/invite-codes.ts) — nunca sincroniza pro navegador do
--       cliente, em nenhum dispositivo. Substituído por tabela real +
--       validação no servidor.
--    b) As RLS policies de is_consultor() das fatias anteriores (Clientes/
--       Projetos/Categorias) bloqueiam `anon` por padrão — o portal público
--       lê os mesmos contexts do app autenticado, então passou a receber
--       relatório vazio pra visitante anônimo. Regressão desta sessão,
--       corrigida aqui com uma única RPC pública que devolve o bundle
--       inteiro do relatório, sem abrir SELECT direto de tabela pra anon.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Simulações — append-only (nunca deleta; "Revisões auditáveis" é a proposta
-- de valor do próprio produto). Cálculo em si continua 100% client-side
-- (monteCarlo.ts) — só o resultado computado persiste.
-- ----------------------------------------------------------------------------

create table if not exists public.simulacoes (
  id                uuid primary key default gen_random_uuid(),
  projeto_id        uuid not null references public.projetos(id) on delete cascade,
  distribuicao      text not null check (distribuicao in ('Triangular', 'Normal', 'Uniforme')),
  iteracoes         text not null,
  confidence_level  integer not null,
  active_categories text[] not null default '{}',
  resultado         jsonb not null,
  criado_em         timestamptz not null default now()
);

create index if not exists idx_simulacoes_projeto_id_criado_em on public.simulacoes (projeto_id, criado_em desc);

alter table public.simulacoes enable row level security;

drop policy if exists simulacoes_select_consultor on public.simulacoes;
create policy simulacoes_select_consultor on public.simulacoes
  for select
  using (public.is_consultor());

create or replace function public.registrar_simulacao(
  p_projeto_id        uuid,
  p_distribuicao      text,
  p_iteracoes         text,
  p_confidence_level  int,
  p_active_categories text[],
  p_resultado         jsonb
)
returns public.simulacoes
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_sim public.simulacoes;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  insert into public.simulacoes (projeto_id, distribuicao, iteracoes, confidence_level, active_categories, resultado)
  values (p_projeto_id, p_distribuicao, p_iteracoes, p_confidence_level, p_active_categories, p_resultado)
  returning * into v_sim;

  return v_sim;
end;
$function$;

revoke execute on function public.registrar_simulacao(uuid, text, text, int, text[], jsonb) from public, anon;
grant execute on function public.registrar_simulacao(uuid, text, text, int, text[], jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- Código de acesso — 1 por projeto. RLS habilitado, ZERO policy: nem
-- consultor lê essa tabela direto. Único acesso é via RPC (abaixo), inclusive
-- pro consultor gerenciar o próprio código.
-- ----------------------------------------------------------------------------

create table if not exists public.codigos_acesso (
  id            uuid primary key default gen_random_uuid(),
  projeto_id    uuid not null references public.projetos(id) on delete cascade,
  codigo        text not null,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index if not exists codigos_acesso_projeto_id_unq on public.codigos_acesso (projeto_id);

alter table public.codigos_acesso enable row level security;

create or replace function public.gerar_codigo_acesso(p_projeto_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sem O/0/I/1 — mesmo alfabeto do mock antigo
  v_codigo text := '';
  i        int;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  for i in 1..10 loop
    v_codigo := v_codigo || substr(v_chars, (floor(random() * length(v_chars)) + 1)::int, 1);
    if i = 5 then v_codigo := v_codigo || '-'; end if;
  end loop;

  insert into public.codigos_acesso (projeto_id, codigo)
  values (p_projeto_id, v_codigo)
  on conflict (projeto_id) do update set codigo = excluded.codigo, atualizado_em = now();

  return v_codigo;
end;
$function$;

revoke execute on function public.gerar_codigo_acesso(uuid) from public, anon;
grant execute on function public.gerar_codigo_acesso(uuid) to authenticated;

create or replace function public.definir_codigo_acesso(p_projeto_id uuid, p_codigo text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_codigo text := upper(trim(p_codigo));
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;
  if length(v_codigo) < 4 then
    raise exception 'Código precisa ter pelo menos 4 caracteres';
  end if;

  insert into public.codigos_acesso (projeto_id, codigo)
  values (p_projeto_id, v_codigo)
  on conflict (projeto_id) do update set codigo = excluded.codigo, atualizado_em = now();

  return v_codigo;
end;
$function$;

revoke execute on function public.definir_codigo_acesso(uuid, text) from public, anon;
grant execute on function public.definir_codigo_acesso(uuid, text) to authenticated;

create or replace function public.obter_codigo_acesso(p_projeto_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_codigo text;
begin
  if not public.is_consultor() then
    raise exception 'Sem permissão';
  end if;

  select codigo into v_codigo from public.codigos_acesso where projeto_id = p_projeto_id;
  return v_codigo;
end;
$function$;

revoke execute on function public.obter_codigo_acesso(uuid) from public, anon;
grant execute on function public.obter_codigo_acesso(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Porta única de leitura pública. `anon` chega aqui só com o código certo;
-- consultor logado (is_consultor()) entra sem código — substitui o antigo
-- `isAdminSession()` que checava localStorage e que a troca pra Supabase
-- Auth (fase D desta sessão) já tinha deixado morto sem eu notar.
-- ----------------------------------------------------------------------------

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

  return jsonb_build_object(
    'projeto',    to_jsonb(v_projeto),
    'cliente',    to_jsonb(v_cliente),
    'categorias', v_categorias,
    'simulacao',  to_jsonb(v_simulacao)
  );
end;
$function$;

revoke execute on function public.obter_relatorio_publico(uuid, text) from public;
grant execute on function public.obter_relatorio_publico(uuid, text) to anon, authenticated;
