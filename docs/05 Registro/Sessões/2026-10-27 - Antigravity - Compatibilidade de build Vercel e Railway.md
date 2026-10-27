---
tipo: sessao
data: 2026-10-27
responsavel: Antigravity
tags:
  - crawler/sessao
---
# 2026-10-27 — Compatibilidade de build Vercel e Railway

## O que foi feito
- Investigado o erro de deploy na Vercel (`ENOENT: no such file or directory, open '/vercel/path0/frontend/.next/next-server.js.nft.json'`).
- Identificado que o modo `output: "standalone"` no Next.js 16 com Turbopack entra em conflito com o empacotador de funções serverless nativo da Vercel durante o gancho `onBuildComplete`.
- Ajustado `frontend/next.config.ts` para desativar condicionalmente `standalone` quando executado no ambiente da Vercel (`process.env.VERCEL`), mantendo o modo `standalone` ativo para deploys em Docker / Railway.
- Validado o build localmente via Vercel CLI (`vercel build`) e via build padrão do Next.js.

## O que mudou para quem usa
- O projeto agora compila e publica com sucesso tanto na Vercel (serverless nativo) quanto no Railway (container Docker standalone).

## Evidências
- `vercel build` executado localmente com sucesso gerando a saída em `.vercel/output`.
- `make test`, `cd frontend && npm test`, `make typecheck` e `npm run build` aprovados com 100% de sucesso.
