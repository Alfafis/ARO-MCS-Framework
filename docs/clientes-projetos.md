> **Reescrito em 2026-08-24** — a correção anterior (2026-08-23) já tinha avisado que o modal "Novo projeto" não tem campo manual de "Custo esperado (R$)", mas descrevia isso como se ainda fosse UMA tela ("Clientes e projetos"). Não é mais: hoje são **4 telas separadas** — lista de clientes, projetos de um cliente, lista global de projetos, e wizard de criação. Cada uma com sua própria rota e componente.

# Telas: Clientes, Projetos de um cliente, Projetos (global), Novo projeto

## `/clientes` — `src/pages/Clientes.tsx`

Lista de clientes da consultoria (não de projetos). `.topbar` com título + badge de contagem + botão primário "+ Novo cliente" (abre `NovoClienteModal`, campo único de nome). Busca em pill por nome. Linha (`ClienteRow`): nome do cliente + contagem de projetos daquele cliente. Clique na linha ou criar cliente navega para `/clientes/:id`.

## `/clientes/:clienteId` — `src/pages/ClienteProjetos.tsx`

Projetos **de um cliente só** — substitui o que a spec antiga chamava de "lista de todos os projetos". Header mostra o nome do cliente (não "Clientes e projetos"), badge de projetos ativos, botão "+ Novo projeto" (navega para `/projetos/novo?clienteId=X`, cliente já vem fixo no wizard). Toolbar: busca + 4 chips de status (Todos/Em andamento/Aguardando cliente/Concluídos) — sem filtro de cliente, óbvio, já está escopado. Tabela (`CltRow`, colunas `ROW_COLS`): projeto, status, revisão, valor esperado, atualização, menu de ações.

## `/projetos` — `src/pages/Projetos.tsx`

Lista global (cross-cliente), equivalente mais próximo da tela antiga. Toolbar: busca (nome de projeto OU cliente) + filtro por cliente + filtro por **tipo de projeto** (`tiposProjeto` do context — não existia na spec antiga) + 4 chips de status. Tabela (`CltRow`, colunas `ROW_COLS_WITH_CLIENTE`): cliente, projeto, status, revisão, valor esperado, atualização, menu. Botão "+ Novo projeto" navega para `/projetos/novo` sem cliente fixo.

### Menu de ações por linha (`useProjetoRowActions`, compartilhado entre `/clientes/:id` e `/projetos`)

Não é mais só "Ver categorias/Concluir/Arquivar" como a spec antiga descrevia — 6 ações reais:
- **Ver categorias de custo** → navega `/projetos/:id/categorias`
- **Marcar como concluído** / **Arquivar projeto** → `concluirProjeto`/`arquivarProjeto` via `ProjetoContext`
- **Ver relatório** → navega `/relatorio/:id` (Portal do Cliente)
- **Gerar link** → copia `{origin}/relatorio/:id` pro clipboard (fallback `prompt()` se `clipboard.writeText` falhar), toast "Link copiado"
- **Gerar código de acesso** → abre `CodigoAcessoModal` (código que o cliente usa pra abrir o relatório sem sessão de consultor — ver `docs/portal-cliente-relatorio.md`)

Nenhuma dessas 3 últimas ações (relatório/link/código) existia na spec antiga.

## `/projetos/novo` — `src/pages/ProjetoNovo.tsx` (step 1 do wizard)

Substitui o modal "Novo projeto". Não é modal, é página própria, e não tem campo de custo esperado — só **Cliente** (fixo se veio de `/clientes/:id`, senão dropdown), **Nome do projeto**, **Tipo de projeto** (dropdown, `tiposProjeto` do context). Ao confirmar, cria o projeto de verdade via RPC `criarProjeto` (`create_projeto`) — sem rascunho local — e navega para `/projetos/:id/config-inicial` (step 2 do wizard, config financeira inicial, fora do escopo deste doc). Valor esperado nunca é digitado — é sempre calculado a partir das categorias do projeto.

## O que não existe mais

"Arquivar projeto" removendo a linha da lista local (array em memória) — hoje é campo de status persistido via RPC, sobrevive reload. Não há mais um `.dc.html` único nem `confirmAddRow`/estado local de lista — todo o CRUD é via `ProjetoContext` (Supabase).
