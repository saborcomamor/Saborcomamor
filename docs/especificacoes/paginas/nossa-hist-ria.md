# Nossa história /nossa-historia

## Composição
Linha narrativa sobre Marli e começo em 2010, família, equipe e jeito de servir; fotos reais.

## Motion e interação
Timeline com cartas e pequenos parallax; fallback sequência simples.

## Regras e validação
Não destacar idade atual ou outras informações voláteis sem confirmação.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
