# Escolha do serviço

**Componente:** `src/components/sections/home/ExpandableServices.tsx`

**Animação isolada:** `src/components/sections/home/ExpandableServices.motion.ts` (se necessário)

**Visual/conteúdo:** Duas opções: empresa compra ingredientes e prepara / cliente fornece ingredientes e equipe cozinha.

**Movimento:** Painéis se expandem por toque, não por hover.

**Regras mobile:** 320–430px; toque e scroll nativos; controls com 44px; sem overflow horizontal; fallback em reduced-motion.

**Estados a validar:** carregando, sucesso, mídia vazia, erro de imagem, animação reduzida, navegação por teclado.

**Segurança e privacidade:** somente mídia autorizada, URLs seguras; nunca expor dados de cliente não publicados.

**Teste de aceite:** o conteúdo é entendível e acionável sem animação e funciona no Android de entrada.
