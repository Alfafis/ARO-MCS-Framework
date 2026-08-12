# Tela: Configurações

Arquivo: `ARO-MCS Configuracoes.dc.html`. Gestão de perfil, notificações e equipe do consultor logado. Não aparece na sidebar (acessível via dropdown de perfil).

## Layout
Sidebar + `.topbar` (título "Configurações" + subtítulo) + `.content` (max-width 760px): navegação por abas + card do conteúdo da aba ativa.

## Componentes

### Abas (`.tabs`, pill container cinza)
3 abas: **Perfil**, **Notificações**, **Equipe** — aba ativa com fundo branco + `--shadow-1`.

### Aba Perfil
Grid 2×2 de campos: Nome, Cargo, E-mail (inputs de texto) e Fuso horário (dropdown custom — Brasília/Manaus/UTC). Botão "Salvar alterações".

### Aba Notificações
3 linhas de toggle (`.toggle-row`, separadas por `border-top`): "Nova revisão publicada", "Lançamento pendente de evidência", "Resumo semanal por e-mail" — cada uma com switch (`.switch`, 40×24px, bolinha desliza, fundo `--accent` quando "on"). Botão "Salvar alterações".

### Aba Equipe
Botão "+ Convidar membro" no cabeçalho + lista de membros (`.member-row`): nome+email, tag de papel (Admin verde / Consultor neutro / Cliente laranja), botão de remover (hover vermelho).

### Toast de confirmação
Aparece por ~2.4s (`@keyframes toast`: fade in → permanece → fade out) após clicar em "Salvar alterações" em qualquer aba.

### Modal "Convidar membro"
Campos Nome/E-mail. Botões Cancelar/Enviar convite.

## Interatividade
- **Navegação de abas**: troca `state.tab`, só uma aba de conteúdo visível por vez (`sc-if`).
- **Campos de perfil**: editáveis, controlados.
- **Fuso horário**: dropdown custom padrão do sistema.
- **3 toggles de notificação**: cada um alterna independentemente entre `''`/`'on'`.
- **Salvar alterações** (`save`, compartilhado pelas 3 abas): dispara o toast (reseta e re-mostra via `requestAnimationFrame` para garantir a animação de entrada mesmo se já estava visível).
- **Convidar membro** (`confirmInvite`): valida nome não vazio, adiciona ao array de membros com papel "Consultor" por padrão.
- **Remover membro**: remove do array.
- Sidebar: recolher/expandir, dropdown de perfil.

## Dados mock iniciais
Perfil: Cesar Aro / Consultor / cesar@aromcs.com. Equipe: Cesar Aro (Admin), Bruna Lima (Consultor), NX Gold — Marcos (Cliente).


## Prompts dos componentes internos

**Navegação por abas**
> Um seletor compacto de 3 abas (Perfil / Notificações / Equipe) dentro de uma trilha de fundo cinza claro com cantos arredondados — a aba ativa tem fundo branco e uma sombra suave, as inativas são apenas texto cinza sem fundo. Só o conteúdo da aba selecionada é exibido por vez.

**Formulário de perfil**
> Um card branco com um grid de campos (Nome, Cargo, E-mail — inputs de texto simples de fundo cinza claro — e Fuso horário, um dropdown customizado com opções Brasília/Manaus/UTC, mesmo padrão visual dos dropdowns do resto do sistema). Botão "Salvar alterações" alinhado à direita no rodapé do card.

**Linha de toggle de notificação**
> Uma linha horizontal com, à esquerda, o nome da notificação em negrito e uma descrição menor em cinza abaixo, e à direita um interruptor (switch) de pílula — 40px de largura, fundo cinza quando desligado e vermelho quando ligado, com uma bolinha branca que deslila de um lado para o outro suavemente. Linhas separadas por uma regra fina horizontal.

**Lista de membros da equipe**
> Um card com o título "Equipe" e um botão secundário "+ Convidar membro" no cabeçalho. Corpo: uma linha por membro — nome em destaque com e-mail em texto secundário cinza abaixo, uma pill de papel à direita (verde para "Admin", neutra para "Consultor", laranja para "Cliente") e um botão de ícone de excluir que fica vermelho no hover. Linhas separadas por regra fina.

**Toast de confirmação**
> Uma pequena etiqueta verde de pílula ("Alterações salvas com sucesso") que aparece suavemente ao lado do botão de salvar, permanece visível por cerca de 2 segundos e depois desaparece suavemente sozinha, sem precisar ser fechada manualmente.

**Modal "Convidar membro"**
> Janela modal centralizada com dois campos (Nome, E-mail) no mesmo padrão visual dos formulários do sistema, e botões "Cancelar"/"Enviar convite" no rodapé.
