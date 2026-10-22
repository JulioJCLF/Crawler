# 2026-10-21 — Remoção da escrita Arsenal Sports dos produtos e vitrine

**Quem:** Luiz & Antigravity  
**Assunto:** Atendimento ao PM-008 e extensão do REQ-005 para remoção completa do nome comercial do fornecedor ("Arsenal Sports") dos títulos/descrições de produtos, higienização do snapshot histórico, sanitização no crawler e vitrine.

## O que aconteceu
1. **Identificação da necessidade**:
   - A vitrine comercial opera sob modelo white-label (Hunting World), mas todos os 12.303 itens capturados pelo crawler continham a marca "Arsenal Sports" nos títulos/descrições exibidos nos cards, na busca e na mensagem padrão de pedido enviada pelo WhatsApp.
   - Além disso, o rodapé da vitrine e uma instrução descritiva do painel `/admin` ainda citavam a marca original do fornecedor.

## O que foi feito
1. **Especificação e Requisitos**:
   - Criado o pedido de mudança formal `docs/04 Pedidos de Mudança/PM-008 Remoção do nome Arsenal Sports dos títulos e descrições dos produtos.md`.
   - Atualizado o requisito `docs/02 Requisitos/REQ-005 Identificar cada produto e normalizar links.md` com regras de negócio e critérios de aceite para a remoção da marca do fornecedor sem mutilar roscas técnicas (como "14MM-").
   - Atualizada a especificação técnica `docs/03-crawler-spec.md`.
2. **Backend e Crawler**:
   - Implementada a função `cleanProductName` em `backend/src/config.ts` com suporte a remoção de prefixos, sufixos, separadores (`-`, `|`, `/`, `•`), parênteses e colchetes.
   - Atualizado `backend/src/crawler.ts` para sanitizar o título durante o processo de extração.
   - Adicionados testes unitários completos em `backend/test/crawler.test.ts` cobrindo todos os casos de borda e validação de rosca negativa.
3. **Frontend e Vitrine**:
   - Adicionada a função `cleanProductName` em `frontend/src/lib/catalogService.ts`, aplicada em `buildUnifiedSnapshot` (garantindo proteção em tempo de execução para produtos vindos do cache/crawler) e no cadastro/edição manual de produtos.
   - Atualizado `frontend/src/components/ProductCard.tsx` para exibir o nome limpo e gerar a mensagem do WhatsApp sem menção ao fornecedor.
   - Atualizado o rodapé de `frontend/src/app/page.tsx` para exibir o catálogo com `${siteConfig.brandName}`.
   - Atualizado o texto informativo de cotação do dólar em `frontend/src/app/admin/page.tsx`.
   - Adicionados testes unitários no frontend em `frontend/src/lib/catalogService.test.ts`.
4. **Migração do Snapshot**:
   - Executada higienização in-place dos 12.303 produtos em `backend/snapshot.json`. Todos os nomes foram limpos e 100% dos históricos de preços (4.102 produtos com histórico) foram preservados intactos (conforme regra 3 do `AGENTS.md`).
5. **Validação**:
   - `make test`: 38 testes do backend aprovados.
   - `cd frontend && npm test`: 65 testes do frontend aprovados.
   - `make typecheck`: TypeScript sem erros em backend e frontend.
