"use client";
import {useEffect,useMemo,useState} from "react";
import {Plus,Image as ImageIcon,X,ArrowUpRight,Trash2,AlertTriangle} from "lucide-react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import {MEDIA_SLOTS} from "@/lib/cms/slots";
import {PhotoUploader} from "./PhotoUploader";
type Photo={id:string;alt_text:string;published_storage_path:string|null;created_at:string};
type Assignment={photo_id:string;slot_key:string};
type Entry={photo_id:string};
type Cleanup={photo_id:string;original_path:string|null;published_path:string|null;high_res_path:string|null;completed:boolean};
const url=(path:string|null)=>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 return path&&base?base+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/"):"";
};
export function AdminPhotos({onEditSite}:{onEditSite:()=>void}){
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [placements,setPlacements]=useState<Assignment[]>([]);
 const [gallery,setGallery]=useState<Entry[]>([]);
 const [intro,setIntro]=useState<Entry[]>([]);
 const [pending,setPending]=useState<Cleanup[]>([]);
 const [detail,setDetail]=useState<Photo|null>(null);
 const [upload,setUpload]=useState(false);
 const [confirm,setConfirm]=useState(false);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");
 const [revision,setRevision]=useState(0);
 async function refresh(){
  const db=getSupabaseBrowser();if(!db){setMessage("Conexão indisponível.");setLoading(false);return;}
  const [p,s,g,i,q]=await Promise.all([
   db.from("photos").select("id,alt_text,published_storage_path,created_at").order("created_at",{ascending:false}),
   db.from("site_media_slots").select("photo_id,slot_key"),
   db.from("gallery_entries").select("photo_id"),
   db.from("intro_frames").select("photo_id"),
   db.from("photo_cleanup_queue").select("photo_id,original_path,published_path,high_res_path,completed").eq("completed",false)
  ]);
  if(p.error||s.error||g.error||i.error||q.error){setMessage("Não foi possível carregar suas fotos.");}
  else {setPhotos((p.data||[]) as Photo[]);setPlacements((s.data||[]) as Assignment[]);
   setGallery((g.data||[]) as Entry[]);setIntro((i.data||[]) as Entry[]);
   setPending((q.data||[]) as Cleanup[]);setMessage("");}
  setLoading(false);
 }
 useEffect(()=>{void refresh();},[revision]);
 const galleryIds=useMemo(()=>new Set(gallery.map(x=>x.photo_id)),[gallery]);
 const introIds=useMemo(()=>new Set(intro.map(x=>x.photo_id)),[intro]);
 const usable=photos.filter(p=>!!p.published_storage_path);
 const uses=detail?placements.filter(p=>p.photo_id===detail.id).map(x=>MEDIA_SLOTS.find(m=>m.key===x.slot_key)).filter(x=>!!x):[];
 const inGallery=!!detail&&galleryIds.has(detail.id),inIntro=!!detail&&introIds.has(detail.id);
 const inUse=inGallery||inIntro||uses.length>0;
 async function cleanFiles(item:Cleanup){
  const db=getSupabaseBrowser();if(!db)return false;
  const original=item.original_path?[item.original_path]:[];
  const published=[item.published_path,item.high_res_path].filter((x):x is string=>!!x);
  if(original.length){const {error}=await db.storage.from("sabor-originais").remove(original);if(error)return false;}
  if(published.length){const {error}=await db.storage.from("sabor-publicadas").remove([...new Set(published)]);if(error)return false;}
  const {error}=await db.rpc("complete_photo_cleanup",{p_photo_id:item.photo_id});
  return !error;
 }
 async function retryCleanup(){
  setBusy(true);
  let left=0;
  for(const item of pending){if(!await cleanFiles(item))left++;}
  setBusy(false);setRevision(x=>x+1);
  setMessage(left?"Ainda restam "+left+" limpeza(s) pendente(s).":"Arquivos antigos removidos com sucesso.");
 }
 async function deletePhoto(){
  if(!detail||inUse||busy)return;
  if(!confirm){setConfirm(true);return;}
  const db=getSupabaseBrowser();if(!db)return;
  setBusy(true);setMessage("");
  const {data,error}=await db.rpc("delete_unused_photo",{p_photo_id:detail.id});
  if(error){setMessage("Não foi possível excluir. Esta fotografia pode estar em uso.");setBusy(false);return;}
  const cleanup=data as Cleanup;
  const completed=await cleanFiles({...cleanup,completed:false});
  setDetail(null);setConfirm(false);setBusy(false);setRevision(x=>x+1);
  setMessage(completed?"Fotografia excluída.":"Fotografia removida do acervo. A limpeza de arquivos ficou pendente.");
 }
 return <section className="app-page" aria-labelledby="library-title">
  <div className="app-page-top"><h2 id="library-title">Fotos</h2><span>{usable.length} arquivos</span></div>
  <div className="app-photo-actions">
   <button className="app-primary" type="button" onClick={()=>setUpload(true)}><Plus size={18}/> Adicionar fotos</button>
   <button type="button" onClick={onEditSite}>Editar o site <ArrowUpRight size={16}/></button>
  </div>
  {!loading&&pending.length>0&&<button type="button" className="app-cleanup-button" onClick={()=>void retryCleanup()} disabled={busy}>
   <AlertTriangle size={16}/> Concluir limpeza de {pending.length} arquivo(s)
  </button>}
  {loading?<p role="status">Carregando fotos…</p>:usable.length===0?<div className="app-empty"><ImageIcon size={30}/><p>Adicione suas fotografias.</p></div>:
   <div className="app-library-grid">{usable.map(p=><button className="app-tile" key={p.id} type="button"
    aria-label={"Ver uso da foto "+p.alt_text} onClick={()=>{setDetail(p);setConfirm(false);setMessage("");}}>
     <img src={url(p.published_storage_path)} alt={p.alt_text} loading="lazy"/>
     {(galleryIds.has(p.id)||introIds.has(p.id)||placements.some(s=>s.photo_id===p.id))&&
      <span className="app-tile-marker" aria-hidden="true"/>}
    </button>)}</div>}
  {message&&<p role="status" className="app-feedback">{message}</p>}
  {detail&&<div className="app-sheet-backdrop" role="presentation">
   <section className="app-sheet app-photo-detail" role="dialog" aria-modal="true" aria-label="Detalhes da fotografia">
    <header className="app-sheet-header"><h2>Foto</h2>
     <button aria-label="Fechar" type="button" onClick={()=>{setDetail(null);setConfirm(false);}}><X/></button>
    </header>
    <img className="app-detail-image" src={url(detail.published_storage_path)} alt={detail.alt_text}/>
    <div className="app-photo-used">
     {inGallery&&<p><strong>Galeria pública</strong> · incluída</p>}
     {inIntro&&<p><strong>Entrada do site</strong> · incluída</p>}
     {uses.map(x=><p key={x.key}><strong>{x.page==="home"?"Página inicial":x.page}</strong> · {x.section} · {x.label}</p>)}
     {!inUse&&<p>Esta fotografia não está sendo utilizada.</p>}
    </div>
    <button type="button" className="app-primary" onClick={()=>{setDetail(null);onEditSite();}}>Editar posições do site</button>
    {inUse?<p className="app-protected-photo">Para excluir, primeiro retire a foto da galeria, da entrada e/ou substitua-a nas seções em que aparece.</p>:
     <div className="app-photo-delete">
      <button type="button" disabled={busy} className="app-delete-action" onClick={()=>void deletePhoto()}>
       <Trash2 size={17}/>{confirm?"Confirmar exclusão definitiva":"Excluir esta fotografia"}
      </button>
      {confirm&&<button type="button" onClick={()=>setConfirm(false)}>Cancelar</button>}
     </div>}
   </section>
  </div>}
  {upload&&<PhotoUploader onClose={()=>setUpload(false)} onComplete={()=>setRevision(x=>x+1)} onEditSite={onEditSite}/>}
 </section>;
}
