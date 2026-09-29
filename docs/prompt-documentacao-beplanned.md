# Prompt — Documentação completa do Be Planned (para gerar PDF no claude.ai)

> **Como usar:** abra uma conversa nova em claude.ai, **anexe os arquivos da seção "Anexos
> obrigatórios"** e cole TODO o conteúdo abaixo da linha `=== INÍCIO DO PROMPT ===`.
> O resultado é um Artifact HTML pronto para `Ctrl/Cmd + P → Salvar como PDF`.

## Anexos obrigatórios (sem eles o layout não sai certo)

| Arquivo | Onde está | Para quê |
|---|---|---|
| `BePlanned Logo.png` | `public/` | marca completa — capa e rodapé |
| `logo.png` | `public/` | ícone — cabeçalho das páginas internas |
| `PADRONAGEM - FUNDO sem pontilhado.png` | `public/` | textura da capa (opcional) |
| Screenshots das telas | você precisa capturar | o manual é inútil sem imagem |

**Screenshots mínimos (16):** login · visão geral · clientes · projetos · wizard de criação ·
config inicial do projeto · dashboard/resumo executivo · categorias (card expandido) · editor de
desembolso por ano · simulação · revisões · lançamentos · configurações do projeto · parâmetros
globais · portal do cliente (tela do código) · portal do cliente (relatório).

---

=== INÍCIO DO PROMPT ===

Você vai produzir a **documentação oficial do Be Planned** — sistema de provisionamento
financeiro de obrigações de encerramento (ARO) com simulação probabilística.

O entregável é **um único Artifact HTML**, em português do Brasil, projetado para ser impresso
como PDF A4. Não entregue Markdown, não entregue vários arquivos, não resuma: é documento
completo.

## Regra número 1 — não invente

O **Apêndice A** deste prompt é a única fonte de verdade sobre o sistema. Nada fora dele existe.

- Não crie tela, botão, campo, menu, atalho, integração ou permissão que não esteja no Apêndice A.
- Não invente número (preço, prazo, limite, percentual, fórmula) que não esteja no Apêndice A.
- Quando faltar informação para completar uma seção, escreva literalmente
  `[CONFIRMAR: <o que falta>]` em destaque e siga. **Nunca preencha com suposição plausível.**
- Se dois trechos do Apêndice A parecerem se contradizer, aponte a contradição em
  `[CONFIRMAR: ...]` em vez de escolher um.
- Terminologia visível ao usuário: use **"Aro Simulação"**, nunca "Monte Carlo". Use
  **"consultor"** para o operador e **"cliente"** para quem recebe o relatório.

## Público e tom

Dois leitores, no mesmo documento, em partes separadas:

1. **Consultor** (usuário final, engenheiro/ambiental, não é de TI) — precisa do passo a passo
   operacional: o que clicar, em que ordem, o que cada campo significa, o que fazer quando der erro.
2. **Gestor/auditor** (lê para entender ou validar) — precisa da metodologia de cálculo, das
   garantias de rastreabilidade e dos limites conhecidos do sistema.

Tom: direto, segunda pessoa ("clique em", "preencha"), frases curtas. Sem marketing, sem
"poderoso", "robusto", "intuitivo". Cada instrução operacional vira passo numerado.

## Estrutura obrigatória do documento

**Capa** — logo completo, título "Be Planned — Documentação do Sistema", subtítulo "Manual de uso
e metodologia", versão e data (use `[CONFIRMAR: versão]` e a data de hoje), fundo com a textura.

**Sumário** — com números de página. Como HTML impresso não numera sozinho, use a numeração de
seção (1, 1.1, 1.2…) e marque `[CONFIRMAR: página]` onde o número de página seria necessário.

1. **Visão geral** — que problema o sistema resolve, quem usa, o ciclo de vida de um projeto do
   cadastro à publicação da revisão para o cliente. Inclua um diagrama de fluxo (HTML/CSS ou SVG
   inline, nunca imagem externa).
2. **Conceitos** — cliente, projeto, revisão, categoria de custo, item de custo, custo provável,
   campo operacional, contingência, ancoragem, curva de desembolso, horizonte, data-base, ano de
   referência. Um parágrafo curto por conceito, com a definição operacional exata.
