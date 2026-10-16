---
tipo: decisao
id: DEC-009
status: aceita
data: "2026-10-16"
decisores:
  - Luiz
tags:
  - crawler/decisao
---

# DEC-009 — Catálogo híbrido com persistência de produtos manuais e bloqueios no Railway Volume

> `status`: aceita — complementa a [[DEC-002 Estado em arquivo de snapshot versionado, sem banco]] e a [[DEC-008 Servidor dinâmico Next.js no Railway com autenticação e gestão de preços]]

## Contexto
O Arsenal Crawler foi concebido originalmente com catálogo baseado no snapshot extraído do site da Arsenal Sports. Com o avanço comercial da vitrine, surgiu a necessidade de:
1. Inserir produtos manuais exclusivos pelo navegador.
2. Ocultar/remover itens indesejados ou esgotados sem que o crawler diário os traga de volta.
3. Permitir que o administrador opere tudo 100% pelo front-end no `/admin`.

Foi considerado adotar um banco de dados relacional externo (como PostgreSQL no Railway ou Supabase). No entanto, um banco externo traria custos adicionais recorrentes, nova infraestrutura para monitorar e maior complexidade de migração.

## Opções consideradas
1. **Banco de Dados Externo (PostgreSQL/Supabase)**: Traria suporte a SQL tradicional, mas adicionaria custo extra de infraestrutura, nova dependência de rede e complexidade desnecessária para o volume atual de operações manuais.
2. **SQLite nativo em contêiner**: Exigiria compilação nativa no Docker Alpine (`better-sqlite3` ou dependências de build C++), com risco de incompatibilidade no pipeline de build.
3. **Catálogo Híbrido com Railway Volume (`/app/data`)**: Utilizar o volume permanente de 5GB já contratado e ativo no Railway para persistir `custom-products.json` (produtos manuais) e `hidden-products.json` (bloqueios de IDs). Na leitura, o serviço de catálogo mescla em memória o snapshot base, remove os IDs bloqueados e insere os produtos manuais.

## Decisão
Adotar o **Catálogo Híbrido com Railway Volume**:
- **Produtos Manuais**: Salvos em `/app/data/custom-products.json` com ID prefixado (`manual-timestamp`).
- **Bloqueios/Ocultações (Soft Delete)**: Salvos em `/app/data/hidden-products.json` com ID, data e motivo.
- **Escrita Atômica**: Todas as alterações usam arquivos temporários (`.tmp`) e renomeação atômica (`fs.renameSync`).
- **Composição em Memória**: O serviço `catalogService` gera a visão unificada em milissegundos, mantendo cache veloz servido por `/api/products`.
- **Preço Flexível**: Suporte a produtos cadastrados em Dólar (com margem e câmbio automáticos) ou com Preço Fixo em Reais (R$).

## Consequências
- Zero custo adicional de banco de dados ou infraestrutura.
- 100% compatível com a execução diária do robô no GitHub Actions.
- Gestão completa pelo painel visual no navegador.
- Caso o volume cresça para centenas de milhares de produtos no futuro, a interface de `catalogService` já estará padronizada para migração transparente.

## Evidências / learnings relacionados
`frontend/src/lib/catalogService.ts`, `frontend/src/app/api/admin/catalog/*`, `PM-006`, `REQ-023`.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-16 | Decisão aceita para catálogo híbrido com produtos manuais e bloqueios no Railway Volume | Luiz | [[PM-006 Gestão visual de produtos pelo front end]] |
