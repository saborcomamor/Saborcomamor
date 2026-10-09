import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("cada foto da overlay precisa de um gesto e não tem botão continuar",()=>{
 const component=read("components/home/SplashIntro.tsx");
 assert.match(component,/active>=frames\.length-1/);
 assert.match(component,/setActive\(i=>i\+1\)/);
 assert.match(component,/onPointerUp/);
 assert.match(component,/Math\.abs\(dx\)/);
 assert.doesNotMatch(component,/setInterval|setTop\(i=>i\+1\)|photo-intro-skip|>Continuar</);
 assert.match(read("styles/home/PhotoIntro.css"),/photo-intro-expand/);
});

test("manifesto permite fontes no CMS e revela textos conforme scroll",()=>{
 assert.match(read("components/home/ClientStories.tsx"),/useVisualSettings/);
 assert.match(read("components/home/ClientStories.tsx"),/Porque o melhor de uma festa<\/span>/);
 assert.match(read("components/home/ClientStories.tsx"),/é estar perto de quem a gente ama\.<\/span>/);
 assert.match(read("components/ui/ScrollInk.tsx"),/scrub/);
 assert.match(read("components/ui/ScrollInk.tsx"),/blur/);
 assert.match(read("components/admin/AdminVisualSettings.tsx"),/visual_settings/);
});

test("galeria fullscreen apresenta somente itens selecionados sem duplicar faixa",()=>{
 const component=read("components/gallery/GalleryCollection.tsx");
 assert.match(component,/items\[shownIndex\]/);
 assert.match(component,/gallery-fullscreen-photo/);
 assert.doesNotMatch(component,/\.\.\.film|gallery-film-track|gallery-photo-editorial/);
 assert.match(read("lib/supabase/public.ts"),/from\("gallery_entries"\)/);
 assert.doesNotMatch(read("lib/supabase/public.ts"),/from\("photos"\)|uploaded\.length\?/);
 const settings=read("components/admin/AdminGallery.tsx");
 assert.match(settings,/publish_gallery_layout/);
 assert.match(settings,/focus_x/);
 assert.match(settings,/fit_mode/);
 assert.match(settings,/zoom/);
 assert.match(settings,/improvePhotoQuality/);
});

test("fotos originais ficam privadas e derivados melhores são opcionais e autorizados",()=>{
 const quality=read("lib/cms/highres.ts");
 const upload=read("components/admin/PhotoUploader.tsx");
 assert.match(quality,/sabor-originais/);
 assert.match(quality,/get_photo_original_path/);
 assert.match(quality,/register_highres_photo/);
 assert.match(upload,/makeQualityWebp\(item\.file,3000\)/);
 assert.doesNotMatch(upload,/canvas\.toBlob\(resolve,"image\/webp",\.82\)/);
});

test("exclusão protegida, limpeza recuperável e favicon dinâmico",()=>{
 const photos=read("components/admin/AdminPhotos.tsx");
 const favicon=read("components/admin/AdminFavicon.tsx");
 const migration=read("supabase/migrations/202610090009_p6_gallery_editor.sql");
 assert.match(photos,/delete_unused_photo/);
 assert.match(photos,/complete_photo_cleanup/);
 assert.match(photos,/inUse/);
 assert.match(favicon,/sabor-identidade/);
 assert.match(read("app/layout.tsx"),/generateMetadata/);
 assert.match(migration,/ENABLE ROW LEVEL SECURITY/);
 assert.match(migration,/photo_cleanup_queue/);
 assert.match(migration,/REVOKE EXECUTE ON FUNCTION public\.publish_gallery_layout/);
});

test("carrosséis dos arquivos ZIP foram adaptados com créditos MIT",()=>{
 assert.match(read("components/gallery/GalleryTiltedPicker.tsx"),/Tilted/);
 assert.match(read("components/home/CurvedEventGallery.tsx"),/File-drawer/i);
 assert.match(read("docs/THIRD_PARTY_CAROUSELS.md"),/Copyright \(c\) 2026 Vivi Tseng/);
 assert.doesNotMatch(read("components/gallery/GalleryTiltedPicker.tsx"),/images\.unsplash\.com/);
});
