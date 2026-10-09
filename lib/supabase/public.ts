import type {GalleryPhoto} from "@/lib/gallery-types";
import {getPublicDatabase} from "@/lib/supabase/read-only";
type GalleryRow={
 photo_id:string;sort_order:number;published_storage_path:string;alt_text:string;
 fit_mode:"cover"|"contain";focus_x:number;focus_y:number;zoom:number;
};
export async function getPublishedPhotos():Promise<GalleryPhoto[]>{
 const db=getPublicDatabase(),base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!db||!base)return [];
 try{
  const {data,error}=await db.from("gallery_entries")
    .select("photo_id,sort_order,published_storage_path,alt_text,fit_mode,focus_x,focus_y,zoom")
    .order("sort_order",{ascending:true});
  if(error)throw error;
  return ((data||[]) as GalleryRow[]).filter(row=>!!row.published_storage_path)
   .map(row=>({
    id:row.photo_id,category:"Buffets" as const,label:"",alt:row.alt_text,
    src:base+"/storage/v1/object/public/sabor-publicadas/"+
     row.published_storage_path.split("/").map(encodeURIComponent).join("/"),
    fit_mode:row.fit_mode==="cover"?"cover":"contain",
    focus_x:row.focus_x??50,focus_y:row.focus_y??50,zoom:Number(row.zoom)||1
   }));
 }catch(error){console.error("Failed to load published gallery",error);return [];}
}
