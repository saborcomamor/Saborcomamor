# Orçamento /orcamento

## Composição
Etapa 1 serviço; etapa 2 dados do evento; etapa 3 contato e envio; revisão; sucesso/erro.

## Motion e interação
Transições curtas entre etapas; indicador de progresso textual.

## Regras e validação
Data pode ser “a definir”; só perguntar o que for útil e necessário.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
