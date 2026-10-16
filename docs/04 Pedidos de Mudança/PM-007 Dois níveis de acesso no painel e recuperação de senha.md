---
tipo: pedido-mudanca
id: PM-007
titulo: Dois níveis de acesso no painel (Master e Câmbio) e recuperação de senha por e-mail
pedido_por: Luiz
data: "2026-10-16"
status: aprovado
urgencia: alta
afeta: ["[[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]]", "[[REQ-023 Gestão visual de produtos (cadastro, ocultação e catálogo híbrido)]]", "[[DEC-008 Servidor dinâmico Next.js no Railway com autenticação e gestão de preços]]"]
decidido_por: Luiz
aplicado_em: "2026-10-16"
tags:
  - crawler/pedido
---
# Dois níveis de acesso no painel (Master e Câmbio) e recuperação de senha por e-mail

## O que precisa mudar?
1. Criar dois tipos de acesso diferenciados no painel `/admin`:
   - **Admin Master (`admin`)**: acesso total a todas as áreas (Catálogo, Cotação do Dólar, Margens de Lucro por Categoria, Margem Padrão, Simulador e Gestão de Usuários).
   - **Operador de Dólar (`cambio`)**: acesso restrito estritamente à alteração da cotação do Dólar (USD / BRL). Não pode gerenciar produtos do catálogo, nem alterar margens de lucro por categoria.
2. Fornecer credenciais iniciais padrão:
   - Admin Master: usuário `admin`, senha `arsenal@admin2026`.
   - Operador de Dólar: usuário `cambio`, senha `arsenal@dolar2026`.
3. Criar sistema de **recuperação de senha via e-mail** com código temporário de 6 dígitos seguro (expiração de 15 minutos), suporte a SMTP configurável no Railway (`.env`) e fallback emergencial com chave mestra.
4. Permitir que o Admin Master redefina senhas e gerencie e-mails de recuperação de qualquer usuário diretamente pelo painel.
5. Criar script de terminal CLI para reset de senhas em caso de necessidade técnica.

## Por quê?
Atualmente, qualquer pessoa com a senha de administrador tem controle total sobre o catálogo e sobre as margens comerciais da loja. É essencial delegar a atualização diária da taxa de câmbio a um operador ou funcionário financeiro sem dar acesso para mexer no catálogo de produtos ou nas margens de lucro das categorias. Além disso, a recuperação de senha por e-mail e chave mestra garante que a administração nunca fique travada caso uma senha seja esquecida.

## Exemplo
O operador financeiro entra em `/admin` usando seu usuário `cambio`. Ele vê apenas a cotação do dólar e o simulador para conferência. A aba do Catálogo não é mostrada e as margens de lucro ficam travadas. Ele ajusta o dólar de 5.50 para 5.65 e clica em Salvar. A vitrine reflete o novo dólar imediatamente. Caso o operador ou o administrador esqueçam a senha, clicam em "Esqueci minha senha" na tela de login e recebem um código de 6 dígitos no seu e-mail para cadastrar uma nova senha.

---
*Preenchido por Luiz:*

## Análise
- Requisitos e decisões afetados: Estende REQ-020 e REQ-023. Cria REQ-024.
- Impacto: Baixo risco e alto benefício de segurança e governança de acessos. Totalmente retrocompatível com a base persistida no Railway Volume.

## Decisão
- Resultado: aprovado — implementação via REQ-024.
- Decidido por: Luiz — data: 2026-10-16

## O que foi alterado
| Arquivo | Mudança |
|---|---|
| `docs/04 Pedidos de Mudança/PM-007 Dois níveis de acesso no painel e recuperação de senha.md` | Registro formal do pedido de mudança |
| `docs/02 Requisitos/REQ-024 Controle de acesso por perfis e recuperação de senha por e-mail.md` | Especificação de requisitos e critérios de aceite |
| `frontend/src/types/index.ts` | Tipagem de perfis (`UserRole`), usuários com e-mail e tokens |
| `frontend/src/lib/auth.ts` | Multi-usuário, controle de perfis, código de recuperação e hashing PBKDF2 |
| `frontend/src/lib/emailService.ts` | Serviço de envio de e-mail via SMTP com template HTML |
| `frontend/src/app/api/auth/forgot-password/route.ts` | Endpoint de solicitação de código de recuperação por e-mail |
| `frontend/src/app/api/auth/reset-password/route.ts` | Endpoint de redefinição de senha via código ou chave mestra |
| `frontend/src/app/api/auth/change-password/route.ts` | Suporte a redefinição de senhas pelo Admin Master |
| `frontend/src/app/api/pricing/route.ts` | Bloqueio de alteração de margens para operadores de câmbio |
| `frontend/src/app/api/admin/catalog/*` | Bloqueio (403) de operações de catálogo para operadores de câmbio |
| `frontend/src/app/admin/login/page.tsx` | Fluxo visual de recuperação de senha por e-mail e chave mestra |
| `frontend/src/app/admin/page.tsx` | Interface adaptativa por perfil e modal de gestão de acessos |
| `frontend/scripts/reset-auth.ts` | Script CLI para reinicialização emergencial de credenciais |
