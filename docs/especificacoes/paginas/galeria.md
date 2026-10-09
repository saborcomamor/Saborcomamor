# Galeria /galeria

## Composição
Cabeçalho mínimo, fotos em destaque, filtros Tudo/Pratos/Buffets/Eventos/Equipe/Bastidores, mosaico, carregar mais.

## Motion e interação
Imagens em transições leves, filtros com crossfade sem reposicionar leitura bruscamente.

## Regras e validação
Categorias com zero fotos ficam ocultas; ordenação no admin.

## Arquitetura
Cada rota possui seu próprio `app/.../page.tsx`; dividir subseções em arquivos `components/sections/<contexto>/*.tsx`, motion em arquivo próprio e dados/validação fora da UI.

## Mobile e acessibilidade
Projetar 320px primeiro, depois 360–430px; foco visível; navegação por toque/teclado; redução de movimento; testes de erro e vazio.
