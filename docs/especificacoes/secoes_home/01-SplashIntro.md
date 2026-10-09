# Entrada fotográfica — sem segunda tela de boas-vindas

**Componente:** `components/home/SplashIntro.tsx`

- Fotos aprovadas escolhidas pelo CMS entram automaticamente uma sobre a outra, por ordem.
- Depois que a última entra, um arraste único retira a pilha em camadas e deixa **a Home visível diretamente**.
- Não mostrar overlay extra com coração, logo, brand splash ou botão "Entrar no site".
- Sem fotos cadastradas, ir diretamente à página inicial.
- `?verEntrada=1` permite testar a entrada; sessão evita repetir a apresentação.
- Suporte a teclado e `prefers-reduced-motion`.
- A breve abertura do Android para PWA instalado é gerada pelo sistema; o ícone do app deve ser discreto, sem círculo escuro dominante.
