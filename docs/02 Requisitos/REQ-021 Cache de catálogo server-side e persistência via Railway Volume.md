---
tipo: requisito
id: REQ-021
titulo: Cache de catálogo server-side e persistência via Railway Volume
autora: Luiz
data: 2026-10-12
status: implementado
categoria: nao-funcional
area: frontend
prioridade: must
sprint: 5
escopo: mvp
implementado_em: 2026-10-12
usa_ia: false
relacionados: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]]", "[[PM-004 Robustez com Railway Volume e cache acelerado de produtos]]"]
tags:
  - crawler/requisito
---
# Cache de catálogo server-side e persistência via Railway Volume

## Problema / Contexto
O catálogo de produtos do Arsenal Crawler ultrapassa 12.000 itens (aproximadamente 6.9MB em JSON não comprimido). Anteriormente, cada cliente que abria a vitrine fazia download do arquivo integral diretamente do GitHub Raw (`raw.githubusercontent.com`), causando lentidão em conexões celulares e sujeição a limites de taxa ou indisponibilidade temporária do GitHub. Além disso, a persistência de configurações administrativas exigia um Railway Volume ativo em produção.

## História de usuário
**Como** cliente navegando na vitrine da Hunting World, **quero** que os produtos carreguem com alta velocidade no meu dispositivo, **para** encontrar equipamentos táticos sem travamento ou demora no carregamento inicial.

## Comportamento esperado
1. O servidor Next.js mantém um serviço dedicado de catálogo (`productsService.ts`) que faz cache do snapshot em memória e no disco local/volume.
2. A rota `/api/products` entrega o snapshot otimizado com cabeçalhos HTTP de cache (`Cache-Control: public, s-maxage=1800, stale-while-revalidate=86400`).
3. O serviço atualiza o catálogo automaticamente em segundo plano de tempos em tempos sem bloquear a requisição do usuário.
4. A vitrine (`src/app/page.tsx`) consome `/api/products` com fallback automático para o GitHub Raw caso esteja em modo estático ou offline.
5. As configurações e dados persistem no Railway Volume `/app/data`.

## Regras de negócio
- RN1: A rota `/api/products` deve responder rapidamente e aceitar parâmetro opcional `refresh=true` para forçar renovação do cache.
- RN2: Em caso de falha de rede ao buscar o snapshot remoto mais recente, o servidor deve servir a versão local em cache sem emitir erro 500 para os clientes.
- RN3: O tempo padrão de expiração do cache do catálogo no servidor deve ser de no mínimo 30 minutos (1800s), renovável em background.
- RN4: Se o volume Railway `/app/data` estiver presente, o snapshot em cache e as configurações de preço persistem automaticamente.

## Critérios de aceite
- [x] **Dado** uma chamada à rota `/api/products`, **quando** o servidor a processa, **então** retorna o snapshot completo com cabeçalho de cache e status 200.
- [x] **Dado** múltiplas chamadas consecutivas a `/api/products`, **quando** executadas no intervalo de cache, **então** o resultado é servido da memória instantaneamente.
- [x] **Dado** a vitrine pública (`/`), **quando** um usuário acessa a página, **então** os produtos carregam a partir do endpoint `/api/products`.
- [x] **Dado** o serviço em produção no Railway, **quando** o volume `arsenal-crawler-volume` está montado em `/app/data`, **então** o diretório é utilizado para persistência.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-12 | Implementado serviço productsService, rota /api/products, fallback em page.tsx e criação do volume Railway | Luiz | [[PM-004 Robustez com Railway Volume e cache acelerado de produtos]] |
| 2026-10-12 | Requisito criado para cache server-side de produtos e persistência via volume | Luiz | [[PM-004 Robustez com Railway Volume e cache acelerado de produtos]] |
