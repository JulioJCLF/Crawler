---
tipo: pedido-mudanca
id: PM-013
titulo: Subtotal no carrinho e remoção de links para o site de origem
pedido_por: Usuário
data: "2026-11-03"
status: aprovado
urgencia: alta
afeta: ["[[REQ-014 Oferecer contato direto e carrinho em cada card]]", "[[05-frontend-guidelines]]"]
decidido_por: Luiz
aplicado_em: "2026-11-03"
tags:
  - crawler/pedido
---
# Subtotal no carrinho e remoção de links para o site de origem

## O que precisa mudar?
1. No drawer do carrinho (`frontend/src/components/layout/FloatingCart.tsx`), calcular e exibir o **Subtotal** com a soma de todos os produtos multiplicados por suas respectivas quantidades.
2. No gerador de link do WhatsApp (`frontend/src/lib/whatsappUtils.ts`), incluir o valor do Subtotal na mensagem final enviada ao vendedor.
3. No card de produto (`frontend/src/components/ProductCard.tsx`), remover qualquer link que aponte para o site da Arsenal Sports (tanto o link no título com ícone `ExternalLink` quanto o texto `Link Original: ...` na mensagem de WhatsApp), garantindo que a vitrine funcione como uma loja autônoma sem vazar o fornecedor.
4. No título do produto em `ProductCard.tsx`, permitir que o clique adicione o item ao carrinho / abra o drawer, unificando a interação comercial.

## Por quê?
1. **Transparência de valores no carrinho**: O cliente precisa visualizar a soma total do pedido antes de finalizar o orçamento no WhatsApp.
2. **Proteção da marca e do canal de vendas**: A vitrine da Hunting World tem proposta comercial própria. Links apontando diretamente para o site do fornecedor ou mensagens de WhatsApp com o "Link Original" expõem a origem do produto, quebrando o modelo comercial do lojista.

## Exemplo
- **Antes**:
  - O carrinho mostrava apenas o contador de itens (`Finalizar Orçamento (3)`), sem valor monetário total.
  - O título do produto no card abria `https://www.arsenalsports.com/produto/...`.
  - A mensagem do WhatsApp continha `Link Original: https://www.arsenalsports.com/produto/...`.
- **Depois**:
  - O carrinho exibe claramente `Subtotal (3 itens): R$ 3.485,00`.
  - A mensagem do WhatsApp inclui a linha `Subtotal: R$ 3.485,00`.
  - Nenhum link externo para o fornecedor é renderizado na vitrine nem enviado no WhatsApp.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende [[REQ-014 Oferecer contato direto e carrinho em cada card]] e atualiza `docs/05-frontend-guidelines.md`.
- Impacto: Puramente de frontend/UX e utilitário de WhatsApp, 100% retrocompatível com a lógica de preços existente.

## Decisão
- Resultado: aprovado — aplicação imediata.
- Decidido por: Luiz — data: 2026-11-03

## O que muda no código e na documentação
| Arquivo | Mudança |
|---|---|
| `frontend/src/components/ProductCard.tsx` | Removido link externo para o fornecedor no título e linha de link original da mensagem de WhatsApp |
| `frontend/src/components/layout/FloatingCart.tsx` | Adicionado cálculo e exibição de Subtotal monetário somando quantidade * preço |
| `frontend/src/lib/whatsappUtils.ts` | Adicionado parâmetro opcional de subtotal na montagem da mensagem de WhatsApp |
| `frontend/src/components/admin/CatalogManager.tsx` | Ocultado link externo quando aponta para o site de origem |
| `docs/05-frontend-guidelines.md` | Documentada a proibição de links para a origem e obrigatoriedade do subtotal no carrinho |
| `docs/02 Requisitos/REQ-014 ...` | Adicionado critério de aceite para o subtotal do carrinho |
