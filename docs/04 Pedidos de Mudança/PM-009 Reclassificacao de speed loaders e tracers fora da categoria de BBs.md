---
tipo: pedido-mudanca
id: PM-009
titulo: Reclassificação de speed loaders e tracers fora da categoria de BBs
pedido_por: Usuário
data: "2026-10-26"
status: aprovado
urgencia: alta
afeta: ["[[REQ-001 Monitorar as categorias do catálogo]]", "[[REQ-011 Listar produtos com filtros e paginação]]"]
decidido_por: Luiz
aplicado_em: "2026-10-26"
tags:
  - crawler/pedido
---
# Reclassificação de speed loaders e tracers fora da categoria de BBs

## O que precisa mudar?
1. Remover todos os speed loaders (carregadores rápidos de magazines/BBs) e seus kits de reparo da categoria de BBs (munição), reclassificando-os para a categoria de Magazines (`magazines` / "Magazines & Carregadores").
2. Remover unidades traçadoras (Tracer Units) que estavam caindo em BBs por conterem menção a BBs no título (como o combo `ACETECH TRACER AT2000 WITH ... BBS`), reclassificando-as para Peças Externas (`pecas-externas` / "Tracers & Silenciadores" `#tracers`).
3. Ajustar a heurística de categorização do robô (`enforceCategory` em `backend/src/config.ts`) para que novos crawls não voltem a colocar speed loaders ou unidades de tracer em `bbs`.
4. Ajustar as regras de filtro da vitrine (`frontend/src/lib/categoryUtils.ts` e `frontend/src/app/page.tsx`) para que `#bbs` ("Munição (BBs)") exclua speed loaders e tracer units, garantindo que apenas munição real (incluindo BBs traçantes) apareça na seção, enquanto os speed loaders aparecem em `#magazines` e os aparelhos tracer em `#tracers`.
5. Atualizar o `snapshot.json` mantendo 100% do histórico de preços dos produtos afetados.

## Por quê?
No site de origem (Arsenal Sports), speed loaders e alguns combos com tracer unit ficam misturados na URL da listagem de BBs (`airsoft-bbs-`). Quando os clientes filtram por "Munição (BBs)" na vitrine, encontram dezenas de speed loaders e unidades de silenciador/tracer AT2000 em vez de apenas esferas/munição. Speed loaders são ferramentas para carregar magazines e pertencem à seção "Magazines & Carregadores", enquanto unidades de tracer são peças externas da arma e pertencem a "Tracers & Silenciadores".

## Exemplo
- Antes:
  - `CYMA SPEED LOADER 100R BLACK` -> Categoria: `bbs` (exibido em Munição)
  - `PTS ODIN INNOVATIONS SPEED LOADER 1600R M12 BLACK` -> Categoria: `bbs` (exibido em Munição)
  - `ACETECH TRACER AT2000 WITH S0006-CB CK043 AND BB KING BBS 0.25GR` -> Categoria: `bbs` (exibido em Munição)
  - `ACETECH TRACER AT2000 FOR GREEN BBS ONLY` -> Exibido em Munição por ter "BBS" no nome
- Depois:
  - `CYMA SPEED LOADER 100R BLACK` -> Categoria: `magazines` (exibido em Magazines & Carregadores)
  - `PTS ODIN INNOVATIONS SPEED LOADER 1600R M12 BLACK` -> Categoria: `magazines` (exibido em Magazines & Carregadores)
  - `ACETECH TRACER AT2000 WITH S0006-CB CK043 AND BB KING BBS 0.25GR` -> Categoria: `pecas-externas` (exibido em Tracers & Silenciadores)
  - `ACETECH TRACER AT2000 FOR GREEN BBS ONLY` -> Exibido estritamente em Tracers & Silenciadores / Peças Externas
  - `G&G BBS GREEN TRACER 0.20G / 2700R BOTTLE` -> Permanece em Munição (BBs traçantes)

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende REQ-001 (regras de categorização por peso e heurística) e REQ-011 (filtros da vitrine). Atualiza `docs/03-crawler-spec.md`.
- Impacto: Limpa a visualização da categoria de BBs, melhora a assertividade da busca por carregadores e tracers, preservando o histórico de preços.

## Decisão
- Resultado: aprovado — aplicação imediata no backend, frontend e snapshot.
- Decidido por: Luiz — data: 2026-10-26

## O que foi alterado
| Arquivo | Mudança |
|---|---|
| `docs/04 Pedidos de Mudança/PM-009 Reclassificacao de speed loaders e tracers fora da categoria de BBs.md` | Registro formal do pedido de mudança |
| `docs/03-crawler-spec.md` | Especificação da reclassificação de speed loaders e unidades tracer em `enforceCategory` |
| `docs/02 Requisitos/REQ-001 Monitorar as categorias do catálogo.md` | Inclusão das regras de negócio de speed loaders e tracer units |
| `backend/src/config.ts` | Regras em `enforceCategory` para speed loaders e unidades tracer |
| `backend/test/crawler.test.ts` | Testes automatizados para reclassificação de speed loaders e tracers |
| `frontend/src/lib/categoryUtils.ts` | Criação de `isSpeedLoader`, aprimoramento de `isTracerOrSilencer` e atualização de `isMagazine` |
| `frontend/src/lib/categoryUtils.test.ts` | Testes para `isSpeedLoader`, `isTracerOrSilencer` e `isMagazine` |
| `frontend/src/app/page.tsx` | Ajuste em `matchesCategory` para `#bbs` e `#magazines` |
| `backend/snapshot.json` | Migração in-place dos produtos afetados preservando preços e histórico |
