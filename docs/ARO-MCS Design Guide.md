# ARO-MCS — Guia de Design (base para novas telas)

Referência viva, extraída de todas as telas construídas do sistema (`ARO-MCS Bento.dc.html` e as telas com sidebar: Dashboard, Cadastro, Simulação, Lançamentos, Revisões, Clientes, Configurações, Ajuda). Use como ponto de partida ao criar novas telas — não é o Modernist (design system padrão do projeto), é uma direção visual alternativa validada com o usuário.

## Tipografia
- Fonte única: **Space Grotesk** (Google Fonts, pesos 400/500/600/700).
- Títulos, números e nomes de categoria: peso 600–700, `letter-spacing: -0.02em` em números grandes.
- Corpo/labels secundários: peso 400–500, cor `--c-text-2`.
- Valores monetários, percentuais e hashes usam fonte monoespaçada (`ui-monospace, Menlo, monospace`) para alinhar dígitos.

## Cores
```
--c-text:     #14151a   texto principal
--c-text-2:   #6c7280   texto secundário / labels
--c-bg:       #f4f3f1   fundo da página (bege claro)
--c-card:     #ffffff   fundo dos cards e sidebar
--c-line:     rgba(20,21,26,.08)   divisórias sutis

--accent:      #ec3013  vermelho primário (ações, destaques, barras)
--accent-700:  #ae1800  hover/texto sobre tint / itens destrutivos (ex: "Sair", excluir)
--accent-100:  #fff1ee  fundo tintado leve (badges, opção selecionada em dropdown, pendências)

--success:     #1a7f4b
--success-bg:  #eaf7ef

--r-md:14px  --r-lg:20px  --r-pill:999px
--shadow-1: 0 1px 2px rgba(20,21,26,.06)   repouso
--shadow-2: 0 16px 40px -12px rgba(20,21,26,.18)   elementos flutuantes
--dur: 220ms   duração padrão de transição
```
Regra: 1 cor de destaque (vermelho) sobre neutros claros. Nunca gradientes fortes no fundo. Fundos alternativos usados nos componentes: `#f6f5f3` (inputs, stat-mini, linha "add item"), `#f0eeec` (chips inativos, filtros inativos, hover neutro, ícone padrão de linha), `#faf9f8` (cabeçalho de bloco de categoria).

**Paletas categóricas (gráficos com várias séries lado a lado):** quando cores precisam se tocar/comparar (ex.: barra 100% empilhada), NÃO usar tints monocromáticos claros — ficam parecidos demais entre si. Usar uma rampa categórica com contraste real, do mais escuro (maior valor) ao mais claro (menor valor), com pelo menos 8 tons distintos e nunca repetidos:
```
#5c0f00  #7a1a06  #99280f  #b83a1a  #d14f2a  #e2703f  #ef9468  #f7bfa0
```
Sempre garantir que a cor da barra e a cor da bolinha da legenda para a mesma categoria sejam idênticas.

**Listas onde os itens não se tocam** (ex.: ranking vertical com barra de progresso): pode usar cor única (`var(--accent)`) — a ordem/número e o tamanho da barra já diferenciam, sem depender de tons.

## Espaçamento e formas
- Raios grandes e consistentes: `--r-md:14px`, `--r-lg:20px`, `--r-xl:26px`, pills `999px` para navegação/tags/botões/filtros/inputs de busca.
- **Cards sem hover** — sem elevação, sombra ou translate ao passar o mouse. Superfície estática (`.cell`).
- Sombras discretas: `--shadow-1` em repouso (cards, botões), `--shadow-2` só em elementos flutuantes (dropdown de perfil, menu de dropdown custom, botão circular de recolher sidebar, modal).
- Divisórias (`border-bottom`/`border-top` fina, `var(--c-line)`) só quando necessário para separar grupos distintos (linhas de toggle, itens de menu de rodada anterior) — evitar entre itens homogêneos de uma mesma lista (ex.: linhas de ranking não têm divisória entre si).

