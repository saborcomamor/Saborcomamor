# AlbumBackLink

**Arquivo obrigatório:** `src/components/sections/gallery/AlbumBackLink.tsx`

**Propósito:** executar apenas a responsabilidade visual ou funcional representada pelo nome; ser independente das demais seções.

**Layout:** mobile 320 px primeiro; controle por toque, foco visível, estados vazio/erro/carregamento.

**Motion:** timeline isolada em `AlbumBackLink.motion.ts` quando houver animação complexa. Fallback 2D ou reduced-motion.

**Segurança:** arquivos públicos apenas se aprovados e publicados. Componentes admin exigem autorização no servidor; entradas validadas e auditadas.

**Critério de aceite:** editar este arquivo não exige alterar os demais componentes.
