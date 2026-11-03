---
tipo: pedido-mudanca
id: PM-012
titulo: Estrutura para extração e exibição do SKU real dos produtos
pedido_por: Usuário
data: "2026-11-03"
status: aprovado
urgencia: alta
afeta: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-014 Oferecer contato direto e carrinho em cada card]]", "[[03-crawler-spec]]", "[[02-data-model]]"]
decidido_por: Luiz
aplicado_em: "2026-11-03"
tags:
  - crawler/pedido
---
# Estrutura para extração e exibição do SKU real dos produtos

## O que precisa mudar?
1. No robô de coleta (`backend/src/crawler.ts`), extrair o código de referência/SKU real exibido nos cards da loja de origem (`Ref.: XXXXX`), armazenando-o no novo campo `sku` do modelo de produto.
2. Manter o `id` histórico do produto (extraído do sufixo da URL) inalterado para preservar integralmente o histórico de preços, datas de detecção e rastreamento de mudanças em `snapshot.json`.
3. Na vitrine (`frontend/src/components/ProductCard.tsx` e `frontend/src/components/layout/FloatingCart.tsx`), exibir `REF. {product.sku || product.id}` no card e no carrinho, e utilizar o SKU real na mensagem de orçamento gerada para o WhatsApp.
4. No mecanismo de busca inteligente (`frontend/src/lib/searchUtils.ts`), permitir que clientes e vendedores pesquisem produtos diretamente pelo SKU numérico.
5. Preservar o campo `sku` no histórico (`backend/src/history.ts`) e no catálogo híbrido (`frontend/src/lib/catalogService.ts`).

## Por quê?
Atualmente, o card exibe como "REF" o número presente no final da URL do produto (ex: `11996` em `produto-...-11996.html`). Esse número é apenas um identificador interno de rota da plataforma da Arsenal Sports. O SKU/Referência oficial do produto utilizado no estoque e no sistema ERP é o código explícito exibido no card como `Ref.: XXXXX` (por exemplo, `329859`). 

Quando os clientes clicam em pedir via WhatsApp e informam o código antigo (ex: `11996`), os vendedores buscam no sistema da loja e encontram outro item completamente diferente (como uma pistola em vez de um cano de precisão), gerando confusão operacional e erros de atendimento.

## Exemplo
- **Antes**:
  - Produto: `ACTION ARMY PRECISION INNER BARREL 6.03/125MM...`
  - URL da loja: `https://www.arsenalsports.com/produto/...-11996.html`
  - Card e Zap exibiam: `REF. 11996` (no sistema do lojista, `11996` é uma pistola).
- **Depois**:
  - O crawler extrai `sku: "329859"`.
  - Card, carrinho e link do Zap passam a exibir: `REF. 329859`.
  - Caso um produto antigo ainda não tenha o SKU extraído, o sistema faz fallback gracioso para o `id`.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Complementa [[REQ-011 Listar produtos com filtros e paginação]], [[REQ-014 Oferecer contato direto e carrinho em cada card]], `docs/03-crawler-spec.md` e `docs/02-data-model.md`.
- Impacto: Baixo risco e alto benefício comercial. Preserva 100% o histórico de preços no `snapshot.json` porque o `id` único continua sendo a chave canônica.
- Respeita as regras do produto: Sim, mantém concorrência inalterada, preserva o snapshot histórico e melhora a exatidão comercial do card e carrinho.

## Decisão
- Resultado: aprovado — aplicação imediata.
- Decidido por: Luiz — data: 2026-11-03

## O que muda no código e na documentação
| Arquivo | Mudança |
|---|---|
| `docs/02-data-model.md` | Adicionado campo `sku?: string` na entidade `Product` |
| `docs/03-crawler-spec.md` | Documentada a extração de `sku` a partir do texto `Ref.: XXXXX` nos cards de produto |
| `backend/src/types.ts` | Adicionado `sku?: string` na interface `Product` |
| `backend/src/config.ts` | Adicionada função `extractSku` e limpeza do prefixo `Ref.:` em `cleanProductName` |
| `backend/src/crawler.ts` | Extração do `sku` e propagação para o mapa de produtos |
| `backend/src/history.ts` | Preservação de `sku` no rastreamento de mudanças |
| `frontend/src/types/index.ts` | Adicionado `sku?: string` nas interfaces `Product` e `CustomProductInput` |
| `frontend/src/components/ProductCard.tsx` | Exibição de `product.sku || product.id` no card e mensagem do WhatsApp |
| `frontend/src/components/layout/FloatingCart.tsx` | Exibição de `sku || id` na lista do carrinho |
| `frontend/src/lib/whatsappUtils.ts` | Uso de `sku || id` na mensagem de múltiplos itens do carrinho |
| `frontend/src/app/page.tsx` | Busca textual abrangendo o SKU do produto |
