# Supabase — infraestrutura principal (Sabor com Amor)

- Projeto: `zjhdnsjkfurflhgtauot`, região us-east-1.
- Migrações executadas: `sabor_com_amor_core`, `harden_public_function_grants_and_rls`, `register_private_photo_originals`.
- PostgreSQL de conteúdo (`public`): services, albums, photos, testimonials e site_content; todas com RLS.
- Banco privado (`app_private`): membros administradores, originais, comprovações de autorização e histórico de alteração.
- Storage: `sabor-originais` (privado, 15 MB por imagem); `sabor-publicadas` (URL pública, 3 MB; somente versões otimizadas e autorizadas).
- Auth: Supabase Auth. **Não existe administrador bootstrap, senha padrão ou autoelevação**; a conta deve ser criada no painel Supabase Auth, e depois um operador do banco explicitamente deve vinculá-la a `app_private.site_admins`.
- Chaves: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` são públicas; NUNCA publicar chave `service_role`/`sb_secret_` no código ou no navegador.

## Cadastro do primeiro administrador

1. Criar/convidar usuário em Authentication > Users, confirmar o endereço de e-mail e ativar MFA se disponível.
2. Verificar a identidade do responsável antes de delegar acesso.
3. Copiar o `id` UUID do usuário Auth criado (não usar um UUID inventado).
4. Executar manualmente no SQL Editor, substituindo `UUID_AUTORIZADO` por esse UUID:

```sql
INSERT INTO app_private.site_admins(user_id, role)
VALUES ('UUID_AUTORIZADO'::uuid, 'owner');
```

Não usar e-mail, senha, token ou segredo no repositório. O formulário de login administrativo usa senha do Supabase Auth; não existe registro público de administrador. Desativar inscrições públicas nas configurações Auth do projeto antes do lançamento e ajustar URLs de redirecionamento depois que a Netlify gerar o domínio.

## Publicação responsável de fotografias

1. Foto criada em rascunho e original guardado no bucket privado.
2. Versão WebP gerada no dispositivo, dimensionada e identificada por SHA-256.
3. Referência documental de direitos de uso inserida somente na tabela privada por função protegida por membership de administrador.
4. Versão otimizada enviada ao bucket público e registro marcado como publicado pelo administrador.
5. Triggers impedem publicação sem referência aprovada para **exatamente o checksum atual** do arquivo.

**Importante**: referências legais cadastradas NÃO substituem verificar a validade da autorização. Fotos com menores precisam de atenção específica. O bucket `sabor-publicadas` é público: a foto enviada a ele será acessível por URL mesmo antes de o banco marcar publicação; o painel faz a autorização antes do upload público, mas futuros clientes/integrações também devem respeitar esse fluxo. Exclusão/retirada do ar do CDN exige fluxo controlado com credencial de servidor e regras de cache.

## Segurança: inspeção de 08/10/2026

- Migrações aplicadas; papel `anon` não executa funções administrativas.
- Cinco tabelas públicas com RLS e políticas separadas para leitura anon e gestão admin autenticado.
- O esquema `app_private` não tem privilégio USAGE nem tabelas acessíveis a anon/authenticated e não está listado como API exposta. **A listagem de tabelas emite alerta de RLS desativado nas cinco tabelas internas**. NÃO habilitar RLS nelas automaticamente: o Supabase avisou que a medida pode impedir operações e exigiu decidir previamente as políticas. Recomenda-se aprovação expressa e nova migração de hardening, mantendo os privilégios privados.
- Advisory de `SECURITY DEFINER` em funções públicas para authenticated permanece: são chamadas intencionais que verificam explicitamente `is_site_admin()` antes de qualquer gravação. Revisar em auditoria independente antes de publicar.
- A autenticação e operações CRUD do painel ainda exigem testes de ponta a ponta com usuário administrador real.

## Implantação Netlify

Variáveis **Builds + Functions**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A configuração é pública por projeto e não precisa de `service_role`. Novas variáveis só entram após novo build. No Netlify, Next.js SSR usa o adaptador OpenNext gerenciado automaticamente; não adicione SPA catch-all `_redirects`.

## Neon

O banco Neon `square-art-75354279` não foi apagado nem alterado durante essa migração. Após validação da aplicação usando Supabase, remover da app qualquer env antiga `DATABASE_URL` usada para Neon, sem necessariamente excluir a instância.
