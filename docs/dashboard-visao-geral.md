> **DESATUALIZADO (2026-08-23)** — descreve o dashboard de projeto único pré-migração workspace-por-projeto, com "projeto ativo" implícito (conceito eliminado, ver ADR "Estado de simulação é por projeto, nunca global"). **Atenção ao nome**: existe hoje uma rota real `/visao-geral` — mas é a Visão Geral GLOBAL cross-cliente (KPIs agregados, ranking por cliente), feature diferente construída em 2026-08-22, sem relação com este doc. O dashboard por-projeto real é `src/pages/ResumoExecutivo.tsx` (aba "Visão geral" dentro do workspace).

# Tela: Visão geral (Dashboard)

Arquivo: `ARO-MCS Dashboard (Full).dc.html`. Tela inicial do sistema — visão consolidada do projeto ativo (NX Gold — Fechamento de Mina).

## Layout
Sidebar (ver `sidebar.md`) + área principal com `.topbar` (título + tag "Rev0" + subtítulo + botões "Exportar PDF"/"Rodar simulação") e um **bento grid** de 12 colunas (`.bento { grid-template-columns:repeat(12,1fr); gap:16px }`) — não usa `.content` linear como as outras telas.

## Componentes e conteúdo

1. **3 KPI cards** (`span 4` cada): "Custo esperado" (R$ 38,5 M), "Faixa min–max" (R$ 29,6–35,2 M), "Valor atualizado 2023" (R$ 40,6 M + tag delta "+11%"). Cada um: badge de ícone 26px (`--accent-100`/`--accent-700`) + `.cell-title` + número grande 22px.

2. **Card "Custo por categoria"** (`span 8`, cabeçalho "5 principais de 8 categorias" + valor total "R$ 34,5 M esperado"): lista ranqueada de 5 linhas — número de ordem mono cinza (01–05) + nome + barra de progresso fina (`--accent`, largura proporcional) + valor mono à direita. Rodapé: link "Ver todas as 8 categorias →" (`.cat-seeall`, hover muda cor para `--accent` via `!important` pois tem `color` inline).

3. **Card "Confiabilidade e contingência"** (`span 4`): "Baixa incerteza" + barra de IC 95% (faixa destacada dentro de trilha cinza) + rótulos R$ 37,9–39,1 M; bloco "Contingência aplicada" com tag "A decidir"; lista "Métodos de atualização" (4 linhas: Escalonamento IPCA, Juros simples, Juros compostos, Inflação constante, cada um com valor calculado).

4. **Tabela "Lançamentos recentes"** (`span 7`, `.table`): 3 linhas (Barragem/Monitoramento/Cavas) com número de setor, período, valor mono, tag de status (Validado/Em revisão).

5. **Timeline vertical "Revisões"** (`span 5`): 3 itens com dot conectado por linha vertical (`.rev-vconnector`) — Rev0 (concluída, check), Rev1 (concluída, tag "Vigente"), Rev2 (pendente, dot cinza numerado "3", opacidade 60%).

## Interatividade
- Sidebar: recolher/expandir, dropdown de perfil (ver `sidebar.md`).
- Botão "Rodar simulação" é um link (`<a>`) para `ARO-MCS Simulacao.dc.html`.
- Nenhum outro elemento desta tela é interativo (todos os dados são estáticos/mock) — é a tela de leitura/overview do sistema.


## Prompts dos componentes internos

**KPI card (Custo esperado / Faixa min-max / Valor atualizado)**
> Crie um card retangular branco (radius 20px, sem sombra, sem hover) com padding 24px. No topo, um badge quadrado de 26x26px (radius 9px, fundo vermelho bem claro, ícone vermelho escuro 14px) representando a métrica (cifrão para custo, setas opostas para faixa, seta diagonal para valor atualizado). Abaixo, um rótulo pequeno em cinza (14px, peso 600) nomeando a métrica. Abaixo, o número principal em 22px peso 700 (ex.: "R$ 38,5 M"). Por fim, uma linha de contexto em cinza 12.5px (ex.: "Monte Carlo · 10.000 iterações"). Quando há variação percentual, o número vem acompanhado de uma pill pequena (peso 600, fundo vermelho claro/texto vermelho escuro ou fundo verde claro/texto verde) mostrando "+11%" ou "-X%".

**Card "Custo por categoria" (lista ranqueada, limitada a 5)**
> Card branco com título de seção (ícone vermelho + "Custo por categoria"). Abaixo do título, uma linha de contexto: à esquerda um rótulo maiúsculo pequeno em cinza ("5 PRINCIPAIS DE 8 CATEGORIAS"), à direita o valor total em destaque ("R$ 34,5 M esperado", número em negrito + palavra "esperado" em peso normal cinza). Corpo: até 5 linhas, cada uma um grid de 3 colunas — número de ordem em mono cinza (01, 02...), depois nome da categoria (13.5px peso 600) com uma barra de progresso fina abaixo (6px altura, radius 4px, trilha cinza clara e preenchimento vermelho proporcional ao valor), e por fim o valor em mono à direita (14px peso 700). Rodapé: uma linha divisória fina e um link centralizado "Ver todas as N categorias" com seta, em cinza que fica vermelho no hover.

**Card "Confiabilidade e contingência"**
> Card branco com ícone de escudo + título. Corpo: rótulo de nível de incerteza em texto grande ("Baixa incerteza", 22px peso 700). Abaixo, uma barra de intervalo de confiança: trilha cinza fina (6px) com um segmento vermelho central destacado representando o IC 95%, e rótulos mono nas extremidades ("IC 95%: R$ 37,9 M" / "R$ 39,1 M"). Divisória fina. Bloco "Contingência aplicada": texto explicativo + uma pill neutra "A decidir" à direita. Divisória fina. Lista "Métodos de atualização": até 4 linhas comparando método (texto cinza) com valor calculado (mono, peso 600) alinhados nas extremidades, mais uma nota final em cinza pequeno.

**Tabela "Lançamentos recentes"**
> Card branco com título + ícone de documento. Tabela simples de 4 colunas (Categoria, Período, Valor real, Status) com cabeçalho em maiúsculas pequenas cinza e linhas divididas por regras finas. Cada categoria é precedida por um badge numérico pequeno (22x22px, radius 7px, fundo cinza claro). Status é uma pill (verde "Validado" ou neutra "Em revisão").

**Timeline vertical "Revisões"**
> Card branco com título + ícone de relógio. Lista vertical de itens conectados por uma linha fina cinza contínua entre um dot e o próximo. Cada dot: círculo 20px — vermelho com check branco quando concluído, cinza com número quando pendente. Ao lado do dot: título da revisão + data (mono, cinza), tag de status quando aplicável ("Vigente", verde), e um parágrafo descritivo em cinza (12.5px) resumindo o que mudou. O último item pendente tem opacidade reduzida (60%) para indicar que é futuro/planejado.
