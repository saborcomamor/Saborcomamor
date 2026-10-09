"use client";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import type {MediaAssignments} from "@/lib/cms/media";
import type {BusinessProfile,VisualSettings} from "@/lib/public-dynamic";
import type {GalleryPhoto} from "@/lib/gallery-types";
import type {PublishedServices,PublicService} from "./services-context";
type Slot={slot_key:string;photo_id:string;published_storage_path:string;alt_text:string;caption:string};
type GalleryRow={photo_id:string;published_storage_path:string;sort_order:number;alt_text:string;
 fit_mode:"contain"|"cover";focus_x:number;focus_y:number;zoom:number};
const base=()=>process.env.NEXT_PUBLIC_SUPABASE_URL;
const valid=(path:string)=>/^[a-zA-Z0-9._/-]+$/.test(path);
const urlFor=(path:string)=>base()+"/storage/v1/object/public/sabor-publicadas/"+
 path.split("/").map(encodeURIComponent).join("/");
export async function readLatestSiteContent():Promise<{
 media:MediaAssignments;profile:BusinessProfile;visual:VisualSettings;services:PublishedServices
}>{
 const db=getSupabaseBrowser();
 if(!db||!base())throw Error("Conexão pública do Supabase não configurada");
 const [slots,profile,visual,servicesResult]=await Promise.all([
  db.from("site_media_slots").select("slot_key,photo_id,published_storage_path,alt_text,caption").eq("is_published",true),
  db.from("business_profile").select("business_name,city,whatsapp,telephone,email,address,hours,instagram,facebook").eq("id",1).single(),
  db.from("visual_settings").select("keepsakes_font,favicon_path,favicon_version").eq("id",1).single(),
  db.from("services").select("code,title,summary").eq("is_published",true)
 ]);
 if(slots.error||profile.error||visual.error||servicesResult.error)throw slots.error||profile.error||visual.error||servicesResult.error;
 const media:MediaAssignments={};
 for(const row of (slots.data||[]) as Slot[]){
  if(!row.published_storage_path||!valid(row.published_storage_path))continue;
  media[row.slot_key]={photo_id:row.photo_id,src:urlFor(row.published_storage_path),
   alt:row.alt_text,label:row.caption||""};
 }
 const services:PublishedServices={};
 for(const item of (servicesResult.data||[]) as PublicService[])services[item.code]=item;
 return {media,profile:profile.data as BusinessProfile,visual:visual.data as VisualSettings,services};
}
export async function readLatestGallery():Promise<GalleryPhoto[]>{
 const db=getSupabaseBrowser();
 if(!db||!base())throw Error("Conexão pública do Supabase não configurada");
 const {data,error}=await db.from("gallery_entries")
  .select("photo_id,sort_order,published_storage_path,alt_text,fit_mode,focus_x,focus_y,zoom")
  .order("sort_order",{ascending:true});
 if(error)throw error;
 return ((data||[]) as GalleryRow[])
  .filter(item=>item.published_storage_path&&valid(item.published_storage_path))
  .map(row=>({
   id:row.photo_id,src:urlFor(row.published_storage_path),alt:row.alt_text,
   category:"Buffets",label:"",fit_mode:row.fit_mode==="cover"?"cover":"contain",
   focus_x:row.focus_x??50,focus_y:row.focus_y??50,zoom:Number(row.zoom)||1
  }));
}
