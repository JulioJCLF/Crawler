---
tipo: painel
gerado_em: 2026-10-16
tags:
  - crawler/painel
---
# Requisitos por fase

> [!info] Página gerada automaticamente em 2026-10-16. Situação de cada item, organizado pelos blocos de trabalho.

## 1 · Crawler
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 5/5

| Requisito | Status | Prioridade |
|---|---|---|
| [[REQ-001 Monitorar as categorias do catálogo]] | 🚀 implementado | must |
| [[REQ-002 Percorrer todas as páginas de cada categoria]] | 🚀 implementado | must |
| [[REQ-003 Respeitar os limites do site de origem]] | 🚀 implementado | must |
| [[REQ-004 Descartar produtos fora do escopo]] | 🚀 implementado | must |
| [[REQ-005 Identificar cada produto e normalizar links]] | 🚀 implementado | must |

## 2 · Mudanças e alertas
🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜ 2/3

| Requisito | Status | Prioridade |
|---|---|---|
| [[REQ-006 Comparar com a execução anterior e classificar a mudança]] | 🚀 implementado | must |
| [[REQ-007 Manter o histórico de preços de cada produto]] | 🚀 implementado | must |
| [[REQ-008 Avisar as mudanças por webhook]] | ✅ aprovado | must |

## 3 · Automação
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 4/4

| Requisito | Status | Prioridade |
|---|---|---|
| [[REQ-009 Rodar sozinho todo dia e guardar o resultado]] | 🚀 implementado | must |
| [[REQ-010 Publicar a vitrine automaticamente]] | 🚀 implementado | must |
| [[REQ-018 Avisar quando a execução diária falhar]] | 🚀 implementado | must |
| [[REQ-019 Detectar queda brusca de produtos numa categoria antes de publicar]] | 🚀 implementado | must |

## 4 · Vitrine
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 6/6

| Requisito | Status | Prioridade |
|---|---|---|
| [[REQ-011 Listar produtos com filtros e paginação]] | 🚀 implementado | must |
| [[REQ-012 Esconder itens sob consulta da vitrine]] | 🚀 implementado | must |
| [[REQ-013 Mostrar preço em reais com o preço anterior]] | 🚀 implementado | must |
| [[REQ-014 Oferecer contato direto e carrinho em cada card]] | 🚀 implementado | must |
| [[REQ-015 Manter a lista de marcas indexadas editável]] | 🚀 implementado | should |
| [[REQ-017 Mostrar filtros ativos e permitir limpá-los de uma vez]] | 🚀 implementado | should |

## 5 · Qualidade
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 4/4

| Requisito | Status | Prioridade |
|---|---|---|
| [[REQ-016 Garantir testes automatizados a cada mudança]] | 🚀 implementado | must |
| [[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]] | 🚀 implementado | must |
| [[REQ-021 Cache de catálogo server-side e persistência via Railway Volume]] | 🚀 implementado | must |
| [[REQ-022 Busca inteligente multi-termo, sugestões e filtro de preço em reais]] | 🚀 implementado | must |

## 6 · Sem fase definida
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 1/1

| Requisito | Status | Prioridade |
|---|---|---|
| [[REQ-023 Gestão visual de produtos (cadastro, ocultação e catálogo híbrido)]] | 🚀 implementado | must |

