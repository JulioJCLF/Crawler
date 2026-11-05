---
tipo: requisito
id: REQ-026
titulo: Extrair e exibir página de detalhes do equipamento com descrição, especificações e galeria
autora: Luiz
data: "2026-11-05"
status: implementado
categoria: funcional
etapa: E3
prioridade: must
sprint: 7
escopo: mvp
implementado_em: backend/src/crawler.ts, backend/src/history.ts, backend/src/types.ts, frontend/src/lib/productDetailsService.ts, frontend/src/app/api/products/[id]/route.ts, frontend/src/app/produto/[id]/page.tsx, frontend/src/components/ProductCard.tsx
usa_ia: false
usuarios:
  - comprador
  - vendedor
relacionados: ["[[REQ-001 Monitorar as categorias do catálogo]]", "[[REQ-003 Respeitar os limites do site de origem]]", "[[REQ-014 Oferecer contato direto e carrinho em cada card]]", "[[PM-014 Página de detalhes do equipamento com descrição, especificações e galeria extraídas pelo crawler]]"]
tags:
  - crawler/requisito
---
# Extrair e exibir página de detalhes do equipamento com descrição, especificações e galeria

## Problema / Contexto
Compradores de airsoft precisam verificar ficha técnica (comprimento, peso, capacidade do magazine, modo de disparo, hop-up, material, itens inclusos) e fotos de múltiplos ângulos antes de enviar o orçamento pelo WhatsApp. Até então, o crawler coletava apenas os dados presentes nos cards das listagens de categoria (nome, preço, SKU e 1 foto miniatura), e a vitrine não possuía página interna de detalhes do equipamento.

## História de usuário
**Como** comprador ou vendedor da loja, **quero** abrir a página de um equipamento na vitrine e visualizar sua descrição completa, tabela de especificações técnicas e galeria de fotos replicadas do crawler, **para** conferir todos os detalhes técnicos do produto e adicioná-lo ao orçamento com segurança.

## Comportamento esperado
1. O crawler possui um extrator de detalhes (`extractProductDetails`) capaz de ler a página individual do produto (`/produto/...-<id>.html`) e extrair:
   - `description`: texto estruturado da aba `#product-tab-description`, limpo de menções a `"Arsenal Sports"` ou URLs do fornecedor.
   - `specs`: mapa chave-valor extraído das linhas (`<th>`/`<td>`) da tabela em `#product-tab-additional`.
   - `images`: lista de URLs absolutas das imagens de alta resolução da galeria (`figure.product-image`).
   - `sku`: caso a listagem não tenha fornecido o SKU, preenche a partir da linha `SKU` da tabela de especificações.
2. Durante a execução do crawler (`runCrawler`), os produtos que ainda não possuem `description`/`specs` são enriquecidos em lotes limitados por execução (`MAX_DETAIL_PAGES`, padrão `50`), respeitando a concorrência máxima de 10 requisições e preservando os detalhes já salvos no `snapshot.json` via `applyChangeTracking`.
3. No servidor da vitrine (`GET /api/products/[id]`), ao consultar um produto que ainda não tenha `description`/`specs` no `snapshot.json`, o serviço busca e extrai os detalhes sob demanda a partir da URL do produto e armazena o resultado em cache persistente (`product-details-cache.json`), garantindo cobertura imediata para 100% do catálogo.
4. Na vitrine, clicar na imagem ou no título de qualquer `ProductCard` navega para `/produto/[id]`.
5. A página `/produto/[id]` exibe:
   - Galeria de imagens com foto principal em destaque e miniaturas clicáveis.
   - Nome limpo do equipamento, referência (`REF.`), categoria e preço em reais (`R$`) com a margem da categoria aplicada.
   - Botões comerciais obrigatórios (`Pedir via WhatsApp` e `+ Carrinho`).
   - Seção de descrição detalhada e tabela responsiva de especificações técnicas.

## Regras de negócio
- RN1: Nenhuma referência textual a `"Arsenal Sports"` ou link para `arsenalsports.com` pode aparecer na descrição ou especificações exibidas ao usuário.
- RN2: O histórico de preços (`priceHistory`), `firstSeen` e detalhes já extraídos (`description`, `specs`, `images`) no `snapshot.json` são sempre preservados entre execuções do crawler.
- RN3: Os botões comerciais (`Pedir via WhatsApp` e `+ Carrinho`) são obrigatórios tanto no card da listagem quanto na página do equipamento.

## Critérios de aceite
- [x] **Dado** o HTML de uma página de produto do site de origem, **quando** `extractProductDetails` é executado, **então** retorna `description` limpa (sem "Arsenal Sports"), `specs` com os pares chave-valor da tabela técnica e `images` com as fotos da galeria em alta resolução.
- [x] **Dado** um produto já enriquecido com `description`, `specs` e `images` no snapshot anterior, **quando** `applyChangeTracking` processa uma nova varredura de listagem, **então** preserva esses campos sem perda de dados.
- [x] **Dado** uma requisição a `GET /api/products/[id]` para um produto ainda sem detalhes no snapshot, **quando** o endpoint responde, **então** retorna o produto enriquecido com os detalhes extraídos e cacheados.
- [x] **Dado** um card de produto na vitrine, **quando** o usuário clica na imagem ou no título, **então** navega para `/produto/[id]` exibindo descrição, especificações, galeria, preço em reais e botões de WhatsApp e Carrinho.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-11-05 | Criação e implementação da extração de detalhes no crawler e página do equipamento `/produto/[id]` | Antigravity | [[PM-014 Página de detalhes do equipamento com descrição, especificações e galeria extraídas pelo crawler]] |
