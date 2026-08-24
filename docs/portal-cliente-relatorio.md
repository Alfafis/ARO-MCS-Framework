# Tela: Portal do cliente — Relatório

> **Reescrito em 2026-08-24** — este doc descrevia o protótipo estático original ("tela ESTÁTICA, sem JS implementado", botão "Baixar PDF" decorativo, card "Expectativa vs. realidade" 2023-2027). Nada disso é real hoje: `src/pages/PortalClienteRelatorio.tsx` (rota pública `/relatorio/:id`, sem sidebar) busca dado real via RPC e o card de expectativa-vs-realidade foi removido de propósito por falta de modelo de dado (ver ADR "Dado não disponível: ocultar, nunca mockar" no vault) — nunca vai voltar nesse formato sem esse modelo existir.

Relatório final que o CLIENTE visualiza, sem sessão de consultor — resumo do provisionamento, custo por categoria, métricas de risco (Monte Carlo) e comparativo entre metodologias de atualização monetária.

## Portão de acesso

Nenhum dado é buscado sem passar pela RPC `obter_relatorio_publico(p_projeto_id, p_codigo)` — ela é o único caminho, valida no servidor (código de acesso OU `is_consultor()` pra sessão de consultor logada). 3 estados possíveis antes do relatório:
- **`loading`** — tela em branco, aguardando a RPC.
- **`need-code`** — sem código válido em `sessionStorage` (`aro_portal_{projetoId}`): modal de código de acesso centralizado, campo mono uppercase, erro inline se o código for rejeitado.
- **`not-found`** — RPC retorna erro "não encontrado": tela de erro simples (ícone + título + corpo).
- **`ready`** — bundle carregado (`projeto`, `cliente`, `categorias`, `simulacao`, `parametrosAnuais`), renderiza o relatório completo.

Sessão de consultor (`isAdmin`, checado via `supabase.auth.getSession()`) libera um botão extra "Gerar código de acesso" no header, que abre `CodigoAcessoModal`.

## Layout

Header fixo (`fixed top-0`, `z-50`): logo ARO-MCS + pill "{cliente} — Portal do cliente" + (se admin) botão "Gerar código de acesso" + botão "Copiar link"/"Link copiado" (`navigator.clipboard`, fallback `prompt()`) + botão "Baixar PDF" + seletor de idioma. Conteúdo `max-width:1040px` centralizado.

## Componentes

- **Cabeçalho do relatório**: título "{reportTitle} — {projeto.nome}" + pill de revisão vigente (`projeto.rev`) + subtítulo com nome do cliente e, se a simulação já rodou, iterações/distribuição do Monte Carlo.
- **3 KPI cards**: Custo médio (`simResult.mean`, ou "—" se simulação pendente), Faixa mín-máx (`simResult.p10p90` + IC95%), Base + provisão (`baseWithProvision` = soma dos pontos médios de categoria × `(1 + contingência%)`).
- **Custo por categoria + Métricas de risco** lado a lado (`CostByCategoryTable` + `RiskMetricsCard`) — mesmos componentes do `ResumoExecutivo` (aba interna do consultor), dado idêntico.
- **Métodos de atualização monetária** (`MonetaryMethodsCard`, só renderiza se `baseTotal > 0`): 4 metodologias comparadas lado a lado (simples/composto/inflação/escalonamento) — comparação pura, nenhuma é "a oficial" (ver ADR "`metodo_atualizacao` fica sem efeito" no vault).
- **NÃO existe**: card "Expectativa vs. realidade" (gráfico de barras 2023-2027) — removido, sem modelo de dado real por trás.

## Interatividade

- **Copiar link**: copia `{origin}/relatorio/{projetoId}` pro clipboard, toast "Link copiado" por 2.5s.
- **Baixar PDF** (`handleDownload`): mostra toast "Gerando PDF..." por 900ms e então chama `window.print()` — não é decorativo, mas também não é export real de PDF (usa o diálogo de impressão do navegador, `print:` classes Tailwind ajustam o layout pra impressão).
- **Gerar código de acesso** (admin): abre `CodigoAcessoModal` sobre o relatório.
- Envio de código (`handleCodeSubmit`): rechama a RPC com o código digitado; sucesso grava em `sessionStorage` (sobrevive reload, não sobrevive fechar aba/outro navegador); erro mostra mensagem inline no campo.
