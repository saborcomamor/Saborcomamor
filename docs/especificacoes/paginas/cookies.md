# Cookies /cookies

## Composição
Explicar cookies necessários, opcionais e preferências revogáveis.

## Motion e interação
Preferências em modal acessível, sem dark patterns.

## Regras e validação
Se só houver cookies estritamente necessários, informar sem banner intrusivo.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
