> **NÃO IMPLEMENTADO** — nenhuma rota ou arquivo desta spec existe no código atual (verificado 2026-08-24, sem rota de "preenchimento" em `App.tsx` nem qualquer página correspondente em `src/pages`). Este documento descreve uma tela que nunca foi construída. A única rota pública real do Portal do Cliente hoje é `/relatorio/:id` (ver `docs/portal-cliente-relatorio.md`).

# Tela: Portal do cliente — Preenchimento (onboarding)

Arquivo: `ARO-MCS Cliente (Preenchimento).dc.html`. Fluxo standalone (sem sidebar do sistema) para o CLIENTE completar dados da operação que o consultor não preencheu.

## Layout

Header simples (`.topbar`, sem sidebar): logo ARO-MCS + tag "NX Gold — Portal do cliente". Conteúdo centralizado, `max-width:760px`.

## Componentes

- **Barra de progresso** (`.prog-track`/`.prog-fill`): "4 de 8 campos" preenchido (50%).
- **Stepper de 3 etapas** (`.step-row`): "1. Dados gerais" (concluída, barra vermelha), "2. Áreas e estruturas" (ativa, barra tom claro), "3. Revisão e envio" (futura, barra cinza).
- **Card "Áreas e estruturas"**: 4 campos (`.onboard-field`), cada um com input + tag lateral indicando quem preencheu: "Preenchido por você" (neutro), "Preenchido pelo consultor" (neutro), "Pendente" ×2 (laranja, campos vazios com placeholder).
- Rodapé: botões "Salvar e continuar depois" (ghost) / "Avançar" (primário).

## Interatividade

**Esta tela é atualmente ESTÁTICA** — nenhum estado JS implementado (sem `c_dc_js`). Os inputs são editáveis pelo navegador (não controlados por React), mas os botões "Salvar e continuar depois"/"Avançar" e o stepper não têm lógica de navegação ou submissão real. Candidata a receber interatividade futura (avançar etapa, validar campos pendentes, submeter).

## Prompts dos componentes internos

**Barra de progresso + contador**

> Uma trilha horizontal fina e longa (fundo cinza claro, cantos arredondados) com um preenchimento vermelho representando a porcentagem de campos já preenchidos, acompanhada à direita de um texto pequeno cinza indicando a fração exata (ex.: "4 de 8 campos").

**Stepper de etapas**

> Três blocos de largura igual lado a lado, cada um representando uma etapa do formulário: uma barra fina colorida no topo (vermelha sólida = concluída, vermelha bem clara = etapa atual, cinza = futura) e, abaixo, o rótulo da etapa em maiúsculas pequenas cinza (ex.: "1. DADOS GERAIS").

**Campo de operação com indicador de responsável**

> Uma linha com, à esquerda, um campo de formulário completo (rótulo + input) e, à direita, uma pequena etiqueta indicando quem já preencheu aquele dado ou se ainda está pendente: "Preenchido por você" (neutra), "Preenchido pelo consultor" (neutra) ou "Pendente" (laranja, com o campo ainda vazio mostrando um placeholder de exemplo). Linhas separadas por regra fina horizontal.

**Rodapé de navegação**

> Dois botões nas extremidades opostas: "Salvar e continuar depois" (estilo secundário, à esquerda) e "Avançar" (estilo primário vermelho, à direita) — permite ao cliente sair e retomar o formulário sem perder o progresso.
