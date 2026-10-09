import {getPublicDatabase} from "@/lib/supabase/read-only";
import type {PublishedServices,PublicService} from "./services-context";
export async function getPublishedServices():Promise<PublishedServices>{
 const db=getPublicDatabase();if(!db)return {};
 const {data,error}=await db.from("services").select("code,title,summary").eq("is_published",true);
 if(error){console.error("Unable to load public service descriptions",error);return {};}
 const map:PublishedServices={};
 for(const item of (data||[]) as PublicService[])map[item.code]=item;
 return map;
}
