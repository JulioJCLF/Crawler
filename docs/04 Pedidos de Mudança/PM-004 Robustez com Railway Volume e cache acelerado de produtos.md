---
tipo: pedido-mudanca
id: PM-004
titulo: Robustez com Railway Volume e cache acelerado de produtos
pedido_por: Luiz
data: "2026-10-12"
status: aplicado
urgencia: alta
afeta: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]]", "[[DEC-008 Servidor dinâmico Next.js no Railway com autenticação e gestão de preços]]"]
decidido_por: Luiz
aplicado_em: "2026-10-12"
tags:
  - crawler/pedido
---
# Robustez com Railway Volume e cache acelerado de produtos

## O que precisa mudar?
1. Garantir que o diretório persistente `/app/data` no Railway seja utilizado com Railway Volume montado, de modo que configurações de preço (`pricing-config.json`) e de autenticação (`auth-config.json`) sobrevivam indefinidamente a reinicializações e novos deploys.
2. Criar um serviço e rota de cache server-side para o catálogo de produtos (`/api/products`), evitando que o navegador do cliente precise baixar diretamente o `snapshot.json` bruto de ~7MB do GitHub a cada visita, reduzindo drasticamente o tempo de carregamento da vitrine, economizando banda e garantindo alta disponibilidade mesmo se o GitHub estiver instável.

## Por quê?
O catálogo atual conta com mais de 12.000 produtos e um arquivo de quase 7MB. Baixar esse JSON bruto diretamente no cliente gera atraso na renderização em conexões móveis e dependência externa desnecessária. Além disso, com a montagem ativa de um Railway Volume no serviço de produção, a persistência de preços e credenciais do lojista fica blindada.

## Exemplo
Um cliente acessa a vitrine no celular 4G: em vez de esperar o download de 7MB de dados brutos do GitHub, a página consome o endpoint otimizado com cache no servidor (`/api/products`), abrindo a loja em milissegundos.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Complementa REQ-011 (carregamento de produtos), REQ-020 (persistência permanente no Railway) e DEC-008.
- Impacto: Baixo risco, altíssimo ganho de performance e resiliência.
- Regras do produto: Mantém 100% das regras comerciais (preço, WhatsApp e carrinho).

## Decisão
- Resultado: aprovado — implementação via REQ-021.
- Decidido por: Luiz — data: 2026-10-12

## O que foi alterado
| Arquivo | Mudança |
|---|---|
| `docs/02 Requisitos/REQ-021 Cache de catálogo server-side e persistência via Railway Volume.md` | Requisito funcional e critérios de aceite |
| `frontend/src/lib/productsService.ts` | Serviço server-side de carregamento, cache em memória e sincronização do catálogo |
| `frontend/src/app/api/products/route.ts` | Endpoint de catálogo com suporte a cache HTTP e resposta rápida |
| `frontend/src/app/page.tsx` | Vitrine consumindo o endpoint otimizado com fallback automático para GitHub Raw |
| Railway Volume | Volume `arsenal-crawler-volume` (5GB) montado em `/app/data` no Railway |
