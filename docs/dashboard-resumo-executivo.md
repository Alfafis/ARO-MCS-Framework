# Tela: Visão geral / Resumo Executivo (Dashboard principal)

Arquivo: `ARO-MCS Dashboard (Resumo Executivo).dc.html`. É o dashboard principal do sistema (item "Visão geral" na sidebar) — consolida custo esperado, faixa de risco, atualização monetária, desembolso por ano, leque de confiança, riscos, lançamentos recentes e timeline de revisões do projeto ativo.

## Layout geral
Sidebar (ver `sidebar.md`) + área principal com `.topbar` (título + tag de revisão + subtítulo) + um **bento grid de 12 colunas** (`.bento { display:grid; grid-template-columns:repeat(12,1fr); gap:16px; padding:0 32px 32px }`) — os cards se distribuem em larguras variadas (`span 3`, `span 5`, `span 7`, `span 12`) ao longo de várias linhas.

## Prompts dos componentes internos

**Topbar**
> Um cabeçalho de página (sem borda inferior, sem fundo próprio — mesma cor do body) com padding generoso (22px verticais, 32px laterais), em layout flex com o bloco de título à esquerda e os botões de ação à direita (`justify-content:space-between`). Bloco de título: um título grande (22px, peso 700) seguido de uma pequena pill neutra indicando a revisão vigente (ex.: "Rev1"), lado a lado na mesma linha de base; abaixo, uma linha de subtítulo em cinza (13px) com o nome do cliente e do projeto.
>
> **Botões de ação** (dois, alinhados à direita, gap de 10px, nunca encolhem):
> - "Exportar PDF" — botão secundário/fantasma (pílula, fundo branco, texto cinza-escuro peso 600, sombra sutil que se intensifica no hover com leve elevação) — ação decorativa nesta tela (sem exportação real implementada).
> - "Rodar simulação" — botão primário (pílula, fundo vermelho sólido, texto branco peso 600) — é um link que navega para a tela de Simulação Monte Carlo, permitindo ao usuário ir direto da visão geral para rodar uma nova simulação.

**KPI card compacto (4 cards no topo, `span 3` cada)**
> Um card branco (radius 20px, padding 24px, sem sombra, sem hover) organizado verticalmente e centralizado no espaço disponível. No topo, um badge quadrado de 26×26px (radius 9px, fundo vermelho bem claro, ícone vermelho escuro 14px outline) — ícone diferente por métrica (cifrão com setas para custo médio, setas divergentes horizontais para faixa min-max, seta diagonal ascendente para valor atualizado, cruz/plus para provisão base). Abaixo, um rótulo em cinza (14px, peso 600). Abaixo, o número principal em destaque (22px, peso 700, ex.: "R$ 32,4 M"). Por fim, uma linha de contexto pequena em cinza (12.5px) explicando a origem do número (ex.: "Monte Carlo · 10.000 iterações", "Custo total, 8 categorias"). Os 4 cards desta linha: Custo médio, Faixa min-máx, Valor atualizado (ano-base), Provisão base.

**Card "Métodos de atualização monetária" (`span 12`)**
> Um card branco de largura total. Título de seção com ícone de barras crescentes + texto explicando a base de cálculo entre parênteses (ex.: "Métodos de atualização monetária (10 anos, sobre R$ 40,57 M)"). Corpo: lista de linhas (`.method-row`), cada uma um grid de 2 colunas — nome do método com sua taxa entre parênteses à esquerda (texto normal, 13px) e o valor final calculado à direita (monoespaçado, peso 700, alinhado à direita). Linhas separadas por regra fina horizontal, sem numeração, sem barra de progresso — é uma comparação simples de 4 métodos: Juros simples, Juros compostos, Inflação constante, Escalonamento (IPCA variável).

**Card "Desembolso projetado por ano" (`span 12`)**
> Um card branco de largura total. Título com ícone de calendário. Corpo: uma grade horizontal de 10 células iguais (uma por ano, `.yr-row` em grid de 10 colunas com gap pequeno), cada célula (`.yr-cell`) é um pequeno retângulo com fundo cinza muito claro (radius 8px, padding 8px), contendo o rótulo do ano em cima (maiúsculas pequenas cinza, ex.: "ANO 1") e o valor abaixo (monoespaçado, peso 700, formato abreviado como "471,7k" ou "14,91M"). Nenhuma barra visual, apenas texto — é uma tabela de valores disfarçada de grade de cartões. Rodapé: uma nota pequena em cinza explicando qual subconjunto de categorias tem esse detalhamento anual disponível.

