import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const base=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,base),"utf8");
test("painel usa quatro abas fixas no rodapé e não mostra álbuns",()=>{
 const code=read("components/admin/AdminDashboard.tsx");
 assert.match(code,/app-admin-tabs/);
 for(const name of ["Site","Fotos","Galeria","Mais"])assert.ok(code.includes('label:"'+name+'"'));
 assert.doesNotMatch(code,/AdminAlbums/);
 assert.doesNotMatch(code,/Nosso acervo/);
 assert.match(read("styles/admin/AppCMS.css"),/position:fixed;bottom:0/);
});
test("upload não permite álbum nem publicar automaticamente",()=>{
 const uploader=read("components/admin/PhotoUploader.tsx");
 assert.match(uploader,/type="file" multiple/);
 assert.match(uploader,/album_id:null/);
 assert.match(uploader,/is_published:false/);
 assert.doesNotMatch(uploader,/from\("albums"\)/);
 assert.doesNotMatch(uploader,/update\(\{\s*is_published: true/);
 assert.match(uploader,/approve_photo_rights/);
});
test("galeria usa seleção explícita e salva ordem em operação única",()=>{
 const gallery=read("components/admin/AdminGallery.tsx");
 const publicPage=read("app/galeria/page.tsx");
 const db=read("lib/supabase/public.ts");
 const sql=read("supabase/migrations/202610090007_gallery_entries.sql");
 assert.match(gallery,/replace_gallery_selection/);
 assert.match(gallery,/Publicar seleção/);
 assert.match(gallery,/setSelected\(\[\]\)/);
 assert.match(db,/gallery_entries/);
 assert.doesNotMatch(db,/albums/);
 assert.doesNotMatch(db,/photos\?select/);
 assert.doesNotMatch(publicPage,/<PageHero/);
 assert.match(sql,/pg_advisory_xact_lock/);
 assert.match(sql,/JOIN app_private\.photo_approvals/);
 assert.match(sql,/RAISE EXCEPTION 'Not authorized'/);
});
test("galeria pública não mostra filtros, contagem ou texto sobre fotos",()=>{
 const pub=read("components/gallery/GalleryCollection.tsx");
 assert.doesNotMatch(pub,/filters\.map|className="gallery-filters"|className="gallery-count"|<button/);
 assert.doesNotMatch(read("components/ui/PhotoGrid.tsx"),/<span>\{item\.label\}<\/span>/);
});
test("todas as imagens anteriores são preservadas por migração não destrutiva",()=>{
 const sql=read("supabase/migrations/202610090007_gallery_entries.sql");
 assert.match(sql,/INSERT INTO public\.gallery_entries/);
 assert.doesNotMatch(sql,/DROP TABLE public\.photos|TRUNCATE public\.photos/);
});
