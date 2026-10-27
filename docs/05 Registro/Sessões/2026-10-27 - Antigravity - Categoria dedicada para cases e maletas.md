---
tipo: sessao
data: 2026-10-27
responsavel: Antigravity
tags:
  - crawler/sessao
---
# 2026-10-27 — Categoria dedicada para cases e maletas

## O que foi feito
- Atendido o pedido do lojista (PM-010) para criar uma categoria própria para cases, maletas e capas de armas:
  - Adicionada a categoria derivada `cases` ("Cases & Maletas") a `VIRTUAL_CATEGORIES` em `backend/src/config.ts`.
  - Configurada heurística em `enforceCategory` com prioridade para maletas rígidas, cases estanques, cases de rifle/pistola e gun bags de transporte acolchoadas, excluindo carcaças mecânicas de gearbox e caixas PEQ de bateria.
  - Criado e exportado utilitário `isCase` em `frontend/src/lib/categoryUtils.ts`.
  - Adicionado o botão de filtro `#cases` ("Cases & Maletas") na barra de categorias da vitrine (`frontend/src/components/layout/Filters.tsx`), e isolada a categoria `#vestuario` para não exibir cases misturados com vestuário.
  - Adicionada a categoria `cases` nos metadados de precificação (`frontend/src/lib/pricingConfig.ts`), permitindo configurar margens personalizadas de lucro no painel `/admin`.
  - Migrados 84 produtos no `backend/snapshot.json` para a nova categoria `cases`, recalculando os totais e preservando 100% do histórico de preços.
  - Registrado o Pedido de Mudança `PM-010`, atualizados `REQ-001`, `docs/03-crawler-spec.md` e o contrato EGM em `frontend/src/lib/README.md`.

## O que mudou para quem usa
- A vitrine agora conta com a categoria dedicada **Cases & Maletas** (`#cases`), facilitando a localização de maletas rígidas, cases de fuzis e pistolas e capas de armas.
- A categoria de **Vestuário Tático** ficou limpa, exibindo apenas fardas, coletes, luvas e acessórios de vestir.
- O painel `/admin` agora permite definir cotação e margem específicas para Cases & Maletas.

## Evidências
- Testes unitários no backend: 43 testes aprovados (`make test`).
- Testes unitários no frontend: 97 testes aprovados (`cd frontend && npm test`).
- Checagem estática de tipos: 0 erros (`make typecheck`).
- Compilação do Next.js aprovada (`npm run build`).
- Painéis regenerados via `make docs`.
