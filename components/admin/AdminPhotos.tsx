"use client";
import {useEffect,useMemo,useState} from "react";
import {Plus,Image as ImageIcon,X,ArrowUpRight} from "lucide-react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import {MEDIA_SLOTS} from "@/lib/cms/slots";
import {PhotoUploader} from "./PhotoUploader";
type Photo={id:string;alt_text:string;published_storage_path:string|null;created_at:string};
type Assignment={photo_id:string;slot_key:string};
type Entry={photo_id:string};
const url=(path:string|null)=>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 return path&&base?base+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/"):"";
};
export function AdminPhotos({onEditSite}:{onEditSite:()=>void}){
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [placements,setPlacements]=useState<Assignment[]>([]);
 const [gallery,setGallery]=useState<Entry[]>([]);
 const [detail,setDetail]=useState<Photo|null>(null);
 const [upload,setUpload]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [revision,setRevision]=useState(0);
 async function refresh(){
  const client=getSupabaseBrowser();if(!client){setError("Conexão indisponível.");setLoading(false);return;}
  const [p,s,g]=await Promise.all([
   client.from("photos").select("id,alt_text,published_storage_path,created_at").order("created_at",{ascending:false}),
   client.from("site_media_slots").select("photo_id,slot_key"),
   client.from("gallery_entries").select("photo_id")
  ]);
  if(p.error||s.error||g.error)setError("Não foi possível carregar suas fotos.");
  else {setPhotos((p.data||[]) as Photo[]);setPlacements((s.data||[]) as Assignment[]);setGallery((g.data||[]) as Entry[]);setError("");}
  setLoading(false);
 }
 useEffect(()=>{void refresh();},[revision]);
 const galleryIds=useMemo(()=>new Set(gallery.map(x=>x.photo_id)),[gallery]);
 const usable=photos.filter(p=>!!p.published_storage_path);
 const uses=detail?placements.filter(p=>p.photo_id===detail.id).map(x=>MEDIA_SLOTS.find(m=>m.key===x.slot_key)).filter(x=>!!x):[];
 return <section className="app-page" aria-labelledby="library-title">
  <div className="app-page-top"><h2 id="library-title">Fotos</h2><span>{usable.length} arquivos</span></div>
  <div className="app-photo-actions">
   <button className="app-primary" type="button" onClick={()=>setUpload(true)}><Plus size={18}/> Adicionar fotos</button>
   <button type="button" onClick={onEditSite}>Editar o site <ArrowUpRight size={16}/></button>
  </div>
  {loading?<p role="status">Carregando fotos…</p>:usable.length===0?<div className="app-empty"><ImageIcon size={30}/><p>Adicione suas primeiras fotografias.</p></div>:
   <div className="app-library-grid">{usable.map(p=><button className="app-tile" key={p.id} type="button"
    aria-label={"Ver uso da foto "+p.alt_text} onClick={()=>setDetail(p)}>
     <img src={url(p.published_storage_path)} alt={p.alt_text} loading="lazy"/>
     {(galleryIds.has(p.id)||placements.some(s=>s.photo_id===p.id))&&<span className="app-tile-marker" aria-hidden="true"/>}
    </button>)}</div>}
  {error&&<p role="alert" className="app-feedback">{error}</p>}
  {detail&&<div className="app-sheet-backdrop" role="presentation">
   <section className="app-sheet app-photo-detail" role="dialog" aria-modal="true" aria-label="Detalhes da fotografia">
    <header className="app-sheet-header"><h2>Foto</h2><button aria-label="Fechar" type="button" onClick={()=>setDetail(null)}><X/></button></header>
    <img className="app-detail-image" src={url(detail.published_storage_path)} alt={detail.alt_text}/>
    <div className="app-photo-used">
      {galleryIds.has(detail.id)&&<p><strong>Galeria pública</strong> · incluída</p>}
      {uses.map(x=><p key={x.key}><strong>{x.page==="home"?"Página inicial":x.page}</strong> · {x.section} · {x.label}</p>)}
      {!galleryIds.has(detail.id)&&uses.length===0&&<p>Esta foto ainda não aparece no site.</p>}
    </div>
    <button type="button" className="app-primary" onClick={()=>{setDetail(null);onEditSite();}}>Editar posições do site</button>
   </section>
  </div>}
  {upload&&<PhotoUploader onClose={()=>setUpload(false)} onComplete={()=>setRevision(x=>x+1)} onEditSite={onEditSite}/>}
 </section>;
}
