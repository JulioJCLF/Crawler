---
tipo: requisito
id: REQ-025
titulo: Extrair e exibir o SKU real dos produtos no catálogo e carrinho
autora: Luiz
data: "2026-11-03"
status: implementado
categoria: funcional
etapa: E2
prioridade: must
sprint: 7
escopo: mvp
implementado_em: backend/src/crawler.ts, backend/src/config.ts, frontend/src/components/ProductCard.tsx, frontend/src/components/layout/FloatingCart.tsx, frontend/src/lib/whatsappUtils.ts
usa_ia: false
usuarios:
  - vendedor
relacionados: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-014 Oferecer contato direto e carrinho em cada card]]", "[[PM-012 Estrutura para extração e exibição do SKU real dos produtos]]"]
tags:
  - crawler/requisito
---
# Extrair e exibir o SKU real dos produtos no catálogo e carrinho

## Problema / Contexto
O identificador no fim da URL dos produtos (`...-11996.html`) é apenas uma chave de banco interna da plataforma de e-commerce da Arsenal Sports. O SKU/Referência oficial dos produtos utilizado no estoque físico e no ERP do lojista é o código exibido explicitamente como `Ref.: XXXXX` nos cards da loja. Exibir o ID de URL como Ref causava confusão comercial: quando o cliente pedia um cano de precisão pelo WhatsApp com o ID antigo, o vendedor pesquisava no sistema e encontrava uma pistola.

## História de usuário
**Como** vendedor da loja, **quero** que os cards, o carrinho e as mensagens de WhatsApp exibam a referência/SKU real do catálogo de origem, **para** localizar o produto exato no estoque e no sistema ERP instantaneamente sem risco de trocar itens.

## Comportamento esperado
1. O robô de extração lê o container do produto na listagem e extrai o código presente em `Ref.: XXXXX`, gravando-o no campo `sku` do produto.
2. O identificador `id` único (baseado na URL) continua existindo para garantir total continuidade histórica de preços e datas no `snapshot.json`.
3. Na vitrine, cada card de produto exibe o SKU real em `REF. {product.sku || product.id}`.
4. No drawer do carrinho, cada item exibe `Ref: {product.sku || product.id}`.
5. Ao clicar em "Pedir via WhatsApp" ou "Finalizar Orçamento", a mensagem gerada inclui a referência real do produto para o vendedor.
6. A busca da vitrine passa a encontrar produtos quando o cliente ou vendedor digita o número do SKU.

## Regras de negócio
- RN1: O campo `id` histórico permanece inalterado para preservar a chave primária de deduplicação e o histórico de preços de 12.000+ produtos.
- RN2: Caso um item ainda não tenha `sku` preenchido, a interface deve fazer fallback para `product.id`.
- RN3: O título do produto é limpo para não duplicar o texto `Ref.: XXXXX` no nome do produto.

## Critérios de aceite
- [x] **Dado** um card de produto com `Ref.: 329859`, **quando** o crawler processar a página, **então** o produto é salvo com `sku: "329859"` e o título limpo.
- [x] **Dado** um produto com `sku: "329859"`, **quando** renderizado no catálogo, **então** exibe `REF. 329859` e a mensagem de WhatsApp envia `Ref: 329859`.
- [x] **Dado** um produto no carrinho, **quando** visualizado na gaveta de orçamento, **então** exibe a referência real do item.
- [x] **Dado** um produto sem `sku`, **quando** renderizado, **então** utiliza o `id` como fallback seguro.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-11-03 | Criação do requisito para extração e exibição do SKU real | Antigravity | [[PM-012 Estrutura para extração e exibição do SKU real dos produtos]] |
