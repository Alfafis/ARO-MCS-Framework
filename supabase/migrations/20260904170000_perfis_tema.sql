-- Adiciona preferência de tema (claro/escuro) por consultor.
-- Por-usuário (não global), diferente das outras configs de plataforma que são
-- single-tenant. Cliente no Portal (`/relatorio/:id`) não tem perfil e sempre
-- vê o tema claro — decisão explícita do usuário.

alter table public.perfis
  add column if not exists tema text not null default 'light'
    check (tema in ('light', 'dark'));

comment on column public.perfis.tema is
  'Preferência de tema visual do consultor. Aplicado via [data-theme] no <html> ao logar. Portal do Cliente ignora — sempre light.';