3. **Primeiros passos** — login, 2FA, perfil, idioma, tema.
4. **Guia de telas** — uma seção por tela do Apêndice A §2 e §3. Cada uma com: para que serve ·
   como chegar · campos e o que cada um significa · ações disponíveis · o que muda no resto do
   sistema quando você salva · erros comuns. Reserve o espaço do screenshot com um bloco
   `.screenshot-placeholder` rotulado (ex.: "Figura 7 — Categorias, card expandido").
5. **Fluxo completo de um projeto** — o caminho feliz ponta a ponta, numerado, do cadastro do
   cliente até o cliente abrir o relatório pelo código de acesso.
6. **Metodologia de cálculo** — Apêndice A §4, explicado para quem não é estatístico: como
   min/máx/custo provável viram distribuição, o que a Aro Simulação faz, como ler P10/P80/P90,
   VaR/CVaR, coeficiente de variação, cenários e direcionadores de risco. Fórmulas em bloco
   destacado. **Inclua a seção "Limites conhecidos" com o Apêndice A §6, sem suavizar.**
7. **Portal do cliente** — como gerar o código, o que o cliente vê, o que ele NÃO vê, validade e
   bloqueio por tentativas.
8. **Administração** — parâmetros globais, tipos de projeto, categorias de custo, setores,
   remediação padrão, personalização da plataforma.
9. **Rastreabilidade e segurança** — revisões e hash, trilha de auditoria, papéis, LGPD.
10. **Solução de problemas** — tabela sintoma → causa provável → o que fazer. Só casos do
    Apêndice A §6; não invente sintoma.
11. **Glossário** — ordem alfabética, incluindo as siglas (ARO, IPCA, Selic, CV, VaR, CVaR, P10,
    PRAD, PFM).

## Layout — identidade Be Planned

Cores (use exatamente estes valores, como CSS custom properties no `:root`):

```
--verde:        #2e7d32   /* primária: títulos de seção, filetes, destaques */
--verde-escuro: #1b5e20   /* capa, cabeçalho de tabela */
--verde-claro:  #e8f5e9   /* fundo de caixa de destaque, zebra de tabela */
--texto:        #14151a
--texto-2:      #5a5f6b
--linha:        #e4e6eb
--papel:        #ffffff
```

Tipografia: **Space Grotesk** via Google Fonts
(`https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap`),
fallback `system-ui, sans-serif`. Corpo 10,5pt / entrelinha 1,55. H1 24pt 700, H2 16pt 600 com
filete verde de 3px embaixo, H3 12,5pt 600 em `--verde-escuro`.

Regras de página:

```css
@page { size: A4 portrait; margin: 18mm 16mm 20mm 16mm; }
```

- Documento **sempre em tema claro**, fundo branco — nunca dark mode, nem se o sistema do leitor
  estiver escuro.
- `h1, h2 { break-after: avoid; }` · `figure, table, .card, .callout { break-inside: avoid; }`
- Cada parte de 1 a 11 começa em página nova (`break-before: page`).
- Cabeçalho de página interna: ícone `logo.png` à esquerda + "Be Planned — Documentação" à
  direita, filete cinza embaixo. Rodapé: "Confidencial · <data>" à esquerda e espaço para o
  número de página à direita (`[CONFIRMAR: numeração]`).
- Componentes visuais a usar: **caixa de passo** numerada, **callout** (💡 dica / ⚠ atenção /
  🔒 segurança) com fundo `--verde-claro` e barra verde à esquerda, **tabela** com cabeçalho
  `--verde-escuro` e texto branco, **bloco de fórmula** com fundo `#f6f7f9` e monoespaçada,
  **placeholder de screenshot** = caixa tracejada 16:9 com a legenda dentro.
- Nada de gradiente roxo, sombra colorida, emoji decorativo fora dos callouts, ícone de biblioteca
  externa. Imagens: só as que eu anexei, referenciadas pelo nome do arquivo.
- Larguras: texto com no máximo ~95 caracteres por linha; tabela nunca estoura a margem — se tiver
  muitas colunas, quebre em duas tabelas.

## Antes de escrever

Comece listando, em no máximo 10 linhas: (a) as lacunas que você vai marcar como
`[CONFIRMAR: ...]`, (b) o número de figuras que o documento vai reservar. Depois entregue o
Artifact completo, sem pedir confirmação.

---

# Apêndice A — Fatos verificados do sistema

> Extraído do código-fonte em 2026-09-29. É a fonte de verdade deste documento.

## A.1 — O que o sistema é

