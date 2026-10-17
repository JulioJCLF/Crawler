---
tipo: requisito
id: REQ-018
titulo: Avisar quando a execução diária falhar
autora: Luiz
data: 2026-09-20
status: implementado
categoria: nao-funcional
area: automacao
prioridade: must
sprint: 3
escopo: mvp
implementado_em: 2026-09-21
usa_ia: false
relacionados: ["[[REQ-009 Rodar sozinho todo dia e guardar o resultado]]", "[[PM-002 Aumentar a confiabilidade do sistema]]"]
tags:
  - crawler/requisito
---
# Avisar quando a execução diária falhar

## Problema / Contexto
O crawler roda sozinho todo dia (REQ-009), sem ninguém acompanhando em tempo real. Hoje, se a execução falhar — crawler não extrai nada, erro fatal, passo do GitHub Actions quebra — a única forma de descobrir é abrir a aba Actions do GitHub manualmente. Não existe nenhum aviso ativo. Isso é o cenário citado na Análise do PM-002: o site mudar de layout e o crawler quebrar sem ninguém notar.

O webhook (REQ-008) está desativado por decisão de Luiz em 2026-09-20 — fica pra outra hora. Então este alerta não depende dele: usa uma Issue automática no GitHub, que já faz parte da automação existente (DEC-005) e não exige nenhuma decisão de canal nova.

## História de usuário
**Como** responsável pelo Arsenal Crawler, **quero** ser avisado quando a execução diária falhar, **para** corrigir o problema antes que o catálogo fique desatualizado por muito tempo.

## Comportamento esperado
1. A execução diária roda normalmente (REQ-009).
2. Se a execução terminar com falha — crawler não extrai produtos (guarda já existente em `index.ts`) ou qualquer outro passo crítico do workflow falhar — um passo do workflow abre uma Issue no repositório avisando da falha, com link para a execução que falhou.
3. Se já existe uma Issue de falha aberta, uma nova falha atualiza a mesma Issue em vez de abrir uma duplicada.
4. Quando uma execução seguinte terminar com sucesso, a Issue de falha (se existir) é fechada automaticamente.
5. Se a execução terminar normalmente, nenhuma Issue é criada.

## Papel da IA
Não se aplica.

## Regras de negócio
- RN1: o alerta é uma Issue do GitHub, criada/atualizada por um passo do workflow (`watch.yml`) — não depende do webhook de REQ-008.
- RN2: falhas seguidas não geram Issues duplicadas — reaproveita a Issue já aberta (identificada por rótulo `alerta-execucao`, distinto do `alerta-categoria` de REQ-019).
- RN3: "execução falhou" cobre qualquer passo crítico do job (`watch.yml`) — crawler, commit e push do snapshot. O passo de aviso roda com `if: always()` no fim do job (precisa rodar tanto na falha quanto no sucesso, para poder fechar a Issue quando o job se recupera) e decide criar/atualizar/fechar/nada a partir de `${{ job.status }}`.
- RN4: o passo de Issue usa `gh` (GitHub CLI, já disponível por padrão nos runners do GitHub Actions) com `GITHUB_TOKEN`, chamado por um script (`backend/src/reportExecutionStatus.ts`) — sem action de terceiro nem dependência nova. A decisão de qual ação tomar (`decideFailureAction`) fica em `backend/src/reliability/failureAlert.ts`, separada do `gh` em si, para poder ser testada no Vitest.

## Dados envolvidos
- Nenhum dado novo persistido no snapshot. Usa o resultado da execução (sucesso/falha) do workflow do GitHub Actions.

## Critérios de aceite
- [x] **Dado** que o crawler não extraiu nenhum produto, **quando** a execução terminar, **então** uma Issue de falha é criada no repositório com link para o run. (`failureAlert.test.ts`)
- [x] **Dado** uma Issue de falha já aberta, **quando** uma nova execução falhar de novo, **então** nenhuma Issue duplicada é criada — a existente é atualizada. (`failureAlert.test.ts`)
- [x] **Dado** uma Issue de falha aberta, **quando** uma execução seguinte terminar com sucesso, **então** a Issue é fechada automaticamente. (`failureAlert.test.ts`)
- [x] **Dado** uma execução que termina normalmente e não há Issue de falha aberta, **quando** o workflow finalizar, **então** nenhuma Issue é criada. (`failureAlert.test.ts`)

## Exceções e erros
- Se o próprio passo de criar/atualizar a Issue falhar, isso não pode mascarar o código de saída de falha do workflow original.

## Fora de escopo
- Retry automático da execução falha — decisão de concorrência/retry já é regida pela regra 2 do AGENTS.md e por REQ-003, não muda aqui.
- Reativar o webhook de REQ-008 — fica pra quando Luiz decidir retomar.
- Monitoramento externo (ex.: serviço de uptime, PagerDuty) — fora do que foi pedido.

## Dúvidas em aberto
- [x] Commit/push do snapshot conta como "execução falhou"? — Decidido: sim, RN3 cobre qualquer passo do job.
- [x] Action de terceiro ou `gh cli`? — Decidido: `gh cli` direto no workflow (RN4).

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-17 | Corrigida falha no alerta quando o rótulo não existia no GitHub: criados rótulos no repositório (`alerta-execucao`, `alerta-categoria`), adicionado `ensureLabel` e fallback seguro para criação sem interromper o pipeline | Luiz | [[REQ-018 Avisar quando a execução diária falhar]] |
| 2026-09-21 | Implementado: `backend/src/reliability/failureAlert.ts` (decisão, testada) + `backend/src/reportExecutionStatus.ts` (chama `gh`) + passo novo em `watch.yml` com permissão `issues: write`. Verificado localmente o caminho de leitura (`gh issue list`) contra o repositório real; os caminhos de criar/atualizar/fechar Issue não foram testados contra o repositório real para não deixar Issue de teste — ficam cobertos pelos testes unitários da decisão | Luiz | branch `req-018-alerta-falha-execucao` |
| 2026-09-20 | Criado a partir do PM-002 | Luiz | [[PM-002 Aumentar a confiabilidade do sistema]] |