## Layout
- **Bento grid** (usado em `ARO-MCS Bento.dc.html`): `display:grid; grid-template-columns: repeat(12, 1fr); gap:16px`. Cards ocupam múltiplos de coluna (`span 4`, `span 7`, `span 12`), tamanhos variados, nunca uniformes.
- **Telas com sidebar** (padrão do sistema — Dashboard, Cadastro, Simulação, Lançamentos, Revisões, Clientes, Configurações, Ajuda): `.appgrid { display:grid; grid-template-columns: {{ sidebarWidth }} 1fr; height:100vh }`, sem bento — conteúdo em `.content` com `padding: 0 32px 32px` e `display:flex; flex-direction:column; gap:16px` (ou grid quando há colunas, ex. Simulação usa `grid-template-columns: 1fr 1.6fr`).
- **Sidebar** — estrutura EXATA a reaproveitar em toda tela nova (copiar o bloco `<aside class="bsidebar">` inteiro, trocar apenas o link `active` e o `title`):
  - `.bsidebar { position:relative; height:100vh; padding:20px 14px 0; display:flex; flex-direction:column; gap:4px; background:var(--c-card) }` — fundo branco contra o bg bege da página, largura controlada via `{{ sidebarWidth }}` (228px expandida / 76px recolhida, com `transition: padding var(--dur) ease` no grid pai).
  - Topo (`.bsidebar-topline`): logo/marca (ícone 18px + texto "ARO-MCS", escondido quando recolhida).
  - Botão de recolher (`.bsidebar-toggle`): círculo 26px, posicionado `absolute; top:20px; right:-13px` (sobre a borda direita da sidebar), fundo branco, sombra leve, chevron duplo que gira 180°.
  - **Links de navegação** (`.bsidebar-scroll`, `flex:1; min-height:0; overflow-y:auto`) — SEMPRE os mesmos 6 itens, nesta ordem: Visão geral → Categorias de custo → Simulação → Lançamentos → Revisões → Clientes. Item ativo = ícone preenchido de vermelho (chip 28×28, radius 9px), não a linha toda (`.bsidebar-link.active .ico`).
  - **Rodapé fixo** (fora de `.bsidebar-scroll`, como último filho direto de `.bsidebar`, `flex:none; padding:8px 0 20px`): cartão de perfil clicável (avatar + nome + cargo + "···"), abre dropdown ancorado ACIMA dele (`bottom: calc(100% + 8px)`), com transição de opacidade + escala (160ms) tanto ao abrir quanto ao fechar (nunca desmontar via `sc-if`/condicional puro se precisa de animação de saída — controlar visibilidade por estado + CSS transition). **Atenção**: essa div de rodapé deve ficar FORA da `.bsidebar-scroll` (que precisa ser fechada antes dela) — se ficar dentro, o botão de perfil rola junto com os links em vez de ficar fixo na base.
  - Configurações e Ajuda existem como telas mas NÃO aparecem na sidebar (removidas por decisão do usuário) — acessíveis apenas via link direto ou pelo item "Configurações" dentro do dropdown de perfil.
- **Topbar** (`.topbar`, `padding:22px 32px`): título + tag de status (opcional) à esquerda, subtítulo em cinza abaixo, botões de ação à direita (`.btn-ghost` + `.btn-primary`, sem quebra de linha, `flex:none`). Este header é o padrão a reaproveitar em toda tela do sistema que tiver cabeçalho — não recriar um novo estilo de header por tela.

