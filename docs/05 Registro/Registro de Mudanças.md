---
tipo: registro
tags:
  - crawler/registro
---
# 📜 Registro de Mudanças

Linha do tempo de tudo o que mudou. **Mais recente no topo.** Detalhes de cada sessão em `Sessões/`.

| Data | O que mudou (em linguagem simples) | Quem | Detalhes |
|---|---|---|---|
| 2026-10-12 | Busca da vitrine agora é inteligente: aceita palavras em qualquer ordem, ignora acentos, tolera erros comuns de digitação de airsoft, traz atalhos de buscas populares com 1 clique e adiciona filtro por faixa de preço em reais | Luiz | [[2026-10-12 - Luiz - Busca inteligente e filtro de preco em reais]] |
| 2026-10-12 | Adicionado volume permanente de 5GB no Railway (/app/data) e criado cache server-side em memória/disco com rota /api/products para acelerar o carregamento da vitrine e eliminar download de 7MB pelo cliente | Luiz | [[2026-10-12 - Luiz - Railway Volume e cache acelerado de produtos]] |
| 2026-10-09 | Criado painel administrativo visual em /admin com autenticação para alterar cotação do dólar e porcentagens de lucro por categoria, com simulador em tempo real e preparação completa para deploy no Railway | Luiz | [[2026-10-09 - Luiz - Painel de alteração de fluxo de valores e deploy Railway]] |
| 2026-09-23 | No celular, os filtros da vitrine não ficam mais por cima dos produtos. As categorias viraram uma fila que rola para o lado, e os produtos aparecem logo abaixo. No computador nada muda | Luiz | [[2026-09-23 - Luiz - Filtros sobrepondo produtos no celular]] |
| 2026-09-23 | Pedidos pela vitrine (botão do card e carrinho) agora vão para o WhatsApp +55 45 99985-8096. O carrinho usava um número próprio fixo no código e agora usa o mesmo número configurado do card | Luiz | [[2026-09-23 - Luiz - Novo número de WhatsApp da vitrine]] |
| 2026-09-21 | Sistema agora avisa sozinho quando uma categoria específica do catálogo cai bruscamente (site pode ter mudado de estrutura). Fecha o PM-002 — os três requisitos de confiabilidade estão resolvidos | Luiz | [[2026-09-21 - Luiz - Alerta de queda brusca de categoria]] |
| 2026-09-21 | CI estava quebrado nas duas últimas PRs sem ninguém notar: testava uma versão do Node (18) que o frontend não suporta mais. Corrigido para testar versões que o projeto realmente roda | Luiz | [[2026-09-21 - Luiz - Corrigido CI quebrado no Node 18]] |
| 2026-09-21 | Documentação corrigida em 3 pontos onde não batia com o código: como o sistema decide categoria de produto duplicado, se o robô reconhece marca (não reconhece, só a vitrine) e um módulo de notificação que nunca existiu. Nenhum comportamento do sistema mudou | Luiz | [[2026-09-21 - Luiz - Docs-check, documentação alinhada com o código real]] |
| 2026-09-21 | Execução diária agora avisa sozinha quando falha: abre uma Issue no GitHub, atualiza se falhar de novo, fecha quando se recupera. Corrigido também: repositório local estava 6 semanas desatualizado do GitHub (sincronizado sem perder nada) e o CI estava quebrado há 5 semanas por um bug de configuração | Luiz | [[2026-09-21 - Luiz - Alerta automático de falha da execução diária]] |
| 2026-09-20 | Vitrine agora mostra os filtros ativos e permite limpar tudo de uma vez. Descoberto e corrigido: o aviso de mudanças por webhook nunca foi implementado (fica pausado por enquanto). Aprovados dois requisitos de confiabilidade (aviso de falha e detecção de categoria quebrada) | Luiz | [[2026-09-20 - Luiz - Pedidos de design e confiabilidade, vitrine com filtros ativos]] |
| 2026-09-20 | Documentação estruturada: 16 requisitos, 7 decisões, painéis e regras para agentes | Luiz | [[2026-09-20 - Luiz - Adoção do sistema de documentação]] |
