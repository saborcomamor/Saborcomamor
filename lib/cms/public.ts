import type {MediaAssignments} from "./media";
import {getPublicDatabase} from "@/lib/supabase/read-only";
type SlotRow={slot_key:string;photo_id:string;published_storage_path:string;alt_text:string;caption:string};
export async function getPublishedMediaAssignments():Promise<MediaAssignments>{
 const db=getPublicDatabase();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!db||!url)return {};
 try{
  const {data,error}=await db.from("site_media_slots")
   .select("slot_key,photo_id,published_storage_path,alt_text,caption").eq("is_published",true);
  if(error)throw error;
  const result:MediaAssignments={};
  for(const row of (data||[]) as SlotRow[]){
   if(!row.published_storage_path || !/^[a-zA-Z0-9._/-]+$/.test(row.published_storage_path))continue;
   result[row.slot_key]={
    photo_id:row.photo_id,
    src:url+"/storage/v1/object/public/sabor-publicadas/"+
     row.published_storage_path.split("/").map(encodeURIComponent).join("/"),
    alt:row.alt_text,label:row.caption||""
   };
  }
  return result;
 }catch(error){console.error("Failed to load public media slots",error);return {};}
}
