# Tela: Categorias de custo (Cadastro)

Arquivo: `ARO-MCS Projeto (Cadastro).dc.html`. Onde consultor/cliente cadastram as categorias de custo do projeto e os itens (min/max/fonte) de cada uma.

## Layout
Sidebar + `.topbar` (título + tag "Rev0" + botões "Salvar rascunho" / "Salvar e continuar" — este último é um `<a>` que navega para `ARO-MCS Simulacao.dc.html`) + `.content` (flex column, gap 16px).

## Componentes

### Card "Dados do projeto"
Grid 3 colunas × 2 linhas de campos: Cliente (input), **Tipo de projeto** (dropdown custom — 4 opções), Data-base (input), Moeda (dropdown custom — BRL/USD), **Método de atualização** (dropdown custom — 5 opções: A definir/Escalonamento/Juros simples/Juros compostos/Inflação constante), Contingência aplicada (input).

### Card "Categorias de custo" — o componente central da tela
Botão "+ Nova categoria" no cabeçalho e outro "+ Nova categoria de custo" no rodapé do card (ambos chamam a mesma ação).

Cada categoria é um `.cat-block` (borda `--c-line`, radius 16px):
- **Cabeçalho** (`.cat-head`, fundo `#faf9f8`): número de ordem (01, 02...), **nome editável inline** (input sem borda, hover cinza, focus com `box-shadow` accent — nunca outline padrão), tag "Preenche: Consultor/Ambos", botão de expandir/recolher (chevron gira 180°), botão de excluir categoria (hover vermelho).
- **Corpo** (só quando expandido, `sc-if`): cabeçalho de colunas (Item/Unidade/Custo Min/Custo Max/Fonte) + linhas de item, cada campo é um `input` inline editável (`.row-input`, mesmo padrão visual do nome de categoria) + botão de excluir item por linha. Rodapé: "+ Adicionar item".

## Interatividade (component state)
- **Categorias**: array de objetos `{id, name, preenche, tagClass, expanded, items[]}` em `state.categories`.
  - Editar nome inline (`onChange`).
  - Expandir/recolher (`toggleExpand`).
  - Remover categoria (`remove`).
  - **Adicionar categoria** (`addCategory`): insere no **TOPO** da lista (nunca no final), com `justAdded:true` → aplica animação de entrada (`@keyframes catIn`, fade+slide 420ms) + destaque de borda `--accent` que decai em 900ms (via `setTimeout`) + **scroll automático** até o novo bloco (`ref` callback + `scrollIntoView`).
- **Itens de cada categoria**: array `items[]` por categoria, cada um com campos editáveis (item, unidade, min, max, fonte) e botão de remover; `addItem(catId)` cria um "Novo item" vazio no final da lista de itens da categoria.
- **3 dropdowns custom** (Tipo de projeto, Moeda, Método de atualização): cada um com `state.xOpen` (boolean) + `state.x` (índice selecionado); abrir um fecha os outros dois; menu com `menuStyle(open)` (opacity+scale, 140ms).
- Sidebar: recolher/expandir, dropdown de perfil.

## Regras de negócio observadas
- Numeração de categoria reflete a ordem na síntese/relatório final (ex.: "01. Estudos", "04. Barragem", "08. Monitoramento").
- "Salvar e continuar" é o próximo passo do fluxo → leva à tela de Simulação.


## Prompts dos componentes internos

**Card "Dados do projeto"**
> Card branco com título + ícone de calendário/prancheta. Grid responsivo de 3 colunas x 2 linhas de campos de formulário: cada campo tem um rótulo pequeno cinza (12.5px, peso 600) acima e, abaixo, ou um input de texto simples (fundo cinza claro, sem borda visível, radius 11px, sem outline de foco) ou um dropdown customizado (ver prompt abaixo). Campos: Cliente, Tipo de projeto, Data-base, Moeda, Método de atualização, Contingência aplicada.

**Dropdown customizado (Tipo de projeto / Moeda / Método de atualização)**
> Nunca um select nativo. Um botão do mesmo visual do input de texto (fundo cinza claro, radius 11px, padding 9-13px) com o valor selecionado à esquerda e um chevron para baixo à direita que gira 180° quando aberto. Ao clicar, revela — ancorado logo abaixo, com uma pequena distância — um menu flutuante branco (radius 14px, sombra pronunciada, padding 6px) listando as opções como linhas clicáveis (radius 9px, hover cinza claro); a opção atualmente selecionada tem fundo vermelho bem claro e texto vermelho escuro em negrito. Abertura/fechamento sempre animados via opacidade + escala (nunca desmontar abruptamente); abrir um dropdown fecha qualquer outro que esteja aberto na mesma tela.

**Bloco de categoria de custo expansível**
> Um contêiner com borda fina cinza e cantos arredondados (16px) representando uma categoria de custo cadastrada. Cabeçalho com fundo levemente acinzentado contendo, em linha: um chip numérico (01, 02...) indicando a ordem, o nome da categoria como um campo de texto editável inline (sem borda visível até o hover/foco — no hover ganha fundo cinza claro, no foco ganha um contorno fino vermelho), uma pill indicando quem deve preencher aquela categoria ("Preenche: Consultor" neutro ou "Preenche: Ambos" em tom vermelho claro), um botão de ícone para expandir/recolher (seta que gira) e um botão de ícone para excluir a categoria inteira (fica vermelho no hover). Quando expandido, revela: um cabeçalho de colunas em maiúsculas pequenas cinza (Item / Unidade / Custo Min / Custo Max / Fonte) seguido de uma linha por item cadastrado — cada célula é também um campo de texto editável inline no mesmo padrão do nome da categoria, os valores monetários em fonte monoespaçada, e um botão de excluir por linha. Ao final, um link "+ Adicionar item". Uma categoria recém-criada deve aparecer no topo da lista (nunca no final), entrando com uma animação suave de opacidade+deslize (de cima para baixo, ~420ms) e um contorno vermelho temporário que desaparece gradualmente em menos de 1 segundo, com a página rolando automaticamente até ela ficar visível.

**Botão "+ Nova categoria de custo" (rodapé da lista)**
> Uma faixa de largura total, centralizada, com fundo levemente acinzentado e cantos arredondados, texto cinza que fica vermelho no hover — convida a criar mais uma categoria sem competir visualmente com o botão de ação principal do cabeçalho do card.
