"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {X,Images,CheckCircle2} from "lucide-react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import {makeQualityWebp} from "@/lib/cms/highres";
type Item={key:string;file:File;preview:string;status:"ready"|"sending"|"done"|"failed";error?:string};
const limit=30;
const allowed=["image/jpeg","image/png","image/webp","image/avif"];
async function digest(blob:Blob){
 return [...new Uint8Array(await crypto.subtle.digest("SHA-256",await blob.arrayBuffer()))].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export function PhotoUploader({onClose,onComplete,onEditSite}:{onClose:()=>void;onComplete:()=>void;onEditSite:()=>void}){
 const [items,setItems]=useState<Item[]>([]);
 const [reference,setReference]=useState("");
 const [rights,setRights]=useState(false);
 const [sending,setSending]=useState(false);
 const [progress,setProgress]=useState(0);
 const [error,setError]=useState("");
 const previews=useRef(new Set<string>());
 useEffect(()=>()=>{previews.current.forEach(url=>URL.revokeObjectURL(url));},[]);
 const pending=items.filter(i=>i.status!=="done");
 function add(files:FileList|null){
  if(!files)return;
  const known=new Set(items.map(x=>x.file.name+"/"+x.file.size+"/"+x.file.lastModified));
  const unique=Array.from(files).filter(x=>allowed.includes(x.type)&&x.size<=15*1024*1024&&!known.has(x.name+"/"+x.size+"/"+x.lastModified));
  const incoming=unique.slice(0,Math.max(0,limit-items.length));
  const accepted=incoming.map(file=>{const preview=URL.createObjectURL(file);previews.current.add(preview);return {key:crypto.randomUUID(),file,preview,status:"ready" as const};});
  setItems(previous=>[...previous,...accepted]);
  if(unique.length>incoming.length)setError("Até 30 fotos por envio. Envie as próximas depois.");
  else if(files.length!==incoming.length)setError("Algumas fotos repetidas, grandes ou incompatíveis não foram incluídas.");
  else setError("");
 }
 function change(key:string,status:Item["status"],error?:string){setItems(prev=>prev.map(x=>x.key===key?{...x,status,error}:x));}
 function remove(key:string){const selected=items.find(x=>x.key===key);if(selected){previews.current.delete(selected.preview);URL.revokeObjectURL(selected.preview);}setItems(prev=>prev.filter(x=>x.key!==key));}
 async function upload(e:FormEvent){
  e.preventDefault();
  if(sending||!pending.length)return;
  if(reference.trim().length<3||!rights){setError("Informe a autorização de uso dessas fotografias.");return;}
  const client=getSupabaseBrowser();
  if(!client){setError("Conexão indisponível.");return;}
  setSending(true);setError("");setProgress(0);
  let successful=0;
  for(const item of pending){
   change(item.key,"sending");
   try{
    const {blob:optimized,width,height}=await makeQualityWebp(item.file,3000);
    const hash=await digest(optimized);
    const id=crypto.randomUUID();
    const extension=item.file.name.split(".").pop()?.toLowerCase()||"jpg";
    const originalPath=id+"/original."+extension;
    const publicPath=id+".webp";
    const alt="Fotografia do Buffet Sabor com Amor: "+item.file.name.replace(/\.[^/.]+$/,"").replace(/[_-]+/g," ").slice(0,150);
    const created=await client.from("photos").insert({
     id,album_id:null,asset_sha256:hash,alt_text:alt,caption:"",
     published_storage_path:publicPath,is_published:false,width,height
    });
    if(created.error)throw Error("Falha ao cadastrar.");
    const original=await client.storage.from("sabor-originais").upload(originalPath,item.file,{contentType:item.file.type,upsert:false});
    if(original.error)throw Error("Falha no original.");
    const linked=await client.rpc("register_photo_original",{p_photo_id:id,p_storage_path:originalPath});
    if(linked.error)throw Error("Falha ao vincular original.");
    const approved=await client.rpc("approve_photo_rights",{p_photo_id:id,p_evidence_reference:reference.trim()});
    if(approved.error)throw Error("Falha na autorização.");
    const publishedFile=await client.storage.from("sabor-publicadas").upload(publicPath,optimized,{contentType:"image/webp",upsert:false});
    if(publishedFile.error)throw Error("Falha na imagem otimizada.");
    successful++;change(item.key,"done");
   }catch(e){change(item.key,"failed",e instanceof Error?e.message:"Falha ao enviar.");}
   setProgress(p=>p+1);
  }
  setSending(false);
  if(successful){onComplete();}
  setError(successful===pending.length?successful+" foto(s) carregada(s). Escolha onde usar no editor do site.":successful+" enviada(s). Confira as que falharam.");
 }
 return <div className="app-sheet-backdrop" role="presentation">
  <section className="app-sheet" role="dialog" aria-modal="true" aria-labelledby="upload-title">
   <header className="app-sheet-header"><h2 id="upload-title">Adicionar fotos</h2>
    <button type="button" aria-label="Fechar" disabled={sending} onClick={onClose}><X/></button></header>
   <form onSubmit={upload} className="app-upload">
    <label className="app-upload-picker">
      <Images size={24}/><strong>Escolher fotografias</strong>
      <small>Até 30 por vez · JPG, PNG, WebP ou AVIF</small>
      <input type="file" multiple accept={allowed.join(",")} disabled={sending} onChange={e=>{add(e.target.files);e.target.value="";}}/>
    </label>
    {!!items.length&&<div className="app-upload-grid">{items.map(item=>
      <div className="app-upload-tile" key={item.key}>
       <img src={item.preview} alt={item.file.name}/>
       <span className={"app-upload-status "+item.status}>{item.status==="ready"?"Pronta":item.status==="sending"?"Enviando":item.status==="done"?"✓":"Falhou"}</span>
       {item.status!=="done"&&!sending&&<button type="button" onClick={()=>remove(item.key)} aria-label={"Remover "+item.file.name}><X size={14}/></button>}
       {item.error&&<small title={item.error}>{item.error}</small>}
      </div>)}</div>}
    {!!pending.length&&<div className="app-upload-rights">
     <label>Registro da autorização de uso
      <input required value={reference} maxLength={400} onChange={e=>setReference(e.target.value)} placeholder="Contrato, autorização ou referência"/>
     </label>
     <label className="app-rights-check"><input type="checkbox" checked={rights} required onChange={e=>setRights(e.target.checked)}/> Tenho autorização para usar todas as fotos selecionadas.</label>
    </div>}
    {sending&&<p role="status" className="app-progress">Enviando {progress} de {pending.length}… <progress max={pending.length||1} value={progress}/></p>}
    {error&&<p className="app-feedback" role="status">{error}</p>}
    {!!pending.length&&<button type="submit" className="app-primary" disabled={sending||!rights||reference.trim().length<3}>{sending?"Enviando…":"Carregar "+pending.length+" foto(s)"}</button>}
    {items.length>0&&pending.length===0&&<button type="button" className="app-primary" onClick={()=>{onClose();onEditSite();}}><CheckCircle2 size={18}/> Escolher onde usar</button>}
   </form>
  </section>
 </div>;
}