## Componentes-chave
- **KPI card**: ícone em badge quadrado-arredondado 26×26 (`--accent-100` bg, `--accent-700` icon, radius 9px) + label pequeno (`.cell-title`) + número grande (22px, peso 700) + meta/delta opcional.
- **Delta/tag** (`.tag`): pill pequena (`--r-pill`), peso 600, fundo tintado — `.tag-ok` (verde, `--success-bg`/`--success`), `.tag-warn` (`--accent-100`/`--accent-700`), `.tag-line` (neutro, `#f0eeec`/`--c-text-2`).
- **Toolbar de lista** (Lançamentos, Clientes): busca em pill flutuante (`.search`, ícone + input sem borda) + chips de filtro (`.filter-chip`, ativo = fundo `--accent` sólido, texto branco).
- **Lista de linhas com menu de ações** (`.prow` em Lançamentos/Clientes): grid de colunas (ícone+título+sub, período/status, valor à direita, tag, botão "···"). O botão "···" abre `.row-menu` (mesmo padrão de dropdown flutuante — fundo branco, radius 12px, `--shadow-2`, item destrutivo em `--accent-700`). Linha recém-criada recebe `.highlight` (fundo `--accent-100` que decai em 900ms) e/ou animação de entrada (ver seção Interações). Lista vazia mostra `.empty-state` central em cinza — nunca uma tabela vazia sem feedback.
- **Modal de criação** (Lançamentos, Clientes, Configurações "Convidar membro"): `.modal-backdrop` (`rgba(20,21,26,.35)`, `position:fixed;inset:0`) + `.modal-card` (`--r-lg`, `--shadow-2`, padding 22–24px, width ~400–440px). Sempre com `stopClick` no card para não fechar ao clicar dentro, e `onclick` no backdrop para fechar.
- **Lista ranqueada** (ex.: custo por categoria): número de ordem (01, 02...) em mono cinza + nome + barra de progresso fina (única cor accent) + valor em destaque à direita. Cabeçalho do card mostra contagem ("5 principais de N categorias") e valor total/esperado. Limitar a exibição a 5 itens por padrão; se houver mais, um link discreto no rodapé do card ("Ver todas as N categorias →") leva à lista completa — nunca um botão de destaque isolado no cabeçalho.
- **Bloco de categoria expansível** (Cadastro — `.cat-block`): cabeçalho (`.cat-head`, fundo `#faf9f8`) com número de ordem, nome editável inline (`input` sem borda, hover `#f0eeec`, focus com `box-shadow` de 1.5px `--accent` — nunca outline padrão), tag de "quem preenche", chevron de expandir/recolher, ícone de excluir (hover `--accent-100`/`--accent-700`). Corpo: tabela de itens (`.item-row`, inputs inline no mesmo padrão) + linha "+ Adicionar item". Nova categoria some no TOPO da lista (nunca no final) com scroll automático até ela + destaque de borda vermelha que decai em 900ms + animação de entrada (fade+slide, ver Interações).
- **Timeline vertical / revisões** (`.rev-card` em Revisões): linha de conectores (`.connector`) + dot numerado (`.rev-dot`, preenchido vermelho quando publicado, cinza `.pending` quando rascunho) + título/data/tag de status + lista de mudanças com check verde + hash monoespaçado com ícone de cadeado quando ancorado (`.hash`). Rascunho tem botão "Continuar edição" que revela um `textarea` (`.rev-textarea`, mesmo estilo de input, sem outline) + "Salvar mudanças"/"Publicar revisão". Nova revisão aparece no topo com a mesma animação de entrada + destaque de categoria.
- **Configurações** (`.tabs`): navegação em pills dentro de container cinza (`#f0eeec`, padding 4px), aba ativa = fundo branco + `--shadow-1`. Toggle de notificação (`.switch`, 40×24px, bolinha desliza, fundo `--accent` quando "on"). Toast de confirmação (`.toast`, animação de aparecer/permanecer/desaparecer em ~2.4–2.6s via `@keyframes`).
- **Ajuda**: busca em pill + grid de tópicos (`.topic-card`, ícone em badge + título + subtítulo) + FAQ em acordeão (`.faq-item`, chevron gira 180°, resposta expande via `max-height` transition) + formulário de contato com textarea.
- **Login**: card centralizado flutuante (não split-screen), radial gradient sutil de fundo, ícone de marca em badge redondo no topo, inputs com fundo cinza claro (não borda), cards de feature abaixo.
- **Dropdown/select** — nunca usar `<select>` nativo (browser controla a caixa de opções, sem estilo possível). Sempre um dropdown custom: `<button class="csel-btn">` (mesmo visual do `.input`, chevron que gira 180° ao abrir) + menu absoluto (`background:#fff; border-radius:14px; box-shadow:var(--shadow-2); padding:6px`) com opções `.csel-opt` (hover cinza claro, selecionada com fundo `--accent-100`/texto `--accent-700`). Animação de abrir/fechar via opacity+scale (140ms), nunca desmontar condicionalmente. **Importante**: todo positioning/background/shadow do menu vai no objeto de estilo retornado por JS (ex. `menuStyle()`), não em uma classe CSS separada — senão o estilo inline no template sobrescreve e o menu fica sem fundo.
- **Segmented control** (`.seg`/`.seg-opt`, ex. distribuição estatística em Simulação): fundo `#f0eeec`, opção ativa com fundo branco + `--shadow-1`.

## Ícones
Lucide (outline, stroke-width 2), tamanho 14–18px conforme contexto.

## Interações
- Hover em texto/link: mudar cor para `var(--accent)`. Cuidado: se o elemento tem `style` inline de cor, o hover via classe precisa de `!important` (inline sempre vence especificidade normal).
- Toda transição de abrir/fechar (dropdown, sidebar, modal) deve ter estado de saída animado — nunca remover do DOM abruptamente quando se espera uma transição.
- **Item novo em uma lista** (categoria, revisão, lançamento, cliente): entra no TOPO (nunca no final), com animação de entrada (`@keyframes` tipo `fadeIn`/`revIn`/`catIn`: `from{opacity:0;transform:translateY(-14px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)}`, 420ms `cubic-bezier(.2,.8,.2,1)`) somada a um destaque temporário (borda ou fundo `--accent`/`--accent-100` que decai via `transition` em ~900ms, removido do estado via `setTimeout`).
- Inputs de texto: nunca usar o outline azul padrão do browser — `:focus-visible{outline:none}` e, quando precisar indicar foco, usar `box-shadow` sutil ou nada (padrão do sistema é não destacar foco em inputs simples; only inputs de nome de categoria/item usam `box-shadow` de 1.5px accent no focus por serem editáveis inline).
- Ações assíncronas (rodar simulação): botão mostra estado de loading (label muda para "Simulando…", ícone spinner), fica `disabled`, e ao concluir atualiza os valores com transição suave (`transition: height 500ms` nas barras do histograma).

## O que evitar
- Bordas 100% quadradas (raio zero).
- Hover com elevação/translate nos cards.
- Mais de uma cor de destaque.
- Sidebar com a mesma cor do fundo da página.
- Tints monocromáticos muito próximos em gráficos onde as cores precisam ser diferenciadas lado a lado.
- Botões de ação isolados em posições que quebram a leitura do cabeçalho de um card — preferir integrá-los ao conteúdo (rodapé, dentro da lista).
- `<select>` nativo, outline azul padrão em inputs/botões.
- Item novo em lista aparecendo no final sem destaque — sempre no topo, com animação e realce temporário.
- Colocar o bloco de rodapé (perfil) dentro do container com `overflow-y:auto` da navegação — ele deve estar fora, como último filho `flex:none` da sidebar.
