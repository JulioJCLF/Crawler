---
tipo: pedido-mudanca
id: PM-010
titulo: Categoria dedicada para cases e maletas de transporte
pedido_por: Usuário
data: "2026-10-27"
status: aprovado
urgencia: media
afeta: ["[[REQ-001 Monitorar as categorias do catálogo]]", "[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]]"]
decidido_por: Luiz
aplicado_em: "2026-10-27"
tags:
  - crawler/pedido
---
# Categoria dedicada para cases e maletas de transporte

## O que precisa mudar?
1. Criar a categoria derivada/virtual `cases` ("Cases & Maletas") para agrupar todas as maletas rígidas, caixas de transporte estanques, cases para fuzis/pistolas e bolsas acolchoadas de transporte de armas (gun bags / rifle bags).
2. Adicionar `cases` em `VIRTUAL_CATEGORIES` em `backend/src/config.ts` com peso correspondente em `enforceCategory`, redirecionando itens de transporte de armas (excluindo estritamente caixas de gearbox, PEQ battery cases, capas de tracer e porta-carregadores).
3. Adicionar a categoria `#cases` ("Cases & Maletas") na barra de filtros da vitrine (`frontend/src/components/layout/Filters.tsx`), permitindo filtrar diretamente maletas e cases.
4. Adicionar utilitário `isCase` em `frontend/src/lib/categoryUtils.ts` e isolar o filtro `#vestuario` para não exibir cases misturados com fardas e equipamentos vestíveis.
5. Incluir `cases` nos metadados de precificação (`frontend/src/lib/pricingConfig.ts`), permitindo definir margem comercial customizada no painel administrativo `/admin`.
6. Migrar os 84 produtos identificados no `backend/snapshot.json` para `category: "cases"`, preservando 100% do histórico de preços.

## Por quê?
No site de origem, maletas rígidas e capas de rifles ficam misturadas em "Equipamento e Vestuário" (`vestuario`). Para o cliente da vitrine, encontrar uma maleta ou case de fuzil em meio a centenas de uniformes, luvas e coletes era confuso e pouco prático. Ter uma seção dedicada a Cases & Maletas facilita a compra de itens de transporte e proteção para armas.

## Exemplo
- Antes:
  - `ARMADILLO CASE 28LT FOR RIFLE ASSAULT / DMR / SNIPER` -> Categoria: `vestuario`
  - `WOSPORT RIFLE BAG DOUBLE CARBINE CASE 107CM` -> Categoria: `vestuario`
  - `G&G CASE PISTOL BLACK` -> Categoria: `vestuario`
  - `ARMADILLO CASE 02LT FOR BATTERY OR ACESSORIES` -> Categoria: `baterias`
- Depois:
  - Todos recebem Categoria: `cases` ("Cases & Maletas")
  - Aba `#cases` dedicada na vitrine
  - Não são classificados como case: `GEARBOX SHELL CASE`, `WOSPORT BATTERY CASE PEQ`, `ESHOOTER TRACER CASE`

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende REQ-001 (regras de categorização por peso e categorias derivadas), REQ-011 (filtros da vitrine) e REQ-020 (gestão de margens por categoria). Atualiza `docs/03-crawler-spec.md`.
- Impacto: Melhora a experiência de navegação comercial na vitrine, organiza o catálogo e preserva 100% do histórico de preços.

## Decisão
- Resultado: aprovado — aplicação imediata no crawler, vitrine, precificação e snapshot.
- Decidido por: Luiz — data: 2026-10-27

## O que muda no código e na documentação
| Arquivo | Mudança |
|---|---|
| `backend/src/config.ts` | Adicionado `cases` a `VIRTUAL_CATEGORIES` e regra em `enforceCategory` |
| `backend/test/crawler.test.ts` | Testes de unidade para roteamento de cases e exclusão de gearbox/battery cases |
| `frontend/src/lib/pricingConfig.ts` | Adicionado `cases` em `DEFAULT_CATEGORY_MARKUPS` e `CATALOG_CATEGORIES_METADATA` |
| `frontend/src/lib/categoryUtils.ts` | Exportada função `isCase` com regex de inclusão e exclusão de falsos positivos |
| `frontend/src/lib/categoryUtils.test.ts` | Testes unitários para `isCase` |
| `frontend/src/components/layout/Filters.tsx` | Adicionado `#cases` em `MACRO_CATEGORIES` |
| `frontend/src/app/page.tsx` | Integrado filtro `#cases` e exclusão de cases em `#vestuario` |
| `backend/snapshot.json` | Migrados 84 produtos para `cases` preservando histórico de preços |
| `docs/02 Requisitos/REQ-001 ...` | Documentada a RN4 para cases |
| `docs/03-crawler-spec.md` | Especificadas as regras de roteamento de cases |
