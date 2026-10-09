# Entrada fotográfica da Home

**Componente:** `components/home/SplashIntro.tsx`

A única introdução implementada pela página é a sequência de fotografias selecionada no painel. As fotos entram automaticamente, empilhadas na ordem configurada; um único arraste lateral remove a pilha e revela a Home diretamente.

**Não exibir**: segundo overlay bege, logotipo circular/coração como uma tela adicional, tela "Entrar no site" ou pausa obrigatória depois da sequência.

**PWA:** a inicialização nativa em dispositivos Android instalados é gerada pelo Chrome/Android, com base no ícone e no manifesto. Não é uma página do site e não pode ser desligada sem perder a experiência de app instalável. O ícone nativo foi suavizado com a própria identidade cromática do site. Mantenha `display: standalone`.

**Mobile:** interação Pointer Events (toque/arraste), um único gesto e suporte a teclado, `prefers-reduced-motion`, e prévia `?verEntrada=1`. Quando não há fotos selecionadas, a Home abre imediatamente.

**Segurança:** somente fotos aprovadas e expostas na seleção pública; não incluir endpoints privados no frontend.
