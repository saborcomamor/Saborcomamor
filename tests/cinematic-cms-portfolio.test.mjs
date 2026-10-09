import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(name)=>readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("entrada fotográfica abre a Home sem segunda tela clássica",()=>{
 const splash=read("components/home/SplashIntro.tsx");
 assert.match(splash,/Stage="photos"\|null/);
 assert.match(splash,/onPointerDown/);
 assert.match(splash,/onPointerUp/);
 assert.match(splash,/finish\(\)/);
 assert.doesNotMatch(splash,/splash-intro-second|photo-intro-underlay|setStage\("original"\)/);
 assert.match(splash,/sessionStorage\.setItem/);
 assert.match(read("app/page.tsx"),/getIntroFrames/);
 assert.match(read("components/admin/AdminIntro.tsx"),/replace_intro_frames/);
});

test("site tem CMS de informações e perfis dinâmicos",()=>{
 const root=read("app/layout.tsx"),quote=read("components/quote/QuoteForm.tsx");
 assert.match(root,/getBusinessProfile/);
 assert.match(quote,/useBusinessProfile/);
 assert.match(read("components/admin/AdminDashboard.tsx"),/AdminBusinessProfile/);
 assert.match(read("components/ui/Footer.tsx"),/useBusinessProfile/);
 assert.doesNotMatch(read("components/ui/Footer.tsx"),/não foi configurado/);
});

test("home revisada preserva copy e remove ícones aleatórios",()=>{
 const copy=read("components/home/ClientStories.tsx");
 assert.match(copy,/Que a mesa seja farta/);
 assert.match(copy,/Que os encontros sejam leves/);
 assert.match(copy,/Que as memórias sejam bonitas/);
 assert.doesNotMatch(copy,/keepsakes-flower|✳/);
 assert.doesNotMatch(read("components/home/WarmWelcome.tsx"),/✳/);
 assert.match(read("components/home/CinematicHero.tsx"),/Celebrar tem/);
 assert.match(read("components/home/HomeWave.tsx"),/<svg/);
});

test("galeria animada utiliza apenas seleção pública e não mostra rótulos",()=>{
 const comp=read("components/gallery/GalleryCollection.tsx");
 assert.match(comp,/gallery-rotor-stage/);
 assert.match(comp,/gallery-rotor-card/);
 assert.doesNotMatch(comp,/gallery-film-track|gallery-photo-editorial/);
 assert.doesNotMatch(comp,/filters\.map|gallery-count|gallery-filters/);
 assert.match(read("lib/supabase/public.ts"),/gallery_entries/);
 assert.match(read("styles/gallery/Portfolio.css"),/prefers-reduced-motion/);
});

test("páginas públicas não mostram alertas internos de preparação",()=>{
 assert.doesNotMatch(read("components/story/StoryProfile.tsx"),/antes da publicação/);
 assert.doesNotMatch(read("components/quote/QuoteForm.tsx"),/WhatsApp comercial ainda não foi configurado/);
 assert.match(read("app/robots.ts"),/allow:"\//);
});

test("CSS respeita usuários com movimento reduzido",()=>{
 for(const file of ["styles/home/PhotoIntro.css","styles/home/CinematicHero.css","styles/gallery/Portfolio.css"])
  assert.match(read(file),/prefers-reduced-motion/);
});
