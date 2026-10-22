---
tipo: pedido-mudanca
id: PM-008
titulo: Remoção do nome Arsenal Sports dos títulos e descrições dos produtos
pedido_por: Usuário
data: "2026-10-21"
status: aprovado
urgencia: alta
afeta: ["[[REQ-005 Identificar cada produto e normalizar links]]", "[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-014 Oferecer contato direto e carrinho em cada card]]"]
decidido_por: Luiz
aplicado_em: "2026-10-21"
tags:
  - crawler/pedido
---
# Remoção do nome Arsenal Sports dos títulos e descrições dos produtos

## O que precisa mudar?
1. Remover completamente a menção "Arsenal Sports" dos títulos e descrições de todos os produtos do catálogo (em `backend/snapshot.json`, no crawler e na vitrine).
2. Garantir que a função extratora do crawler (`crawler.ts`) sanitize automaticamente os títulos extraídos do HTML da origem, eliminando "Arsenal Sports" (esteja no final, início, entre parênteses ou separado por hífen), sem danificar especificações técnicas (como roscas de cano "14MM-").
3. Garantir que a vitrine e a API do catálogo (`buildUnifiedSnapshot` e `ProductCard`) também apliquem a sanitização como camada de proteção.
4. Ajustar textos do rodapé da vitrine e do painel `/admin` que ainda faziam referência direta a "Arsenal Sports", adotando o nome da marca configurada (`siteConfig.brandName`) e "catálogo".

## Por quê?
O catálogo público da Hunting World funciona como uma vitrine comercial white-label para clientes finais. A origem dos dados (fornecedor Arsenal Sports) injeta seu próprio nome comercial em todos os títulos de produtos. Isso poluía a visualização dos cards e as mensagens de WhatsApp geradas nos pedidos com a marca do distribuidor em vez da identidade limpa do produto.

## Exemplo
Antes:
`APS MAGAZINE 23R CO2 FOR ACP601 BLACK Arsenal Sports`
`CYMA ADAPTER ALUMINUM AIRSOFT THREAD 14MM+ TO 14MM- Arsenal Sports`

Depois:
`APS MAGAZINE 23R CO2 FOR ACP601 BLACK`
`CYMA ADAPTER ALUMINUM AIRSOFT THREAD 14MM+ TO 14MM-`

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende REQ-005 (normalização de dados extraídos). Atualiza `docs/03-crawler-spec.md`.
- Impacto: Melhora a apresentação comercial da vitrine. Mantém a integridade do histórico de preços dos 12.303 itens no `snapshot.json`.

## Decisão
- Resultado: aprovado — aplicação imediata em REQ-005, backend, frontend e snapshot.
- Decidido por: Luiz — data: 2026-10-21

## O que foi alterado
| Arquivo | Mudança |
|---|---|
| `docs/04 Pedidos de Mudança/PM-008 Remoção do nome Arsenal Sports dos títulos e descrições dos produtos.md` | Registro formal do pedido de mudança |
| `docs/02 Requisitos/REQ-005 Identificar cada produto e normalizar links.md` | Atualização dos critérios de aceite e regra de remoção de marca do fornecedor |
| `docs/03-crawler-spec.md` | Especificação da sanitização `cleanProductName` durante a extração |
| `backend/src/config.ts` | Criação e exportação de `cleanProductName` |
| `backend/src/crawler.ts` | Aplicação de `cleanProductName` na extração de títulos |
| `backend/test/crawler.test.ts` | Testes unitários para `cleanProductName` cobrindo sufixos, prefixos, parênteses e preservação de sufixos técnicos |
| `frontend/src/lib/catalogService.ts` | Sanitização preventiva em `buildUnifiedSnapshot` e cadastro de produtos |
| `frontend/src/components/ProductCard.tsx` | Sanitização de títulos exibidos no card e na mensagem gerada para o WhatsApp |
| `frontend/src/app/page.tsx` | Rodapé com `${siteConfig.brandName}` em vez de Arsenal Sports |
| `frontend/src/app/admin/page.tsx` | Texto informativo de cotação sem citação à marca Arsenal Sports |
| `backend/snapshot.json` | Migração in-place dos 12.303 produtos removendo "Arsenal Sports" e preservando todo histórico de preços |
