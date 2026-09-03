> **NÃO IMPLEMENTADO** — nenhuma rota ou arquivo desta spec existe no código atual (verificado 2026-08-24, sem `/ajuda` em `App.tsx` nem qualquer página correspondente em `src/pages`). Este documento descreve uma tela que nunca foi construída.

# Tela: Central de ajuda

Arquivo: `ARO-MCS Ajuda.dc.html`. Guias, FAQ e formulário de contato com suporte. Não aparece na sidebar (acessível via link direto).

## Layout

Sidebar + `.topbar` (título "Central de ajuda" + subtítulo) + `.content` (max-width 760px): busca, grid de tópicos, card de FAQ, card de contato.

## Componentes

### Busca

Pill de busca (`.search`) — campo controlado, sem filtragem real implementada ainda (é decorativo/placeholder para busca futura em artigos).

### Grid de tópicos (`.topic-grid`, 2 colunas)

4 cards clicáveis (`.topic-card`): ícone em badge + título + subtítulo — "Categorias de custo", "Simulação Monte Carlo", "Lançamentos", "Revisões". Atualmente sem destino real (decorativos, representam categorias de artigos).

### FAQ (acordeão, `.faq-item`)

4 perguntas: contingência do projeto, número de iterações da simulação, quem pode publicar revisão, se lançamentos precisam de comprovante. Cada item: pergunta clicável com chevron (gira 180° quando aberto) + resposta que expande via `max-height` (transition 260ms) — só uma pode ficar aberta por vez (`state.openFaq`, índice ou -1).

### Card "Fale com o suporte"

Campos Assunto (input) e Mensagem (textarea). Botão "Enviar mensagem" + toast "Mensagem enviada" (mesma animação de 2.6s do toast de Configurações).

## Interatividade

- **Busca**: campo controlado, sem lógica de filtro.
- **FAQ**: `toggle(i)` abre o item `i` e fecha qualquer outro aberto (`openFaq === i ? -1 : i`).
- **Formulário de contato**: campos controlados; `sendMessage` valida que a mensagem não está vazia, limpa os campos e mostra o toast por 2.6s.
- Sidebar: recolher/expandir, dropdown de perfil.

## Prompts dos componentes internos

**Campo de busca de ajuda**

> Um campo de busca em formato de pílula, largo, com ícone de lupa e placeholder "Buscar em artigos de ajuda...", fundo branco, sem borda visível — visualmente idêntico às barras de busca usadas em Lançamentos e Clientes, mas isolado no topo da página (sem chips de filtro ao lado).

**Grid de tópicos**

> Uma grade de 2 colunas com cards clicáveis pequenos — cada um com um ícone em badge vermelho claro à esquerda e, à direita, um título em destaque (ex.: "Categorias de custo") com uma descrição menor em cinza abaixo (ex.: "Como cadastrar itens, min/max e fontes"). Representam categorias de artigos de ajuda.

**Acordeão de perguntas frequentes**

> Uma lista de perguntas, cada uma separada por uma regra fina horizontal. Cada pergunta é uma linha clicável (texto em negrito) com um chevron à direita que gira 180° quando expandida. Ao clicar, a resposta (texto cinza menor, várias linhas) se revela suavemente abaixo, empurrando o conteúdo seguinte para baixo — só uma pergunta pode estar expandida por vez; abrir outra fecha a anterior automaticamente.

**Card "Fale com o suporte"**

> Um formulário simples com dois campos — Assunto (input de linha única) e Mensagem (área de texto multi-linha), ambos no padrão visual cinza-claro-sem-borda do resto do sistema. Botão "Enviar mensagem" no rodapé à direita; ao enviar, os campos se limpam e uma pequena confirmação verde em pílula ("Mensagem enviada") aparece ao lado do botão por alguns segundos antes de desaparecer.
