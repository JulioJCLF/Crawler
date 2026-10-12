---
tipo: sessao
data: "2026-10-12"
responsavel: Luiz
objetivo: Implementar Railway Volume permanente e cache acelerado de catálogo de produtos
reqs:
  - REQ-021
pedidos:
  - PM-004
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Railway Volume e cache acelerado de produtos

## Resumo em linguagem simples
Criado e montado o volume persistente `arsenal-crawler-volume` (5GB) em `/app/data` no Railway para garantir que todas as configurações de preços e senhas nunca se percam entre deploys. Desenvolvido também um serviço de cache server-side no Next.js (`productsService.ts`) e o endpoint `/api/products`, que evita que os clientes baixem diretamente 7MB de dados brutos do GitHub toda vez que abrem a vitrine, acelerando brutalmente o carregamento da loja e blindando contra falhas externas com suporte a fallback automático.

## O que foi feito
- Criado e anexado o volume `arsenal-crawler-volume` (5000MB) montado em `/app/data` no serviço `arsenal-crawler` do Railway.
- Desenvolvido `productsService.ts` com cache em memória (TTL de 30 minutos), persistência no volume em disco e suporte a *Stale-While-Revalidate*.
- Criada a rota de API `/api/products` com cabeçalhos de cache HTTP (`Cache-Control: public, s-maxage=1800, stale-while-revalidate=86400`).
- Atualizado `src/app/page.tsx` para priorizar a busca rápida em `/api/products` com fallback resiliente para o GitHub Raw caso esteja offline.
- Atualizado `Dockerfile` para inicializar com o snapshot base embutido e permissões completas em `/app/data`.
- Criada a suíte de testes unitários `productsService.test.ts` (4 novos testes, totalizando 65 testes passando no projeto).
- Registrados REQ-021 e PM-004 e atualizados os painéis de documentação.

## Arquivos alterados
- `frontend/src/lib/productsService.ts`
- `frontend/src/lib/productsService.test.ts`
- `frontend/src/app/api/products/route.ts`
- `frontend/src/app/page.tsx`
- `Dockerfile`
- `docs/04 Pedidos de Mudança/PM-004 Robustez com Railway Volume e cache acelerado de produtos.md`
- `docs/02 Requisitos/REQ-021 Cache de catálogo server-side e persistência via Railway Volume.md`
- `docs/05 Registro/Sessões/2026-10-12 - Luiz - Railway Volume e cache acelerado de produtos.md`
- `docs/05 Registro/Registro de Mudanças.md`

## Critérios de aceite cobertos
- Rota `/api/products` servindo o snapshot com headers de cache HTTP profissionais.
- Múltiplas requisições servidas instantaneamente da memória.
- Vitrine consumindo o endpoint com fallback automático.
- Volume Railway de 5GB ativo e montado em `/app/data`.

## Pendências e dúvidas
- Nenhuma.
