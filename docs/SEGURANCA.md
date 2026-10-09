# Segurança, LGPD e pré-publicação

Este documento é uma matriz de controles técnicos. Não substitui uma avaliação jurídica da operação.

## Neste primeiro corte público (sem backend)
- **Sem contas de usuário e sem pseudo-painel de administração.** Não existe rota pública de admin falsa que aceite senha no navegador.
- **Sem dados persistidos.** O formulário Zod valida localmente e gera mensagem em WhatsApp no aparelho. O envio ocorre apenas após ação humana.
- **Dados coletados no navegador:** serviço, tipo de evento, número aproximado de convidados, cidade, data opcional e observações. Evitar solicitar dados sensíveis.
- **WhatsApp:** número comercial via variável pública sem dados secretos; mensagem revisável na plataforma externa.
- **Arquivos:** nenhuma funcionalidade de upload aceita arquivos no estágio atual; impedimos upload inseguro até existir backend.
- **Dependências:** atualizar versões, auditar (`npm audit`) em CI e verificar licenças antes do lançamento.
- **Cabeçalhos:** CSP restritiva de base (ajustar em produção após teste), HSTS, X-Content-Type-Options, Frame Options, Referrer Policy, Permissions Policy.
- **Robots:** `noindex`/`disallow` deliberados durante desenvolvimento. Não são mecanismos de sigilo.
- **Mídia:** imagens de terceiros são temporárias. O operador deve ter autorização escrita para uso de fotos com pessoas identificáveis, inclusive em contexto de eventos privados.
- **Cookies:** sem analytics; splash usa `sessionStorage` somente no navegador e deve ser mencionado na transparência.

## Backend e painel (gate obrigatório antes de implementar)
1. Hospedagem e banco escolhidos. Credenciais APENAS em variáveis de servidor, jamais em `NEXT_PUBLIC_`.
2. Autenticação gerenciada, senhas com hash moderno, MFA para admin, sessões seguras com `HttpOnly`, `Secure`, `SameSite`.
3. Autorização **server-side** para leitura e escrita; negar por padrão, RBAC e auditoria de ações.
4. Proteção de CSRF conforme estratégia de autenticação; proteção de abuso/rate limiting em login, leads e APIs.
5. Upload: assinar URLs com tempo curto, validar extensões, MIME e magic bytes, dimensões/tamanho, sanitizar EXIF, nomes aleatórios; nunca executar SVG/HTML não confiável.
6. Storage privado para originais e autorização de publicação por imagem; catálogo público usa versões derivadas aprovadas.
7. Banco com migrações, backups testados e acesso de menor privilégio; nunca expor conexão ao navegador.
8. Registros de consentimentos/autorização de uso de imagem e exclusão programada conforme base legal.
9. Registro e resposta a incidentes com avaliação de gravidade e comunicação quando exigida à ANPD e titulares.
10. Direitos LGPD: identificação do controlador, canal do titular, base legal, transparência, prazo de retenção, fornecedores/suboperadores, transferências internacionais quando aplicáveis.

## Checklist para liberação
- [ ] Trocar fotos ilustrativas por fotos reais licenciadas/autorizadas.
- [ ] Informar controlador e canal de privacidade real nas páginas legais.
- [ ] Revisar copy, telefone, endereço e cidades atendidas.
- [ ] Verificar WCAG: teclado, labels, contraste, ordem de foco, reflow 320px, `prefers-reduced-motion`.
- [ ] Testar SSL, headers CSP e todas as rotas na hospedagem.
- [ ] Validar abertura do orçamento em iOS/Android e sem WhatsApp instalado.
- [ ] Habilitar SEO apenas após revisão e aprovação.
- [ ] Conferir eventuais obrigações do CDC e contratação a distância conforme oferta efetiva.
- [ ] Aprovar privacidade e termos com responsável da empresa e revisão jurídica adequada.
