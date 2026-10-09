import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("public reads use Supabase's no-store REST client",()=>{
 const server=read("lib/supabase/read-only.ts");
 assert.match(server,/createClient/);
 assert.match(server,/cache:"no-store"/);
 for(const path of ["lib/cms/public.ts","lib/public-dynamic.ts","lib/supabase/public.ts"])
  assert.match(read(path),/getPublicDatabase/,path);
});

test("Next shared layout synchronizes CMS updates when tab focus returns",()=>{
 const layout=read("app/layout.tsx");
 const live=read("components/ui/LivePublicContent.tsx");
 assert.match(layout,/getPublishedServices/);
 assert.match(live,/readLatestSiteContent/);
 assert.match(live,/visibilitychange/);
 assert.match(live,/pageshow/);
 assert.match(live,/SITE_PUBLISHED_EVENT/);
 assert.match(live,/SiteMediaProvider items=\{state.media\}/);
 assert.match(live,/ServicesProvider services=\{state.services\}/);
 assert.match(live,/favicon_path/);
});

test("save success is verified and notifies public clients",()=>{
 for(const path of [
 "components/admin/AdminVisualSettings.tsx","components/admin/AdminBusinessProfile.tsx",
 "components/admin/AdminFavicon.tsx","components/admin/AdminGallery.tsx",
 "components/admin/AdminSiteMedia.tsx","components/admin/AdminIntro.tsx","components/admin/AdminServices.tsx"
 ]){
  assert.match(read(path),/announceSitePublished/,path);
  assert.match(read(path),/router.refresh\(\)/,path);
 }
 assert.match(read("components/admin/AdminVisualSettings.tsx"),/data\?\.keepsakes_font!==font/);
 assert.match(read("components/admin/AdminBusinessProfile.tsx"),/Object.keys\(payload\)/);
 assert.match(read("components/admin/AdminServices.tsx"),/Rascunho salvo/);
});

test("gallery displays only explicitly selected public photos",()=>{
 assert.match(read("components/gallery/GalleryCollection.tsx"),/readLatestGallery/);
 assert.match(read("lib/cms/browser-public.ts"),/from\("gallery_entries"\)/);
 assert.ok(read("app/galeria/page.tsx").includes("<GalleryCollection items={photos}/>"));
});

test("intro can be previewed even if previously viewed this session",()=>{
 assert.match(read("components/home/SplashIntro.tsx"),/verEntrada/);
 assert.match(read("components/admin/AdminIntro.tsx"),/\/\?verEntrada=1/);
});

test("service summaries actually appear when published",()=>{
 assert.match(read("lib/cms/public-services.ts"),/eq\("is_published",true\)/);
 for(const path of [
 "components/services/ServiceIndexList.tsx","components/services/FullBuffetIntro.tsx",
 "components/services/CookingIntro.tsx","components/home/ExpandableServices.tsx"
 ])assert.match(read(path),/usePublishedServices/,path);
});

test("Storage deletion can read published files only for authorized admins",()=>{
 const migration=read("supabase/migrations/202610090010_repair_photo_cleanup.sql");
 assert.match(migration,/CREATE POLICY sabor_admin_read_published/);
 assert.match(migration,/is_site_admin/);
});

test("business name changes reach the public header and footer",()=>{
 assert.match(read("components/ui/Header.tsx"),/useBusinessProfile/);
 assert.match(read("components/ui/Footer.tsx"),/business.business_name/);
});
