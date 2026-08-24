> **DESATUALIZADO (2026-08-23), complementado 2026-08-24** — "hash de ancoragem (OpenTimestamps)" abaixo é overclaim: é hash SHA-256 de conteúdo, calculado no servidor, nunca houve integração com OpenTimestamps. A correção de 2026-08-23 tinha corrigido só essa alegação — mas a seção "Interatividade" abaixo (`addRevision`/`toggleEdit`/`saveDraft`/`publish` como estado local em array) também está errada: a tela real (`src/pages/Revisoes.tsx`, rota `/projetos/:id/revisoes`) é 100% via RPC Supabase. Layout visual (timeline, cards, textarea) segue igual.

# Tela: Revisões do relatório

Arquivo: `ARO-MCS Revisoes.dc.html`. Histórico auditável das revisões do relatório de provisionamento, com hash de ancoragem (OpenTimestamps).

## Layout
Sidebar + `.topbar` (título + subtítulo "histórico auditável, com hash de registro" + botão primário "+ Gerar nova revisão") + `.content` (card único contendo a timeline).

## Componentes

Timeline vertical de `.rev-card`s conectados por `.connector` (linha vertical fina entre um card e o próximo — sem conector após o último):

Cada `.rev-card` (borda `--c-line`, radius 16px, borda `--accent-100` quando é a revisão vigente):
- **Cabeçalho**: dot numerado (`.rev-dot`, preenchido vermelho + check quando publicado, cinza + número quando rascunho/pendente) + título ("Rev2 — Planejada", "Rev1 — Vigente"...) + data (ou "A definir") + tag de status (Rascunho/Vigente/Substituída) + botão "Ver PDF" (só se a revisão tem hash).
- **Lista de mudanças** (`.rev-changes`): itens com check verde (ou invisível/opacidade 0 quando pendente/sem check ainda).
- **Modo de edição** (só em rascunho, toggle via botão "Continuar edição"/"Fechar edição"): revela um `textarea` (`.rev-textarea`, uma mudança por linha) + botões "Salvar mudanças" e "Publicar revisão".
- **Hash de ancoragem** (`.hash`, só quando publicado): ícone de cadeado + hash mono (`0x8f2a...c194`) + "ancorado via OpenTimestamps".

## Interatividade
- **Carga inicial**: `load()` busca `revisoes` via `.from('revisoes').select('*').eq('projeto_id', projeto.id)` (RLS, não RPC).
- **Gerar nova revisão** (`handleNovaRevisao`): chama RPC `criar_revisao_rascunho(p_projeto_id)`, insere o registro retornado no topo da lista, abre em modo de edição (`editingId`) e aplica destaque (`highlightId`, decai em 900ms) — mesmo efeito visual do protótipo, dado real.
- **Editar rascunho**: `toggleEditor` abre/fecha o textarea local (populado com `rev.itens.join('\n')`), sem chamada de rede até salvar.
- **Salvar rascunho** (`handleSalvar`): RPC `salvar_rascunho_revisao(p_id, p_itens)` — `p_itens` é o texto do textarea, split por linha e filtrado; substitui a revisão local pelo retorno da RPC.
- **Publicar revisão** (`handlePublicar`): RPC `publicar_revisao(p_id, p_itens)` — servidor calcula o hash SHA-256 real de conteúdo, muda `status` pra `'vigente'`, e o client rebaixa localmente qualquer outra revisão que estava `'vigente'` para `'substituida'`. Também chama `atualizarRevLocal` no `ProjetoContext` pra sincronizar o badge `projetos.rev` mostrado em outras telas.
- Sidebar: recolher/expandir, dropdown de perfil (herdado do layout global).

## Dados mock iniciais
Não existe mais — removido. A tela carrega as revisões reais do projeto ativo; lista vazia mostra `t.emptyState`.


## Prompts dos componentes internos

**Card de revisão na timeline**
> Um card com borda fina cinza e cantos arredondados (16px), representando uma versão publicada ou planejada do relatório. Cabeçalho: um "selo" quadrado-arredondado de 34px identificando a revisão (número "R0", "R1"...) — preenchido vermelho quando essa revisão já foi publicada, cinza neutro quando ainda é um rascunho/planejada — ao lado o título ("Rev1 — Vigente") e a data de publicação (ou "A definir" se ainda não publicada); à direita, uma pill de status (Rascunho cinza / Vigente verde / Substituída cinza) e, quando a revisão já tem um hash de ancoragem, um botão secundário pequeno "Ver PDF". Corpo: uma lista de mudanças, cada item precedido de um ícone de check verde (invisível/oculto quando a revisão ainda não tem conteúdo definido). Quando a revisão vigente é destacada, sua borda usa um tom vermelho bem claro em vez do cinza padrão.

**Modo de edição de rascunho**
> Dentro de um card de revisão em rascunho, um botão secundário pequeno "Continuar edição" revela uma área de texto multi-linha (mesmo visual dos inputs — fundo cinza claro, sem borda) pré-populada com as mudanças já registradas (uma por linha), permitindo editar livremente. Abaixo dela, dois botões pequenos: "Salvar mudanças" (fantasma) e "Publicar revisão" (primário vermelho) — publicar transforma o rascunho em revisão vigente, gera um hash de ancoragem e atualiza a data.

**Selo de hash de ancoragem**
> Uma pequena etiqueta horizontal com fundo cinza muito claro e cantos arredondados, contendo um ícone de cadeado/cofre seguido de um código hexadecimal abreviado em fonte monoespaçada (ex.: "0x8f2a...c194") e o texto "· ancorado via OpenTimestamps" — comunica que aquela revisão foi registrada de forma imutável/auditável.

**Conector vertical entre revisões**
> Uma linha fina vertical cinza clara conectando o fundo de um card de revisão ao topo do próximo, criando a sensação visual de uma linha do tempo contínua — nunca aparece depois do último card da lista.

**Nova revisão (animação de criação)**
> Ao clicar em "+ Gerar nova revisão", uma nova entrada de rascunho vazio aparece imediatamente no TOPO da lista (nunca no final), já aberta em modo de edição, com uma animação de entrada suave (opacidade + deslocamento de cima para baixo, ~420ms) combinada com um contorno vermelho temporário que se dissipa gradualmente em menos de 1 segundo — chamando a atenção para o item recém-criado sem precisar de um alerta ou toast separado.
