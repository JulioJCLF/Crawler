---
tipo: sessao
data: "2026-11-05"
responsavel: Antigravity
objetivo: Criar página de detalhes do equipamento (/produto/[id]) na vitrine e extração de descrição, especificações técnicas e galeria de fotos no crawler
reqs:
  - REQ-026
pedidos:
  - PM-014
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Página de detalhes do equipamento e extração de descrição e especificações no crawler

## Resumo em linguagem simples
Agora cada equipamento da vitrine tem sua própria página dedicada (`/produto/[id]`) ao clicar na imagem ou no nome do produto. O crawler foi atualizado para extrair a descrição completa, a tabela de especificações técnicas (SKU, Código Fabricante, Marca, Comprimento, Peso, Capacidade do Magazine, Modo de Disparo, Calibre, Hop-Up, Material) e todas as fotos de alta resolução da galeria do produto, limpando qualquer menção a "Arsenal Sports". Além do enriquecimento incremental no crawler, a API `/api/products/[id]` busca e faz cache automático sob demanda para que todos os 12.303 itens funcionem imediatamente em tempo real.

## O que foi feito
- Criado o extrator `extractProductDetails` em `backend/src/crawler.ts` e o lote de enriquecimento incremental (`MAX_DETAIL_PAGES`, padrão 50 por execução), preservando os limites de concorrência do site de origem.
- Atualizado `applyChangeTracking` em `backend/src/history.ts` para preservar `description`, `specs` e `images` no `snapshot.json` entre execuções.
- Criado `frontend/src/lib/productDetailsService.ts` e o endpoint `frontend/src/app/api/products/[id]/route.ts` com extração sob demanda e cache persistente (`product-details-cache.json`).
- Criada a página do equipamento `frontend/src/app/produto/[id]/page.tsx` com galeria de fotos interativa, preço em reais calculado com a margem da categoria, botões comerciais obrigatórios (`Pedir via WhatsApp` e `+ Carrinho`), descrição formatada e tabela responsiva de especificações técnicas.
- Atualizado `frontend/src/components/ProductCard.tsx` para navegar até `/produto/[id]` ao clicar na foto ou no título.
- Enriquecidos os equipamentos da linha MCX / APFG em `backend/snapshot.json` e criados testes unitários no backend e no frontend.

## Arquivos alterados
- `backend/src/types.ts`
- `backend/src/crawler.ts`
- `backend/src/history.ts`
- `backend/src/index.ts`
- `backend/src/README.md`
- `backend/test/crawler.test.ts`
- `backend/snapshot.json`
- `frontend/src/types/index.ts`
- `frontend/src/lib/productDetailsService.ts`
- `frontend/src/lib/productDetailsService.test.ts`
- `frontend/src/lib/README.md`
- `frontend/src/app/api/products/[id]/route.ts`
- `frontend/src/app/produto/[id]/page.tsx`
- `frontend/src/app/README.md`
- `frontend/src/components/ProductCard.tsx`
- `docs/02-data-model.md`
- `docs/03-crawler-spec.md`
- `docs/05-frontend-guidelines.md`
- `docs/02 Requisitos/REQ-026 Extrair e exibir página de detalhes do equipamento com descrição, especificações e galeria.md`
- `docs/04 Pedidos de Mudança/PM-014 Página de detalhes do equipamento com descrição, especificações e galeria extraídas pelo crawler.md`
