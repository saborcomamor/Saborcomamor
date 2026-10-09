# Banco Neon — Sabor com Amor

**Projeto:** `square-art-75354279`  
**Banco:** `neondb`  
**Branch:** `production` (`br-long-band-b6flfe6g`)  
**Esquema:** `sabor`  
**Migração aplicada:** `db/migrations/0001_initial_content.sql` (09/10/2026, horário UTC)

## Modelo inicial

| Tabela | Responsabilidade | Exposição pública |
|---|---|---|
| `sabor.services` | Modalidades buffet completo e serviço de cozinha | Apenas leitura de registros publicados por backend |
| `sabor.albums` | Álbuns, categorias, ordem, status de publicação | Apenas publicados |
| `sabor.photos` | Referências a mídia em storage, alt text, direitos de uso, ordenação | Apenas aprovadas/publicadas |
| `sabor.testimonials` | Depoimentos autorizados | Apenas aprovados/publicados |
| `sabor.site_content` | Textos ajustáveis para as páginas | Apenas publicados |
| `sabor.admin_audit` | Histórico de operações administrativas | **Nunca público** |

Os dois serviços foram cadastrados como **rascunho** (`is_published=false`). Não há fotos, depoimentos, dados de convidados, dados pessoais de orçamento, nem usuários administrativos cadastrados.

## Regras indispensáveis antes de conectar o site

1. `DATABASE_URL` somente em variáveis de **servidor**; nunca em componentes client-side nem com prefixo `NEXT_PUBLIC_`; não colocar credenciais no GitHub, README ou conversa.
2. Criar papel PostgreSQL de menor privilégio para a aplicação, diferente de `neondb_owner`; restringir operações por rota e serviço.
3. Autenticação gerenciada e MFA na área administrativa, autorização no servidor por ação, CSRF conforme sessões e rate limiting. Não publicar uma tela de login simulada.
4. Usar storage específico de imagens, com originais privados, verificação de tipo/tamanho, remoção de EXIF e versões públicas derivadas. O Neon armazena **referências**, não imagens binárias.
5. Conferir os direitos de imagem antes de publicação; o banco bloqueia `is_published=true` sem verificação e referência da autorização. Esse controle técnico **não substitui** conferência dos documentos e o atendimento à LGPD.
6. Para guardar orçamentos/leads no futuro, exigir definição da finalidade, política de retenção, canal do titular, proteção de dados, autorização do painel e rotinas de exclusão. **Nenhuma tabela de leads foi criada nesta fase** porque o formulário atual abre o WhatsApp sem registrar no banco.
7. Não executar migrações destrutivas automaticamente; revisar backups, índices e mudanças de schema antes de aplicá-las.

## Operação e conexão

O código público atual é estático/client-side e **não consulta o Neon**. O banco já está preparado para integração segura com painel e galerias em etapa posterior. Quando a Vercel for conectada, configurar a string privada diretamente nas variáveis da Vercel (não no Git).

### Verificações realizadas

- Seis tabelas criadas na schema `sabor`.
- Dois serviços cadastrados e **não publicados**.
- Constraints de autorização de imagem e de consentimento de depoimentos conferidas em `pg_constraint`.
