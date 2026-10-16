---
tipo: sessao
data: "2026-10-16"
responsavel: Luiz
objetivo: Implementar dois níveis de acesso (Admin Master e Operador de Dólar), credenciais padrão e sistema de recuperação de senha por e-mail e chave mestra
reqs:
  - REQ-024
pedidos:
  - PM-007
decisoes: []
commits: []
tags:
  - crawler/sessao
---
# Dois níveis de acesso e recuperação de senha por e-mail

## Resumo em linguagem simples
Criados dois tipos de acesso no painel `/admin`: o **Admin Master** (`admin`), com controle total sobre catálogo, câmbio, margens e gestão de usuários; e o **Operador de Dólar** (`cambio`), com permissão restrita para atualizar exclusivamente a cotação do dólar (sem acesso ao catálogo e com margens de lucro bloqueadas). Implementado também um sistema completo de **recuperação de senha via e-mail** com código temporário de 6 dígitos seguro (validade de 15 minutos), fallback para **Chave Mestra de Emergência** (`arsenal-reset-2026`) diretamente pela tela de login, e script CLI (`make reset-auth`) para redefinição emergencial no servidor.

## O que foi feito
- Criado o Pedido de Mudança PM-007 e o Requisito REQ-024.
- Evoluído o modelo de autenticação (`auth.ts`) para suportar múltiplos usuários com hash PBKDF2 individual, papéis (`master` e `dolar_operator`) e e-mails de recuperação associados.
- Criado o serviço de envio de e-mails (`emailService.ts`) integrado com Nodemailer e template responsivo no padrão visual da Hunting World.
- Criadas as rotas de API `/api/auth/forgot-password` (solicitação de código de 6 dígitos) e `/api/auth/reset-password` (redefinição por código ou chave mestra).
- Atualizadas as rotas `/api/auth/login`, `/api/auth/me` e `/api/auth/change-password` para propagar e validar os perfis de acesso e permitir que o Admin Master redefina senhas e e-mails.
- Bloqueado o acesso do operador de câmbio a alterações de margens em `/api/pricing` e a operações de catálogo em `/api/admin/catalog/*` (com retorno HTTP 403 Forbidden).
- Atualizada a tela de login (`/admin/login`) com modal completo de recuperação por e-mail e chave mestra.
- Atualizado o painel `/admin` com identificação visual do perfil conectado, ocultação da aba de catálogo para o operador e bloqueio dos campos de margem.
- Criado o utilitário CLI `scripts/reset-auth.ts` e o atalho `make reset-auth`.
- Escrita de 11 novos testes unitários no Vitest cobrindo múltiplos usuários, perfis, tokens temporários, bloqueio 403 e serviço de e-mail (totalizando 61 testes passando no frontend).

## Arquivos alterados
- `frontend/src/types/index.ts`
- `frontend/src/lib/auth.ts`
- `frontend/src/lib/auth.test.ts`
- `frontend/src/lib/emailService.ts`
- `frontend/src/lib/emailService.test.ts`
- `frontend/src/app/api/auth/login/route.ts`
- `frontend/src/app/api/auth/me/route.ts`
- `frontend/src/app/api/auth/forgot-password/route.ts`
- `frontend/src/app/api/auth/reset-password/route.ts`
- `frontend/src/app/api/auth/change-password/route.ts`
- `frontend/src/app/api/pricing/route.ts`
- `frontend/src/app/api/admin/catalog/products/route.ts`
- `frontend/src/app/api/admin/catalog/hide/route.ts`
- `frontend/src/app/api/admin/catalog/unhide/route.ts`
- `frontend/src/app/api/admin/catalog/catalogApi.test.ts`
- `frontend/src/app/admin/login/page.tsx`
- `frontend/src/app/admin/page.tsx`
- `frontend/scripts/reset-auth.ts`
- `frontend/package.json`
- `Makefile`
- `docs/04 Pedidos de Mudança/PM-007 Dois níveis de acesso no painel e recuperação de senha.md`
- `docs/02 Requisitos/REQ-024 Controle de acesso por perfis e recuperação de senha por e-mail.md`

## Critérios de aceite cobertos
- Login com `admin` (master) e `cambio` (operador de dólar).
- Bloqueio da aba de catálogo e das APIs de catálogo para `cambio` (403 Forbidden).
- Bloqueio de alteração de margens de categoria para `cambio`.
- Recuperação de senha por e-mail via código de 6 dígitos com expiração de 15 minutos.
- Redefinição de emergência via Chave Mestra na tela de login.
- Redefinição de senha do operador pelo Admin Master no painel.
- Script CLI `make reset-auth` operacional.

## Pendências e dúvidas
- Nenhuma.
