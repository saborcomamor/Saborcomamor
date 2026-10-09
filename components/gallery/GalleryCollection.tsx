"use client";
import {useEffect,useRef,useState} from "react";
import {ChevronLeft,ChevronRight} from "lucide-react";
import type {SitePhoto} from "@/lib/photos";
import {Lightbox} from "@/components/ui/Lightbox";
/** Portfólio editorial sem filtros, textos sobre as imagens ou contagem visível. */
export function GalleryCollection({items}:{items:SitePhoto[]}){
 const [active,setActive]=useState(0);
 const [lightbox,setLightbox]=useState<number|null>(null);
 const [visible,setVisible]=useState(true);
 const [paused,setPaused]=useState(false);
 const stage=useRef<HTMLDivElement>(null);
 const pointer=useRef<number|null>(null);
 const swiped=useRef(false);
 const count=items.length;
 const go=(delta:number)=>setActive(v=>(v+delta+count)%count);
 useEffect(()=>{
  if(!stage.current)return;
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.2});
  observer.observe(stage.current);
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(count<2||paused||!visible||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const interval=window.setInterval(()=>setActive(v=>(v+1)%count),5700);
  return()=>window.clearInterval(interval);
 },[count,paused,visible]);
 if(!items.length)return null;
 const main=items[active];
 const previewLeft=items[(active-1+count)%count];
 const previewRight=items[(active+1)%count];
 const film=items.slice(0,Math.min(items.length,9));
 return <div className="photographer-gallery" aria-label="Portfólio fotográfico Sabor com Amor">
  <section className="gallery-editorial-stage" ref={stage}
    onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
    onFocus={()=>setPaused(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setPaused(false);}}
    onPointerDown={e=>{pointer.current=e.clientX;swiped.current=false;}}
    onPointerUp={e=>{if(pointer.current!==null&&Math.abs(e.clientX-pointer.current)>48){swiped.current=true;go(e.clientX<pointer.current?1:-1);}pointer.current=null;}}>
   <div className="gallery-editorial-spread">
    {count>1&&<button type="button" className="gallery-side gallery-side-left" aria-label="Fotografia anterior" onClick={()=>go(-1)}>
      <img src={previewLeft.src} alt="" loading="lazy" decoding="async"/>
    </button>}
    <button type="button" className="gallery-main-image" aria-label={"Ampliar fotografia: "+main.alt}
       onClick={()=>{if(swiped.current){swiped.current=false;return;}setLightbox(active);}}>
      <img src={main.src} alt={main.alt} fetchPriority={active===0?"high":"auto"} decoding="async"/>
    </button>
    {count>1&&<button type="button" className="gallery-side gallery-side-right" aria-label="Próxima fotografia" onClick={()=>go(1)}>
      <img src={previewRight.src} alt="" loading="lazy" decoding="async"/>
    </button>}
   </div>
   {count>1&&<div className="gallery-stage-controls">
    <button type="button" onClick={()=>go(-1)} aria-label="Voltar fotografia"><ChevronLeft size={24}/></button>
    <button type="button" onClick={()=>go(1)} aria-label="Avançar fotografia"><ChevronRight size={24}/></button>
   </div>}
  </section>
  {film.length>1&&<section aria-label="Fotografias em movimento" className="gallery-film-window">
   <div className="gallery-film-track">{[...film,...film].map((item,i)=><button type="button" key={item.id+"-"+i} className="gallery-film-photo"
      aria-label={"Ampliar: "+item.alt} onClick={()=>setLightbox(i%film.length)}>
      <img src={item.src} alt="" loading="lazy" decoding="async"/>
    </button>)}</div>
  </section>}
  <section className="gallery-photo-editorial" aria-label="Todas as fotografias do portfólio">
   {items.map((item,i)=><button type="button" key={item.id} className={"gallery-editorial-tile tile-"+(i%7)}
      onClick={()=>setLightbox(i)} aria-label={"Ampliar: "+item.alt}>
      <img src={item.src} alt={item.alt} loading="lazy" decoding="async"/>
    </button>)}
  </section>
  <Lightbox hideCount items={items} index={lightbox} onClose={()=>setLightbox(null)} onNavigate={setLightbox}/>
 </div>;
}
