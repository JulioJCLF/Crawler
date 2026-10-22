---
tipo: requisito
id: REQ-005
titulo: Identificar cada produto e normalizar links
autora: Luiz
data: 2026-09-20
status: implementado
categoria: funcional
area: dados
prioridade: must
sprint: 1
escopo: mvp
implementado_em: 2026-09-20
usa_ia: false
relacionados: []
tags:
  - crawler/requisito
---
# Identificar cada produto e normalizar links

> [!info] Escrito a partir do que já existe
> Este requisito descreve comportamento que já está implementado. Foi escrito em 2026-09-20 para dar rastreabilidade ao que o sistema faz. Confira se corresponde ao seu entendimento antes de usá-lo como base para mudanças.

## Problema / Contexto
Sem identificador estável, o robô não sabe se o produto é novo ou já existia.

## Comportamento esperado
1. O identificador vem do número no final da URL do produto.
2. Links de produto e de imagem que vierem relativos recebem o endereço completo.
3. O nome do produto tem espaços extras removidos.
4. Qualquer menção ao nome do fornecedor original ("Arsenal Sports") é sanitizada e removida do título/descrição do produto (no início, meio ou final), preservando o nome limpo do produto e especificações técnicas para a vitrine.

## Regras de negócio
- RN1: o identificador nunca é o nome do produto.
- RN2: a remoção de "Arsenal Sports" não pode mutilar sufixos de calibre ou roscas técnicas (ex.: "14MM-").

## Critérios de aceite
- [x] **Dado** um link relativo de imagem, **quando** o produto é salvo, **então** a imagem tem endereço completo.
- [x] **Dado** dois produtos com o mesmo número na URL, **quando** processados, **então** são tratados como o mesmo produto.
- [x] **Dado** um produto com "Arsenal Sports" no título (sufixo, prefixo ou parênteses), **quando** processado, **então** o texto "Arsenal Sports" é removido e o nome do produto permanece limpo.

## Dúvidas em aberto
- [ ] Conferir se o comportamento descrito bate com o código atual.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-21 | Sanitização do nome do fornecedor (Arsenal Sports) dos títulos de produtos | Luiz | [[PM-008 Remoção do nome Arsenal Sports dos títulos e descrições dos produtos]] |
| 2026-09-20 | Requisito escrito a partir do sistema em funcionamento | Luiz | [[DEC-007 Adoção do sistema de documentação e trilhos para agentes]] |
