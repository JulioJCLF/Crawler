---
tipo: sessao
data: "2026-11-03"
responsavel: Antigravity
objetivo: Criar estrutura para extrair e exibir o SKU/Referência oficial dos produtos nos cards, carrinho e WhatsApp
reqs:
  - REQ-025
pedidos:
  - PM-012
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Estrutura de extração e exibição do SKU real dos produtos

## Resumo em linguagem simples
Corrigido o problema em que a referência exibida no card do produto era apenas o identificador numérico interno da URL da Arsenal Sports (ex: `11996`), que no sistema/ERP do lojista apontava para um item incorreto (uma pistola em vez de um cano de precisão). Agora, o robô extrai o código oficial do produto (`Ref.: XXXXX`), armazenando-o no novo campo `sku`. O catálogo, a busca, o carrinho e as mensagens de WhatsApp passam a utilizar essa referência real, com fallback seguro para o `id` caso algum item ainda não possua o SKU preenchido.

## O que foi feito
- Criado o Pedido de Mudança `PM-012` e o Requisito `REQ-025`.
- Atualizadas as especificações técnicas `docs/03-crawler-spec.md` e `docs/02-data-model.md`.
- No backend:
  - Adicionado campo `sku?: string` na interface `Product` (`types.ts`).
  - Adicionada função `extractSku` e limpeza de prefixos `Ref.:` em `config.ts`.
  - Atualizado `crawler.ts` para extrair o `sku` do container do produto na listagem e alimentar o mapa de produtos.
  - Atualizado `history.ts` para preservar o `sku` entre execuções sucessivas do crawler.
  - Adicionados testes de unidade para extração de SKU e sanitização de títulos em `crawler.test.ts`.
- No frontend:
  - Adicionado campo `sku?: string` nos tipos de `Product` e `CustomProductInput`.
  - Atualizado `ProductCard.tsx` para exibir `REF. {product.sku || product.id}` e enviar a referência real no link do WhatsApp.
  - Atualizado `FloatingCart.tsx` e `whatsappUtils.ts` para exibir e enviar a referência real nos orçamentos com múltiplos itens.
  - Atualizado o buscador em `page.tsx` para permitir pesquisar produtos diretamente pelo SKU.
  - Atualizado o `/admin` (`CatalogManager.tsx` e `catalogService.ts`) para suporte a SKU.
  - Adicionados testes unitários e de componente em `FloatingCart.test.tsx` e `whatsappUtils.test.ts`.

## Arquivos alterados
- `backend/src/types.ts`
- `backend/src/config.ts`
- `backend/src/crawler.ts`
- `backend/src/history.ts`
- `backend/test/crawler.test.ts`
- `frontend/src/types/index.ts`
- `frontend/src/lib/cleanUtils.ts`
- `frontend/src/lib/whatsappUtils.ts`
- `frontend/src/lib/whatsappUtils.test.ts`
- `frontend/src/lib/catalogService.ts`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/layout/FloatingCart.tsx`
- `frontend/src/components/layout/FloatingCart.test.tsx`
- `frontend/src/components/admin/CatalogManager.tsx`
- `frontend/src/app/page.tsx`
- `docs/03-crawler-spec.md`
- `docs/02-data-model.md`
- `docs/02 Requisitos/REQ-025 Extrair e exibir o SKU real dos produtos no catálogo e carrinho.md`
- `docs/04 Pedidos de Mudança/PM-012 Estrutura para extração e exibição do SKU real dos produtos.md`
- `docs/05 Registro/Registro de Mudanças.md`

## Critérios de aceite cobertos
- [x] **REQ-025**: extração e suporte a `sku` em backend e frontend, com testes cobrindo parsing, exibição no card, carrinho, WhatsApp e fallback para `id`.
