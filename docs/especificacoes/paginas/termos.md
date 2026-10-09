# Termos /termos

## Composição
Uso do site, direitos sobre materiais, natureza do pedido de orçamento, canais e responsabilidades.

## Motion e interação
Sem grandes animações no texto jurídico.

## Regras e validação
Não substituir contrato comercial de evento.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
