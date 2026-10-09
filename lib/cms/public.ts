import type { MediaAssignments } from "./media";
type RecordRow={slot_key:string;photo_id:string;published_storage_path:string;alt_text:string;caption:string};
export async function getPublishedMediaAssignments():Promise<MediaAssignments>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)return {};
  try {
    const response=await fetch(url+"/rest/v1/site_media_slots?select=slot_key,photo_id,published_storage_path,alt_text,caption&is_published=eq.true", {
      headers:{apikey:key},cache:"no-store"
    });
    if(!response.ok)return {};
    const entries=(await response.json()) as RecordRow[];
    const result:MediaAssignments={};
    for(const row of entries) {
      if(!row.published_storage_path || !/^[a-zA-Z0-9._/-]+$/.test(row.published_storage_path)) continue;
      result[row.slot_key]={
        photo_id:row.photo_id,
        src:url+"/storage/v1/object/public/sabor-publicadas/"+row.published_storage_path.split("/").map(encodeURIComponent).join("/"),
        alt:row.alt_text,
        label:row.caption||"",
      };
    }
    return result;
  }catch{return {};}
}
