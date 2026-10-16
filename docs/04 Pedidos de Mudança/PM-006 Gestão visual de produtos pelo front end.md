---
tipo: pedido-mudanca
id: PM-006
titulo: Gestão visual de produtos pelo front end (cadastro, remoção e catálogo híbrido)
pedido_por: Luiz
data: "2026-10-16"
status: aprovado
urgencia: alta
afeta: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]]", "[[DEC-008 Servidor dinâmico Next.js no Railway com autenticação e gestão de preços]]"]
decidido_por: Luiz
aplicado_em: "2026-10-16"
tags:
  - crawler/pedido
---
# Gestão visual de produtos pelo front end (cadastro, remoção e catálogo híbrido)

## O que precisa mudar?
1. Permitir que o administrador gerencie o catálogo de produtos da vitrine inteiramente pelo navegador (em `/admin`), sem necessidade de editar arquivos JSON ou usar terminal.
2. Permitir **inserir novos produtos manualmente** (com nome, foto, categoria, link e opção de preço flexível em Dólar ou Reais).
3. Permitir **remover/ocultar produtos** da vitrine com bloqueio inteligente (soft delete persistente que impede que o crawler diário traga o item de volta).
4. Permitir **restaurar produtos ocultados** a qualquer momento e excluir definitivamente itens criados manualmente.
5. Persistir os produtos manuais e a lista de bloqueios no volume do Railway (`/app/data`), mantendo compatibilidade integral com a stack existente.

## Por quê?
Atualmente, qualquer ajuste no catálogo de produtos depende do crawler da Arsenal Sports ou de intervenção técnica via terminal (`overrides-cli.ts`). Quem gerencia a loja precisa de autonomia para cadastrar produtos próprios, esconder itens fora de estoque ou indesejados e gerenciar a vitrine de forma visual, rápida e segura.

## Exemplo
O lojista recebe um lote de armas ou acessórios exclusivos que não estão no site da Arsenal Sports: ele acessa `/admin`, clica em "+ Novo Produto", preenche o formulário e salva. Na hora, o produto passa a aparecer na vitrine com filtros, busca e botão de WhatsApp. Da mesma forma, se um produto do robô não puder mais ser vendido, o lojista clica em "Ocultar" e o item desaparece imediatamente da vitrine.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende REQ-011, REQ-020 e DEC-008. Cria REQ-023 e DEC-009.
- Impacto: Baixo risco e alto valor operacional. O crawler diário continua rodando normalmente e o volume persistente do Railway (`/app/data`) garante a segurança dos dados.

## Decisão
- Resultado: aprovado — implementação via REQ-023 e DEC-009.
- Decidido por: Luiz — data: 2026-10-16

## O que foi alterado
| Arquivo | Mudança |
|---|---|
| `docs/03 Decisões/DEC-009 Catálogo híbrido com persistência de produtos manuais e bloqueios no Railway Volume.md` | Decisão arquitetural de catálogo híbrido |
| `docs/02 Requisitos/REQ-023 Gestão visual de produtos (cadastro, ocultação e catálogo híbrido).md` | Especificação completa de requisitos e critérios de aceite |
| `frontend/src/types/index.ts` | Extensão da tipagem de Product e novos tipos administrativos |
| `frontend/src/lib/catalogService.ts` | Motor unificado de catálogo híbrido, persistência e CRUD |
| `frontend/src/lib/catalogService.test.ts` | Testes unitários do catálogo híbrido e operações de gestão |
| `frontend/src/lib/productsService.ts` | Integração do catálogo híbrido ao cache do servidor |
| `frontend/src/app/api/admin/catalog/*` | Endpoints administrativos autenticados para produtos e bloqueios |
| `frontend/src/app/admin/page.tsx` | Interface visual completa de Gerenciador de Catálogo |
| `frontend/src/components/ProductCard.tsx` & `PricingProvider.tsx` | Suporte a produtos com preço fixo em reais |
