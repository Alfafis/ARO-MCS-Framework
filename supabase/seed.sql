-- ============================================================================
-- seed.sql
-- ============================================================================
-- Roda só em `supabase db reset` (local dev) — config.toml [db.seed] aponta
-- pra este arquivo. NUNCA aplicado via `db push`/migration em produção.
--
-- Movido pra cá em 2026-09-04: os inserts abaixo viviam misturados no DDL de
-- `20260821171535_clientes_rpc.sql`/`20260821172614_projetos_rpc.sql`, o que
-- fez 4 clientes fixture (Ferro Linhares/Cobre Brasil/Minérios do Sul/Aço
-- Zafira) + seus projetos irem parar em produção sem rótulo de "demo" nenhum,
-- indistinguíveis de cliente real na tela `/clientes`. Limpo do remoto na
-- mesma sessão — ver `_ADRs.md` do vault (projeto ARO-MCS-Framework).
--
-- Todos os cinco são clientes fictícios de demonstração — seedados aqui só
-- como conveniência de ambiente local vazio, nascem sem projeto (igual em
-- produção). Nomes ilustrativos, não referenciam clientes reais.
-- ============================================================================

insert into public.clientes (nome) values
  ('Cliente Alfa'), ('Ferro Linhares'), ('Cobre Brasil'), ('Minérios do Sul'), ('Aço Zafira')
on conflict (lower(nome)) do nothing;

insert into public.projetos (cliente_id, tipo_projeto_id, nome, status, rev, data_base)
select c.id, 'outro', p.nome, p.status, p.rev, '2023'
from (values
  ('Ferro Linhares',  'Encerramento de Lavra — Cava Norte', 'aguardando', 'Rev1'),
  ('Cobre Brasil',    'Descomissionamento de Barragem',     'andamento',  'Rev2'),
  ('Minérios do Sul', 'Reabilitação de Área Degradada',     'concluido',  'Rev3'),
  ('Aço Zafira',      'Fechamento de Pátio de Estéril',     'andamento',  'Rev0')
) as p(cliente_nome, nome, status, rev)
join public.clientes c on c.nome = p.cliente_nome
where not exists (
  select 1 from public.projetos existing where existing.nome = p.nome
);
