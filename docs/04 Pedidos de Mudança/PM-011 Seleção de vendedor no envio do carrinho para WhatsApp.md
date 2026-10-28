---
tipo: pedido-mudanca
id: PM-011
titulo: Seleção de vendedor no envio do carrinho para WhatsApp
pedido_por: Usuário
data: "2026-10-27"
status: aprovado
urgencia: media
afeta: ["[[REQ-014 Oferecer contato direto e carrinho em cada card]]"]
decidido_por: Luiz
aplicado_em: "2026-10-27"
tags:
  - crawler/pedido
---
# Seleção de vendedor no envio do carrinho para WhatsApp

## O que precisa mudar?
1. Na configuração do site (`frontend/src/config/site.ts`), adicionar suporte a uma lista de vendedores (`whatsappSellers`) com `id`, `name` e `number`, mantendo o Vendedor 1 com o número atual (`5545999858096`) e o Vendedor 2 com um número placeholder (`5545999999999`) até que o número fixo seja definido.
2. No card de produto (`frontend/src/components/ProductCard.tsx`), fazer o botão "Pedir via WhatsApp" ter o mesmo comportamento de adicionar 1 unidade do produto ao carrinho e abrir a gaveta do carrinho, unificando o fluxo de envio.
3. No drawer do carrinho (`frontend/src/components/layout/FloatingCart.tsx`), permitir que o cliente escolha entre os vendedores configurados antes de clicar em "Finalizar Orçamento".
4. O botão de finalizar orçamento deve abrir o WhatsApp (`https://wa.me/...`) direcionado ao número do vendedor escolhido, com a lista completa de produtos e quantidades do carrinho.

## Por quê?
O atendimento comercial via WhatsApp passa a contar com dois vendedores diferentes. Permitir que o cliente escolha para qual vendedor enviar o orçamento do carrinho distribui melhor o atendimento e permite direcionar o pedido para o vendedor com quem o cliente já está negociando.

## Exemplo
- Antes:
  - Clicar em "Finalizar Orçamento" no carrinho abria sempre `https://wa.me/5545999858096?text=...` sem opção de escolha.
- Depois:
  - No rodapé do carrinho, o cliente visualiza as opções **Vendedor 1** (padrão) e **Vendedor 2**.
  - Se escolher **Vendedor 1**, o pedido vai para `5545999858096`.
  - Se escolher **Vendedor 2**, o pedido vai para o número configurado para o segundo vendedor (`5545999999999` provisoriamente).

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende [[REQ-014 Oferecer contato direto e carrinho em cada card]] e `docs/05-frontend-guidelines.md`.
- Impacto: Alteração restrita ao frontend (configuração, utilitário de URL do WhatsApp e componente `FloatingCart`), preservando integralmente os botões de conversão do card.

## Decisão
- Resultado: aprovado — aplicação imediata.
- Decidido por: Luiz — data: 2026-10-27

## O que muda no código e na documentação
| Arquivo | Mudança |
|---|---|
| `frontend/src/config/site.ts` | Adicionada interface `WhatsAppSeller` e lista `whatsappSellers` com Vendedor 1 e Vendedor 2 (placeholder) |
| `frontend/src/lib/whatsappUtils.ts` | Criada função `buildCartWhatsAppUrl` para montar o link de orçamento do carrinho por vendedor |
| `frontend/src/lib/whatsappUtils.test.ts` | Testes unitários validando o envio para Vendedor 1, Vendedor 2 e formatação da mensagem |
| `frontend/src/components/layout/FloatingCart.tsx` | Adicionado seletor de vendedor no rodapé do carrinho antes do botão de finalizar orçamento |
| `docs/02 Requisitos/REQ-014 ...` | Atualizado com a escolha de vendedor no carrinho |
| `docs/05-frontend-guidelines.md` | Documentado o seletor de vendedor no carrinho |
