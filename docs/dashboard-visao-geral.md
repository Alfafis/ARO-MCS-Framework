# Tela: Visão Geral (global cross-cliente)

**Rota**: `/visao-geral`
**Arquivo**: `src/pages/VisaoGeral.tsx`

Dashboard **global** do consultor — visão consolidada de todos os clientes e projetos ativos. Não confundir com `/projetos/:id/dashboard` (Resumo Executivo do projeto individual, descrito em `dashboard-resumo-executivo.md`).

## Layout geral

`PageHeader` com título "Visão geral" (sem botões de ação nesta tela).

Corpo em `flex flex-col gap-4`, padding `px-4 sm:px-8 pb-6 sm:pb-8`:

## Blocos

### 1. KPIs cross-cliente
Linha de `KpiCard` (`src/components/dashboard/KpiCard.tsx`) mostrando totais agregados do portfólio do consultor logado:
- Nº total de clientes ativos
- Nº total de projetos ativos
- Custo esperado somado (soma do valor esperado numérico de todos os projetos)
- Ranking / destaque de topo (se aplicável — ex. cliente ou projeto de maior valor)

Cada card tem ícone (Lucide outline 14–18px) em badge quadrado 26×26 (`--accent-100`/`--accent-700`), rótulo em `text-c-text-2`, valor grande em `text-c-text` peso 700, e sub-informação em cinza (12.5px).

### 2. Feed de atividade recente
Lista das últimas ações no portfólio (revisões publicadas, lançamentos criados/atualizados, etc.), agregada a partir de queries paralelas a `revisoes` e `lancamentos`, ordenadas por `publicado_em`/`atualizado_em` DESC.

Cada item tem:
- Ícone contextual (categoria da ação)
- Cliente + Projeto (link navegando pra `/projetos/{id}/...`)
- Timestamp relativo (`formatRelativeTime`) — "há 2 dias", etc.

## Fluxo de dados

- `clientes`, `projetos`, `loading` vêm do `useProjeto()` — dados já pré-carregados no context.
- Feed de atividade é buscado no `useEffect` do mount, com join manual (RPC não usada aqui — queries de leitura simples).
- `valorEsperadoNumerico` computa o valor esperado por projeto para o KPI de custo agregado.

## Interatividade

- Cards de KPI: sem interação (leitura pura).
- Feed de atividade: click em item navega para o projeto correspondente (`navigate(/projetos/{id}/...)`).

## Referências
- `KpiCard` compartilhado com outras telas de dashboard.
- Consultar `_Session.md` no vault (`projetos/aro-mcs/`) para o estado atual e pendências específicas dessa tela.
