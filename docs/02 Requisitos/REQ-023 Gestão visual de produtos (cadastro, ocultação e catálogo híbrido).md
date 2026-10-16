---
tipo: requisito
id: REQ-023
titulo: Gestão visual de produtos (cadastro, ocultação e catálogo híbrido)
autora: Luiz
data: 2026-10-16
status: implementado
categoria: funcional
area: frontend
prioridade: must
sprint: 6
escopo: mvp
implementado_em: frontend/src/lib/catalogService.ts, frontend/src/app/admin/page.tsx, frontend/src/components/admin/CatalogManager.tsx, frontend/src/app/api/admin/catalog/*
usa_ia: false
relacionados: ["[[REQ-011 Listar produtos com filtros e paginação]]", "[[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]]", "[[REQ-021 Cache de catálogo server-side e persistência via Railway Volume]]", "[[PM-006 Gestão visual de produtos pelo front end]]", "[[DEC-009 Catálogo híbrido com persistência de produtos manuais e bloqueios no Railway Volume]]"]
tags:
  - crawler/requisito
---
# Gestão visual de produtos (cadastro, ocultação e catálogo híbrido)

## Problema / Contexto
Antes desta funcionalidade, a vitrine da Hunting World dependia estritamente dos produtos capturados pelo crawler da Arsenal Sports. O lojista não conseguia cadastrar produtos próprios, nem remover ou ocultar produtos sem conhecimento de programação e terminal. Além disso, se um item fosse deletado diretamente no arquivo, a próxima execução diária do robô o traria de volta.

## História de usuário
**Como** lojista/administrador da Hunting World, **quero** cadastrar novos produtos manuais, ocultar produtos indesejados da vitrine e restaurá-los quando necessário através de uma tela simples no painel `/admin`, **para** controlar meu estoque comercial sem precisar editar arquivos de código ou banco de dados manual.

## Comportamento esperado
1. Na área `/admin` (autenticada), existe uma aba dedicada **"Gerenciador de Catálogo"**.
2. O administrador pode visualizar o catálogo com busca instantânea, filtro por categoria e filtro por status ("Todos", "Ativos", "Ocultos", "Criados Manualmente").
3. O administrador pode clicar em **"Ocultar da Vitrine"** em qualquer produto (seja do robô ou manual). O produto é imediatamente removido da vitrine pública e vai para a lista de ocultos.
4. Na aba ou filtro de produtos ocultos, existe o botão **"Restaurar Produto"**, que faz o produto reaparecer na vitrine na hora.
5. O botão **"+ Cadastrar Novo Produto"** abre um modal visual com validação:
   - Nome do produto (obrigatório).
   - Categoria (dropdown com as categorias oficiais da loja).
   - Modo de Preço:
     - Dólar (USD) com margem e câmbio automáticos.
     - Preço Fixo em Reais (R$) com valor numérico final.
   - URL da Imagem (com preview ao vivo).
   - Link de destino / WhatsApp (opcional; padrão gera link de WhatsApp direto com o lojista).
6. Produtos manuais podem ser editados ou excluídos permanentemente.
7. A vitrine pública consome o catálogo unificado através de `/api/products`.
8. Todas as alterações persistem no Railway Volume `/app/data` de forma atômica e segura.

## Regras de negócio
- RN1: Produtos com ID cadastrado em `hidden-products.json` nunca aparecem na vitrine pública nem no radar de novidades.
- RN2: O crawler diário não remove produtos manuais nem reativa produtos que estão na lista de ocultação.
- RN3: Todo produto manual recebe um ID único gerado pelo sistema (prefixo `manual-`).
- RN4: Se o produto manual possuir `fixedBrlPrice`, a vitrine exibe esse valor diretamente em Reais sem aplicar fórmula de dólar. Se possuir preço em Dólar, aplica a regra de câmbio e margem da categoria.
- RN5: Todas as rotas de alteração (`/api/admin/catalog/*`) exigem autenticação de sessão ativa de administrador.
- RN6: As gravações em disco no volume utilizam escrita atômica via arquivo temporário para evitar corrupção em caso de reinício.

## Critérios de aceite
- [x] **Dado** um produto do robô ativo na vitrine, **quando** o administrador clica em "Ocultar da Vitrine" no `/admin`, **então** o produto é salvo em `hidden-products.json` e deixa de ser exibido na vitrine pública imediatamente.
- [x] **Dado** um produto ocultado, **quando** o administrador clica em "Restaurar Produto", **então** o item sai da lista de bloqueio e volta a aparecer na vitrine.
- [x] **Dado** o formulário de cadastro de novo produto, **quando** o lojista cadastra um item com preço fixo em Reais (ex: R$ 450,00) ou Dólar, **então** o produto é salvo em `custom-products.json` e aparece na vitrine com sua respectiva categoria, imagem e botão de WhatsApp.
- [x] **Dado** a execução do crawler diário no GitHub Actions, **quando** um novo snapshot é gerado, **então** os produtos manuais e as ocultações permanecem ativos e preservados no Railway Volume.
- [x] **Dado** um usuário não autenticado, **quando** tenta acessar as rotas de alteração de catálogo, **então** recebe status HTTP 401 Unauthorized.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-16 | Implementação completa com CatalogManager, rotas API, catálogo híbrido e testes | Luiz | [[REQ-023 Gestão visual de produtos (cadastro, ocultação e catálogo híbrido)]] |
| 2026-10-16 | Requisito criado para gestão visual de produtos, cadastro manual e ocultação inteligente | Luiz | [[PM-006 Gestão visual de produtos pelo front end]] |

