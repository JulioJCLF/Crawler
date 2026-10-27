# 03 - Especificação do Crawler

Este documento mapeia como os dados são minerados da origem e tratamentos realizados durante a extração, geridos pelos arquivos `crawler.ts` e `config.ts`.

## Motor e Estratégia
Utilizamos o **Crawlee (`CheerioCrawler`)** no lugar do puro Axios/Fetch para gerenciar melhor as filas de requisições, concorrência e eventuais retries.

- **Concorrência**: Mínimo 2, Máximo 10 requisições simultâneas. Evita DDoS no alvo, mantendo respeito pela infraestrutura do site.
- **Max Retries**: Até 3 tentativas se a requisição falhar/der timeout.
- **Timeout**: 30 segundos por requisição.

## Alvos (Categorias)
As categorias-alvo estão mapeadas no vetor `CATEGORIES` no `config.ts`. O sistema começa injetando requisições simulando acessos à página 1 de cada uma das URLs listadas.
Exemplos monitorados (ao todo 14 categorias):
- Réplicas
- Peças Externas / Internas
- Magazines, BBs, Gás / Baterias
- Miras, Speedsoft, Granadas, Vestuário

## Mecanismo de Extração (Parsing)
A lógica ocorre no hook `requestHandler` do Crawlee.
1. Busca por `a[href*="/produto/"]` (links que levam a produtos).
2. O **ID do Produto** é garantido via regex da URL: `/\/produto\/.*-(\d+)\.html/`.
3. O título é limpo de espaços extras e sanitizado via `cleanProductName` para remover a menção ao fornecedor ("Arsenal Sports"), preservando termos técnicos e especificações (como "14MM-").
4. Preço é localizado via regex para captura explícita em USD: `USD\s*([\d.,]+)`.
5. URLs de produtos e de imagens sofrem padronização forçada, ganhando o prefixo absoluto (`https://www.arsenalsports.com...`) se vierem como relativas.

### Filtros Anti-Poluição (`isValidProduct`)
Foi identificado que o site mistura produtos "irrelevantes" (fitness) na seção de Airsoft.
Palavras-chave como `"wellness"`, `"fitness"`, `"yoga"`, `"chaveiro"`, `"adesivo"`, `"caneca"`, `"mouse pad"` disparam um **bypass imediato** e o item não entra na lista (`productsMap`), reduzindo uso de memória e eventuais alertas indesejados.

## Paginação
O crawler trabalha de maneira inteligente (Spidering linear progressivo). 
- Ele incrementa e injeta a próxima página (`?pagina=2`, `3`, etc) na fila do Crawler.
- A condição de parada ocorre caso os "itens encontrados na página" (`foundOnPage`) chegue a zero OU caso o limite drástico (`MAX_PAGES = 150`) seja atingido.
- Se houver produtos idênticos referenciados em múltiplas categorias, eles são deduplicados via `Map` (Key baseada no `ID`), mantendo a categoria de **maior peso** entre as ocorrências (ver seção abaixo) — não a do primeiro encontro.

## Categorização por peso (`enforceCategory`, em `config.ts`)
> Corrigido em 2026-09-21 (docs-check): esta seção não existia; o texto anterior dizia (errado) que a deduplicação mantinha a categoria do primeiro encontro.

Depois de extraído, cada produto passa por `enforceCategory(nome, categoriaOriginal)`, que pode reclassificar a categoria com base em palavras no nome, não só na URL de onde veio:
- Nomes com "bucking" ou "hop-up rubber" viram a categoria derivada `buckings` (peso 110 — a mais alta, não tem URL própria no site, é montada só pela heurística).
- Nomes com "speed loader", "speedloader", "bb loader", "magazine loader" ou kits Odin M12 são reclassificados para `magazines` (peso 50), removendo-os da listagem de `bbs`.
- Nomes com "tracer unit", "silencer" ou modelos de aparelho traçador (AT2000, Bifrost, Blaster, etc.) que não sejam munição com gramatura (ex: 0.25g) são reclassificados para `pecas-externas` (peso 50), impedindo que caiam em `bbs`.
- Nomes que batem com padrão de arma de verdade (ex.: termina em "airsoft rifle", "sniper rifle", "aeg" sem contexto de peça) viram `replicas` (peso 100).
- Dentro de `replicas`, nomes com termos de peça (magazine, cylinder, spring, gearbox, hop up, stock, grip, etc.) são reclassificados para `magazines`, `pecas-internas` ou `pecas-externas`.
- Cada categoria tem um peso fixo em `CATEGORY_WEIGHTS` (de 1 a 6, fora os casos acima). Quando o mesmo produto aparece em duas categorias de origem diferentes, vence o de maior peso.
