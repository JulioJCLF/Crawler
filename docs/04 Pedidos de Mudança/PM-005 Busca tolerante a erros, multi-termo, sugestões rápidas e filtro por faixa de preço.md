---
tipo: pedido-mudanca
id: PM-005
titulo: Busca tolerante a erros, multi-termo, sugestões rápidas e filtro por faixa de preço
pedido_por: Luiz
data: "2026-10-12"
status: aplicado
urgencia: alta
afeta: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-017 Mostrar filtros ativos e permitir limpá-los de uma vez]]"]
decidido_por: Luiz
aplicado_em: "2026-10-12"
tags:
  - crawler/pedido
---
# Busca tolerante a erros, multi-termo, sugestões rápidas e filtro por faixa de preço

## O que precisa mudar?
1. Tornar o motor de busca da vitrine tolerante a acentuação, caracteres especiais e termos fora de ordem (busca multi-palavra inteligente com suporte a variantes comuns como "glok" -> "glock").
2. Adicionar pílulas de sugestões de busca rápida com os termos mais procurados do airsoft/tático (ex: Glock, M4, Green Gas, BBs 0.25g, Red Dot, Hop-Up, etc.).
3. Adicionar filtro visual por faixa de preço em reais (orçamento), permitindo filtrar produtos por limites como até R$ 100, R$ 100 a R$ 500, R$ 500 a R$ 1.500, R$ 1.500 a R$ 3.000 e acima de R$ 3.000.
4. Adicionar debounce de digitação e contador instantâneo de resultados encontrados com mensagens amigáveis.

## Por quê?
Atualmente, se o cliente digita um termo com ou sem acento diferente do título ou digita com uma letra trocada ou palavras em ordem invertida, a busca retorna zero produtos mesmo havendo estoque. Além disso, muitos compradores navegam com um limite de orçamento definido e precisam filtrar por valor em reais.

## Exemplo
O usuário busca "red dot m4" ou "glok": o sistema acha todos os itens relevantes mesmo que o título esteja "M4 Red Dot Sight" ou que "glock" tenha sido digitado sem o c. Ao mesmo tempo, ele pode clicar em "R$ 100 a R$ 500" para ver apenas opções que cabem no bolso dele.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende REQ-011 e REQ-017.
- Impacto: Melhora drástica na taxa de conversão e na usabilidade sem quebrar nenhum teste existente.

## Decisão
- Resultado: aprovado — implementação via REQ-022.
- Decidido por: Luiz — data: 2026-10-12

## O que foi alterado
| Arquivo | Mudança |
|---|---|
| `docs/02 Requisitos/REQ-022 Busca inteligente multi-termo, sugestões e filtro de preço em reais.md` | Requisito funcional e critérios de aceite |
| `frontend/src/lib/searchUtils.ts` | Motor de busca normalizada, multi-termo e fuzzy matching de variantes |
| `frontend/src/lib/searchUtils.test.ts` | Testes unitários para o motor de busca inteligente |
| `frontend/src/lib/activeFilters.ts` | Suporte ao filtro de faixa de preço nos chips ativos |
| `frontend/src/components/layout/Filters.tsx` | UI com pílulas de busca rápida e seletor de faixa de preço em reais |
| `frontend/src/app/page.tsx` | Integração do filtro de preço dinâmico e busca inteligente |
