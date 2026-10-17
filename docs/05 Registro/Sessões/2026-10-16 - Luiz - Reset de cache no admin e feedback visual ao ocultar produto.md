# 2026-10-16 — Reset de cache no admin e feedback visual ao ocultar produto

**Quem:** Luiz & Antigravity  
**Assunto:** Botão e rota de reset de cache no servidor (/admin), desativação de cache do navegador na API de produtos e feedback visual instantâneo (toast flutuante, animações de linha e strikethrough) ao ocultar ou restaurar produtos.

## O que foi feito
1. **Reset de Cache Server-Side do Catálogo**:
   - Criada a função `clearProductsCache()` em `frontend/src/lib/productsService.ts` que zera a memória RAM, deleta o arquivo de cache em disco (`snapshot-cache.json`) e recarrega os dados a partir da fonte com `forceRefresh = true`.
   - Criada a rota autenticada `POST /api/admin/catalog/reset-cache` restrita a usuários com perfil Master.
   - Adicionado botão "Resetar Cache" na barra de ferramentas do Gerenciador de Catálogo (`CatalogManager.tsx`), com spinner de carregamento e confirmação visual.
2. **Eliminação de Cache Stale no Navegador/Proxy**:
   - Ajustado o header da rota pública `/api/products` para `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, garantindo que produtos ocultados ou adicionados reflitam imediatamente sem delay de 60 segundos.
   - Vitrine configurada para consumir `/api/products` com `{ cache: "no-store" }`.
3. **Feedback Visual Imediato ao Ocultar e Restaurar**:
   - Implementado Toast Flutuante Fixo (`fixed bottom-6 right-6 z-50`), garantindo visibilidade mesmo com o usuário no meio ou final de uma lista longa de produtos.
   - Incluído botão de 1 clique "Desfazer" diretamente no Toast para reverter a ação acidental em segundos.
   - Adicionada animação de destaque na linha da tabela (`bg-rose-950/40`, borda vermelha e badge pulsante `[ 🚫 Recém Ocultado! ]` ou `[ 👁️ Recém Restaurado! ]`).
   - Aplicado efeito tachado (*strikethrough*) no nome e preço dos produtos que estão com status oculto.
4. **Validação**:
   - Testes unitários de rota cobrindo permissões de reset de cache e fluxo de ocultação passando com 100% de sucesso.
   - Testes em produção validados com Railway CLI e curl.
