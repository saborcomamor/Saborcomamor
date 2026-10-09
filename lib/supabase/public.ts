import type {GalleryPhoto} from "@/lib/gallery-types";
type GalleryRow={
 photo_id:string;sort_order:number;published_storage_path:string;alt_text:string;
 fit_mode:"cover"|"contain";focus_x:number;focus_y:number;zoom:number;
};
/** The portfolio draws exclusively from the explicitly saved gallery selection. */
export async function getPublishedPhotos():Promise<GalleryPhoto[]>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key)return [];
 try{
  const response=await fetch(base+"/rest/v1/gallery_entries?select=photo_id,sort_order,published_storage_path,alt_text,fit_mode,focus_x,focus_y,zoom&order=sort_order.asc",{
   headers:{apikey:key},cache:"no-store"
  });
  if(!response.ok)throw Error("Gallery API: "+response.status);
  const entries=(await response.json()) as GalleryRow[];
  return entries.filter(x=>!!x.published_storage_path).map(row=>({
   id:row.photo_id,
   src:base+"/storage/v1/object/public/sabor-publicadas/"+row.published_storage_path.split("/").map(encodeURIComponent).join("/"),
   alt:row.alt_text,category:"Buffets" as const,label:"",
   fit_mode:row.fit_mode==="cover"?"cover":"contain",
   focus_x:row.focus_x??50,focus_y:row.focus_y??50,zoom:Number(row.zoom)||1
  }));
 }catch(error){console.error("Unable to load public portfolio",error);return [];}
}
