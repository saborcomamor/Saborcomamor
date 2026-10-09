import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("fotos entram em pilha e um gesto revela diretamente a Home, sem splash extra",()=>{
 const component=read("components/home/SplashIntro.tsx");
 const css=read("styles/home/PhotoIntro.css");
 assert.match(component,/frames\.map\(\(frame,index\)/);
 assert.match(component,/index\*PHOTO_STEP_MS/);
 assert.match(component,/setReady\(true\)/);
 assert.match(component,/releaseStack/);
 assert.match(component,/onPointerUp/);
 assert.match(component,/finish\(\)/);
 assert.doesNotMatch(component,/splash-intro-second|photo-intro-underlay|setStage\("original"\)/);
 assert.match(css,/background:transparent/);
 assert.match(component,/sabor-intro-v5-complete/);
 assert.match(component,/Arraste para o lado/);
 assert.doesNotMatch(component,/setActive\(i=>i\+1\)|setActive\(active\+1\)|>Continuar</);
 assert.match(css,/photo-intro-arrive/);
 assert.match(css,/photo-intro-sweep/);
 assert.match(css,/--exit-delay/);
 assert.match(css,/prefers-reduced-motion/);
});

test("manifesto permite fontes no CMS e revela textos conforme scroll",()=>{
 assert.match(read("components/home/ClientStories.tsx"),/useVisualSettings/);
 assert.match(read("components/home/ClientStories.tsx"),/Porque o melhor de uma festa<\/span>/);
 assert.match(read("components/home/ClientStories.tsx"),/é estar perto de quem a gente ama\.<\/span>/);
 assert.match(read("components/ui/ScrollInk.tsx"),/scrub/);
 assert.match(read("components/ui/ScrollInk.tsx"),/blur/);
 assert.match(read("components/admin/AdminVisualSettings.tsx"),/visual_settings/);
});

test("galeria 3D mostra apenas seleção publicada sem mosaicos repetidos",()=>{
 const component=read("components/gallery/GalleryCollection.tsx");
 assert.match(component,/items\[shownIndex\]/);
 assert.match(component,/gallery-rotor-card/);
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

test("carrossel rotativo 3D e reflexo editorial respeitam layout, movimento e acessibilidade",()=>{
 const gallery=read("components/gallery/GalleryCollection.tsx");
 const css=read("styles/gallery/Portfolio.css");
 const editor=read("components/admin/AdminGallery.tsx");
 assert.match(gallery,/offsetFor/);
 assert.match(css,/rotateY\(var\(--rotor-ry\)\)/);
 assert.match(gallery,/gallery-rotor-reflection/);
 assert.match(gallery,/gallery-rotor-gloss/);
 assert.match(gallery,/SWIPE_THRESHOLD/);
 assert.match(gallery,/AUTOPLAY_MS/);
 assert.match(gallery,/gallery-rotor-lightbox/);
 assert.match(gallery,/setOpenIndex/);
 assert.match(gallery,/window\.matchMedia/);
 assert.match(gallery,/readLatestGallery/);
 assert.match(gallery,/items\.map\(/);
 assert.match(gallery,/Math\.abs\(card\.offset\)<=2/);
 assert.match(gallery,/objectFit:item\.fit_mode/);
 assert.match(gallery,/item\.focus_x/);
 assert.match(gallery,/item\.zoom/);
 assert.match(css,/perspective:1250px/);
 assert.match(css,/gallery-rotor-card\.is-current/);
 assert.match(css,/prefers-reduced-motion/);
 assert.doesNotMatch(gallery,/gallery-fullscreen-backdrop|gallery-film-track|grid-template-columns/);
 assert.doesNotMatch(css,/gallery-fullscreen-backdrop|gallery-film-track/);
 assert.match(editor,/Definir capa/);
 assert.match(editor,/move\(pos,0\)/);
 assert.match(editor,/publish_gallery_layout/);
});
