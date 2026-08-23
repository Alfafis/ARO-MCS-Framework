> **DESATUALIZADO (2026-08-23)** — sidebar de 6 itens e modal "Novo projeto" com campo manual "Custo esperado (R$)" não refletem o código real. Hoje `criarProjeto` só recebe cliente/nome/tipo — o valor esperado é calculado a partir das categorias, nunca digitado. Ver ADR "workspace por projeto" no vault. Layout de lista/toolbar ainda é referência válida.

# Tela: Clientes e projetos

Arquivo: `ARO-MCS Clientes.dc.html`. Lista de todos os projetos de provisionamento de ARO em andamento na consultoria (visão do consultor sobre todos os clientes, não de um projeto só).

## Layout
Sidebar + `.topbar` (título + tag "12 ativos" + botão primário "+ Novo projeto") + `.content`: toolbar de busca/filtro + card de lista.

## Componentes

### Toolbar
Busca em pill (por nome de cliente OU de projeto) + 4 chips de filtro: Todos / Em andamento / Aguardando cliente / Concluídos.

### Lista de projetos (`.plist`, scroll horizontal em telas estreitas)
Cabeçalho de colunas (Cliente/Projeto, Status, Rev. atual, Esperado, Última atualização) + linhas (`.prow`): iniciais do cliente em badge quadrado, nome do projeto + nome do cliente, tag de status (Em andamento verde / Aguardando cliente laranja / Concluído neutro), revisão atual, valor esperado formatado (R$ X,X M), tempo desde última atualização, botão "···" com menu.

Menu de ações por linha: "Ver categorias de custo" (navega para `ARO-MCS Projeto (Cadastro).dc.html`), "Marcar como concluído", "Arquivar projeto" (remove da lista).

Estado vazio: `.empty-state` quando busca/filtro não retorna nada.

### Modal "Novo projeto"
Campos: Cliente, Nome do projeto, Custo esperado (R$). Botões Cancelar/Criar projeto.

## Interatividade
- **Busca**: filtra por `projeto` OU `cliente` (case-insensitive).
- **Filtros**: por `status` (andamento/aguardando/concluido).
- **Menu de linha**: mesmo padrão de fechar-todos-antes-de-abrir das outras listas; "Ver categorias" navega via `window.location.href` (não é link `<a>`, é ação JS).
- **Criar projeto** (`confirmAddRow`): valida cliente e projeto não vazios, calcula iniciais automaticamente a partir do nome do cliente (`initials()` — primeiras letras de palavras capitalizadas), insere no topo com `status:'andamento'`, `rev:'Rev0'`, `justAdded:true` (destaque `.highlight` que decai em 900ms).
- Sidebar: recolher/expandir, dropdown de perfil.

## Dados mock iniciais
5 projetos: NX Gold (Rev0, andamento), Ferro Linhares (Rev1, aguardando), Cobre Brasil (Rev2, andamento), Minérios do Sul (Rev3, concluído), Aço Zafira (Rev0, andamento).


## Prompts dos componentes internos

**Toolbar de busca e filtros**
> Uma barra horizontal com um campo de busca em pílula (ícone de lupa, fundo branco, sem borda) à esquerda ocupando o espaço disponível, e um grupo de chips de filtro em pílula à direita (Todos / Em andamento / Aguardando cliente / Concluídos) — o filtro ativo com fundo vermelho sólido e texto branco.

**Linha de projeto/cliente**
> Uma linha de tabela sem bordas de célula tradicionais: à esquerda, iniciais do cliente dentro de um quadrado cinza claro arredondado, seguidas do nome do projeto (destaque) e do nome do cliente (texto secundário cinza abaixo); depois uma pill de status (verde "Em andamento", laranja "Aguardando cliente", neutra "Concluído"); depois a revisão atual (texto cinza, ex.: "Rev0"); depois o valor esperado formatado em milhões, alinhado à direita e monoespaçado; depois o tempo relativo desde a última atualização (ex.: "há 2 dias"); por fim um botão de três pontinhos abrindo um menu com "Ver categorias de custo" (navega para a tela de cadastro), "Marcar como concluído" e "Arquivar projeto" (remove da lista). Um projeto recém-criado aparece no topo com um destaque de fundo vermelho bem claro que se dissipa suavemente.

**Modal "Novo projeto"**
> Janela modal centralizada sobre fundo escurecido. Título "Novo projeto". Três campos (Cliente, Nome do projeto, Custo esperado em R$), mesmo padrão visual dos demais formulários do sistema (rótulo cinza pequeno + input de fundo cinza claro sem borda). Rodapé com "Cancelar" e "Criar projeto" (primário) alinhados à direita. Ao confirmar, as iniciais do cliente são calculadas automaticamente a partir do nome digitado.

**Estado vazio da lista**
> Texto centralizado simples em cinza ("Nenhum projeto encontrado."), sem decoração, quando busca/filtro não retornam resultados.