Aplicação web (SPA) de página única usada por consultores para estimar, provisionar e
documentar o custo de encerramento de um empreendimento — originalmente fechamento de mina
(ARO, *Asset Retirement Obligation*), hoje posicionada para passivo ambiental em geral. O
produto se chama **Be Planned**. O custo é estimado por faixa (mínimo, máximo e custo provável)
e submetido a uma simulação probabilística chamada **Aro Simulação**. O resultado vira um
relatório que pode ser publicado para o cliente final por link com código de acesso.

Backend é Supabase (Postgres + Auth). Cálculo roda no navegador. Não há app móvel nem API
pública para terceiros.

## A.2 — Menu lateral (10 itens, sempre visíveis ao consultor)

| Item | Rota | Função |
|---|---|---|
| Visão Geral | `/visao-geral` | indicadores agregados de todos os clientes, projetos recentes, atividade recente |
| Clientes | `/clientes` | lista de clientes; abrir um leva aos projetos dele (`/clientes/:id`) |
| Projetos | `/projetos` | lista global de projetos; criação em `/projetos/novo` |
| Tipos de Projeto | `/tipos-projeto` | cadastro dos tipos (ex.: Fechamento de Mina) |
| Categorias de Custo | `/categorias-custo` | template de categorias e itens usado como exemplo |
| Parâmetros Globais | `/parametros-globais` | IPCA e Selic ano a ano (mín/máx) e câmbio |
| Setores | `/setores` | setores do empreendimento usados na aplicabilidade dos itens |
| Remediação Padrão | `/remediacao-padrao` | template do módulo de remediação |
| Auditoria | `/auditoria` | trilha de alterações |
| Plataforma | `/plataforma` | logo, cor primária e fundo do sistema |

Fora do menu: `/perfil` (dados, senha, 2FA, exportar/excluir dados), `/privacidade` (política),
`/relatorio/:projetoId` (portal público do cliente), `/login`, `/esqueci-senha`,
`/redefinir-senha`, `/verificar-codigo` (2FA).

## A.3 — Área do projeto (abas dentro de `/projetos/:id`)

| Aba | Rota | Conteúdo |
|---|---|---|
| Visão geral | `dashboard` | resumo executivo: KPIs, custo por categoria, composição, métricas de risco, cenários, direcionadores de risco, histograma, curva de desembolso (agregada e detalhada), fan chart, métodos de atualização monetária, botão **Exportar PDF** |
| Categorias de custo | `categorias` | categorias e itens do projeto: custo mín/máx, unidade, custo provável da categoria, campos operacionais, fórmula de quantidade, aplicabilidade por setor, fase, ano início/fim e **desembolso por ano** por item |
| Simulação | `simulacao` | configura distribuição e número de iterações, roda a Aro Simulação, mostra resultado e histórico de rodadas |
| Remediação | `remediacao` | **só aparece quando o projeto tem o módulo habilitado**: quantidade × custo unitário por área (ha) |
| Revisões | `revisoes` | cria e publica revisões; cada publicação gera hash de conteúdo |
| Lançamentos | `lancamentos` | registro dos valores efetivamente gastos — base do comparativo expectativa vs. realidade |
| Configurações | `config` | moeda, data-base, horizonte (1 a 20 anos), método de atualização, contingência (%) e **ano de referência** |

Cabeçalho do projeto mostra cliente, nome, revisão vigente e status (Em andamento ·
Aguardando · Concluído).

## A.4 — Como o número é calculado (encadeamento real)

1. **Item de custo** tem `custo mínimo` e `custo máximo`. Se tiver fórmula de quantidade, os dois
   saem de `custo unitário × quantidade`, e a quantidade vem de uma expressão sobre os **campos
   operacionais** do projeto (área, perímetro, volume…). Campos podem depender uns dos outros
   (ex.: Perímetro → Volume → Tonelagem) — o sistema resolve o encadeamento.
2. **Categoria** soma os mínimos e os máximos dos seus itens. O **custo provável** da categoria é
   informado pelo consultor; quando não informado, o sistema usa o ponto médio entre mínimo e
   máximo. O valor é sempre limitado à faixa [mínimo, máximo].
3. **Ancoragem** corrige valores cadastrados em um ano anterior: multiplica pelo IPCA acumulado
   do **ano de referência** do projeto até a **data-base**. Quando os dois anos são iguais, o
   fator é 1 e nada é corrigido. Se faltar IPCA de qualquer ano do intervalo, o sistema **não
   corrige** e mostra aviso de ancoragem incompleta.
