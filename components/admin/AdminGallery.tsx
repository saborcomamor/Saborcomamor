"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowDown,ArrowUp,Check,LoaderCircle} from "lucide-react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
type Photo={id:string;alt_text:string;published_storage_path:string|null};
type Entry={photo_id:string;sort_order:number};
const img=(path:string|null)=>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 return url&&path?url+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/"):"";
};
export function AdminGallery(){
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [selected,setSelected]=useState<string[]>([]);
 const [saved,setSaved]=useState<string[]>([]);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [feedback,setFeedback]=useState("");
 const [confirmEmpty,setConfirmEmpty]=useState(false);
 const byId=useMemo(()=>new Map(photos.map(p=>[p.id,p])),[photos]);
 const dirty=selected.join(",")!==saved.join(",");
 async function load(){
  const client=getSupabaseBrowser();if(!client){setFeedback("Conexão indisponível.");setLoading(false);return;}
  const [library,entries]=await Promise.all([
   client.from("photos").select("id,alt_text,published_storage_path").order("created_at",{ascending:false}),
   client.from("gallery_entries").select("photo_id,sort_order").order("sort_order",{ascending:true})
  ]);
  if(library.error||entries.error){setFeedback("Falha ao carregar a galeria. Atualize a página.");setLoading(false);return;}
  const all=(library.data||[]) as Photo[];
  const order=(entries.data||[] as Entry[]).map(x=>x.photo_id);
  setPhotos(all);
  setSaved(order);
  setSelected(order);
  setLoading(false);
 }
 useEffect(()=>{void load();},[]);
 function toggle(id:string){
   setFeedback("");
   setConfirmEmpty(false);
   setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 }
 function move(index:number,delta:number){
   const to=index+delta;
   if(to<0||to>=selected.length)return;
   setSelected(previous=>{
    const next=[...previous];[next[index],next[to]]=[next[to],next[index]];return next;
   });
 }
 async function publish(){
  if(busy||!dirty)return;
  if(selected.length===0&&!confirmEmpty){setConfirmEmpty(true);setFeedback("Confirme para deixar a galeria vazia.");return;}
  const client=getSupabaseBrowser();if(!client)return;
  setBusy(true);setFeedback("");
  const {error}=await client.rpc("replace_gallery_selection",{p_photo_ids:selected});
  if(error){setFeedback("Não foi possível salvar. Verifique as fotos e tente novamente.");setBusy(false);return;}
  const {data, error:checkError}=await client.from("gallery_entries").select("photo_id,sort_order").order("sort_order");
  const verified=!checkError&&(data||[]).map(x=>x.photo_id).join(",")===selected.join(",");
  if(verified){setSaved([...selected]);setConfirmEmpty(false);setFeedback("Galeria atualizada: "+selected.length+" foto(s) na ordem escolhida.");}
  else setFeedback("A atualização foi enviada, mas não foi possível confirmá-la. Atualize a tela para conferir.");
  setBusy(false);
 }
 if(loading)return <section className="app-page"><p role="status">Carregando galeria…</p></section>;
 return <section className="app-page" aria-labelledby="gallery-editor-title">
  <div className="app-page-top"><h2 id="gallery-editor-title">Galeria</h2><span>{selected.length} foto(s)</span></div>
  <div className="app-gallery-actions">
   <button type="button" onClick={()=>{setSelected(photos.filter(x=>!!x.published_storage_path).map(x=>x.id));setConfirmEmpty(false);}}>Selecionar todas</button>
   <button type="button" onClick={()=>{setSelected([]);setConfirmEmpty(false);}}>Limpar</button>
   <a href="/galeria" target="_blank" rel="noopener noreferrer">Ver galeria ↗</a>
  </div>
  {dirty&&<div className="app-savebar" role="region" aria-label="Publicar alterações">
    <span>{selected.length} foto(s) escolhida(s)</span>
    <button type="button" disabled={busy} onClick={()=>void publish()}>
     {busy?<LoaderCircle size={16} className="app-spin"/>:null}
     {confirmEmpty?"Confirmar galeria vazia":"Publicar seleção"}
    </button>
  </div>}
  <div className="app-gallery-grid" aria-label="Fotografias disponíveis">
   {photos.filter(x=>!!x.published_storage_path).map(p=>{
    const position=selected.indexOf(p.id);
    return <button key={p.id} type="button" className={"app-tile "+(position>=0?"is-selected":"")} aria-pressed={position>=0}
       aria-label={(position>=0?"Remover da galeria: ":"Incluir na galeria: ")+p.alt_text} onClick={()=>toggle(p.id)}>
      <img src={img(p.published_storage_path)} alt={p.alt_text} loading="lazy"/>
      {position>=0&&<span className="app-tile-count"><Check size={13}/> {position+1}</span>}
    </button>;
   })}
  </div>
  {selected.length>1&&<details className="app-gallery-order">
    <summary>Ordenar fotos ({selected.length})</summary>
    <div className="app-gallery-order-list">{selected.map((id,i)=>{
     const p=byId.get(id);if(!p)return null;
     return <div className="app-gallery-order-item" key={id}>
      <img src={img(p.published_storage_path)} alt="" loading="lazy"/>
      <span>Foto {i+1}</span>
      <button aria-label={"Mover foto "+(i+1)+" para a esquerda"} disabled={i===0||busy} onClick={()=>move(i,-1)} type="button"><ArrowUp size={17}/></button>
      <button aria-label={"Mover foto "+(i+1)+" para a direita"} disabled={i===selected.length-1||busy} onClick={()=>move(i,1)} type="button"><ArrowDown size={17}/></button>
     </div>;
    })}</div>
   </details>}
  {feedback&&<p className="app-feedback" role="status">{feedback}</p>}
 </section>;
}
