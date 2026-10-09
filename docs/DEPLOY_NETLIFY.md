# Publicação Netlify — Sabor com Amor

## Infraestrutura validada
- GitHub: https://github.com/saborcomamor/Saborcomamor — branch `main`
- Netlify: https://app.netlify.com/projects/saborcomamor
- Supabase: `zjhdnsjkfurflhgtauot`
- Neon antigo preservado, não é usado pela aplicação nova.

## Conectar a Netlify
1. Abra o projeto `saborcomamor` na Netlify, equipe `saborcomamor`.
2. Clique em `Deploy with Git` / `Link repository` e escolha GitHub.
3. Selecione `saborcomamor/Saborcomamor` e a branch `main`.
4. Framework Next.js. Build `npm run build`, Publish `.next`, diretório base raiz.
5. Confirme e inicie o deploy. O adaptador OpenNext deve ser detectado automaticamente.

## Variáveis de ambiente (Builds e Functions)
- `NEXT_PUBLIC_SUPABASE_URL`: `https://zjhdnsjkfurflhgtauot.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: usar a chave publicável válida no painel Supabase
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número comercial **confirmado** em formato `55DDDNÚMERO`
- `NEXT_PUBLIC_SITE_URL`: URL real do site após o primeiro deploy.

A chave publicável é pública, mas as permissões RLS devem permanecer ativas. Nunca cadastrar `service_role`, `sb_secret_`, senhas ou chaves do Neon com prefixo `NEXT_PUBLIC_`.

## Regras antes de divulgar
- O site inicialmente usa fotografias ilustrativas, que precisam ser substituídas pelo acervo autorizado.
- O painel somente funciona para um usuário real no Supabase Auth presente em `app_private.site_admins`; nenhum administrador foi criado automaticamente.
- Revisar textos, privacidade, domínio, contato, navegação, consentimento de imagens e acessibilidade.
- Executar validação `npm run typecheck && npm test && npm run build` no GitHub Actions.
- Projeto em desenvolvimento mantém `robots: noindex` até revisão de publicação.
