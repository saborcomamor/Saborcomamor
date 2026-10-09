"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {ArrowDown,ArrowUp,Check,GripVertical,ImageUp,LoaderCircle,SlidersHorizontal,X} from "lucide-react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import {announceSitePublished} from "@/lib/cms/site-published";
import {useRouter} from "next/navigation";
import {defaultFrame,type GallerySelection} from "@/lib/gallery-types";
import {improvePhotoQuality} from "@/lib/cms/highres";
type Photo={id:string;alt_text:string;published_storage_path:string|null;high_res_storage_path:string|null};
type Entry=GallerySelection&{sort_order:number;published_storage_path:string};
const img=(path:string|null)=>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 return url&&path?url+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/"):"";
};
export function AdminGallery(){
 const router=useRouter();
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [selected,setSelected]=useState<GallerySelection[]>([]);
 const [saved,setSaved]=useState<GallerySelection[]>([]);
 const [editor,setEditor]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const [enhancing,setEnhancing]=useState(false);
 const [progress,setProgress]=useState("");
 const [loading,setLoading]=useState(true);
 const [feedback,setFeedback]=useState("");
 const [confirmEmpty,setConfirmEmpty]=useState(false);
 const reorder=useRef<{index:number,y:number}|null>(null);
 const byId=useMemo(()=>new Map(photos.map(p=>[p.id,p])),[photos]);
 const chosen=selected.find(e=>e.photo_id===editor);
 const photo=editor?byId.get(editor):null;
 const dirty=JSON.stringify(selected)!==JSON.stringify(saved);
 async function load(){
  const client=getSupabaseBrowser();if(!client){setFeedback("Conexão indisponível.");setLoading(false);return;}
  const [library,entries]=await Promise.all([
   client.from("photos").select("id,alt_text,published_storage_path,high_res_storage_path").order("created_at",{ascending:false}),
   client.from("gallery_entries").select("photo_id,sort_order,fit_mode,focus_x,focus_y,zoom,published_storage_path").order("sort_order")
  ]);
  if(library.error||entries.error){setFeedback("Não foi possível carregar a galeria. Atualize e tente novamente.");setLoading(false);return;}
  const all=(library.data||[]) as Photo[];
  const configuration=((entries.data||[]) as Entry[]).map(e=>({
   photo_id:e.photo_id,fit_mode:e.fit_mode||"contain",
   focus_x:e.focus_x??50,focus_y:e.focus_y??50,zoom:Number(e.zoom)||1
  }));
  setPhotos(all);setSaved(configuration);setSelected(configuration);setLoading(false);
 }
 useEffect(()=>{void load();},[]);
 function toggle(id:string){
  setFeedback("");setConfirmEmpty(false);
  setSelected(previous=>previous.some(x=>x.photo_id===id)
    ?previous.filter(x=>x.photo_id!==id)
    :previous.length<200?[...previous,{photo_id:id,...defaultFrame()}]:previous);
 }
 function move(from:number,to:number){
  if(to<0||to>=selected.length||from===to)return;
  setSelected(previous=>{const next=[...previous];const [item]=next.splice(from,1);next.splice(to,0,item);return next;});
 }
 function change(id:string,update:Partial<GallerySelection>){
  setSelected(previous=>previous.map(item=>item.photo_id===id?{...item,...update}:item));
 }
 const actualPath=(item:Photo)=>item.high_res_storage_path||item.published_storage_path;
 async function publish(){
  if(busy||!dirty)return;
  if(selected.length===0&&!confirmEmpty){setConfirmEmpty(true);setFeedback("Confirme novamente para publicar uma galeria vazia.");return;}
  const client=getSupabaseBrowser();if(!client)return;
  setBusy(true);setFeedback("");
  const {error}=await client.rpc("publish_gallery_layout",{p_items:selected});
  if(error){setFeedback("Falha ao publicar. Verifique se todas as imagens estão autorizadas.");setBusy(false);return;}
  const check=await client.from("gallery_entries").select("photo_id,fit_mode,focus_x,focus_y,zoom").order("sort_order");
  const verified=!check.error&&(check.data||[]).every((v,i)=>v.photo_id===selected[i]?.photo_id
   &&v.fit_mode===selected[i]?.fit_mode&&v.focus_x===selected[i]?.focus_x
   &&v.focus_y===selected[i]?.focus_y&&Number(v.zoom)===Number(selected[i]?.zoom))
   &&(check.data||[]).length===selected.length;
  if(verified){announceSitePublished();router.refresh();setSaved(selected.map(x=>({...x})));setConfirmEmpty(false);
   setFeedback("Publicado! A galeria usa somente estas "+selected.length+" foto(s), nesta ordem.");}
  else setFeedback("A atualização foi enviada, mas não foi possível confirmar. Atualize para conferir.");
  setBusy(false);
 }
 async function recoverQuality(){
  if(enhancing||!selected.length)return;
  const remaining=selected.filter(x=>!byId.get(x.photo_id)?.high_res_storage_path);
  if(!remaining.length){setFeedback("Todas as fotos selecionadas já têm uma versão de alta qualidade.");return;}
  setEnhancing(true);setFeedback("");
  let successes=0,failures=0;
  for(const [i,item] of remaining.entries()){
   setProgress("Recuperando originais: "+(i+1)+" de "+remaining.length);
   try{await improvePhotoQuality(item.photo_id);successes++;}
   catch{failures++;}
  }
  await load();
  setEnhancing(false);setProgress("");
  if(successes){announceSitePublished();router.refresh();}
  setFeedback(successes+" versão(ões) aprimorada(s)."+(failures?" "+failures+" falha(s); confira seus originais.":""));
 }
 if(loading)return <section className="app-page"><p role="status">Carregando galeria…</p></section>;
 return <section className="app-page" aria-labelledby="gallery-title">
  <div className="app-page-top"><h2 id="gallery-title">Galeria</h2><span>{selected.length} selecionada(s)</span></div>
  <div className="app-gallery-actions">
   <button type="button" onClick={()=>{setSelected(photos.filter(x=>!!x.published_storage_path).map(x=>({photo_id:x.id,...defaultFrame()})));setConfirmEmpty(false);}}>Todas</button>
   <button type="button" onClick={()=>{setSelected([]);setConfirmEmpty(false);}}>Limpar seleção</button>
   <a href="/galeria" target="_blank" rel="noopener noreferrer">Ver galeria ↗</a>
  </div>
  {dirty&&<div className="app-savebar app-gallery-sticky">
    <span>{selected.length} para publicar</span>
    <button type="button" onClick={()=>void publish()} disabled={busy||enhancing}>
     {busy?<LoaderCircle size={16} className="app-spin"/>:null}
     {confirmEmpty?"Confirmar vazia":"Publicar seleção"}
    </button>
  </div>}
  <div className="app-gallery-grid" aria-label="Fotos disponíveis">
   {photos.filter(p=>!!p.published_storage_path).map(p=>{
    const pos=selected.findIndex(s=>s.photo_id===p.id);
    return <div className="app-gallery-choose" key={p.id}>
     <button type="button" className={"app-tile "+(pos>=0?"is-selected":"")}
      aria-pressed={pos>=0} aria-label={(pos>=0?"Retirar ":"Adicionar ")+p.alt_text}
      onClick={()=>toggle(p.id)}>
      <img src={img(p.published_storage_path)} alt={p.alt_text} loading="lazy"/>
      {pos>=0&&<span className="app-tile-count"><Check size={14}/> {pos+1}</span>}
     </button>
     {pos>=0&&<button type="button" className="app-frame-button" aria-label={"Ajustar enquadramento de "+p.alt_text} onClick={()=>setEditor(p.id)}>
      <SlidersHorizontal size={14}/> Ajustar
     </button>}
    </div>;
   })}
  </div>
  {selected.length>1&&<details className="app-gallery-order">
   <summary>Ordenar fotografias ({selected.length})</summary>
   <div className="app-gallery-order-list">
    {selected.map((entry,i)=>{
     const p=byId.get(entry.photo_id);if(!p)return null;
     return <div className="app-gallery-order-item" key={entry.photo_id}>
      <span className="app-drag-handle" role="button" tabIndex={0} aria-label={"Arrastar foto "+(i+1)+" para ordenar"}
       onPointerDown={e=>{reorder.current={index:i,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}}
       onPointerUp={e=>{const start=reorder.current;reorder.current=null;if(start){const diff=Math.round((e.clientY-start.y)/60);if(diff)move(start.index,Math.max(0,Math.min(selected.length-1,start.index+diff)));}}}
       onKeyDown={e=>{if(e.key==="ArrowUp")move(i,i-1);if(e.key==="ArrowDown")move(i,i+1);}}>
       <GripVertical size={20}/></span>
      <img src={img(p.published_storage_path)} alt="" loading="lazy"/>
      <span>Foto {i+1}</span>
      <button type="button" disabled={i===0} onClick={()=>move(i,i-1)} aria-label="Mover para cima"><ArrowUp size={17}/></button>
      <button type="button" disabled={i===selected.length-1} onClick={()=>move(i,i+1)} aria-label="Mover para baixo"><ArrowDown size={17}/></button>
     </div>;
    })}
   </div>
  </details>}
  <button className="app-highres-action" type="button" disabled={enhancing||busy||!selected.length} onClick={()=>void recoverQuality()}>
    <ImageUp size={18}/>{enhancing?"Preparando fotografias…":"Recuperar qualidade das fotos selecionadas"}
  </button>
  {progress&&<p role="status" className="app-feedback">{progress}</p>}
  {feedback&&<p role="status" className="app-feedback">{feedback}</p>}
  {chosen&&photo&&<div className="app-sheet-backdrop" role="presentation">
   <section className="app-sheet" role="dialog" aria-modal="true" aria-label="Ajustar fotografia da galeria">
    <header className="app-sheet-header"><h2>Enquadrar foto</h2>
     <button type="button" aria-label="Fechar" onClick={()=>setEditor(null)}><X size={20}/></button>
    </header>
    <div className="app-crop-preview">
     <img src={img(actualPath(photo))} alt={photo.alt_text}
      style={{objectFit:chosen.fit_mode,objectPosition:chosen.focus_x+"% "+chosen.focus_y+"%",
       transform:"scale("+chosen.zoom+")"}}/>
    </div>
    <div className="app-crop-controls">
     <label>Modo de exibição
      <select value={chosen.fit_mode} onChange={e=>change(chosen.photo_id,{fit_mode:e.target.value as "cover"|"contain"})}>
       <option value="contain">Mostrar fotografia inteira</option>
       <option value="cover">Preencher a tela (pode cortar)</option>
      </select>
     </label>
     <label>Posição horizontal <input type="range" min="0" max="100" value={chosen.focus_x}
        onChange={e=>change(chosen.photo_id,{focus_x:Number(e.target.value)})}/></label>
     <label>Posição vertical <input type="range" min="0" max="100" value={chosen.focus_y}
        onChange={e=>change(chosen.photo_id,{focus_y:Number(e.target.value)})}/></label>
     <label>Zoom <input type="range" min="1" max="2" step=".05" value={chosen.zoom}
        onChange={e=>change(chosen.photo_id,{zoom:Number(e.target.value)})}/></label>
    </div>
    <button className="app-primary app-crop-done" type="button" onClick={()=>setEditor(null)}>
     Aplicar ajuste
    </button>
    <p className="app-crop-note">Depois, toque em “Publicar seleção” para salvar no site.</p>
   </section>
  </div>}
 </section>;
}
