import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=(path)=>readFileSync(new URL(path,root),"utf8");
const catalog=read("lib/cms/slots.ts");
const match=catalog.match(/export const MEDIA_SLOTS: MediaSlot\[\] = (\[[\s\S]*?\]);/);
assert.ok(match,"Catálogo de posições deve existir");
const slots=JSON.parse(match[1]);
test("todas as 60 posições do CMS são únicas",()=>{
 assert.equal(slots.length,60);
 assert.equal(new Set(slots.map(x=>x.key)).size,slots.length);
 assert.ok(slots.every(x=>x.page&&x.section&&x.label&&/^p\d\d$/.test(x.fallback)));
});
test("cada página e cada seção possui posições nomeadas",()=>{
 const pages=["home","services","buffet","kitchen","story","gallery"];
 for(const page of pages)assert.ok(slots.some(x=>x.page===page),page);
 for(const s of slots)assert.ok(s.key.startsWith(s.page+"."));
});
test("todas as seções com fotografias foram conectadas ao CMS",()=>{
 const sources=[
 "components/home/CinematicHero.tsx","components/home/WarmWelcome.tsx",
 "components/home/ExpandableServices.tsx","components/home/RotatingFoodGallery.tsx",
 "components/home/StoryCardStack.tsx","components/home/CurvedEventGallery.tsx",
 "components/home/ServingStyles.tsx","components/home/LivingPhotoMosaic.tsx",
 "components/home/FinalInvitation.tsx","components/services/ServiceIndexList.tsx",
 "components/services/FullBuffetGallery.tsx","components/services/CookingGallery.tsx",
 "components/story/StoryProfile.tsx","app/servicos/page.tsx",
 "app/buffet-completo/page.tsx","app/servico-de-cozinha/page.tsx",
 "app/nossa-historia/page.tsx"
 ];
 for(const name of sources)assert.match(read(name),/slot=|slotPrefix=/,name);
 assert.match(read("components/admin/AdminGallery.tsx"),/publish_gallery_layout/);
});
test("edição funciona por posição e mantém fallback",()=>{
 assert.match(read("components/ui/Photo.tsx"),/resolveSitePhoto/);
 assert.match(read("components/ui/PhotoGrid.tsx"),/resolveSitePhoto/);
 assert.match(read("app/layout.tsx"),/getPublishedMediaAssignments/);
 assert.match(read("components/admin/AdminSiteMedia.tsx"),/set_site_media_slot/);
 assert.match(read("components/admin/AdminSiteMedia.tsx"),/clear_site_media_slot/);
 assert.match(read("components/admin/AdminDashboard.tsx"),/AdminSiteMedia/);
});
