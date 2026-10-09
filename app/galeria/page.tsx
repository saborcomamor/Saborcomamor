import type {Metadata} from "next";
import {GalleryCollection} from "@/components/gallery/GalleryCollection";
import {getPublishedPhotos} from "@/lib/supabase/public";
export const metadata:Metadata={title:"Galeria",description:"Fotografias do Buffet Sabor com Amor."};
export const dynamic="force-dynamic";
export default async function GalleryPage(){
 const photos=await getPublishedPhotos();
 return <section className="public-gallery" aria-label="Galeria de fotografias">
  {photos.length>0?<GalleryCollection items={photos}/>:<p className="public-gallery-empty" role="status">Nenhuma fotografia publicada no momento.</p>}
 </section>;
}
