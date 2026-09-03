# Tela: Simulação Monte Carlo

Arquivo: `ARO-MCS Simulacao.dc.html`. Onde se configuram parâmetros e roda a simulação de custo total a partir dos itens min/max cadastrados.

## Layout

Sidebar + `.topbar` (título + tag "Rev0" + botão "Ver rodadas anteriores") + `.content` em grid 2 colunas (`1fr 1.6fr`): coluna esquerda = parâmetros, coluna direita = resultados.

## Componentes

### Coluna "Parâmetros" (card único)

- **Distribuição estatística**: segmented control (`.seg`/`.seg-opt`) com 3 opções — Triangular/Normal/Uniforme.
- **Número de iterações**: input de texto editável (default "10.000").
- **Categorias incluídas**: dropdown custom (2 opções — Todas as 8 categorias / Personalizar seleção).
- **Nível de confiança**: dropdown custom (3 opções — 95%/90%/80%).
- Texto explicativo + **botão "Rodar simulação"** (largura total, ícone play que troca para spinner girando durante execução).

### Coluna "Resultados" (3 cards)

1. **"Resultado da última rodada"**: tag de status ("Concluída há 2 dias" / "Concluída agora mesmo" / "Rodada de [data]") + grid 4 estatísticas (Média, Desvio-padrão, P10–P90, IC 95%) em mono.
2. **"Distribuição de custo total"**: histograma de 12 barras (`.hist-bar`, altura animada via `transition: height 500ms`), barras "dentro" do range destacado ganham cor `--accent` (classe `.in`, threshold ≥45%), demais ficam cinza. Rótulos min/média/max abaixo. Texto de nível de incerteza calculado (baixo/moderado/alto) com faixa ±X%.
3. **"Contribuição de incerteza por categoria"**: lista simples de 3 linhas (Monitoramento/Barragem/Cavas) com percentual mono à direita — estático, não reage à simulação.

### Modal "Rodadas anteriores"

Aberto pelo botão do topbar. Lista de 4 rodadas mock (data, distribuição, iterações, média, tag de incerteza) — clicar em uma carrega seus valores (média + nível de incerteza) no card de resultado e fecha o modal.

## Interatividade

- **Rodar simulação** (`runSimulation`): seta `state.running=true` (botão fica "Simulando…", disabled, ícone spinner), após 1.3s (`setTimeout` simulando processamento) recalcula histograma (`shapeFor(dist)` + jitter aleatório), média, desvio, IC95, min/max e nível de incerteza — tudo gerado com `Math.random()` para variar a cada rodada; atualiza a tag para "Concluída agora mesmo".
- **Distribuição** (segmented): troca o formato-base do histograma (triangular/normal/uniforme têm curvas diferentes em `shapeFor`).
- **Iterações**: input controlado, texto livre.
- **2 dropdowns custom** (Categorias incluídas, Nível de confiança): mesmo padrão do resto do sistema — abrir um fecha o outro.
- **Modal de rodadas anteriores**: abre/fecha via `historyOpen`, clique fora (`.modal-backdrop`) fecha, clique dentro do card não propaga (`stopClick`).
- Sidebar: recolher/expandir, dropdown de perfil.

## Prompts dos componentes internos

**Segmented control "Distribuição estatística"**

> Um controle de segmento único (não abas de página, um seletor compacto): uma trilha de fundo cinza claro com cantos arredondados contendo 3 opções lado a lado de largura igual (Triangular / Normal / Uniforme); a opção selecionada tem fundo branco e uma sombra suave, as demais são texto cinza sem fundo. Clique troca a seleção instantaneamente.

**Botão "Rodar simulação" com estado de carregamento**

> Um botão primário de largura total (fundo vermelho sólido, texto branco), com um ícone de "play" à direita do texto. Ao ser clicado, o texto muda para "Simulando…", o botão fica desabilitado (levemente translúcido, cursor padrão) e o ícone de play é substituído por um círculo girando continuamente (spinner). Após a simulação "terminar" (simulada por um pequeno atraso), o botão volta ao estado normal e os resultados na coluna da direita são recalculados com pequenas variações aleatórias a cada execução.

**Card "Resultado da última rodada"**

> Card branco com título + ícone de gráfico de barras + uma pill verde de status à direita indicando quando a rodada foi concluída (texto dinâmico: "há 2 dias", "agora mesmo", ou "Rodada de [data]" quando carregada do histórico). Corpo: grid de 4 caixinhas estatísticas (fundo cinza muito claro, radius 14px) — Média, Desvio-padrão, P10–P90, IC 95% — cada uma com um rótulo pequeno maiúsculo cinza acima e um valor em negrito monoespaçado abaixo.

**Histograma de distribuição de custo**

> Um gráfico de barras verticais simples (12 barras) representando uma distribuição em formato de sino, sem eixos ou grades visíveis. Barras na região central/mais alta (representando o intervalo P10-P90) são vermelhas; as barras das extremidades (caudas da distribuição) ficam em cinza claro. A altura de cada barra anima suavemente quando os valores mudam (transição de ~500ms). Abaixo do gráfico, três rótulos monoespaçados alinhados às extremidades e ao centro (valor mínimo, média, valor máximo). Por fim, uma frase explicando o nível de incerteza calculado (baixo/moderado/alto) com a faixa percentual em destaque.

**Card "Contribuição de incerteza por categoria"**

> Card branco simples com título + ícone. Lista vertical de linhas, cada uma com o nome da categoria à esquerda (texto normal) e o percentual de contribuição de incerteza à direita (monoespaçado, negrito, formato "±X,X%") — sem barras, sem separadores entre as linhas, só espaçamento vertical.

**Modal "Rodadas anteriores"**

> Uma janela modal centralizada sobre um fundo escurecido semitransparente. Cabeçalho com título "Rodadas anteriores" e um botão de fechar (X) no canto. Corpo: lista de rodadas anteriores, cada uma clicável — mostrando data/hora, tipo de distribuição usada e número de iterações à esquerda, e o valor médio resultante (monoespaçado, negrito) junto de uma pill indicando o nível de incerteza daquela rodada à direita. Linhas separadas por regras finas, com hover em fundo cinza claro. Clicar em uma linha carrega aqueles resultados de volta na tela principal e fecha o modal. Clicar fora do modal (no fundo escurecido) também fecha.
