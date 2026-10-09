"use client";
import {useEffect,useRef,useState} from "react";
import {ChevronLeft,ChevronRight,Images,Pause,Play} from "lucide-react";
import type {GalleryPhoto} from "@/lib/gallery-types";
import {readLatestGallery} from "@/lib/cms/browser-public";
import {SITE_PUBLISHED_EVENT,isSitePublishStorageEvent} from "@/lib/cms/site-published";
import {GalleryTiltedPicker} from "./GalleryTiltedPicker";
/** One fullscreen photographic slide at a time: no filmstrip duplication or mosaic fallback. */
export function GalleryCollection({items:initialItems}:{items:GalleryPhoto[]}){
 const [items,setItems]=useState(initialItems);
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false);
 const [visible,setVisible]=useState(true);
 const [thumbs,setThumbs]=useState(false);
 const stage=useRef<HTMLElement>(null);
 const pointer=useRef<number|null>(null);
 const swipe=useRef(false);
 const count=items.length;
 const shownIndex=Math.min(active,Math.max(0,count-1));
 useEffect(()=>{setItems(initialItems);setActive(i=>Math.min(i,Math.max(0,initialItems.length-1)));},[initialItems]);
 useEffect(()=>{
  let alive=true,busy=false;
  async function refresh(){
   if(!alive||busy||document.visibilityState==="hidden")return;
   busy=true;
   try{
    const latest=await readLatestGallery();
    if(alive){
     setItems(previous=>{
      if(JSON.stringify(previous)===JSON.stringify(latest))return previous;
      return latest;
     });
     setActive(i=>Math.min(i,Math.max(0,latest.length-1)));
    }
   }catch(error){console.warn("Não foi possível atualizar galeria",error);}
   finally{busy=false;}
  }
  const onVisibility=()=>{if(document.visibilityState==="visible")void refresh();};
  const onStorage=(event:StorageEvent)=>{if(isSitePublishStorageEvent(event))void refresh();};
  const onFocus=()=>void refresh();
  void refresh();
  window.addEventListener("focus",onFocus);
  window.addEventListener("storage",onStorage);
  window.addEventListener(SITE_PUBLISHED_EVENT,onFocus);
  document.addEventListener("visibilitychange",onVisibility);
  const interval=window.setInterval(onFocus,60000);
  return()=>{
   alive=false;clearInterval(interval);
   window.removeEventListener("focus",onFocus);
   window.removeEventListener("storage",onStorage);
   window.removeEventListener(SITE_PUBLISHED_EVENT,onFocus);
   document.removeEventListener("visibilitychange",onVisibility);
  };
 },[]);
 const go=(direction:number)=>setActive(i=>(i+direction+count)%count);
 useEffect(()=>{
  if(!stage.current)return;
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.25});
  observer.observe(stage.current);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(count<2||paused||!visible||thumbs||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const id=window.setInterval(()=>setActive(i=>(i+1)%count),7200);
  return()=>window.clearInterval(id);
 },[count,paused,visible,thumbs]);
 if(!items.length)return <p className="public-gallery-empty" role="status">Nenhuma fotografia publicada no momento.</p>;
 const current=items[shownIndex];
 const focus=current.focus_x+"% "+current.focus_y+"%";
 return <section ref={stage} className="gallery-fullscreen" aria-label="Portfólio fotográfico Sabor com Amor"
  onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
  onPointerDown={e=>{pointer.current=e.clientX;swipe.current=false;}}
  onPointerUp={e=>{
   if(pointer.current===null)return;
   const delta=e.clientX-pointer.current;
   pointer.current=null;
   if(Math.abs(delta)>45){go(delta<0?1:-1);swipe.current=true;}
  }}
  onPointerCancel={()=>{pointer.current=null;}}
  onKeyDown={e=>{if(e.key==="ArrowLeft")go(-1);if(e.key==="ArrowRight")go(1);}}>
  <div className="gallery-fullscreen-backdrop" aria-hidden="true" style={{backgroundImage:"url("+JSON.stringify(current.src)+")"}}/>
  <div className="gallery-fullscreen-stage">
   <img key={current.id} src={current.src} alt={current.alt} className="gallery-fullscreen-photo"
    decoding="async" fetchPriority={active===0?"high":"auto"}
    style={{objectFit:current.fit_mode,objectPosition:focus,transform:"scale("+current.zoom+")"}}/>
  </div>
  {count>1&&<div className="gallery-fullscreen-controls" aria-label="Controles de fotografias">
    <button type="button" onClick={()=>go(-1)} aria-label="Fotografia anterior"><ChevronLeft size={22}/></button>
    <button type="button" onClick={()=>go(1)} aria-label="Próxima fotografia"><ChevronRight size={22}/></button>
    <button type="button" onClick={()=>setPaused(x=>!x)} aria-label={paused?"Reproduzir automaticamente":"Pausar passagem automática"}>
      {paused?<Play size={19}/>:<Pause size={19}/>}
    </button>
    <button type="button" onClick={()=>setThumbs(x=>!x)} aria-label={thumbs?"Esconder seleção de fotos":"Mostrar seleção de fotos"}
     aria-expanded={thumbs}><Images size={20}/></button>
   </div>}
  {thumbs&&<GalleryTiltedPicker items={items} active={shownIndex} onChoose={setActive}/>}
 </section>;
}
