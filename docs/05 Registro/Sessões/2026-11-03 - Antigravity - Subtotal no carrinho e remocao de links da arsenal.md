---
tipo: sessao
data: "2026-11-03"
responsavel: Antigravity
objetivo: Implementar cálculo e exibição do Subtotal monetário no carrinho e remover todos os links para o site da Arsenal Sports
reqs:
  - REQ-014
pedidos:
  - PM-013
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Subtotal no carrinho e remoção de links da Arsenal Sports

## Resumo em linguagem simples
Adicionada a soma total dos valores dos produtos no carrinho (preço unitário multiplicado pela quantidade de cada item), exibindo claramente o Subtotal em reais tanto no drawer visual do carrinho quanto na mensagem de orçamento enviada pelo WhatsApp. Além disso, foram eliminados todos os links externos que direcionavam o cliente ou abriam páginas no site da Arsenal Sports, blindando o canal de vendas do lojista.

## O que foi feito
- Criado o Pedido de Mudança `PM-013` e atualizados `docs/05-frontend-guidelines.md` e `docs/02 Requisitos/REQ-014 Oferecer contato direto e carrinho em cada card.md`.
- No frontend:
  - `ProductCard.tsx`:
    - Removido o link `<a>` externo com ícone `ExternalLink` no título do produto. O título agora atua como botão de ação rápida para adicionar ao carrinho (`handleAddToCart`).
    - Removida menção de `Link Original` na mensagem individual gerada para WhatsApp.
  - `FloatingCart.tsx`:
    - Adicionado cálculo em tempo real do subtotal somando os itens e suas quantidades com suporte a preços em R$ formatados, preços com markup/cotação e preços fixos em BRL (`fixedBrlPrice`).
    - Adicionado bloco visual de Subtotal no rodapé do drawer, acima da seleção de vendedor.
    - Passado o subtotal formatado para o gerador de URL do WhatsApp.
  - `whatsappUtils.ts`:
    - Adicionado suporte a `subtotalFormatted` opcional, exibindo a linha `Subtotal: R$ X.XXX,XX` no orçamento final.
  - `CatalogManager.tsx`:
    - Ocultado o link externo no painel administrativo caso a URL pertença a `arsenalsports.com`.
  - Testes:
    - Adicionados testes em `whatsappUtils.test.ts` e `FloatingCart.test.tsx` cobrindo o cálculo do subtotal, a quantidade dos itens e a garantia de ausência de links apontando para o domínio da Arsenal Sports.

## Arquivos alterados
- `docs/04 Pedidos de Mudança/PM-013 Subtotal no carrinho e remoção de links para o site de origem.md`
- `docs/05-frontend-guidelines.md`
- `docs/02 Requisitos/REQ-014 Oferecer contato direto e carrinho em cada card.md`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/layout/FloatingCart.tsx`
- `frontend/src/components/layout/FloatingCart.test.tsx`
- `frontend/src/lib/whatsappUtils.ts`
- `frontend/src/lib/whatsappUtils.test.ts`
- `frontend/src/components/admin/CatalogManager.tsx`
- `docs/05 Registro/Registro de Mudanças.md`
- `docs/05 Registro/Sessões/2026-11-03 - Antigravity - Subtotal no carrinho e remocao de links da arsenal.md`

## Próximos passos
- Nenhum bloqueio. Código testado e validado por `make test` e `make typecheck`.
