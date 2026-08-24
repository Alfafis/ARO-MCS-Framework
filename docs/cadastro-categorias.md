# Tela: Categorias de custo (do projeto)

> **Reescrito em 2026-08-24** — a spec antiga descrevia array local `{id, name, preenche, tagClass, expanded, items[]}` por projeto, com card "Dados do projeto" (Cliente/Tipo/Moeda/Método de atualização) embutido na mesma tela e dropdowns próprios pra essas configurações. Nada disso está aqui hoje: as configurações do projeto migraram pra fora desta tela (`ProjetoConfigInicial`/`ProjetoConfiguracoes`, wizard/config do projeto), e categoria deixou de ser array local — é catálogo compartilhado, persistido via RPC.

Arquivo real: `src/pages/Categorias.tsx` (rota `/projetos/:id/categorias`) + `src/components/categorias/CategoryBlock.tsx`.

## Modelo de dado — catálogo compartilhado, não array por projeto

Cada categoria de um projeto referencia uma entrada em `catalogo` (`catalogoId`) — o **nome** da categoria vive no catálogo, compartilhado entre TODOS os projetos que usam aquele nome. Renomear uma categoria (`renomearCategoriaCatalogo`) afeta qualquer outro projeto que já usa esse nome — a tela avisa isso explicitamente no toast ("Categoria renomeada — vale pra todos os projetos que usam esse nome"). A categoria em si (`preenche`, `expanded`, lista de itens) é dado por-projeto; só o nome é compartilhado.

## Layout

Header simples: título + botão "+ Nova categoria" (`addCategoria`). Sem tag de revisão, sem "Salvar rascunho"/"Salvar e continuar" — esses dois botões não existem mais nesta tela (salvar é sempre incremental por campo, ver abaixo; navegação pra Simulação é pela sidebar de abas do workspace de projeto).

## Componentes

### Card "Categorias" — único card da tela

- **Estado vazio**: se o projeto não tem nenhuma categoria ainda, mostra mensagem + um botão "Carregar exemplo de {tipo}" por cada tipo de projeto que tem template cadastrado (`tiposComTemplate`, ver `docs/configuracoes.md` — editor de template em `/categorias-custo`). Carrega via `carregarTemplateExemplo`, que lê o template do servidor (não aceita payload arbitrário do client — RPC endurecida nessa mesma sessão, ver ADR "Template de categoria administrável" no vault).
- **Lista de `CategoryBlock`**, um por categoria do projeto (`projeto.categorias`).

### `CategoryBlock` — cada categoria

- **Cabeçalho** (fundo `#faf9f8`): nome editável inline (mesmo padrão confirmar/cancelar do resto do app — nunca salva sozinho no blur), badge "Preenche: {Consultor/Cliente/Ambos}" clicável (abre menu portal com as 3 opções), botão expandir/recolher, botão excluir categoria.
- **Corpo** (só expandido): tabela de itens com **7 colunas**, não 5 como a spec antiga — Item, Unidade, Custo Min, Custo Max, Fonte, **Aplicabilidade**, **Ano previsto** (as 2 últimas não existiam na spec original). Cada célula salva no blur via `onSaveItem` (RPC), estado local (`onUpdateItem`) só pro valor digitado antes do blur. Botão "+ Adicionar item" no rodapé.
- Categoria recém-criada: mesmo efeito visual da spec antiga (entra no topo, scroll automático, destaque de borda que decai) — isso continua igual, só o dado por trás mudou.

## Interatividade

- **Adicionar categoria** (`addCategoria`): RPC via `ProjetoContext`, insere no topo do array local após confirmar no servidor.
- **Renomear categoria** (`renomearCategoriaCatalogo`): edita o catálogo compartilhado, não um campo local — erro de nome duplicado vira toast ("Já existe uma categoria com esse nome").
- **Alterar "Preenche"**: `onChange('preenche', ...)` — RPC de update, não estado local puro.
- **Itens**: `addItem`/`removeItem`/`updateItem` (estado local, digitação) + `saveItem` (RPC, no blur de cada campo) — mesmo padrão de outras telas do sistema (salvar incremental por campo, nunca um botão "Salvar" único pra tudo).
- Sidebar/dropdown de perfil: herdados do layout global, não específicos desta tela.

## O que NÃO existe mais nesta tela

Card "Dados do projeto" (Cliente/Tipo de projeto/Data-base/Moeda/Método de atualização/Contingência) e os 3 dropdowns custom associados — migraram pra fora de Categorias (config do projeto, wizard de criação). Botões "Salvar rascunho"/"Salvar e continuar" como ações explícitas de tela inteira — tudo salva incremental por campo.
