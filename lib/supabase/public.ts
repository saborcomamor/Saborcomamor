import type {SitePhoto} from "@/lib/photos";
type GalleryRow={photo_id:string;sort_order:number;published_storage_path:string;alt_text:string};
/** A galeria lê somente a seleção explícita salva no banco, sem álbuns ou categorias. */
export async function getPublishedPhotos():Promise<SitePhoto[]>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key)return [];
 try {
  const response=await fetch(base+"/rest/v1/gallery_entries?select=photo_id,sort_order,published_storage_path,alt_text&order=sort_order.asc",{
    headers:{apikey:key},cache:"no-store"
  });
  if(!response.ok)throw Error("Gallery API: "+response.status);
  const entries=(await response.json()) as GalleryRow[];
  return entries.filter(p=>!!p.published_storage_path).map(p=>({
    id:p.photo_id,
    src:base+"/storage/v1/object/public/sabor-publicadas/"+p.published_storage_path.split("/").map(encodeURIComponent).join("/"),
    alt:p.alt_text,category:"Buffets" as const,label:""
  }));
 } catch(error) {console.error("Falha ao carregar galeria",error);return [];}
}
