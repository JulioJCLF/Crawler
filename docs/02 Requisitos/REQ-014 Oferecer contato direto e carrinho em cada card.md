---
tipo: requisito
id: REQ-014
titulo: Oferecer contato direto e carrinho em cada card
autora: Luiz
data: 2026-09-20
status: implementado
categoria: funcional
area: frontend
prioridade: must
sprint: 4
escopo: mvp
implementado_em: 2026-09-20
usa_ia: false
relacionados: []
tags:
  - crawler/requisito
---
# Oferecer contato direto e carrinho em cada card

> [!info] Escrito a partir do que já existe
> Este requisito descreve comportamento que já está implementado. Foi escrito em 2026-09-20 para dar rastreabilidade ao que o sistema faz. Confira se corresponde ao seu entendimento antes de usá-lo como base para mudanças.

## Problema / Contexto
A vitrine tem fim comercial. Sem caminho de contato, ela vira catálogo morto.

## Comportamento esperado
1. Cada card tem botão "Pedir via WhatsApp" e botão "+ Carrinho".
2. Tanto o botão "Pedir via WhatsApp" quanto o botão "+ Carrinho" adicionam 1 unidade do produto ao carrinho e abrem a gaveta do carrinho para seguir o fluxo de orçamento.
3. Ao enviar o orçamento pelo carrinho, o cliente pode escolher para qual vendedor (entre os vendedores configurados em `siteConfig.whatsappSellers`) o pedido será encaminhado no WhatsApp.

## Regras de negócio
- RN1: nenhum refactor de tema ou layout pode remover esses botões do card.
- RN2: o carrinho deve pré-selecionar o primeiro vendedor configurado por padrão (Vendedor 1) e permitir alternar para o segundo vendedor antes de finalizar o orçamento.

## Critérios de aceite
- [x] **Dado** um card qualquer, **quando** for renderizado, **então** ele tem preço, botão de WhatsApp e botão de carrinho.
- [x] **Dado** um card qualquer, **quando** o cliente clicar em "Pedir via WhatsApp" ou "+ Carrinho", **então** o produto é adicionado ao carrinho com 1 unidade e a gaveta do carrinho é aberta para escolha do vendedor.
- [x] **Dado** um carrinho com produtos, **quando** o cliente escolher entre o Vendedor 1 e o Vendedor 2 no carrinho, **então** o link de finalizar orçamento deve apontar para o número de WhatsApp do vendedor selecionado com a lista completa de itens.

## Dúvidas em aberto
- [ ] Conferir se o comportamento descrito bate com o código atual.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-27 | Adicionada escolha entre 2 vendedores no envio do orçamento pelo carrinho | Antigravity | [[PM-011 Seleção de vendedor no envio do carrinho para WhatsApp]] |
| 2026-09-20 | Requisito escrito a partir do sistema em funcionamento | Luiz | [[DEC-007 Adoção do sistema de documentação e trilhos para agentes]] |
