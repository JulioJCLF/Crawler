# Guia de Deploy no Railway — Arsenal Sports Vitrine & Painel

Este projeto está pronto para rodar como um serviço contínuo de alta performance no [Railway](https://railway.app/), com suporte a:
- Vitrine pública de produtos com preços calculados em tempo real
- Painel administrativo visual protegido em `/admin`
- Alteração simplificada de cotação de dólar e porcentagens de margem por categoria
- Autenticação e cookies de sessão seguros
- Armazenamento persistente através de Railway Volume

---

## 1. Passo a Passo Rápido (Via Interface do Railway)

1. Acesse o seu painel no [Railway](https://railway.app/) e clique em **New Project** (Novo Projeto).
2. Selecione **Deploy from GitHub repo**.
3. Escolha o repositório `JulioJCLF/crawler` (ou o seu fork/branch).
4. O Railway detectará o `railway.json` e o `Dockerfile` na raiz automaticamente.

---

## 2. Variáveis de Ambiente (Variables)

No Railway, acesse a aba **Variables** do seu serviço e configure:

| Variável | Descrição | Exemplo / Padrão |
|---|---|---|
| `ADMIN_USERNAME` | Nome de usuário para login no `/admin` | `admin` |
| `ADMIN_PASSWORD` | Senha inicial para login no painel | `arsenal@admin2026` |
| `AUTH_SECRET` | Chave secreta para assinar os tokens de sessão | Qualquer texto longo (ex: `chave-secreta-forte-123`) |
| `PORT` | Porta HTTP (o Railway injeta sozinho) | `3000` |
| `DATA_DIR` | Diretório para persistir os arquivos de preço | `/app/data` |

> [!TIP]
> Caso você não configure `ADMIN_USERNAME` ou `ADMIN_PASSWORD`, o sistema inicia com o usuário `admin` e senha `arsenal@admin2026`. Você também pode alterar sua senha a qualquer momento diretamente pelo botão **Senha** no painel `/admin`.

---

## 3. Persistência de Dados (Railway Volume) — Recomendado

Para garantir que as alterações de porcentagem, cotação e troca de senha nunca se percam entre reinicializações ou novos deploys:

1. No painel do projeto no Railway, clique em **+ New** e escolha **Volume**.
2. Conecte o Volume ao serviço da vitrine.
3. Defina o **Mount Path** como:
   ```
   /app/data
   ```
4. Pronto! O arquivo `pricing-config.json` e `auth-config.json` ficarão permanentemente gravados no disco do Railway.

---

## 4. Domínio Público e Acesso

1. Na aba **Settings** do serviço no Railway, vá até a seção **Networking**.
2. Clique em **Generate Domain** (ou configure seu domínio próprio customizado).
3. Você receberá uma URL pública como:
   ```
   https://arsenal-catalogo.up.railway.app
   ```
4. Acesse a URL:
   - **Vitrine pública de produtos:** `https://seu-dominio.up.railway.app/`
   - **Painel administrativo:** `https://seu-dominio.up.railway.app/admin`
   - **Healthcheck:** `https://seu-dominio.up.railway.app/api/health`

---

## 5. Deploy via Railway CLI (Alternativa por Linha de Comando)

Se preferir subir diretamente pelo terminal:

```bash
# Instalar a CLI do Railway (se ainda não tiver)
npm i -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto ou criar novo
railway init

# Adicionar as variáveis
railway variables --set ADMIN_USERNAME=admin
railway variables --set ADMIN_PASSWORD=arsenal@admin2026
railway variables --set AUTH_SECRET=chave-super-secreta-producao

# Fazer o deploy
railway up
```

---

## 6. Como Usar o Painel de Precificação

1. Acesse `/admin` e faça login com seu usuário e senha.
2. No card **Cotação do Dólar**, digite o valor atual do dólar (ex: `5.75`).
3. No card **Margem Padrão Geral**, ajuste a porcentagem base desejada (ex: `50%`).
4. Na tabela **Porcentagens de Margem por Categoria**, customize a margem de cada categoria conforme sua estratégia comercial (ex: Réplicas 55%, BBs 35%, Peças 45%).
5. Use o **Simulador em Tempo Real** para digitar qualquer valor em dólar e conferir o desmembramento de custo, lucro e preço final ao consumidor.
6. Clique em **Salvar Alterações**.
7. Pronto! A vitrine pública passa a exibir imediatamente os novos preços para os clientes.
