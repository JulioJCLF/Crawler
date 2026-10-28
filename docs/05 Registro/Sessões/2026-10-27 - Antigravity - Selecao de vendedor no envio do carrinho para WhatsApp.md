---
tipo: sessao
data: "2026-10-27"
responsavel: Antigravity
objetivo: Permitir escolher entre 2 vendedores ao enviar o orçamento do carrinho pelo WhatsApp
reqs:
  - REQ-014
pedidos:
  - PM-011
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Seleção de vendedor no envio do carrinho para WhatsApp

## Resumo em linguagem simples
Agora, quando o cliente abre o carrinho para enviar o pedido pelo WhatsApp, ele pode escolher para qual vendedor deseja mandar o orçamento: **Vendedor 1** (com o número atual `+55 45 99985-8096` pré-selecionado por padrão) ou **Vendedor 2** (configurado com o número placeholder `5545999999999` até que o número fixo seja definido).

## O que foi feito
- Criado o Pedido de Mudança `PM-011` e atualizado o `REQ-014` e `docs/05-frontend-guidelines.md`.
- Adicionada a lista `whatsappSellers` em `frontend/src/config/site.ts` com Vendedor 1 (`5545999858096`) e Vendedor 2 (`5545999999999`).
- Criado o utilitário `buildCartWhatsAppUrl` em `frontend/src/lib/whatsappUtils.ts` para montar o link de orçamento do carrinho para o vendedor escolhido.
- Atualizado o `ProductCard.tsx` para que o botão **Pedir via WhatsApp** adicione 1 unidade do produto ao carrinho e abra a gaveta lateral, unificando o fluxo de escolha do vendedor.
- Atualizado o componente `FloatingCart.tsx` com seletor de vendedor no rodapé do carrinho, logo acima do botão **Finalizar Orçamento**.
- Adicionados testes automatizados de unidade (`whatsappUtils.test.ts`) e de componente (`FloatingCart.test.tsx`).

## Arquivos alterados
- `frontend/src/config/site.ts`
- `frontend/src/config/README.md`
- `frontend/src/lib/whatsappUtils.ts`
- `frontend/src/lib/whatsappUtils.test.ts`
- `frontend/src/lib/README.md`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/layout/FloatingCart.tsx`
- `frontend/src/components/layout/FloatingCart.test.tsx`
- `docs/02 Requisitos/REQ-014 Oferecer contato direto e carrinho em cada card.md`
- `docs/04 Pedidos de Mudança/PM-011 Seleção de vendedor no envio do carrinho para WhatsApp.md`
- `docs/05-frontend-guidelines.md`

## Critérios de aceite cobertos
- [x] **REQ-014**: escolha entre Vendedor 1 e Vendedor 2 no envio do orçamento pelo carrinho validada por testes automatizados (`whatsappUtils.test.ts` e `FloatingCart.test.tsx`).

## Pendências e dúvidas
- Substituir o número placeholder do Vendedor 2 (`5545999999999`) em `frontend/src/config/site.ts` assim que o número fixo definitivo estiver disponível.
