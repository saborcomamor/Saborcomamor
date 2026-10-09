"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowDown,ArrowUp,ArrowUpRight,Check,Play,X} from "lucide-react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import {announceSitePublished} from "@/lib/cms/site-published";
import {useRouter} from "next/navigation";
type Photo={id:string;published_storage_path:string|null;alt_text:string};
type Entry={photo_id:string;sort_order:number};
const photoUrl=(path:string|null)=>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 return path&&base?base+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/"):"";
};
export function AdminIntro(){
 const router=useRouter();
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [selected,setSelected]=useState<string[]>([]);
 const [saved,setSaved]=useState<string[]>([]);
 const [preview,setPreview]=useState(false);
 const [previewIndex,setPreviewIndex]=useState(0);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(true);
 const byId=useMemo(()=>new Map(photos.map(p=>[p.id,p])),[photos]);
 const changed=selected.join(",")!==saved.join(",");
 useEffect(()=>{const client=getSupabaseBrowser();if(!client){setLoading(false);return;}
  Promise.all([
   client.from("photos").select("id,published_storage_path,alt_text").order("created_at",{ascending:false}),
   client.from("intro_frames").select("photo_id,sort_order").order("sort_order")
  ]).then(([photosResult,introResult])=>{
   if(photosResult.error||introResult.error)setMessage("Não foi possível carregar as imagens.");
   else{
    setPhotos((photosResult.data||[]) as Photo[]);
    const ids=((introResult.data||[]) as Entry[]).map(x=>x.photo_id);
    setSaved(ids);setSelected(ids);
   }
   setLoading(false);
  });
 },[]);
 useEffect(()=>{
  if(!preview)return;
  setPreviewIndex(0);
  const timer=window.setInterval(()=>setPreviewIndex(i=>(i+1)%Math.max(1,selected.length)),2600);
  return()=>window.clearInterval(timer);
 },[preview,selected.length]);
 function toggle(id:string){setMessage("");setSelected(arr=>arr.includes(id)?arr.filter(v=>v!==id):arr.length<12?[...arr,id]:arr);}
 function move(i:number,delta:number){setSelected(current=>{const next=[...current],target=i+delta;if(target<0||target>=next.length)return current;[next[i],next[target]]=[next[target],next[i]];return next;});}
 async function save(){
  if(busy||!changed)return;
  const client=getSupabaseBrowser();if(!client)return;
  setBusy(true);setMessage("");
  const {data,error}=await client.rpc("replace_intro_frames_v2",{p_photo_ids:selected});
  if(error){
   const code=error.code||"";
   if(code==="42501")setMessage("Sua sessão não tem autorização administrativa. Entre novamente no painel.");
   else if(code==="23514")setMessage("Uma foto não está disponível ou não tem autorização válida. Retire-a da seleção e tente novamente.");
   else if(code==="22023")setMessage("A sequência contém uma foto inválida ou repetida. Confira a seleção.");
   else setMessage("Erro ao salvar a entrada"+(code?" ("+code+")":"")+". Tente novamente. Se persistir, envie este código para verificarmos.");
   setBusy(false);return;
  }
  if(!data||data.saved!==true||data.count!==selected.length||
    !Array.isArray(data.photo_ids)||data.photo_ids.join(",")!==selected.join(",")){
   setMessage("A gravação não retornou confirmação. A sequência antiga foi preservada.");
   setBusy(false);return;
  }
  const verify=await client.from("intro_frames").select("photo_id").order("sort_order");
  if(verify.error||(verify.data||[]).map(x=>x.photo_id).join(",")!==selected.join(",")){
   setMessage("A seleção foi enviada, mas não foi possível confirmar a ordem.");
  }else {announceSitePublished();router.refresh();setSaved([...selected]);setMessage("Sequência publicada. Use “Visualizar no site” para conferir agora.");}
  setBusy(false);
 }
 const previewPhoto=byId.get(selected[previewIndex]||"");
 return <section className="app-page" aria-label="Fotografias de abertura">
  <div className="app-page-top"><h2>Entrada do site</h2><span>{selected.length}/12</span></div>
  <p className="app-intro-hint">Escolha as fotos que aparecem antes da abertura atual. A ordem define a sequência.</p>
  <div className="app-gallery-grid">{photos.filter(p=>!!p.published_storage_path).map(p=>{
   const i=selected.indexOf(p.id);return <button type="button" className={"app-tile "+(i>=0?"is-selected":"")} key={p.id}
     onClick={()=>toggle(p.id)} aria-label={(i>=0?"Retirar ":"Incluir ")+p.alt_text} aria-pressed={i>=0}>
     <img src={photoUrl(p.published_storage_path)} alt={p.alt_text} loading="lazy"/>
     {i>=0&&<span className="app-tile-count"><Check size={13}/> {i+1}</span>}
   </button>;
  })}</div>
  {selected.length>1&&<details className="app-gallery-order">
   <summary>Alterar ordem das fotos</summary>
   <div className="app-gallery-order-list">{selected.map((id,i)=>{
    const p=byId.get(id);if(!p)return null;
    return <div className="app-gallery-order-item" key={id}>
      <img alt="" src={photoUrl(p.published_storage_path)}/><span>Foto {i+1}</span>
      <button type="button" disabled={i===0} onClick={()=>move(i,-1)} aria-label="Mover antes"><ArrowUp size={18}/></button>
      <button type="button" disabled={i===selected.length-1} onClick={()=>move(i,1)} aria-label="Mover depois"><ArrowDown size={18}/></button>
    </div>;
   })}</div>
  </details>}
  <div className="app-intro-actions" role="group" aria-label="Ações da entrada">
   <div className="app-intro-secondary">
    <button type="button" className="app-intro-preview-button" disabled={!selected.length}
      onClick={()=>setPreview(true)}><Play size={16}/> Prévia</button>
    <a className="app-intro-preview-link" href="/?verEntrada=1" target="_blank"
      rel="noopener noreferrer">Ver site <ArrowUpRight size={15}/></a>
   </div>
   <button type="button" className="app-primary app-intro-save" onClick={()=>void save()}
     disabled={!changed||busy}><Check size={17}/>{busy?"Salvando…":"Salvar"}</button>
  </div>
  {message&&<p className="app-feedback" role="status">{message}</p>}
  {preview&&<div className="app-intro-preview" role="dialog" aria-modal="true" aria-label="Prévia da entrada">
    {previewPhoto&&<img src={photoUrl(previewPhoto.published_storage_path)} alt={previewPhoto.alt_text}/>}
    <span className="app-intro-preview-text">Arraste a fotografia para abrir</span>
    <button type="button" onClick={()=>setPreview(false)} aria-label="Fechar prévia"><X size={23}/></button>
   </div>}
  {loading&&<p>Carregando…</p>}
 </section>;
}
