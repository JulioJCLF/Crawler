---
tipo: sessao
data: 2026-10-26
responsavel: Antigravity
tags:
  - crawler/sessao
---
# 2026-10-26 — Reclassificação de speed loaders e tracers fora de BBs

## O que foi feito
Atendido o pedido do lojista (PM-009) para remover speed loaders e unidades traçadoras da categoria de munição ("BBs"):
- Identificado que o site de origem mistura dezenas de speed loaders e aparelhos de tracer na listagem `airsoft-bbs-`.
- Implementada regra de reclassificação em `enforceCategory` (`backend/src/config.ts`), encaminhando speed loaders e kits Odin M12 para a categoria `magazines` (peso 50) e unidades de tracer para `pecas-externas` (peso 50).
- Adicionadas funções `isSpeedLoader` e refinamento de `isTracerOrSilencer` em `frontend/src/lib/categoryUtils.ts`, garantindo que o filtro `#bbs` ("Munição (BBs)") da vitrine exclua speed loaders e aparelhos de tracer, enquanto `#magazines` os inclui.
- Adicionados testes unitários no backend (Vitest) e frontend (Vitest) para garantir a separação precisa de munições reais (incluindo BBs traçantes) contra ferramentas de recarga e aparelhos.
- Realizada migração in-place no `backend/snapshot.json`, reclassificando 61 speed loaders para `magazines` e 19 aparelhos traçadores para `pecas-externas`, recalculando os contadores de categoria e preservando 100% do histórico de preços e metadados dos produtos.
- Registrado o Pedido de Mudança `PM-009` e atualizados `REQ-001`, `docs/03-crawler-spec.md` e o contrato EGM de `frontend/src/lib/README.md`.

## O que mudou para quem usa
- Ao navegar na vitrine e filtrar por "Munição (BBs)", a listagem agora exibe estritamente munições e esferas BBs (incluindo esferas traçantes).
- Todos os speed loaders agora aparecem organizados na seção de "Magazines & Carregadores".
- As unidades traçadoras (como o ACETECH AT2000) aparecem em "Tracers & Silenciadores" e "Peças Externas", nunca mais poluindo a seção de munições.

## Pedidos e Decisões
- [[PM-009 Reclassificacao de speed loaders e tracers fora da categoria de BBs]]
- [[REQ-001 Monitorar as categorias do catálogo]]

## Evidências
- Testes automatizados: 41 testes no backend e 95 testes no frontend passando sem falhas.
- `make typecheck` com zero erros de tipos.
- Painéis regenerados com sucesso via `make docs`.
