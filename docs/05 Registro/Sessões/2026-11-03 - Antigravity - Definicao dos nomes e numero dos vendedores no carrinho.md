---
tipo: sessao
data: "2026-11-03"
responsavel: Antigravity
objetivo: Definir nomes Matheus e Alexandre para os vendedores e configurar número definitivo de WhatsApp do vendedor 2
reqs:
  - REQ-014
pedidos:
  - PM-011
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Definição dos nomes e número dos vendedores no carrinho

## Resumo em linguagem simples
Os botões de seleção de vendedor no carrinho de WhatsApp da vitrine agora exibem os nomes reais da equipe comercial: **Matheus** (vendedor 1, mantendo o número `+55 45 99985-8096`) e **Alexandre** (vendedor 2, configurado com o número definitivo `+55 45 9845-4109`).

## O que foi feito
- Atualizada a configuração de vendedores em `frontend/src/config/site.ts` com os nomes **Matheus** e **Alexandre** e o número definitivo do vendedor 2 (`554598454109`).
- Atualizado o fallback do componente `FloatingCart.tsx` para manter alinhado o nome inicial caso a lista esteja vazia.
- Atualizados os testes de integração do carrinho (`FloatingCart.test.tsx`) e utilitários de WhatsApp (`whatsappUtils.test.ts`) para cobrir os nomes e o novo número.
- Atualizado o histórico do requisito `REQ-014`.
- Conectado o serviço de produção do Railway (`arsenal-crawler`) ao repositório GitHub (`JulioJCLF/Crawler@main`), realizando o deploy com sucesso em `https://hunting-world.up.railway.app` e habilitando deploys contínuos a cada push na `main`.

## Arquivos alterados
- `frontend/src/config/site.ts`
- `frontend/src/components/layout/FloatingCart.tsx`
- `frontend/src/components/layout/FloatingCart.test.tsx`
- `frontend/src/lib/whatsappUtils.test.ts`
- `docs/02 Requisitos/REQ-014 Oferecer contato direto e carrinho em cada card.md`

## Critérios de aceite cobertos
- [x] **REQ-014**: seleção de vendedor no carrinho atualizada com Matheus e Alexandre, gerando URLs de WhatsApp corretas para ambos os contatos.
