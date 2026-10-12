---
tipo: requisito
id: REQ-022
titulo: Busca inteligente multi-termo, sugestões e filtro de preço em reais
autora: Luiz
data: 2026-10-12
status: implementado
categoria: funcional
area: frontend
prioridade: must
sprint: 5
escopo: mvp
implementado_em: frontend/src/lib/searchUtils.ts, frontend/src/app/page.tsx, frontend/src/components/layout/Filters.tsx
usa_ia: false
relacionados: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-017 Mostrar filtros ativos e permitir limpá-los de uma vez]]", "[[PM-005 Busca tolerante a erros, multi-termo, sugestões rápidas e filtro por faixa de preço]]"]
tags:
  - crawler/requisito
---
# Busca inteligente multi-termo, sugestões e filtro de preço em reais

## Problema / Contexto
Com mais de 12.000 equipamentos, encontrar itens por busca exigia digitação exata e na mesma ordem. Variações como falta de acentos, erros de digitação comuns ("glok", "hopup", "bbt") ou termos compostos em ordens diferentes ("red dot m4") retornavam zero resultados. Além disso, clientes frequentemente desejam filtrar por poder de compra (faixas de preço em reais).

## História de usuário
**Como** cliente da Hunting World, **quero** encontrar produtos digitando termos sem me preocupar com acentos ou ordem das palavras, ver sugestões rápidas dos itens mais procurados e filtrar pelo valor em reais que cabe no meu bolso, **para** comprar com agilidade sem me frustrar com buscas vazias.

## Comportamento esperado
1. O campo de busca normaliza os textos (remove acentuações como `é/e`, `ã/a`, `ç/c`) e quebra em palavras independentes: todas as palavras digitadas devem estar presentes no produto, em qualquer ordem.
2. Termos frequentes com erros comuns de grafia (ex: "glok" -> "glock", "m-4" -> "m4") são reconhecidos e mapeados.
3. A interface exibe pílulas com atalhos de buscas populares (ex: Glock, M4, Green Gas, Red Dot, BBs 0.25g, Hop-Up) que aplicam a busca com 1 clique.
4. Um seletor de faixas de preço em reais permite filtrar:
   - Até R$ 150
   - R$ 150 a R$ 500
   - R$ 500 a R$ 1.500
   - R$ 1.500 a R$ 3.000
   - Acima de R$ 3.000
5. O filtro de faixa de preço aparece no componente de filtros ativos (`ActiveFilters`) com botão para remoção individual ou limpeza global.

## Regras de negócio
- RN1: A busca não diferencia maiúsculas de minúsculas e ignora pontuações/acentos diacríticos.
- RN2: Cada palavra da busca é testada individualmente; espaços múltiplos são ignorados.
- RN3: O cálculo de preço em reais usado no filtro de orçamento utiliza o `PricingProvider` e a margem ativa da categoria.
- RN4: Se o usuário selecionar "Limpar filtros", a busca e a faixa de preço são redefinidas para o estado inicial.

## Critérios de aceite
- [x] **Dado** uma busca por "glok" ou "red dot m4", **quando** filtrados os produtos, **então** retorna itens de Glock e Red Dot M4 independentemente da ordem das palavras e com tolerância à grafia.
- [x] **Dado** termos com acentos como "ópticos" ou "munição", **quando** comparados com títulos sem acento, **então** a correspondência é positiva.
- [x] **Dado** uma faixa de preço selecionada (ex: R$ 150 a R$ 500), **quando** os produtos são exibidos, **então** apenas itens cujo valor final em BRL calculado esteja dentro desse intervalo aparecem na lista.
- [x] **Dado** o componente de filtros ativos, **quando** uma faixa de preço está selecionada, **então** um chip representativo é exibido e permite ser removido isoladamente.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-12 | Requisito criado para busca inteligente, sugestões rápidas e filtro de orçamento | Luiz | [[PM-005 Busca tolerante a erros, multi-termo, sugestões rápidas e filtro por faixa de preço]] |
| 2026-10-12 | Implementação concluída com utilitários, testes e integração na vitrine | Luiz | [[REQ-022 Busca inteligente multi-termo, sugestões e filtro de preço em reais]] |
