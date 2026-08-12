# Tela: Portal do cliente — Relatório

Arquivo: `ARO-MCS Cliente (Relatorio).dc.html`. Relatório final standalone (sem sidebar do sistema) que o CLIENTE visualiza — resumo do provisionamento, comparativo expectativa vs. realidade e custo por categoria.

## Layout
Header simples: logo ARO-MCS + tag "NX Gold — Portal do cliente" + botão "Baixar PDF". Conteúdo centralizado, `max-width:1040px`.

## Componentes
- **Cabeçalho**: título "Relatório — Fechamento de Mina" + tag "Rev1 · Vigente" + subtítulo com data-base e data de atualização.
- **3 KPI cards** (`.kpi-grid`): Custo esperado (R$ 38,5 M), Nível de incerteza (Baixo, com faixa IC95), Valor atualizado 2023 (R$ 40,6 M + delta +11%).
- **Card "Expectativa vs. realidade"**: gráfico de barras agrupadas por ano (2023–2027) — barra pontilhada "Projeção" vs. barra sólida vermelha "Realizado" (`.yr-chart`), com delta % acima de cada par (verde quando abaixo do projetado, vermelho quando acima); 2027 só tem a barra projetada (ainda não realizado, tag "projetado" cinza). Nota de texto explicando o desvio de 2026.
- **Card "Custo por categoria"**: mesma lista ranqueada (barra de progresso + valor) usada no Dashboard, com Monitoramento/Barragem/Cavas.

## Interatividade
**Esta tela é atualmente ESTÁTICA** — nenhum estado JS implementado (sem `c_dc_js`). O botão "Baixar PDF" não tem ação real associada (decorativo/placeholder). Candidata a receber exportação real (usar a skill de PDF) no futuro.


## Prompts dos componentes internos

**Cabeçalho do relatório**
> Um bloco de topo (sem sidebar) com o título do relatório em destaque, uma pill neutra ao lado indicando a revisão vigente (ex.: "Rev1 · Vigente"), e uma linha de subtítulo em cinza com data-base e data da última atualização.

**KPI cards de resumo**
> Três cards brancos lado a lado, cada um com um pequeno ícone em badge vermelho claro, um rótulo cinza e um valor grande em negrito — Custo esperado, Nível de incerteza (com a faixa de confiança como texto secundário) e Valor atualizado no ano-base (com uma pill de variação percentual ao lado).

**Gráfico "Expectativa vs. realidade" (barras agrupadas por ano)**
> Um gráfico de barras com um par de barras por ano ao longo do eixo horizontal: uma barra pontilhada sem preenchimento representando a projeção original, e uma barra vermelha sólida ao lado representando o valor realmente gasto naquele ano — com uma legenda no topo explicando os dois estilos. Acima de cada par, uma pequena pill de variação percentual (vermelha clara quando o realizado ficou acima do projetado, verde quando ficou abaixo). O ano mais recente/futuro mostra apenas a barra pontilhada de projeção (ainda sem realizado), com uma etiqueta neutra "projetado" em vez da variação percentual. Uma nota de texto abaixo do gráfico explica em linguagem simples o principal desvio do ano mais recente.

**Lista "Custo por categoria"**
> A mesma lista ranqueada usada no Dashboard interno: número de ordem em mono cinza, nome da categoria com uma barra de progresso fina proporcional ao valor, e o valor em destaque monoespaçado alinhado à direita — sem link para "ver todas", pois este relatório já mostra a visão consolidada.

**Botão "Baixar PDF"**
> Um botão secundário no cabeçalho da página, com um ícone de seta apontando para baixo sobre uma bandeja, alinhado ao lado da etiqueta de identificação do portal do cliente.
