import {getPublicDatabase} from "@/lib/supabase/read-only";
export type BusinessProfile={
 business_name:string;city:string;whatsapp:string;telephone:string;email:string;
 address:string;hours:string;instagram:string;facebook:string;
};
export const defaultBusiness:BusinessProfile={
 business_name:"Sabor com Amor",city:"Telêmaco Borba, PR",whatsapp:"",telephone:"",
 email:"",address:"",hours:"",instagram:"",facebook:""
};
export type IntroFrame={id:string;src:string;alt:string;sort_order:number};
export type VisualSettings={keepsakes_font:"caveat"|"dancing"|"allura";favicon_path:string;favicon_version:string};
export const defaultVisual:VisualSettings={keepsakes_font:"caveat",favicon_path:"",favicon_version:""};
export async function getBusinessProfile():Promise<BusinessProfile>{
 const db=getPublicDatabase();if(!db)return defaultBusiness;
 const {data,error}=await db.from("business_profile")
  .select("business_name,city,whatsapp,telephone,email,address,hours,instagram,facebook")
  .eq("id",1).maybeSingle();
 if(error){console.error("Failed to load public business details",error);return defaultBusiness;}
 return {...defaultBusiness,...data};
}
export async function getVisualSettings():Promise<VisualSettings>{
 const db=getPublicDatabase();if(!db)return defaultVisual;
 const {data,error}=await db.from("visual_settings")
  .select("keepsakes_font,favicon_path,favicon_version").eq("id",1).maybeSingle();
 if(error){console.error("Failed to load published visual settings",error);return defaultVisual;}
 return {...defaultVisual,...data};
}
export async function getIntroFrames():Promise<IntroFrame[]>{
 const db=getPublicDatabase(),url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 if(!db||!url)return [];
 const {data,error}=await db.from("intro_frames")
  .select("photo_id,published_storage_path,alt_text,sort_order").order("sort_order",{ascending:true});
 if(error){console.error("Failed to load intro frames",error);return [];}
 return (data||[]).filter(x=>/^[a-zA-Z0-9_.\/-]+$/.test(x.published_storage_path))
  .map(x=>({
   id:x.photo_id,sort_order:x.sort_order,alt:x.alt_text,
   src:url+"/storage/v1/object/public/sabor-publicadas/"+
    x.published_storage_path.split("/").map(encodeURIComponent).join("/")
  }));
}
