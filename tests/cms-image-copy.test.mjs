import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const base=new URL("../",import.meta.url);
const read=name=>readFileSync(new URL(name,base),"utf8");

test("galerias públicas não mostram legendas sobre cada fotografia",()=>{
 const grid=read("components/ui/PhotoGrid.tsx");
 const lightbox=read("components/ui/Lightbox.tsx");
 const css=read("styles/Pages.css");
 assert.doesNotMatch(grid,/<span>\{item\.label\}<\/span>/);
 assert.doesNotMatch(lightbox,/items\[index\]\.label/);
 assert.doesNotMatch(css,/\.photo-grid-cell>span\{/);
});
test("imagem real não herda legenda da foto ilustrativa",()=>{
 const media=read("lib/cms/media.tsx");
 assert.match(media,/label:match\.label/);
 assert.doesNotMatch(media,/match\.label\|\|fallback\.label/);
 const curved=read("components/home/CurvedEventGallery.tsx");
 assert.match(curved,/item\.label&&<span>/);
 const story=read("components/home/StoryCardStack.tsx");
 assert.match(story,/SlotCaption/);
});
test("painel exibe texto antes de salvar e permite removê-lo",()=>{
 const editor=read("components/admin/AdminSiteMedia.tsx");
 assert.match(editor,/app-compare/);
 assert.match(editor,/Texto sobre a foto/);
 assert.match(editor,/p_caption:caption\.trim\(\)/);
 assert.match(editor,/Imagem de exemplo/);
 assert.match(read("supabase/migrations/202610090006_media_caption_per_position.sql"),/p_caption text/);
});
test("alterações chegam ao site sem precisar novo build ou esperar cache de layout",()=>{
 assert.match(read("lib/supabase/read-only.ts"),/cache:"no-store"/);
});
