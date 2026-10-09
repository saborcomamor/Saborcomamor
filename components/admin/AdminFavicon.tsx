"use client";
import {useEffect,useState,type ChangeEvent} from "react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
function faviconUrl(path:string){
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 return base&&path?base+"/storage/v1/object/public/sabor-identidade/"+path:"";
}
export function AdminFavicon(){
 const [path,setPath]=useState("");
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{const db=getSupabaseBrowser();if(!db)return;
  db.from("visual_settings").select("favicon_path").eq("id",1).single().then(({data,error})=>{
   if(!error&&data)setPath(data.favicon_path||"");
   setLoading(false);
  });
 },[]);
 async function upload(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];e.target.value="";
  if(!file)return;
  if(file.type!=="image/png"||file.size>2*1024*1024){setMessage("Use PNG com até 2 MB.");return;}
  let bitmap:ImageBitmap|null=null;
  try{
   bitmap=await createImageBitmap(file);
   if(bitmap.width!==bitmap.height||bitmap.width<256||bitmap.width>2048){
    setMessage("Escolha uma imagem quadrada, de 256 a 2048 pixels.");return;
   }
  }catch{setMessage("Este arquivo não pôde ser aberto.");return;}
  finally{bitmap?.close();}
  const db=getSupabaseBrowser();if(!db)return;
  setBusy(true);setMessage("");
  const target="favicons/"+crypto.randomUUID()+".png";
  const uploadResult=await db.storage.from("sabor-identidade").upload(target,file,{contentType:"image/png",upsert:false});
  if(uploadResult.error){setMessage("Falha no envio do favicon.");setBusy(false);return;}
  const {error}=await db.from("visual_settings").update({
   favicon_path:target,favicon_version:String(Date.now())
  }).eq("id",1);
  setBusy(false);
  if(error){setMessage("Imagem enviada, mas não foi possível publicar o favicon.");return;}
  setPath(target);setMessage("Favicon atualizado. Alguns navegadores demoram para renovar o cache.");
 }
 async function restore(){
  const db=getSupabaseBrowser();if(!db)return;setBusy(true);
  const {error}=await db.from("visual_settings").update({favicon_path:"",favicon_version:String(Date.now())}).eq("id",1);
  setBusy(false);
  if(error){setMessage("Falha ao restaurar ícone.");return;}
  setPath("");setMessage("Ícone padrão restaurado.");
 }
 return <section className="app-favicon" aria-label="Favicon do site">
  <h3>Ícone do site</h3>
  <div className="app-favicon-preview">
   {path?<img src={faviconUrl(path)} alt="Prévia do favicon cadastrado"/>:
     <span aria-hidden="true" className="app-favicon-fallback">S</span>}
   <span>Aparece na aba do navegador e nos favoritos.</span>
  </div>
  {!loading&&<div className="app-favicon-actions">
   <label className="app-primary">Escolher PNG <input type="file" accept="image/png" disabled={busy} onChange={e=>void upload(e)}/></label>
   {path&&<button type="button" onClick={()=>void restore()} disabled={busy}>Restaurar</button>}
  </div>}
  {message&&<p className="app-feedback" role="status">{message}</p>}
 </section>;
}
