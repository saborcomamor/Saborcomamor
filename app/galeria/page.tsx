import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GalleryCollection } from "@/components/gallery/GalleryCollection";
import { Notice } from "@/components/ui/Notice";
import { photo, photos } from "@/lib/photos";
import { getPublishedPhotos } from "@/lib/supabase/public";
export const metadata:Metadata={title:"Galeria",description:"Fotografias inspiradoras de pratos, buffets e celebrações."};
export default async function GalleryPage(){const uploaded=await getPublishedPhotos();return <><PageHero eyebrow="UM OLHAR CHEIO DE CARINHO" title="Uma coleção de bons momentos." description="Entre ingredientes, mesas e encontros, o que mais gostamos é fazer parte das lembranças." image={photo("p03")}/><GalleryCollection items={uploaded.length?uploaded:photos}/>{uploaded.length===0&&<div className="container"><Notice/></div>}</>}
