export type BusinessProfile = {
 business_name:string;city:string;whatsapp:string;telephone:string;email:string;
 address:string;hours:string;instagram:string;facebook:string;
};
export const defaultBusiness:BusinessProfile={
 business_name:"Sabor com Amor",city:"Telêmaco Borba, PR",whatsapp:"",telephone:"",
 email:"",address:"",hours:"",instagram:"",facebook:""
};
export type IntroFrame={id:string;src:string;alt:string;sort_order:number};
const base=()=>process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey=()=>process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
async function getRows<T>(table:string,params:string):Promise<T[]>{
 const url=base(),key=publicKey();if(!url||!key)return [];
 try{
  const response=await fetch(url+"/rest/v1/"+table+"?"+params,{
    headers:{apikey:key},cache:"no-store"
  });
  if(!response.ok)return [];
  return await response.json() as T[];
 }catch{return [];}
}
export async function getBusinessProfile():Promise<BusinessProfile>{
 const rows=await getRows<BusinessProfile>("business_profile","select=business_name,city,whatsapp,telephone,email,address,hours,instagram,facebook&id=eq.1&limit=1");
 return {...defaultBusiness,...rows[0]};
}
export async function getIntroFrames():Promise<IntroFrame[]>{
 type Row={photo_id:string;published_storage_path:string;alt_text:string;sort_order:number};
 const rows=await getRows<Row>("intro_frames","select=photo_id,published_storage_path,alt_text,sort_order&order=sort_order.asc");
 const url=base();if(!url)return [];
 return rows.filter(r=>/^[a-zA-Z0-9_.\/-]+$/.test(r.published_storage_path)).map(r=>({
  id:r.photo_id,alt:r.alt_text,sort_order:r.sort_order,
  src:url+"/storage/v1/object/public/sabor-publicadas/"+r.published_storage_path.split("/").map(encodeURIComponent).join("/")
 }));
}
