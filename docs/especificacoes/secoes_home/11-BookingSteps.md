# Como contratar

**Componente:** `src/components/sections/home/BookingSteps.tsx`

**Animação isolada:** `src/components/sections/home/BookingSteps.motion.ts` (se necessário)

**Visual/conteúdo:** Três passos curtos sem fazer promessa contratual.

**Movimento:** Reveal sequenciado; fallback estático.

**Regras mobile:** 320–430px; toque e scroll nativos; controls com 44px; sem overflow horizontal; fallback em reduced-motion.

**Estados a validar:** carregando, sucesso, mídia vazia, erro de imagem, animação reduzida, navegação por teclado.

**Segurança e privacidade:** somente mídia autorizada, URLs seguras; nunca expor dados de cliente não publicados.

**Teste de aceite:** o conteúdo é entendível e acionável sem animação e funciona no Android de entrada.
