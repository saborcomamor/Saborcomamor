"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowUpRight,Check,RotateCcw,X} from "lucide-react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import {announceSitePublished} from "@/lib/cms/site-published";
import {useRouter} from "next/navigation";
import {MEDIA_SLOTS,type MediaSlot} from "@/lib/cms/slots";
import {mediaSlotPresentation} from "@/lib/cms/slot-presentation";
import {photo} from "@/lib/photos";
type Assignment={slot_key:string;photo_id:string;caption:string;alt_text:string;published_storage_path:string};
type Photo={id:string;alt_text:string;published_storage_path:string|null};
const pages=[{id:"home",name:"Página inicial",url:"/"},{id:"services",name:"Serviços",url:"/servicos"},
 {id:"buffet",name:"Buffet completo",url:"/buffet-completo"},
 {id:"kitchen",name:"Serviço de cozinha",url:"/servico-de-cozinha"},
 {id:"story",name:"Nossa história",url:"/nossa-historia"}];
const fixedOverlay=(slot:MediaSlot):string=>{
 const labels:Record<string,string>={
  "services.hero.01":"Cada celebração tem seu jeito.",
  "buffet.hero.01":"Você vive a festa. A gente cuida do sabor.",
  "kitchen.hero.01":"Você prepara a ocasião. A gente prepara a comida.",
  "story.hero.01":"A cozinha sempre foi um lugar de encontro.",
  "home.final.01":"Vamos colocar carinho no seu próximo evento?",
  "home.services.01":"Buffet completo",
  "home.services.02":"Serviço de cozinha",
 };
 return slot.key.startsWith("home.hero.")?"O sabor que reúne. O carinho que fica.":labels[slot.key]||"";
};
const imageUrl=(path:string|null)=>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 return base&&path?base+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/"):"";
};
export function AdminSiteMedia(){
 const router=useRouter();
 const [page,setPage]=useState("home");
 const [section,setSection]=useState("Abertura / Hero");
 const [assigned,setAssigned]=useState<Assignment[]>([]);
 const [library,setLibrary]=useState<Photo[]>([]);
 const [current,setCurrent]=useState<string|null>(null);
 const [choice,setChoice]=useState<string|null>(null);
 const [caption,setCaption]=useState("");
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");
 const pageSlots=MEDIA_SLOTS.filter(s=>s.page===page);
 const sections=useMemo(()=>[...new Set(pageSlots.map(s=>s.section))],[page]);
 const displayed=pageSlots.filter(s=>s.section===section);
 const assignments=useMemo(()=>new Map(assigned.map(p=>[p.slot_key,p])),[assigned]);
 const byId=useMemo(()=>new Map(library.map(p=>[p.id,p])),[library]);
 const selected=MEDIA_SLOTS.find(s=>s.key===current);
 const chosen=choice?byId.get(choice):null;
 const present=selected?mediaSlotPresentation(selected):null;
 const original=selected?photo(selected.fallback):null;
 const selectedActual=selected?assignments.get(selected.key):null;
 function visual(slot:MediaSlot,assignment?:Assignment){
  return assignment?imageUrl(assignment.published_storage_path):photo(slot.fallback).src;
 }
 function visibleText(slot:MediaSlot,assignment?:Assignment){
  const presentation=mediaSlotPresentation(slot);
  return presentation.overlay?(assignment?assignment.caption:presentation.originalText):fixedOverlay(slot);
 }
 async function refresh(){
  const client=getSupabaseBrowser();if(!client){setMessage("Conexão indisponível.");setLoading(false);return;}
  const [a,b]=await Promise.all([
    client.from("site_media_slots").select("slot_key,photo_id,caption,alt_text,published_storage_path"),
    client.from("photos").select("id,alt_text,published_storage_path").order("created_at",{ascending:false})
  ]);
  if(a.error||b.error)setMessage("Não foi possível carregar as imagens.");
  else {setAssigned((a.data||[]) as Assignment[]);setLibrary((b.data||[]) as Photo[]);}
  setLoading(false);
 }
 useEffect(()=>{void refresh();},[]);
 function changePage(id:string){
  setPage(id);
  setSection(MEDIA_SLOTS.find(p=>p.page===id)?.section||"");
 }
 function open(slot:MediaSlot){
  const existing=assignments.get(slot.key);
  setCurrent(slot.key);setChoice(existing?.photo_id??null);setCaption(existing?.caption??"");setMessage("");
 }
 async function save(){
  if(!selected||!choice||busy)return;
  const client=getSupabaseBrowser();if(!client)return;
  setBusy(true);setMessage("");
  const {error}=await client.rpc("set_site_media_slot",{p_slot_key:selected.key,p_photo_id:choice,p_caption:caption.trim()});
  if(error){setMessage("Falha ao salvar. Confira a autorização desta foto.");setBusy(false);return;}
  const check=await client.from("site_media_slots").select("photo_id,caption").eq("slot_key",selected.key).maybeSingle();
  if(check.error||check.data?.photo_id!==choice||check.data?.caption!==caption.trim())
   setMessage("Alteração enviada, mas não foi possível confirmar. Atualize e confira.");
  else {announceSitePublished();router.refresh();setCurrent(null);setMessage("Foto atualizada e conferida nesta posição.");await refresh();}
  setBusy(false);
 }
 async function restore(){
  if(!selected||busy)return;
  const client=getSupabaseBrowser();if(!client)return;
  setBusy(true);
  const {error}=await client.rpc("clear_site_media_slot",{p_slot_key:selected.key});
  if(error)setMessage("Falha ao restaurar.");
  else{
   const check=await client.from("site_media_slots").select("slot_key").eq("slot_key",selected.key).maybeSingle();
   if(check.error||check.data){setMessage("Não foi possível confirmar a restauração.");}
   else{announceSitePublished();router.refresh();setCurrent(null);setMessage("Imagem anterior restaurada e conferida.");await refresh();}
  }
  setBusy(false);
 }
 const pageInfo=pages.find(p=>p.id===page);
 if(loading)return <section className="app-page"><p role="status">Carregando editor…</p></section>;
 return <section className="app-page" aria-labelledby="app-site-title">
  <div className="app-page-top"><h2 id="app-site-title">Editar o site</h2>
   <a className="app-small-link" href={pageInfo?.url||"/"} target="_blank" rel="noopener noreferrer">Ver página <ArrowUpRight size={16}/></a>
  </div>
  <div className="app-location-selectors">
   <label>Página<select value={page} onChange={e=>changePage(e.target.value)}>
    {pages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
   </select></label>
   <label>Seção<select value={section} onChange={e=>setSection(e.target.value)}>
    {sections.map(s=><option key={s} value={s}>{s}</option>)}
   </select></label>
  </div>
  <div className="app-page-top app-section-title"><h3>{section}</h3><span>{displayed.length} foto(s)</span></div>
  <div className="app-site-grid">
   {displayed.map((slot,i)=>{
    const assignment=assignments.get(slot.key);
    const captionText=visibleText(slot,assignment);
    const isWide=slot.key.startsWith("home.hero.")||slot.key.endsWith(".hero.01");
    return <button type="button" className={"app-site-position "+(isWide?"wide":"")} key={slot.key}
        onClick={()=>open(slot)} aria-label={"Alterar "+slot.label}>
      <div className="app-site-photo">
       <img src={visual(slot,assignment)} loading="lazy" alt={assignment?.alt_text||photo(slot.fallback).alt}/>
       {captionText&&<span className="app-site-overlay">{captionText}</span>}
       <span className="app-site-number">{i+1}</span>
      </div>
      <span className="app-site-position-label">{slot.label}</span>
      {assignment?<small><Check size={12}/> Substituída</small>:<small>Imagem de exemplo</small>}
    </button>;
   })}
  </div>
  {message&&!current&&<p className="app-feedback" role="status">{message}</p>}
  {selected&&<div className="app-sheet-backdrop" role="presentation">
   <section className="app-sheet app-editor-sheet" role="dialog" aria-modal="true" aria-labelledby="edit-photo-title">
    <header className="app-sheet-header"><div><small>{pageInfo?.name} / {selected.section}</small><h2 id="edit-photo-title">{selected.label}</h2></div>
      <button type="button" aria-label="Fechar" disabled={busy} onClick={()=>setCurrent(null)}><X/></button>
    </header>
    <div className="app-compare">
     <div><span>Agora</span><img src={visual(selected,selectedActual??undefined)} alt="Imagem atualmente usada" loading="lazy"/></div>
     <div><span>Escolhida</span><div className="app-compare-new">
       <img src={chosen?imageUrl(chosen.published_storage_path):original?.src} alt="Imagem que será usada"/>
       {(present?.overlay?caption.trim():fixedOverlay(selected))&&<b className="app-compare-caption">{present?.overlay?caption.trim():fixedOverlay(selected)}</b>}
      </div></div>
    </div>
    {present?.overlay&&<label className="app-caption-control">Texto sobre a foto (opcional)
       <input value={caption} onChange={e=>setCaption(e.target.value)} maxLength={160} placeholder="Sem texto"/>
    </label>}
    {!present?.overlay&&!!fixedOverlay(selected)&&<p className="app-fixed-text-info">Texto da seção é fixo: “{fixedOverlay(selected)}”.</p>}
    <div className="app-sheet-subtitle">Escolher fotografia</div>
    <div className="app-library-picker">
     {library.filter(x=>!!x.published_storage_path).map(item=><button type="button" key={item.id}
       aria-label={"Selecionar "+item.alt_text} aria-pressed={choice===item.id}
       className={"app-tile "+(choice===item.id?"is-selected":"")}
       onClick={()=>{setChoice(item.id);if(item.id!==selectedActual?.photo_id)setCaption("");}}>
      <img src={imageUrl(item.published_storage_path)} alt={item.alt_text} loading="lazy"/>
      {choice===item.id&&<span className="app-tile-count"><Check size={16}/></span>}
     </button>)}
    </div>
    <div className="app-sheet-bottom">
      {selectedActual&&<button type="button" className="app-restore" disabled={busy} onClick={()=>void restore()}><RotateCcw size={16}/> Restaurar</button>}
      <button type="button" className="app-primary" disabled={!choice||busy} onClick={()=>void save()}>{busy?"Salvando…":"Salvar foto"}</button>
    </div>
    {message&&<p role="alert" className="app-feedback">{message}</p>}
   </section>
  </div>}
 </section>;
}
