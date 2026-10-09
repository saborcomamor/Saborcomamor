# Buffet completo /servicos/buffet-completo

## Composição
Hero fotográfico; definição do que a empresa realiza; cardápio personalizado (se disponível); galeria vinculada; etapas; FAQ; CTA.

## Motion e interação
Fotografia de mesa e serviço; zoom/depth suave e galeria com swipe.

## Regras e validação
Detalhes exatos de compras, pessoal, deslocamento e montagem exigem confirmação comercial.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
