---
tipo: decisao
id: DEC-008
status: aceita
data: "2026-10-09"
decisores:
  - Luiz
tags:
  - crawler/decisao
---

# DEC-008 — Servidor dinâmico Next.js no Railway com autenticação e gestão de preços

> `status`: aceita — substitui parcialmente a restrição da [[DEC-004 Vitrine em Next.js exportada como site estático]]

## Contexto
A DEC-004 definia o frontend estritamente como export estático no GitHub Pages sem rotas de servidor ou APIs. Entretanto, para viabilizar a alteração do fluxo de valores e margens de produtos através de uma interface administrativa fácil e simples (sem edição de código ou terminal), e garantir acesso restrito através de autenticação segura, é necessário um servidor dinâmico em produção hospedado no Railway.

## Opções consideradas
1. **Manter export estático e criar backend separado**: Exigiria dois serviços, maior complexidade de infraestrutura, CORS e sincronização desnecessária.
2. **Next.js Fullstack (Server + API Routes) no Railway**: O próprio Next.js executa em modo standalone como servidor Node.js de alta performance, servindo a vitrine pública, as rotas de API (`/api/pricing`, `/api/auth`) e o painel administrativo (`/admin`).
3. **Persistência leve e robusta**: Arquivo JSON com escrita atômica em volume montável `/app/data/pricing-config.json` e fallback padrão, garantindo persistência no Railway sem dependência obrigatória de banco externo.

## Decisão
Adotar o **Next.js em modo servidor standalone no Railway**, com:
- APIs nativas para autenticação (`/api/auth/*`) com cookie HTTP-Only assinado.
- API para consulta e atualização das margens e cotações (`/api/pricing`).
- Armazenamento persistente de configurações em arquivo local/volume (`data/pricing-config.json`).
- Dockerfile otimizado multi-stage para deploy no Railway.
- Preservação da opção de build estático (`STATIC_EXPORT=true`) para compatibilidade retroativa com GitHub Pages se necessário.

## Consequências
- A vitrine e o painel de administração convivem harmoniosamente na mesma aplicação.
- Mudanças de câmbio e margens são refletidas imediatamente para os clientes da vitrine sem necessidade de novo deploy.
- O acesso ao painel de precificação fica protegido por senha e sessão segura.

## Evidências / learnings relacionados
`frontend/src/app/admin`, `frontend/src/app/api`, `frontend/Dockerfile`, `railway.json`, `PM-003`, `REQ-020`.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-09 | Decisão aceita para permitir execução no Railway com painel administrativo e autenticação | Luiz | [[PM-003 Painel de alteração de fluxo de valores e deploy no Railway]] |
