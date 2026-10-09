"use client";
import {PhotoGrid} from "@/components/ui/PhotoGrid";
import type {SitePhoto} from "@/lib/photos";
/** Galeria sem categorias, filtros, chips, frases ou contadores. */
export function GalleryCollection({items}:{items:SitePhoto[]}){
 return <div className="public-gallery-grid"><PhotoGrid items={items}/></div>;
}
