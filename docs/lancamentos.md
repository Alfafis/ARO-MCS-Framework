> **Corrigido em 2026-08-24** — as seções "Interatividade" e "Dados mock iniciais" abaixo descreviam o protótipo estático original (array em memória, `confirmAddRow`). Tela real hoje é `src/pages/Lancamentos.tsx`, rota `/projetos/:id/lancamentos`, 100% via RPC Supabase — sem array local nem dado mock. Layout/visual (KPIs, toolbar, tabela, modal) continua igual ao descrito.

# Tela: Lançamentos realizados

Arquivo real: `src/pages/Lancamentos.tsx`. Registro dos custos efetivamente realizados por categoria/período de um projeto, usado como base do comparativo expectativa vs. realidade.

## Layout

Sidebar + `.topbar` (título + botão primário "+ Novo lançamento") + `.content`: 3 KPI cards no topo, toolbar de busca/filtro, card de lista.

## Componentes

### KPI cards (3, `.kpi-grid`)

"Realizado em 2026" (soma de todos os lançamentos, formatada em R$ X,XX M), "Validados" (contagem), "Aguardando evidência" (contagem) — todos calculados a partir do array de lançamentos em tempo real.

### Toolbar

Busca em pill (filtra por nome de categoria, case-insensitive) + 4 chips de filtro: Todos / Validados / Em revisão / Pendente evidência (mutuamente exclusivos, um fica `.active` com fundo `--accent` sólido).

### Lista de lançamentos (`.plist-scroll`, scroll horizontal em telas estreitas)

Cabeçalho de colunas (Categoria/Período/Valor real/Status) + linhas (`.prow`): ícone da categoria (Barragem/Monitoramento/Cavas/genérico, escolhido por `iconKey` via `sc-if` em cadeia), título + subtítulo (nome do anexo ou "Sem anexo"), período, valor em mono, tag de status (Validado verde / Em revisão neutro / Pendente evidência laranja), botão "···" que abre menu de ações.

Menu de ações por linha (`.row-menu`): "Marcar como validado", "Marcar em revisão", "Excluir lançamento" (vermelho).

Estado vazio: `.empty-state` centralizado quando a busca/filtro não retorna nada.

### Modal "Novo lançamento"

Campos: Categoria, Período, Valor real (R$) — todos texto livre. Botões Cancelar/Adicionar.

## Interatividade

- **Carga inicial**: `load()` busca `lancamentos` via `.from('lancamentos').select('*').eq('projeto_id', projeto.id)` (RLS, não RPC) — não array local nem mock.
- **Busca**: filtra `rows` em memória por `categoria.toLowerCase().includes(search)` (cliente-side, sobre o dado já carregado).
- **Filtros**: filtram por `status` (validado/revisao/pendente), também client-side.
- **Menu de linha**: fecha ao clicar fora (`mousedown` no documento); as 2 ações reais chamam RPC — **excluir** (`remover_lancamento`) e **mudar status** (`atualizar_status_lancamento`, usada tanto pra "Marcar como validado" quanto "Marcar em revisão") — sucesso atualiza o array local só depois da RPC confirmar.
- **Adicionar lançamento** (`confirmAdd`): chama RPC `criar_lancamento` (`p_projeto_id`, `p_categoria`, `p_periodo`, `p_valor` já convertido de string BR "350.000" pra número via `parseValor`); insere o registro retornado pela RPC no topo do array, aplica `highlightId` (fundo destacado que decai em 900ms) e fecha o modal.
- Sidebar: recolher/expandir, dropdown de perfil (herdado do layout global, não específico desta tela).

## Dados mock iniciais

Não existe mais — removido. A tela carrega os lançamentos reais do projeto ativo via Supabase; lista vazia mostra o estado vazio (`.empty-state`), não dado de exemplo.

## Prompts dos componentes internos

**KPI cards do topo (Realizado / Validados / Aguardando evidência)**

> Três cards brancos lado a lado, cada um com um pequeno badge de ícone vermelho claro no topo, um rótulo cinza abaixo, e um número grande em negrito (22px) como valor principal — todos os três números são calculados em tempo real a partir da lista completa de lançamentos (soma total formatada em milhões, contagem de itens validados, contagem de itens pendentes de comprovante).

**Toolbar de busca e filtros**

> Uma barra horizontal com, à esquerda, um campo de busca em formato de pílula (fundo branco, ícone de lupa, sem borda visível) ocupando o espaço disponível, e à direita um grupo de chips de filtro em pílula (Todos / Validados / Em revisão / Pendente evidência) — o filtro ativo tem fundo vermelho sólido e texto branco, os inativos têm fundo branco e texto cinza, mutuamente exclusivos.

**Linha de lançamento com menu de ações**

> Uma linha de tabela sem bordas de célula, dividida em colunas: um ícone identificador da categoria dentro de um quadrado cinza claro arredondado (ícones diferentes para Barragem/Monitoramento/Cavas, um ícone genérico de "pessoas" para outras categorias) seguido do nome da categoria e, abaixo, o nome do anexo ou "Sem anexo" em texto pequeno cinza; depois o período (texto cinza); depois o valor em destaque monoespaçado alinhado à direita; depois uma pill de status colorida (verde "Validado", neutra "Em revisão", laranja "Pendente evidência"); por fim um botão de três pontinhos que abre um menu flutuante com as ações "Marcar como validado", "Marcar em revisão" e "Excluir lançamento" (esta última em vermelho). Uma linha recém-adicionada aparece no topo da lista com um fundo vermelho bem claro que se dissipa suavemente em menos de 1 segundo.

**Estado vazio da lista**

> Quando a busca ou o filtro não retornam nenhum resultado, mostrar um texto centralizado simples em cinza ("Nenhum lançamento encontrado."), sem ilustração, sem borda — apenas espaço em branco generoso acima e abaixo.

**Modal "Novo lançamento"**

> Janela modal centralizada com fundo escurecido atrás. Título "Novo lançamento". Três campos de formulário empilhados (Categoria, Período, Valor real em R$), cada um com rótulo cinza pequeno acima e input de fundo cinza claro sem borda. Rodapé com dois botões alinhados à direita: "Cancelar" (estilo secundário/fantasma) e "Adicionar" (estilo primário vermelho).
