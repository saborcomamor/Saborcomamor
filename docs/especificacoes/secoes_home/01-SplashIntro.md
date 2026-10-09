# Abertura de boas-vindas

**Componente:** `src/components/sections/home/SplashIntro.tsx`

**Animação isolada:** `src/components/sections/home/SplashIntro.motion.ts` (se necessário)

**Visual/conteúdo:** Foto real, logo sobreposto. Duração breve, pular, só uma vez por sessão.

**Movimento:** Animação reveal + zoom suave; reduced-motion remove overlay.

**Regras mobile:** 320–430px; toque e scroll nativos; controls com 44px; sem overflow horizontal; fallback em reduced-motion.

**Estados a validar:** carregando, sucesso, mídia vazia, erro de imagem, animação reduzida, navegação por teclado.

**Segurança e privacidade:** somente mídia autorizada, URLs seguras; nunca expor dados de cliente não publicados.

**Teste de aceite:** o conteúdo é entendível e acionável sem animação e funciona no Android de entrada.
