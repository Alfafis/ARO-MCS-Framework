# Sidebar — ARO-MCS

Componente de navegação lateral presente em todas as telas internas do sistema (Dashboard, Categorias de custo, Simulação, Lançamentos, Revisões, Clientes, Configurações, Ajuda). Estrutura EXATA a reaproveitar em toda tela nova.

## Estrutura DOM

```html
<div class="appgrid" style="grid-template-columns:{{ sidebarWidth }} 1fr">
  <aside class="bsidebar">
    <div class="bsidebar-topline">…logo…</div>
    <button class="bsidebar-toggle">…chevron duplo…</button>
    <div class="bsidebar-scroll">
      …6 links de navegação…
    </div>
    <div style="position:relative;flex:none;padding:8px 0 20px">
      …cartão de perfil + dropdown…
    </div>
  </aside>
  <div class="app-main">…conteúdo da página…</div>
</div>
```

**Atenção crítica**: a div do cartão de perfil deve ficar FORA de `.bsidebar-scroll` — se ficar dentro, ela herda o `overflow-y:auto` e rola junto com os links de navegação em vez de ficar fixa na base da sidebar. Esse foi um bug real encontrado e corrigido no Dashboard.

## Largura e recolhimento

- `.appgrid { display:grid; grid-template-columns: {{ sidebarWidth }} 1fr; height:100vh; transition: grid-template-columns var(--dur) ease }`
- `sidebarWidth`: `'228px'` expandida, `'76px'` recolhida — controlado por `state.collapsed`.
- `.bsidebar { position:relative; height:100vh; padding:20px 14px 0; display:flex; flex-direction:column; gap:4px; background:var(--c-card) }` — fundo branco (`--c-card`) contra o bg bege (`--c-bg`) da página.
- Botão de recolher (`.bsidebar-toggle`): círculo 26×26px, `position:absolute; top:20px; right:-13px` (sobre a borda direita da sidebar, meio para fora), fundo `--c-card`, borda `--c-line`, `box-shadow: var(--shadow-1)` em repouso e `var(--shadow-2)` no hover. Ícone: chevron duplo (`<<`) que gira 180° via `transform` com `transition: transform 200ms ease`.
- Logo/marca (`.bsidebar-topline`): ícone 18px (losango/octaedro) + texto "ARO-MCS" — o texto desaparece (`sc-if` com `showLabel`) quando recolhida, e o container centraliza (`justify-content: center`) nesse estado.

## Links de navegação

`.bsidebar-scroll { flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:4px }` — cresce para ocupar o espaço disponível e rola independentemente se a lista crescer.

Ordem fixa dos 6 itens (sempre os mesmos, em todas as telas):
1. Visão geral → `ARO-MCS Dashboard (Full).dc.html`
2. Categorias de custo → `ARO-MCS Projeto (Cadastro).dc.html`
3. Simulação → `ARO-MCS Simulacao.dc.html`
4. Lançamentos → `ARO-MCS Lancamentos.dc.html`
5. Revisões → `ARO-MCS Revisoes.dc.html`
6. Clientes → `ARO-MCS Clientes.dc.html`

Cada link (`.bsidebar-link`): ícone Lucide 14px dentro de um chip `.ico` (28×28px, radius 9px, fundo `#f0eeec`) + label de texto (escondido quando recolhida, `title` no `<a>` serve de tooltip nesse estado).
- **Ativo** (`.bsidebar-link.active`): o chip `.ico` fica com fundo `var(--accent)` e ícone branco + `box-shadow: var(--shadow-1)` — a linha inteira NÃO muda de fundo, só o chip do ícone.
- **Hover** (não ativo): chip `.ico` vai para `#e7e4e1`, texto para `var(--c-text)`.

Configurações e Ajuda existem como telas (`ARO-MCS Configuracoes.dc.html`, `ARO-MCS Ajuda.dc.html`) mas foram removidas da lista de navegação por decisão do usuário — acessíveis só via link direto ou pelo item "Configurações" dentro do dropdown de perfil.

## Cartão de perfil (rodapé fixo)

Container: `flex:none; padding:8px 0 20px` (fora do scroll, colado na base real da sidebar).

`.bsidebar-foot`: avatar circular 26px (iniciais "CA", fundo `--accent-100`, texto `--accent-700`) + nome "Cesar Aro" + cargo "Consultor" (escondidos quando recolhida) + ícone "···" de menu. Fundo `#f6f5f3`, radius 14px, hover `#efece9`. Clicável — abre/fecha o dropdown de perfil.

### Interatividade
- `state.profileOpen` (boolean) — toggla ao clicar no cartão.
- Dropdown (`profileMenuStyle`) ancorado ACIMA do cartão: `position:absolute; bottom:calc(100% + 8px); left:0; right:0`, fundo `--c-card`, radius 14px, `box-shadow: var(--shadow-2)`, padding 6px.
- Animação de abrir/fechar: **nunca desmontado via `sc-if`** — sempre presente no DOM, controlado por `opacity` (0→1) + `transform: translateY(6px) scale(0.96)` → `translateY(0) scale(1)`, `transition: opacity 160ms ease, transform 160ms ease`, `pointerEvents: 'none'` quando fechado (evita cliques fantasmas).
- Itens do menu (`.profile-menu-item`, hover `#f0eeec`): "Meu perfil" (sem link real), "Configurações" (link para `ARO-MCS Configuracoes.dc.html`), divisor fino, "Sair" (cor `--accent-700`, ícone de logout).

## Prompt do componente — Logo/marca (\`.bsidebar-topline\`)

Bloco fixo no topo da sidebar, primeira coisa vista ao carregar qualquer tela do sistema.

> Construa o cabeçalho de marca da sidebar de um app interno B2B (fundo branco `--c-card` sobre página bege `--c-bg`). Elemento único, alinhado à esquerda quando a sidebar está expandida e centralizado quando recolhida (\`justify-content\` alterna entre \`flex-start\`/\`center\`). Contém: (1) um ícone de 18×18px em SVG outline (Lucide, stroke-width 2, sem fill) representando um poliedro/octaedro simples — 3 paths formando um losango com duas linhas de "faces" internas, remetendo a mineração/geologia sem ser literal; (2) o texto "ARO-MCS" logo ao lado, peso 700, tamanho 16px, cor \`--c-text\`, \`letter-spacing:-0.02em\`, gap de 9px entre ícone e texto. O texto desaparece quando a sidebar está recolhida (76px), deixando só o ícone centralizado — nunca truncar ou quebrar linha, é sempre uma palavra só, sem link (não é clicável, é identidade estática, não navega para lugar nenhum). Padding do container: 8px 4px 20px 10px (respiro maior abaixo, separando do primeiro item de navegação).

## Estado (lógica JS)

```js
state = { collapsed: false, profileOpen: false };
// renderVals() expõe: sidebarWidth, showLabel, brandJustify, chevronStyle,
// toggle (fn), profileOpen, toggleProfile (fn), profileMenuStyle (objeto de estilo)
```
