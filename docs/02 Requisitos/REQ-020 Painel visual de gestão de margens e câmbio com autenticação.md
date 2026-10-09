---
tipo: requisito
id: REQ-020
titulo: Painel visual de gestão de margens e câmbio com autenticação e deploy no Railway
autora: Luiz
data: 2026-10-09
status: implementado
categoria: funcional
area: frontend
prioridade: must
sprint: 5
escopo: mvp
implementado_em: 2026-10-09
usa_ia: false
relacionados: ["[[REQ-013 Mostrar preço em reais com o preço anterior]]", "[[PM-003 Painel de alteração de fluxo de valores e deploy no Railway]]", "[[DEC-008 Servidor dinâmico Next.js no Railway com autenticação e gestão de preços]]"]
tags:
  - crawler/requisito
---
# Painel visual de gestão de margens e câmbio com autenticação e deploy no Railway

## Problema / Contexto
Hoje a cotação do dólar e as margens de preço estão fixas no código TypeScript (`pricingConfig.ts`). Para o lojista ou administrador alterar as porcentagens de lucro dos produtos ou atualizar o câmbio, era obrigatório editar código, commitar e rodar deploy. É necessário um sistema visual, simples e intuitivo (sem terminal), protegido por autenticação, com capacidade de simulação em tempo real e pronto para rodar como servidor dinâmico no Railway.

## História de usuário
**Como** administrador da vitrine, **quero** acessar um painel autenticado e alterar a cotação do dólar e a porcentagem de margem das categorias através de campos simples com pré-visualização instantânea, **para** manter os preços do catálogo alinhados com o mercado e com a minha estratégia de lucro sem precisar de programador.

## Comportamento esperado
1. O administrador acessa `/admin`. Se não estiver logado, é redirecionado para a tela de login `/admin/login`.
2. Após informar credenciais válidas, acessa o painel de controle administrativo.
3. No painel, o usuário visualiza:
   - Cotação do Dólar atual em reais (ex: 5.50).
   - Margem padrão geral em porcentagem (ex: 50%).
   - Tabela/cards com todas as categorias do catálogo (Réplicas, Peças Internas, Peças Externas, Magazines, BBs, etc.) e seus respectivos percentuais de margem.
   - Simulador em tempo real: ao digitar qualquer valor em USD ou alterar uma margem, vê imediatamente o valor final convertido em BRL e o detalhamento do cálculo.
   - Prévia com produtos reais do catálogo.
4. Ao clicar em "Salvar Alterações", os valores são validados e gravados com sucesso.
5. A vitrine pública consome as novas definições de precificação sem precisar de novo deploy ou reinicialização.
6. O sistema pode ser hospedado e executado no Railway via Dockerfile ou Nixpacks com suporte a variáveis de ambiente e persistência.

## Regras de negócio
- RN1: Apenas usuários autenticados com sessão válida podem salvar ou alterar configurações de precificação.
- RN2: A cotação do dólar deve ser um número positivo maior que zero.
- RN3: As porcentagens de margem são salvas e calculadas com precisão: uma margem de 50% corresponde a um multiplicador de 1.50 na fórmula `(USD * Câmbio) * (1 + margem/100)`.
- RN4: Se uma categoria não possuir margem personalizada explícita, o sistema utiliza a margem padrão geral configurada.
- RN5: As configurações salvas são persistidas em armazenamento permanente (`data/pricing-config.json` ou volume Railway) com fallback gracioso para os valores padrão do sistema.
- RN6: O card de produto na vitrine continua exibindo obrigatoriamente preço, botão de WhatsApp e botão de carrinho, conforme a diretriz comercial do produto (AGENTS.md Regra 4).

## Critérios de aceite
- [x] **Dado** um usuário não autenticado, **quando** tenta acessar a rota `/admin`, **então** é redirecionado para `/admin/login`.
- [x] **Dado** credenciais válidas de administrador, **quando** o usuário faz login, **então** recebe uma sessão autenticada segura e acessa o painel.
- [x] **Dado** uma alteração na cotação do dólar e na porcentagem de uma categoria (ex: Réplicas para 60%), **quando** o administrador clica em salvar, **então** os novos parâmetros são persistidos e retornados pela API `/api/pricing`.
- [x] **Dado** produtos exibidos na vitrine, **quando** a configuração de precificação é alterada, **então** a vitrine calcula os preços em BRL utilizando os novos parâmetros.
- [x] **Dado** o simulador de preços do painel, **quando** um valor em dólar é digitado, **então** o resultado em reais é calculado instantaneamente em tela.
- [x] **Dado** o repositório, **quando** configurado para o Railway, **então** contém Dockerfile e railway.json prontos para execução em produção na porta definida pela variável `$PORT`.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-09 | Implementado painel visual, autenticação de sessão, simulador de fluxo de valores e configuração Docker/Railway | Luiz | [[PM-003 Painel de alteração de fluxo de valores e deploy no Railway]] |
| 2026-10-09 | Requisito criado para gestão visual de margens, autenticação e deploy no Railway | Luiz | [[PM-003 Painel de alteração de fluxo de valores e deploy no Railway]] |
