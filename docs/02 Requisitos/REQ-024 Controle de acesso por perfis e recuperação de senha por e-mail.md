---
tipo: requisito
id: REQ-024
titulo: Controle de acesso por perfis (Master e Câmbio) e recuperação de senha por e-mail
autora: Luiz
data: 2026-10-16
status: implementado
categoria: funcional
area: frontend
prioridade: must
sprint: 6
escopo: mvp
implementado_em: frontend/src/lib/auth.ts, frontend/src/lib/emailService.ts, frontend/src/app/admin/page.tsx, frontend/src/app/admin/login/page.tsx, frontend/src/app/api/auth/*
usa_ia: false
relacionados: ["[[REQ-020 Painel visual de gestão de margens e câmbio com autenticação]]", "[[REQ-023 Gestão visual de produtos (cadastro, ocultação e catálogo híbrido)]]", "[[PM-007 Dois níveis de acesso no painel e recuperação de senha]]", "[[DEC-008 Servidor dinâmico Next.js no Railway com autenticação e gestão de preços]]"]
tags:
  - crawler/requisito
---
# Controle de acesso por perfis (Master e Câmbio) e recuperação de senha por e-mail

## Problema / Contexto
O sistema possuía apenas uma credencial administrativa única compartilhada. Para atualizar a cotação do dólar diariamente, qualquer colaborador precisava da senha que também concedia permissão de alterar margens de lucro estratégicas e modificar/ocultar produtos do catálogo. Além disso, não existia uma forma autônoma de recuperar o acesso caso a senha fosse esquecida, dependendo de intervenção manual no servidor.

## História de usuário
**Como** lojista e proprietário da vitrine, **quero** criar um acesso restrito para o operador que atualiza o dólar sem permitir que ele altere as margens de lucro ou mexa no catálogo, e ter uma forma automática de recuperar minha senha por e-mail, **para** delegar tarefas com segurança e nunca perder o controle da minha loja.

## Comportamento esperado
1. **Perfis de Acesso**:
   - **Admin Master (`admin`)**: acesso irrestrito ao Gerenciador de Catálogo, Precificação Completa (Dólar, Margem Padrão e Categorias), Simulador e Gestão de Contas (troca de senhas e e-mails de recuperação).
   - **Operador de Dólar (`cambio`)**: ao logar, a aba de Catálogo fica oculta e as rotas de API `/api/admin/catalog/*` respondem `403 Forbidden`. Na aba de Precificação, apenas a Cotação do Dólar é editável; as margens de lucro ficam travadas para edição.
2. **Credenciais Iniciais Padrão**:
   - Admin Master: usuário `admin`, senha `arsenal@admin2026`, e-mail `admin@huntworld.com.br` (ou `ADMIN_EMAIL`).
   - Operador de Dólar: usuário `cambio`, senha `arsenal@dolar2026`, e-mail `cambio@huntworld.com.br` (ou `CAMBIO_EMAIL`).
3. **Recuperação de Senha por E-mail**:
   - Na tela `/admin/login`, o link "Esqueci minha senha" permite digitar o usuário ou e-mail.
   - O sistema gera um código de 6 dígitos seguro com validade de 15 minutos e envia por e-mail (via SMTP configurável).
   - O usuário digita o código e a nova senha, tendo seu acesso restabelecido imediatamente.
4. **Fallback com Chave Mestra**:
   - Caso o e-mail não esteja configurado ou inacessível, o usuário pode redefinir a senha informando a Chave Mestra (`arsenal-reset-2026` ou `ADMIN_RECOVERY_KEY`).
5. **Gestão de Usuários pelo Master**:
   - O Admin Master pode redefinir a senha do operador de dólar e alterar e-mails cadastrados direto no painel administrativo.
6. **Utilitário de Terminal**:
   - Script CLI `npm run auth:reset` para restaurar credenciais no ambiente de deploy se necessário.

## Regras de negócio
- RN1: O perfil `dolar_operator` só tem permissão de alterar o campo `exchangeRate` em `/api/pricing`. Qualquer payload contendo alterações de margens deve ser rejeitado ou ter as margens descartadas mantendo apenas a cotação.
- RN2: Nenhuma rota de `/api/admin/catalog/*` pode ser executada por usuários que não sejam do perfil `master`.
- RN3: O código de recuperação por e-mail é de uso único, possui 6 dígitos numéricos e expira após 15 minutos da geração.
- RN4: As senhas devem ser armazenadas com hash PBKDF2 e salt criptográfico individual de 16 bytes.
- RN5: A comparação da chave mestra e dos tokens deve usar comparação em tempo constante (`timingSafeEqual`) para prevenir ataques de temporização.
- RN6: O arquivo `auth-config.json` no Railway Volume deve ser atualizado com escrita atômica via arquivo temporário.

## Critérios de aceite
- [x] **Dado** o usuário `cambio` autenticado, **quando** acessa o painel `/admin`, **então** a aba "Gerenciador de Catálogo" não está visível e os campos de margem de categoria estão desabilitados para edição.
- [x] **Dado** uma requisição POST para `/api/admin/catalog/products` com sessão do usuário `cambio`, **quando** enviada, **então** a API retorna status HTTP 403 Forbidden.
- [x] **Dado** o usuário `admin` autenticado, **quando** acessa o painel `/admin`, **então** visualiza e pode editar o Catálogo, a Cotação do Dólar, as Margens e redefinir a senha do operador.
- [x] **Dado** um usuário com senha esquecida, **quando** solicita recuperação por e-mail informando seu usuário ou e-mail, **então** um código de 6 dígitos é enviado para sua caixa de entrada e permite cadastrar uma nova senha.
- [x] **Dado** um código de recuperação expirado (após 15 minutos) ou incorreto, **quando** submetido na redefinição, **então** a operação é rejeitada com mensagem amigável.
- [x] **Dado** o uso da chave mestra de emergência na tela de login, **quando** informada corretamente, **então** a senha do usuário selecionado é atualizada com sucesso.
- [x] **Dado** uma instalação com arquivo `auth-config.json` no formato legado (usuário único), **quando** o sistema inicia, **então** migra automaticamente preservando a senha existente do admin e criando o operador `cambio`.

## Histórico
| Data | O que mudou | Quem | Referência |
|---|---|---|---|
| 2026-10-16 | Implementação concluída com dois perfis de acesso, recuperação por e-mail (SMTP), chave mestra e CLI | Luiz | [[PM-007 Dois níveis de acesso no painel e recuperação de senha]] |
| 2026-10-16 | Criação do requisito para dois níveis de acesso e recuperação de senha por e-mail | Luiz | [[PM-007 Dois níveis de acesso no painel e recuperação de senha]] |
