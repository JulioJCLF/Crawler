---
tipo: pedido-mudanca
id: PM-003
titulo: Painel de alteração de fluxo de valores e deploy no Railway
pedido_por: Luiz
data: "2026-10-09"
status: aplicado
urgencia: alta
afeta: ["[[REQ-013 Mostrar preço em reais com o preço anterior]]", "[[DEC-004 Vitrine em Next.js exportada como site estático]]"]
decidido_por: Luiz
aplicado_em: "2026-10-09"
tags:
  - crawler/pedido
---
# Painel de alteração de fluxo de valores e deploy no Railway

## O que precisa mudar?
Criar um painel visual e amigável (sem terminal ou código) para alterar o fluxo de valores e porcentagens de margem dos produtos (por categoria e margem geral) e a cotação do dólar, com sistema de autenticação seguro para proteger o acesso administrativo, e configurar o sistema para rodar como servidor dinâmico hospedado no Railway.

## Por quê?
Atualmente a cotação do dólar (`EXCHANGE_RATE = 5.50`) e as margens de lucro por categoria (`CATEGORY_MARKUPS`) estão fixadas no código fonte (`pricingConfig.ts`). Para mudar qualquer margem ou o câmbio, hoje é necessário editar arquivo, commitar e republicar. Quem opera o negócio precisa alterar margens e cotações de forma simples, visual e instantânea, sem conhecimento técnico, além de ter a vitrine e o painel rodando em produção no Railway.

## Exemplo
O dólar sobe para R$ 5,80 ou a margem da categoria "Réplicas" precisa ser ajustada para 45%: o administrador entra em `/admin`, faz login, digita os novos valores nos campos visuais, confere a simulação em tempo real e clica em "Salvar". Automaticamente a vitrine passa a exibir os preços recalculados.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Afeta REQ-013 (regras de precificação passam a ser dinâmicas) e DEC-004 (substituída por DEC-008 para permitir Next.js como servidor dinâmico no Railway com API de autenticação e precificação, mantendo compatibilidade de build estático se desejado).
- Impacto (prazo, esforço, risco): Médio esforço, baixo risco. A vitrine continua funcionando perfeitamente e ganha autonomia operacional.
- Respeita as regras do produto: Sim, mantém as regras 4 (preço, WhatsApp e carrinho preservados) e não altera dados de scraping ou snapshot.

## Decisão
- Resultado: aprovado — implementação via REQ-020 e DEC-008.
- Decidido por: Luiz — data: 2026-10-09

## O que foi alterado
| Arquivo | Mudança |
|---|---|
| `docs/03 Decisões/DEC-008 Servidor dinâmico Next.js no Railway com autenticação e gestão de preços.md` | Nova decisão arquitetural para deploy no Railway |
| `docs/02 Requisitos/REQ-020 Painel visual de gestão de margens e câmbio com autenticação e deploy no Railway.md` | Requisito funcional implementado e testado |
| `frontend/src/app/admin/*` | Painel visual administrativo e tela de login |
| `frontend/src/lib/pricingService.ts` & `auth.ts` | Serviço de precificação, persistência e autenticação |
| `frontend/src/app/api/*` | Endpoints de precificação, autenticação e healthcheck |
| `Dockerfile`, `railway.json`, `RAILWAY_DEPLOY.md` | Configuração completa de execução e deploy no Railway |
