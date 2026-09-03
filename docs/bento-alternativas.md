# Arquivo: Alternativas de layout (histórico de exploração)

Arquivo: `ARO-MCS Bento.dc.html`. Página de comparação lado a lado (modo canvas, `design_doc_mode: canvas`) usada durante a fase de exploração de direção visual — não é uma tela final do fluxo do usuário, é um documento de referência/arquivo do processo de design.

## Conteúdo

Duas alternativas apresentadas:

1. **"Dashboard bento com sidebar"**: versão inicial do Dashboard com bento grid dentro de um `.frame` com bordas arredondadas (mockup emoldurado) — mesmo conteúdo que evoluiu para `ARO-MCS Dashboard (Full).dc.html`, mas com o card "Custo por categoria" ocupando `span 12` (largura total) em vez de `span 8` como na versão final, e sem o card de "Confiabilidade e contingência" ao lado.
2. **"Login flutuante (moderno, centrado)"**: card de login centralizado com gradiente radial sutil de fundo, ícone de marca em badge redondo, campos de e-mail/senha, botão "Entrar", link "Esqueci minha senha", e 3 cards de feature abaixo (Dados da sua área / Progresso ao vivo / Relatório final). **Esta tela de login não foi promovida a arquivo próprio** — existe só aqui, no arquivo de exploração.

## Interatividade

Mesma lógica de sidebar (recolher/expandir, dropdown de perfil) replicada da versão que se tornou o Dashboard final, mas os links de navegação apontam para `href="#"` (não navegam para as telas reais, pois este arquivo antecede a criação das telas individuais).

## Status

Arquivo de referência histórica do processo de design — mantido para registro, mas as decisões de layout (`span 8`/`span 4` no Dashboard, sidebar em cada tela) foram finalizadas nos arquivos `.dc.html` individuais, não aqui.

## Prompts dos componentes internos

**Frame de mockup**

> Um contêiner com cantos bem arredondados (28px) e uma sombra pronunciada, emoldurando cada alternativa de tela como se fosse a captura de uma janela de app — usado apenas neste arquivo de exploração para apresentar as opções lado a lado num canvas navegável, nunca nas telas finais do produto.

**Rótulo de alternativa**

> Um texto pequeno em maiúsculas, espaçado entre letras, cinza, posicionado acima de cada frame para identificar qual variação está sendo mostrada (ex.: "Alternativa — Login flutuante (moderno, centrado)").

**Card de login flutuante**

> Um card branco centralizado verticalmente e horizontalmente sobre um fundo com gradiente radial sutil (do rosa muito claro no topo até o bege padrão da página), com cantos bem arredondados e sombra pronunciada. Contém, de cima para baixo: um selo quadrado vermelho com o ícone da marca centralizado; um título "Entrar no portal" com subtítulo indicando o cliente/projeto; dois campos de formulário (E-mail, Senha — este mascarado); um botão primário de largura total "Entrar"; um link secundário "Esqueci minha senha" centralizado abaixo. Por fim, três cards pequenos de destaque de funcionalidade lado a lado abaixo do card principal, cada um com ícone + texto curto centralizados.