4. **Aro Simulação** sorteia, para cada categoria, um valor dentro da faixa, seguindo a
   distribuição escolhida — **Triangular**, **Normal** (derivada dos três pontos pelo método dos
   momentos: μ=(mín+4×provável+máx)/6, σ=(máx−mín)/6) ou **Uniforme** — e soma as categorias.
   Repete de 10.000 a 100.000 vezes (piso e teto do sistema), parando quando converge. Cada
   execução guarda a semente, então é reproduzível.
5. **Saídas da simulação:** média, desvio-padrão, P10, P80, P90, P95, intervalo de confiança,
   VaR e CVaR a 95%, coeficiente de variação (CV), histograma, cenários determinísticos e
   direcionadores de risco (correlação de cada categoria com o total, exibida como impacto
   Alto / Médio / Baixo). P10 aparece como **Otimista** e P90 como **Pessimista**.
6. **Curva de desembolso** distribui o custo ao longo do horizonte, item a item, nesta ordem de
   precedência: (a) valores por ano digitados pelo consultor no item; (b) distribuição uniforme
   entre ano início e ano fim; (c) tudo no ano 1, quando não há ano definido. Tem três modos:
   **Sem provisão**, **Com provisão X%** (aplica a contingência em cada ano) e **Com IPCA
   acumulado** (aplica o IPCA composto ano a ano por cima).
7. **Métodos de atualização monetária** comparam, lado a lado, juros simples, juros compostos,
   inflação e escalonamento. Os dois primeiros usam a Selic e os dois últimos o IPCA dos
   parâmetros anuais. **Se faltar o valor de qualquer ano do horizonte, o método some do card —
   o sistema nunca completa buraco com estimativa.**

## A.5 — Portal do cliente

`/relatorio/:projetoId` é público. O consultor gera um **código de acesso** e envia junto com o
link (há envio por e-mail). Sem código válido, nada é exibido. Cinco tentativas erradas bloqueiam
aquele projeto por 15 minutos; um acerto zera a contagem. O cliente vê KPIs, custo por categoria,
composição, métricas de risco, cenários, direcionadores de risco, histograma, curva de desembolso
e o botão de baixar o PDF do relatório. Ele **não** vê outros clientes, outros projetos, custos
unitários de item, nem a área administrativa. O portal tem seletor de idioma (português, inglês,
espanhol) e o PDF sai sempre em tema claro.

## A.6 — Limites conhecidos (documentar, não esconder)

1. **A curva de desembolso e o custo provável medem coisas diferentes.** A curva parte do custo
   **máximo** de cada item (ou dos valores por ano digitados); o custo provável é o valor
   informado por categoria. Os dois totais não batem, e isso é esperado — em um projeto real a
   diferença foi de 6,17% (R$ 35,20 mi contra R$ 33,16 mi). Documentar como leitura, não como erro.
2. **O desembolso por ano não se ressincroniza quando o custo máximo do item muda.** O sistema
   avisa em laranja ("difere do Custo Max em R$ ..."), mas mantém o valor digitado no total da
   curva. Revisar o desembolso sempre que editar o custo do item.
3. **Sem IPCA de todos os anos, não há ancoragem nem métodos de IPCA** — o card some ou o fator
   volta a 1, com aviso. Preencher Parâmetros Globais antes de confiar no relatório.
4. **O seletor de confiança (80/90/95%) afeta só o intervalo de confiança.** VaR e CVaR são
   sempre calculados a 95%, por exigência da metodologia.
5. **Não existe código de recuperação para o 2FA.** Perdeu o aplicativo autenticador, só um
   administrador desfaz o vínculo.
6. **A exclusão de conta (LGPD) é uma solicitação, não é imediata** — os dados pessoais do perfil
   são apagados na hora, mas o vínculo com a trilha de auditoria é preservado.
7. **Exclusão de cliente ou projeto é bloqueada** quando existem projetos, revisões ou
   lançamentos vinculados; a mensagem informa a contagem.

## A.7 — Papéis e acesso

Dois papéis: **consultor** (acesso total à área administrativa) e **cliente** (sem login no
sistema — acessa apenas o portal por código). O papel **não** é editável pelo próprio usuário.
Não existe um terceiro nível de administrador hoje. Login é e-mail e senha, com 2FA por
aplicativo autenticador opcional. Toda escrita em tabela financeira fica registrada na trilha de
auditoria, com autor e data.

=== FIM DO PROMPT ===
