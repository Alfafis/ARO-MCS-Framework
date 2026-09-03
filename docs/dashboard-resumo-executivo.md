# Tela: Resumo Executivo (workspace do projeto)

**Rota**: `/projetos/:id/dashboard`
**Arquivo**: `src/pages/ResumoExecutivo.tsx`

Aba "Visão geral" dentro do workspace de um projeto específico — consolida custo médio, faixa min-máx, valor atualizado, provisão base, curva de desembolso ano-a-ano, métodos de atualização monetária, métricas de risco Monte Carlo e timeline de revisões.

> **Não confundir** com `/visao-geral` (rota global, cross-cliente, KPIs agregados) descrita em `dashboard-visao-geral.md`.

## Layout geral

`PageHeader` (`src/components/layout/PageHeader.tsx`) — título "Resumo Executivo" à esquerda + 3 botões à direita ("Gerar link do cliente" / "Link copiado", "Exportar PDF" decorativo, "Rodar simulação" navegando para `/projetos/:id/simulacao`).

Corpo: `flex flex-col gap-4`, padding `px-4 sm:px-8 pb-6 sm:pb-8`. Cards empilhados verticalmente, com layouts internos usando grid apenas onde a densidade pede.

## Blocos (na ordem em que aparecem)

### 1. Custo por categoria + Métricas de risco (lado a lado)

Grid `md:grid-cols-[1.3fr_1fr]`.

- `CostByCategoryTable`: tabela de 8 categorias com colunas Min / Max / Atualizado + linha "Total geral" em destaque.
- `RiskMetricsCard`: rótulo de risco (Baixo/Moderado/Alto), CV, IC 95% com barra fina, lista de 4 métricas (Média, σ, P80, Prob. excedência), rodapé "Contingência aplicada".

### 2. Curva de desembolso ano-a-ano

Renderizado só quando `disbursement.totalGeral > 0`. Barra de controles com:

- **Modo** (`ModoToggle` em `components/resumo-executivo/DesembolsoControls.tsx`): Sem provisão / Com provisão 20% / Com IPCA acumulado. IPCA desabilitado se `parametros_anuais.inflacao_ipca` não tem série completa do horizonte.
- **Visão** (`ViewToggle`): Agregado por categoria (aba `0. Síntese Por Setor` da planilha) / Detalhado por atividade (aba `9. Síntese Por Atividade`).
- **`AncoragemBadge`**: badge informacional cinza "ancoragem 2022→AAAA (+X%)" ou amber "⚠ ancoragem incompleta" se faltarem anos em `parametros_anuais`.

Card correspondente à visão:

- **Agregado**: `AnnualDisbursementCard` — grid categoria × ano, com "Total geral" no rodapé.
- **Detalhado**: `AnnualDisbursementDetailedCard` — grid item × ano agrupado por categoria (categoria como sub-header, itens embaixo, subtotal por categoria por ano), linha de contingência por ano (`SUM(itens_col) × cont%`), linha "Total por ano (base + contingência)", e — no modo `ipca` com IPCA disponível — linhas extras "Multiplicador IPCA acumulado" (×1.XXX) e "Total corrigido por IPCA".

### 3. Métodos de atualização monetária + Timeline de revisões

Grid `lg:grid-cols-12`.

- `MonetaryMethodsCard` (`lg:col-span-7` se aparecer) — 4 linhas: Juros simples, Juros compostos, Inflação constante, Escalonamento (IPCA variável). Base = `baseWithProvision`. Só renderiza se `baseTotal > 0`.
- `RevisionTimeline` (`lg:col-span-5` ou `12` se sem métodos) — últimas 3 revisões (`revisoes` ordenadas por `criado_em`, mostrando `Rev{N}` + data + pill "Vigente" quando aplicável + descrição por status).

## Fluxo de dados

- `projeto` vem do `useOutletContext` (workspace do projeto ativo, montado em `WorkspaceLayout`).
- `catalogo` e `parametrosAnuais` vêm do `useProjeto()` context.
- `simulacoes` e `revisoes` são buscados por `supabase.from(...).limit(...)` no `useEffect` do mount.
- Curva de desembolso é computada via `computeDesembolsoMatrix` (agregado) ou `computeDesembolsoItemMatrix` (detalhado) em `src/lib/desembolsoAno.ts`.
- Ancoragem via `computeFatorAncoragem` em `src/lib/ancoragem.ts` — fator = ∏(1+ipca_ano_i) do `ANO_BASE_TEMPLATE` (2022) até `data_base - 1`. Aplicado em toda a matriz antes dos modos.

## Interatividade

- Toggles Modo e Visão: state local, sem persistência.
- Botão "Gerar link do cliente": `navigator.clipboard.writeText(...)`, fallback `prompt()`; badge muda pra "Link copiado" por 2.5s.
- Botão "Exportar PDF": decorativo (não implementado).
- Botão "Rodar simulação": navega para `/projetos/:id/simulacao`.
- Card `AnnualDisbursementDetailedCard` tem scroll horizontal se `min-width` excede o container (`overflow-x-auto`, `min-w-[820px]`).

## Referências

- `_Dados_Formulas_Planilha.md` §Etapa 3 (Síntese Por Setor) e §Etapa 4 (Síntese Por Atividade) — cálculo por trás dos dois modos de visualização.
- `_Session.md` — estado atual da implementação e pendências.
