# Serviço de cozinha /servicos/servico-de-cozinha

## Composição
Hero de preparo; lista “cliente fornece” vs “equipe executa”; estrutura necessária; perguntas; galeria de bastidores; CTA.

## Motion e interação
Cartões que se revelam por rolagem; interações por toque.

## Regras e validação
Não afirmar fornecimento de ingredientes ou de equipe adicional nessa modalidade.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
