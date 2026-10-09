import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("PWA manifesto define abertura standalone, escopo e ícones PNG instaláveis",()=>{
 const manifest=read("app/manifest.ts");
 const layout=read("app/layout.tsx");
 for(const part of ['id:"/"','start_url:"/?origem=aplicativo"','scope:"/"','display:"standalone"',
 'sizes:"192x192"','sizes:"512x512"','purpose:"maskable"','type:"image/png"']){
  assert.ok(manifest.includes(part),part);
 }
 assert.match(layout,/manifest:"\/manifest\.webmanifest"/);
 assert.match(layout,/appleWebApp/);
 assert.match(layout,/apple:\[\{url:"\/pwa-icon-192\.png"/);
});

test("ícones de 192 e 512 px têm respostas de imagem reais",()=>{
 const renderer=read("lib/pwa/render-icon.tsx");
 assert.match(renderer,/ImageResponse/);
 for(const pair of [
  ["app/pwa-icon-192.png/route.tsx","renderPwaIcon(192)"],
  ["app/pwa-icon-512.png/route.tsx","renderPwaIcon(512)"],
  ["app/pwa-icon-maskable.png/route.tsx","renderPwaIcon(512,true)"]
 ]){
  assert.ok(read(pair[0]).includes(pair[1]),pair[0]);
 }
});

test("service worker funciona apenas como fallback e jamais cacheia dados privados",()=>{
 const sw=read("public/sw.js");
 assert.match(sw,/addEventListener\("install"/);
 assert.match(sw,/addEventListener\("activate"/);
 assert.match(sw,/addEventListener\("fetch"/);
 assert.match(sw,/request\.mode!=="navigate"/);
 assert.match(sw,/startsWith\("\/admin"\)/);
 assert.match(sw,/startsWith\("\/api"\)/);
 assert.match(sw,/fetch\(request\)\.catch/);
 assert.match(sw,/\/offline\.html/);
 assert.doesNotMatch(sw,/cache\.put\(request|caches\.open\(CACHE\).*put/);
 assert.match(read("public/offline.html"),/Sem conexão/);
});

test("aviso instalável respeita um clique real e explica limitações do navegador",()=>{
 const prompt=read("components/pwa/InstallAppPrompt.tsx");
 const css=read("styles/pwa/InstallAppPrompt.css");
 const chrome=read("components/ui/SiteChrome.tsx");
 assert.match(prompt,/beforeinstallprompt/);
 assert.match(prompt,/installEvent\.preventDefault\(\)/);
 assert.match(prompt,/await prompt\.prompt\(\)/);
 assert.match(prompt,/userChoice/);
 assert.match(prompt,/sabor-pwa-offer-dismiss-until/);
 assert.match(prompt,/runningAsApp/);
 assert.match(prompt,/welcomeSequenceActive/);
 assert.match(prompt,/splash-intro-second/);
 assert.match(prompt,/Instalar aplicativo/);
 assert.match(prompt,/Adicionar à Tela de Início/);
 assert.match(prompt,/Abra o link no Chrome/);
 assert.match(prompt,/serviceWorker\.register\("\/sw\.js"/);
 assert.match(chrome,/InstallAppPrompt/);
 assert.match(css,/prefers-reduced-motion/);
});

test("menu apresenta opção de reabrir convite de instalação depois de dispensar",()=>{
 const header=read("components/ui/Header.tsx");
 assert.match(header,/mobile-nav-install/);
 assert.match(header,/sabor-show-install/);
 assert.match(header,/querySelectorAll<HTMLElement>\("a,button"\)/);
 assert.match(read("next.config.ts"),/source: "\/sw\.js"/);
});
