# Instalação do Sabor com Amor como aplicativo (PWA)

## O que foi adicionado

- Manifesto em `/manifest.webmanifest`, com `display: standalone`, `scope: /`, nome e ícones PNG 192/512 e máscara.
- Ícones próprios do buffet gerados em rotas PNG estáticas; independentes do favicon editável do CMS.
- Service worker que nunca salva conteúdo do Supabase, fotos, APIs ou painel: apenas a página estática offline.
- Um aviso de instalação dentro do site, apresentado no celular após a entrada cinematográfica; reabrível no menu.
- Em Chrome/Edge compatíveis, o botão aciona `beforeinstallprompt.prompt()` **somente após clique**.
- Em navegador interno de Instagram/Google, sem evento nativo, instrui abrir o link no Chrome; no iOS explica o caminho pelo Safari.
- O aviso não aparece em apps já instalados, e respeita recusa por 14 dias e `appinstalled`.

## Restrições importantes

O desenvolvedor não consegue **forçar** a caixa nativa de instalação no carregamento: ela depende de critérios e gesto do usuário. O aviso dentro do site é próprio, não uma simulação de instalação concluída. Ícones de PWA são independentes do favicon; atualizar favicon no CMS não troca automaticamente o ícone do app já instalado.

## Verificações pós-publicação

1. Em HTTPS, visitar `/manifest.webmanifest`, `/pwa-icon-192.png`, `/pwa-icon-512.png`, `/sw.js`: todos devem retornar HTTP 200; os PNG devem ser imagens reais.
2. Android Chrome, em aba normal: abrir site, concluir abertura cinematográfica, ver cartão de instalação, clicar em Instalar. Se o navegador ainda não tiver disparado `beforeinstallprompt`, utilizar o menu Chrome ou aguardar elegibilidade. Não confundir atalho com app instalado.
3. Abrir o PWA pela tela inicial: deve rodar sem a barra do Chrome e sem exibir novamente o convite.
4. Desligar conexão e navegar: página offline simples; voltar a conectar para fotografias e CMS.
5. Instagram, Google App e iOS: verificar ajuda contextual; opções nativas dependem do navegador.

## Cuidados de segurança

O service worker não intercepta navegação `/admin` nem `/api` e nunca cacheia respostas de autenticação, JSON de fotos ou conteúdo pessoal. Cache estático tem versão, limpa versões anteriores e não impede revalidação de páginas.
