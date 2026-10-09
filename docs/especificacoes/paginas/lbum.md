# Álbum /galeria/[slug]

## Composição
Capa, tipo de evento, descrição opcional, mosaico com fotos, abrir lightbox, retorno ao ponto anterior.

## Motion e interação
Mosaico animado, lightbox com swipe e controle acessível.

## Regras e validação
Metadados privados removidos; publicar apenas mídia autorizada.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
