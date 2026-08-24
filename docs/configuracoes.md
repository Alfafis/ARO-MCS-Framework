> **Reescrito em 2026-08-24** — este doc já tinha sido marcado "DESATUALIZADO" em 2026-08-23 (dizia que a tela real era CRUD único de tipos de projeto em `src/pages/Configuracoes.tsx`). Isso também ficou obsoleto: o commit `f5b3030` desmembrou aquele CRUD único em **3 rotas/páginas independentes**, cada uma na sidebar global (não mais escondidas em "Configurações"). Não existe mais nenhuma tela nem rota `/configuracoes` — quem navegar até lá cai no fallback `*` → `/visao-geral`.

# Telas: Tipos de Projeto, Categorias de Custo, Parâmetros Globais

Três páginas irmãs, cada uma um card branco único dentro de `PageHeader`, com toast de confirmação no canto inferior direito (`#14151a`, fade+slide, ~2.5s) — mesmo padrão visual nas três. Todas leem/escrevem via `ProjetoContext` (Supabase, RLS `is_consultor()`), sem mock.

## `/tipos-projeto` — `src/pages/TiposProjeto.tsx`

CRUD simples de `tiposProjeto` (`criarTipoProjeto`/`renomearTipoProjeto`/`removerTipoProjeto` do `ProjetoContext`). Card único, max-width 560px.

- Lista de `TipoRow`: input sempre editável (`variant="filled"`), ícones de confirmar/cancelar só aparecem com edição em andamento (clique fora cancela, nunca salva sozinho no blur), botão de remover sempre visível.
- Rodapé do card: input + botão "+ Adicionar" para criar tipo novo.
- Delete é bloqueado pelo FK `RESTRICT` do Postgres se algum projeto usa o tipo — erro do backend vira toast (`err.message`).
- `id` (slug) nunca é editável depois de criado.

## `/categorias-custo` — `src/pages/CategoriasCusto.tsx`

Editor do **template de categoria por tipo de projeto** (`categorias_template`/`itens_template`) — não é a categoria de um projeto real, é o blueprint que `carregar_template_exemplo` usa pra popular um projeto novo daquele tipo.

- Chips de tipo de projeto no topo (`tiposProjeto` do context); selecionar um busca sob demanda (`fetchTemplateCategorias`) e cacheia em `templates[tipoId]` — trocar de tipo e voltar não rebusca.
- Corpo reaproveita `CategoryBlock` (mesmo componente usado em `Categorias.tsx` pra categoria de projeto real) via `TemplateEditor`, trocando as mutações pelas `template*` do context (`templateAddCategoria`/`templateRemoveCategoria`/`templateUpdateCategoria`/`templateAddItem`/`templateRemoveItem`/`templateUpdateItem`/`templateSaveItem`).
- Renomear a categoria (`onRename`) chama `renomearCategoriaCatalogo` — o nome é do **catálogo compartilhado**, então renomear aqui afeta qualquer projeto que já usa aquela categoria (ver `docs/cadastro-categorias.md`).

## `/parametros-globais` — `src/pages/ParametrosGlobais.tsx`

Dois tipos de parâmetro, ambos com botão de atualização via API do BCB (`buscarValorBcb`) e edição manual:

- **Parâmetro spot único** (`PARAMETRO_ORDEM`: só `cambio_usd_brl` hoje) — `ParametroRow`: valor formatado (R$ ou %), fonte (`bcb-sgs`/`manual`) + tempo relativo desde a última atualização, clique no valor abre edição inline.
- **Parâmetro ano-a-ano** (`PARAMETRO_ANUAL_ORDEM`: `inflacao_ipca`, `selic`) — `ParametroAnualTable`: grade de 20 anos com min/max por ano, salva no blur de cada célula. "Ano 1" tem botão de API (spot do BCB); anos 2-20 são sempre manuais — não existe API pública de projeção futura. Estado local (`edicoes`) evita que salvar min e max em sequência rápida sobrescreva um com o outro via prop desatualizada (bug reproduzido e corrigido, ver comentário no arquivo).
- `inflacao_ipca`/`selic` NÃO são mais valor spot fixo — reabertura registrada como ADR "Inflação e Selic viram tabela ano-a-ano" (Subsistema A2, `c8fbfcc`).

## O que NÃO existe mais

Perfil (`/perfil`), Notificações e Equipe do doc original não têm equivalente nestas 3 páginas — `/perfil` é rota própria e separada (ver `Perfil.tsx`), Notificações/Equipe/convite de membro nunca foram reimplementados fora do protótipo estático original.
