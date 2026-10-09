# Tela admin: login

/admin/login | Sessão segura, erros genéricos, recuperação protegida e limite de tentativas.

**Arquivo:** `src/app/<rota>/page.tsx`

**Componentes:** separados em `src/components/admin/`.

**Segurança:** autenticação + autorização de função no servidor, rate limit, logs, input validation, confirmação de operações destrutivas e sessão segura.

**Mobile:** listas em cards, ações de toque, estados vazio/erro/carregando.
