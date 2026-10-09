# Serviços /servicos

## Composição
Comparação honesta das duas opções; abertura fotográfica, 2 painéis interativos, diferenças, perguntas frequentes, CTA individual.

## Motion e interação
Antes/depois de montagem; cards expansíveis tocáveis; fallback accordion.

## Regras e validação
Não incluir utensílios nesta fase.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
