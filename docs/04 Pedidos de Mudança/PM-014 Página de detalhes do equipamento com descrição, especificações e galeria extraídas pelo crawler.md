---
tipo: pedido-mudanca
id: PM-014
titulo: Página de detalhes do equipamento com descrição, especificações e galeria extraídas pelo crawler
pedido_por: Usuário
data: "2026-11-05"
status: aplicado
urgencia: alta
afeta: ["[[REQ-001 Monitorar as categorias do catálogo]]", "[[REQ-014 Oferecer contato direto e carrinho em cada card]]", "[[REQ-026 Extrair e exibir página de detalhes do equipamento com descrição, especificações e galeria]]", "[[02-data-model]]", "[[03-crawler-spec]]", "[[05-frontend-guidelines]]"]
decidido_por: Luiz
aplicado_em: "2026-11-05"
tags:
  - crawler/pedido
---
# Página de detalhes do equipamento com descrição, especificações e galeria extraídas pelo crawler

## O que precisa mudar?
1. **No Crawler (`backend/src/crawler.ts`, `backend/src/history.ts`, `backend/src/types.ts`)**:
   - Extrair da página individual de cada produto (`/produto/...-<id>.html`) a descrição completa (`#product-tab-description`), a tabela de especificações técnicas (`#product-tab-additional table tr`) e a galeria de fotos de alta resolução (`figure.product-image`).
   - Preservar `description`, `specs` e `images` entre execuções no `snapshot.json` via `applyChangeTracking`, buscando páginas de detalhe de forma incremental (lote configurável por execução) para respeitar os limites do site de origem ([[REQ-003 Respeitar os limites do site de origem]]).
   - Limpar qualquer menção a `"Arsenal Sports"` ou links externos da descrição extraída.
2. **Na API e Serviço de Catálogo (`frontend/src/app/api/products/[id]/route.ts`, `frontend/src/lib/productDetailsService.ts`)**:
   - Criar endpoint `/api/products/[id]` que retorna o produto enriquecido com `description`, `specs` e `images`.
   - Caso o item ainda não tenha sido enriquecido no `snapshot.json` pelo lote incremental do crawler, buscar e extrair sob demanda da URL do produto no servidor e fazer cache persistente no volume/disco, garantindo que todos os 12.303 itens funcionem imediatamente em tempo real.
3. **Na Vitrine (`frontend/src/app/produto/[id]/page.tsx` e `frontend/src/components/ProductCard.tsx`)**:
   - Criar a página dedicada do equipamento (`/produto/[id]`) com galeria interativa de fotos, preço em reais calculado com a margem da categoria, botões comerciais (`Pedir via WhatsApp` e `+ Carrinho`), descrição detalhada formatada e tabela responsiva de especificações técnicas.
   - Fazer com que o clique na foto ou no título do `ProductCard` leve para `/produto/[id]`.

## Por quê?
Os clientes precisam consultar características técnicas (FPS, material, peso, comprimento, sistema, magazines inclusos, hop-up) e ver todas as fotos do equipamento antes de fechar o orçamento via WhatsApp.

## Exemplo
- **Antes**: O catálogo exibia apenas o card resumido com 1 miniatura, título, referência e preço. Não existia página do equipamento nem extração de descrição/especificações no crawler.
- **Depois**: Ao clicar em qualquer equipamento (ex: `VFC APFG GBBR MCX RATTLER LT`), o cliente abre `/produto/34272` com galeria de fotos em alta resolução, descrição completa (*"Características: Estilo Rattler LT, HandGuard M-LOK, Acompanha 03 magazines extras..."*), tabela de especificações (*SKU, Código Fabricante, Marca, Comprimento, Peso, Calibre, Hop-Up, Material*) e botões de conversão para o carrinho e WhatsApp.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Cria [[REQ-026 Extrair e exibir página de detalhes do equipamento com descrição, especificações e galeria]] e atualiza `docs/02-data-model.md`, `docs/03-crawler-spec.md` e `docs/05-frontend-guidelines.md`.
- Impacto: Enriquecimento incremental no crawler + fallback sob demanda com cache no servidor Next.js, sem aumentar concorrência nem sobrecarregar o site de origem.

## Decisão
- Resultado: aprovado — implementação imediata.
- Decidido por: Luiz — data: 2026-11-05
