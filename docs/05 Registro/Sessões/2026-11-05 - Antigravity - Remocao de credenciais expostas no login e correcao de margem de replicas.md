---
tipo: sessao
data: "2026-11-05"
responsavel: Antigravity
objetivo: Remover credenciais expostas na tela de login administrativo e corrigir classificação de 218 réplicas (incluindo VFC APFG MCX) que recebiam margem de peças (48%) em vez de réplicas (60%)
reqs:
  - REQ-001
  - REQ-024
pedidos: []
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Remoção de credenciais expostas no login e correção de margem de réplicas

## Resumo em linguagem simples
Removido o bloco "Credenciais de Acesso" (e dicas de usuários) da tela pública `/admin/login` que exibia as senhas de administração. Corrigida também a regra de categorização para que 218 armas completas (como todas as VFC APFG GBBR MCX, AEGs com menção a gearbox no título e snipers spring) permaneçam na categoria `replicas` e recebam a porcentagem correta de **60%** em vez de **48%** (peças), preservando 100% do histórico de preços.

## O que foi feito
- Removido o bloco visual de credenciais e dicas de nomes de usuário (`admin` / `cambio`) em `frontend/src/app/admin/login/page.tsx`.
- Criado o identificador `isCompleteReplicaGun` em `backend/src/config.ts` e `frontend/src/lib/categoryUtils.ts` para reconhecer armas completas mesmo quando o título termina com a cor (`AIRSOFT RIFLE BLACK`, `TAN`, `DUAL TONE`) ou cita especificações técnicas (`HANDGUARD`, `WITH GEARBOX`, `SPRING SNIPER`, `WITH MAGAZINE`).
- Atualizado `backend/src/crawler.ts` para sincronizar `categoryLabel` com a categoria resolvida por `enforceCategory`.
- Atualizado `buildUnifiedSnapshot` e `getAdminCatalog` em `frontend/src/lib/catalogService.ts` para corrigir automaticamente em memória réplicas completas vindas de cache anterior.
- Reclassificadas as 218 armas completas em `backend/snapshot.json` para `category: "replicas"` e `categoryLabel: "Réplicas"`, preservando integralmente o histórico de preços.
- Adicionados testes unitários no backend (`backend/test/crawler.test.ts`) e no frontend (`frontend/src/lib/catalogService.test.ts`).

## Arquivos alterados
- `frontend/src/app/admin/login/page.tsx`
- `frontend/src/lib/categoryUtils.ts`
- `frontend/src/lib/catalogService.ts`
- `frontend/src/lib/catalogService.test.ts`
- `frontend/src/lib/README.md`
- `backend/src/config.ts`
- `backend/src/crawler.ts`
- `backend/src/README.md`
- `backend/test/crawler.test.ts`
- `backend/snapshot.json`
- `docs/03-crawler-spec.md`
- `docs/02 Requisitos/REQ-001 Monitorar as categorias do catálogo.md`
- `docs/02 Requisitos/REQ-024 Controle de acesso por perfis e recuperação de senha por e-mail.md`
