# Sabor com Amor — experiência mobile-first

Projeto Next.js 15, React 19 e TypeScript. Uma página (`app/**/page.tsx`) e um componente por seção (`components/home/*.tsx`). Animações com GSAP/ScrollTrigger e CSS, com redução de movimento acessível.

## Etapas
1. Base/arquitetura/segurança e componentes comuns.
2. Home fotográfica com 12 seções independentes.
3. Páginas de serviços, história, galeria, formulário e páginas legais.
4. Revisão de fotos, textos, contato, privacidade e acessibilidade.
5. Painel seguro, galeria administrável e leads **apenas após definir backend, identidade e storage com autorização adequada**.
6. Deploy quando solicitado (não incluído nesta etapa).

## Localmente
`npm install && npm run dev` — `npm run build` — `npm test`.

## Antes de publicar
- Substituir todas as fotos ilustrativas pelos arquivos reais com autorização. O código contém descrições alternativas provisórias.
- Configurar `NEXT_PUBLIC_WHATSAPP_NUMBER` com número comercial validado.
- Revisar conteúdos e requisitos LGPD / autorizações de imagem.
- Retirar a desindexação (`robots.ts` e `metadata.robots`) **somente** após revisão.
- Ajustar CSP conforme backend e fontes futuras; não armazenar chaves privadas `NEXT_PUBLIC_`.

## Proteção
Não há autenticação falsa, banco de dados nem persistência de dados pessoais nesta primeira entrega. O formulário valida no navegador e monta a mensagem para WhatsApp, sem gravar dados no servidor. As páginas legais são rascunhos informativos e exigem validação antes do lançamento.

Consulte `docs/IMPLEMENTACAO.md` e `docs/SEGURANCA.md`.

## Referências de projeto
- `docs/Guia_Mestre.pdf`: especificação do produto e de UI/UX.
- `docs/especificacoes`: arquivos de referência independentes por tela e seção.
- `docs/DESIGN_SYSTEM.md`: paleta, tipografia e movimento.

## Banco de dados já preparado no Neon

O projeto Neon `square-art-75354279` possui a migração inicial aplicada, sem dados pessoais nem conteúdo publicado. Consulte `docs/NEON.md` e `db/migrations/0001_initial_content.sql`. O site público permanece desacoplado do banco nesta fase; credenciais só devem ser configuradas no backend seguro.

## Acesso GitHub pendente

Repositório planejado: `https://github.com/saborcomamor/Saborcomamor`.
A integração GitHub retornou `403 Resource not accessible by integration` ao tentar criar `README.md`. Este código-fonte está preparado localmente, **não foi enviado ao GitHub**. Autorizar a integração com permissão `Contents: read and write` no repositório antes do push.

## Supabase definido como infraestrutura principal

A configuração real foi aplicada no projeto `zjhdnsjkfurflhgtauot`, com Storage público/privado e RLS para as tabelas públicas. O painel de gestão foi iniciado em `app/admin`, com login Supabase Auth, verificação de membro administrativo e componentes separados para álbuns, fotos e serviços. **Ainda não existe conta administradora autorizada**; siga `docs/SUPABASE.md` para bootstrap sem senha fictícia.

O painel foi implementado em código, mas ainda requer ambiente Netlify com variáveis e testes E2E de upload/login antes de considerar a aplicação publicada. Nenhuma foto real foi enviada. O Neon anterior segue preservado como referência e não recebe novas alterações.

## Integração Netlify

`netlify.toml` usa Next.js SSR e o plugin OpenNext gerenciado pela Netlify. A equipe `saborcomamor` não tem site criado/vinculado ainda. Como o repositório GitHub continua sem autorização de escrita via integração, esta entrega é um pacote de código local; não representa deploy.
