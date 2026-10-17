# 2026-10-16 — Deploy no Railway e visibilidade do gerenciador de catálogo

**Quem:** Luiz & Antigravity  
**Assunto:** Deploy em produção no Railway, correção de permissões de escrita em volume montado com `su-exec` e garantia de visibilidade da aba do Gerenciador de Catálogo.

## O que foi feito
1. **Deploy em Produção no Railway**:
   - Vinculado o projeto `arsenal-crawler` no workspace `Julio Projects` ao repositório local via Railway CLI.
   - Publicado o container com o serviço online em `https://hunting-world.up.railway.app`.
2. **Correção de Permissão no Volume Railway (`EACCES`)**:
   - Ao montar o Railway Volume em `/app/data`, a propriedade de montagem vinha com usuário `root`.
   - Adicionado `su-exec` no Alpine Runner com `docker-entrypoint.sh` para garantir ownership `nextjs:nodejs` e permissões de escrita antes de baixar privilégios, eliminando erros de permissão ao salvar produtos e senhas.
3. **Visibilidade do Gerenciador de Catálogo**:
   - Ajustado `frontend/src/app/admin/page.tsx` para sempre manter a aba `[ 📦 Gerenciador de Catálogo ]` visível no topo, exibindo instrução clara para operadores de câmbio.
   - Adicionado no topo da vitrine o botão de acesso rápido `[ 📦 Gerenciar Catálogo ]`.
   - Incluído guia de contas e credenciais na tela de login `/admin/login`.
4. **Validação**:
   - Login, listagem, cadastro manual de produto e exclusão testados e homologados ao vivo na URL de produção do Railway com 100% de sucesso.