**Fan chart — leque de confiança (`span 12`)**
> Um card branco de largura total com título "Leque de confiança (fan chart) — desembolso acumulado por ano" e ícone de gráfico de linha ascendente. Corpo: um gráfico de 10 colunas (uma por ano), cada coluna com uma trilha vertical fina de fundo (16px de largura, cantos arredondados, cinza muito claro, altura total do container ~150px) representando o intervalo teórico completo; dentro dela, uma faixa vermelha bem clara (mesma largura, posicionada e dimensionada via `bottom`/`height` em porcentagem) representa a banda de incerteza daquele ano — cresce progressivamente da esquerda (ano 1, quase nula) para a direita (ano 10, ocupando a maior parte da trilha), formando visualmente um "funil" que se abre com o tempo; um pequeno ponto vermelho sólido (9px, contornado em branco) marca o valor central esperado dentro de cada faixa. Abaixo do gráfico, rótulos de ano centralizados sob cada coluna (mesma grade de 10). Nota final em cinza pequeno explicando que a faixa é uma estimativa derivada do coeficiente de variação da simulação aplicado ao desembolso acumulado — não um cálculo de percentil ano a ano.

**Card "Riscos e pontos de atenção" (`span 12`)**
> Um card branco de largura total com título e ícone de alerta triangular. Corpo: lista vertical de itens (`.risk-item`), cada um em duas colunas — à esquerda um ícone dentro de um badge quadrado 28×28px (radius 9px, fundo vermelho bem claro, ícone vermelho escuro, ícone variando por tipo de risco: documento para inconsistência de contingência, círculo de alerta para item fora do total, escudo para incerteza subestimada, check-documento para correção já aplicada); à direita, um título em negrito (13.5px) e, abaixo, uma descrição em cinza (12.5px, até 2 linhas) explicando o risco em linguagem direta. Itens separados por regra fina horizontal, sem numeração, sem prioridade visual entre eles (todos no mesmo peso).

**Card "Custo por categoria — 8 setores" (`span 7`)**
> Um card branco com título e ícone de barras. Corpo: uma mini-tabela sem bordas de célula — cabeçalho de colunas em maiúsculas pequenas cinza (#, Categoria, Min, Max, Atualiz. ano-base) seguido de 8 linhas (uma por categoria) com número de ordem em mono cinza, nome da categoria (truncado com ellipsis se muito longo), e os 3 valores monetários alinhados à direita em fonte monoespaçada. Última linha "Total geral" destacada com uma borda superior mais espessa (2px) e peso 700 em todos os valores — funciona como um rodapé de soma.

**Card "Métricas de risco" (`span 5`)**
> Um card branco compacto com título e ícone de escudo. Corpo, de cima para baixo: um rótulo de nível de risco em destaque (22px, peso 700, cor verde quando "Baixo") ao lado de uma nota pequena cinza com o coeficiente de variação (ex.: "CV = 4,97%"); abaixo, uma barra fina (6px, radius 4px, trilha cinza clara) com um segmento vermelho sobreposto no centro representando o intervalo de confiança de 95%, com os dois valores-limite em mono cinza abaixo, alinhados às extremidades; uma regra divisória fina; uma lista compacta de 4 métricas (Média, Desvio-padrão, P80, Probabilidade de excedência) em duas colunas (rótulo cinza à esquerda, valor mono em negrito à direita); outra regra divisória fina; por fim, uma linha isolada "Contingência aplicada" com o percentual à direita (sem texto explicativo abaixo).

**Card "Lançamentos recentes" (`span 7`)**
> Um card branco com título e ícone de documento. Corpo: uma tabela HTML nativa estilizada (`.table`) — cabeçalho em maiúsculas pequenas cinza com borda inferior, linhas de dados também com borda inferior fina. Colunas: Categoria (precedida de um badge numérico circular-quadrado pequeno, 22px, fundo cinza claro), Período (cinza), Valor real (monoespaçado, alinhado à direita), Status (pill colorida — verde "Validado" ou neutra "Em revisão", alinhada à direita).

**Card "Timeline de revisões" (`span 5`)**
> Um card branco com título e ícone de relógio. Corpo: lista vertical conectada por uma linha fina cinza contínua entre um item e o próximo (`.rev-vconnector`, ausente após o último). Cada item: um dot circular de 20px à esquerda (vermelho com ícone de check branco quando concluído, cinza neutro com número quando pendente/planejado) e, à direita, o título da revisão em negrito + data em mono cinza (ou uma pill verde "Vigente" no lugar da data, quando aplicável) na mesma linha, seguido de um parágrafo descritivo em cinza (12.5px) resumindo o que mudou naquela revisão. O último item (revisão futura/planejada) tem opacidade reduzida (60%) para indicar que ainda não aconteceu.

## Interatividade
- Sidebar: recolher/expandir (`state.collapsed`), dropdown de perfil (`state.profileOpen`) — mesmo padrão de todas as telas do sistema (ver `sidebar.md`).
- Botão "Exportar PDF" no topbar: decorativo, sem ação real associada ainda.
- Botão "Rodar simulação" no topbar: link real para `ARO-MCS Simulacao.dc.html`.
- **Nenhum outro elemento desta tela é interativo** — todos os cards são leitura pura de dados consolidados (sem filtros, sem drill-down, sem edição). É o painel de visão geral do projeto ativo.
