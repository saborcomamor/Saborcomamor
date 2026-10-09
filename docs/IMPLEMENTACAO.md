# Matriz de implementação — Sabor com Amor

Data-base: outubro/2026. Escopo principal: experiência **mobile-first**, texto acolhedor, muitas fotos e movimento intencional.

## Ordem de desenvolvimento

| Etapa | Entregáveis | Aceite |
| --- | --- | --- |
| 0 — Auditoria | Verificar repositório, direitos de imagem, escopo e permissões | Projeto correto, sem sobrescrever produção |
| 1 — Fundação | Next 15, TS strict, design tokens, headers, layout, navegação, SEO protegido | Sem segredos no Git, rotas e estrutura isoladas |
| 2 — Home | 12 arquivos em `components/home`, splash, hero, serviços expansíveis, galeria circular, pilha, arco, mosaico, revelações | Toque, rolagem, redução de movimento e botões funcionais |
| 3 — Páginas | Serviços, buffet, cozinha, galeria, história, orçamento, legais, 404 | Links e informação coerentes, sem falsas ofertas |
| 4 — Fotografia | Substituir fotos ilustrativas por acervo próprio autorizado, formatos e alt revisados | Nenhuma foto genérica ou sem autorização no lançamento |
| 5 — Integração | Número WhatsApp confirmado, domínio, acessibilidade e testes E2E | Orçamento envia para contato real e teste mobile passa |
| 6 — Admin | Identidade segura, RBAC, banco/armazenamento, moderação, gestão de mídias | API protegida no servidor; auditoria; backup; políticas LGPD |
| 7 — Publicação | Conectar Vercel posteriormente, domínio, monitoramento, revisar indexação | Deploy aprovado pela responsável; sem segredos expostos |

## Contrato modular

- Cada **página** possui seu arquivo de rota em `app/{nome}/page.tsx`.
- Cada seção da Home possui **um componente físico separado** em `components/home`.
- Cada bloco reutilizável fica em `components/ui`, `components/services`, `components/gallery`, `components/quote`.
- Dados e textos compartilhados ficam em `lib`, sem chamadas remotas dentro dos componentes visuais.
- Regras de animação complexas podem ser extraídas para `lib/motion` ao crescerem. Não aglomerar novas seções em `app/page.tsx`.
- O CSS atual é um único arquivo de fundação com grupos explícitos. Conforme crescer, migrar cada grupo para seu arquivo CSS Module; não acoplar lógicas entre seções.

## Home — seção → arquivo

| Ordem | Arquivo | Movimento |
|---|---|---|
| 1 | SplashIntro.tsx | Overlay inicial temporizado e dispensável |
| 2 | CinematicHero.tsx | Troca de imagens e zoom cinematográfico |
| 3 | WarmWelcome.tsx | Composição de fotos em revelação por rolagem |
| 4 | ExpandableServices.tsx | Painéis que expandem ao toque |
| 5 | RotatingFoodGallery.tsx | Galeria 3D com swipe, setas e perspectiva |
| 6 | StoryCardStack.tsx | Fotografias empilhadas/sticky |
| 7 | CurvedEventGallery.tsx | Carrossel em perspectiva e arraste |
| 8 | ServingStyles.tsx | Accordions e troca de imagem |
| 9 | LivingPhotoMosaic.tsx | Mosaico fotográfico progressivo |
| 10 | ClientStories.tsx | Manifesto com movimento decorativo (não inventar depoimentos) |
| 11 | BookingSteps.tsx | Passos aparecendo conforme rolagem |
| 12 | FinalInvitation.tsx | Encerramento fotográfico com zoom lento |

## Critérios mobile (antes de desktop)

- Testar nas larguras 320, 360, 390, 430, 768 px; depois desktop 1024 e 1440 px.
- Alvos de toque adequados (~44px); menu com `aria-expanded`, foco visível, sem necessidade de hover.
- Carrosséis: toque e botões de navegação; não bloquear scroll vertical.
- `prefers-reduced-motion` elimina deslocamentos e autoanimações não essenciais; conteúdo fica visível.
- Galeria usa imagens responsivas e carrega inicialmente só o necessário.
- A sessão de história precisa de fotografia real da Marli; nenhum retrato ilustrativo será apresentado como sendo dela após o lançamento.

## O que **não** está implementado nesta etapa

- Banco de dados e salvamento de leads.
- Login de administração, uploads e moderação (não simular autenticação insegura).
- Locação de utensílios (escopo futuro).
- Site publicado ou conectado à Vercel.
- Teste de build real até instalar dependências com acesso a registry.

## Valores que faltam validar com o negócio

- Número comercial do WhatsApp, identidade legal, endereço comercial, cidades atendidas.
- Fotografias originais, consentimentos e eventuais direitos de uso.
- Cardápios e escopo efetivo de atendimento (garçons, infraestrutura, transporte etc.).
- Políticas contratuais, prazo de resposta e regras de disponibilidade.

## Marco de 09/10/2026 — banco pronto e GitHub bloqueado

- Neon `square-art-75354279`: base inicial e controles para direitos de imagem criados na schema `sabor` (ver `docs/NEON.md`).
- A migração SQL foi versionada em `db/migrations/0001_initial_content.sql` para acompanhar o código.
- GitHub `saborcomamor/Saborcomamor`: conectado para consulta, mas criação de arquivos bloqueada pelo conector com erro 403. Nenhum commit realizado.
- Não há deploy e não há ligação com a Vercel. O banco não recebeu dados pessoais nem credenciais.
