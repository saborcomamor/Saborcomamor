# Galeria curva de eventos

**Componente:** `src/components/sections/home/CurvedEventGallery.tsx`

**Animação isolada:** `src/components/sections/home/CurvedEventGallery.motion.ts` (se necessário)

**Visual/conteúdo:** Fotos por álbum e link para cada galeria.

**Movimento:** Slider panorâmico em arco com controles, fallback horizontal.

**Regras mobile:** 320–430px; toque e scroll nativos; controls com 44px; sem overflow horizontal; fallback em reduced-motion.

**Estados a validar:** carregando, sucesso, mídia vazia, erro de imagem, animação reduzida, navegação por teclado.

**Segurança e privacidade:** somente mídia autorizada, URLs seguras; nunca expor dados de cliente não publicados.

**Teste de aceite:** o conteúdo é entendível e acionável sem animação e funciona no Android de entrada.
