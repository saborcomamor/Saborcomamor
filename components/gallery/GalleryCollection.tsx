"use client";
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent} from "react";
import {ArrowLeft,ArrowRight,Maximize2,Pause,Play,X} from "lucide-react";
import type {GalleryPhoto} from "@/lib/gallery-types";
import {readLatestGallery} from "@/lib/cms/browser-public";
import {SITE_PUBLISHED_EVENT,isSitePublishStorageEvent} from "@/lib/cms/site-published";

type Gesture={x:number;y:number;id:number};
type Dimensions={width:number;height:number};
const AUTOPLAY_MS=6100;
const SWIPE_THRESHOLD=48;
function offsetFor(index:number,current:number,length:number){
 if(length<=1)return 0;
 let delta=index-current;
 if(delta>length/2)delta-=length;
 if(delta< -length/2)delta+=length;
 return delta;
}
function formatNumber(value:number){return String(value).padStart(2,"0");}

/** Rotating pagination + editorial reflective card: one live Supabase selection, no grid. */
export function GalleryCollection({items:initialItems}:{items:GalleryPhoto[]}){
 const [items,setItems]=useState(initialItems);
 const [active,setActive]=useState(0);
 const [openIndex,setOpenIndex]=useState<number|null>(null);
 const [playing,setPlaying]=useState(true);
 const [hovering,setHovering]=useState(false);
 const [visible,setVisible]=useState(true);
 const [pageVisible,setPageVisible]=useState(true);
 const [reducedMotion,setReducedMotion]=useState(false);
 const [screen,setScreen]=useState<Dimensions>({width:400,height:800});
 const [ratios,setRatios]=useState<Record<string,number>>({});
 const stageRef=useRef<HTMLDivElement>(null);
 const dialogRef=useRef<HTMLDivElement>(null);
 const closeButtonRef=useRef<HTMLButtonElement>(null);
 const gesture=useRef<Gesture|null>(null);
 const lightboxGesture=useRef<Gesture|null>(null);
 const suppressClickUntil=useRef(0);
 const lastManualChange=useRef(0);
 const count=items.length;
 const shownIndex=Math.min(active,Math.max(0,count-1));
 const fullscreenItem=openIndex===null?null:items[Math.min(openIndex,Math.max(0,count-1))];

 const advance=useCallback((direction:number,manual=true)=>{
  if(count<2)return;
  if(manual)lastManualChange.current=Date.now();
  setActive(index=>(index+direction+count)%count);
 },[count]);
 const choose=useCallback((index:number)=>{
  lastManualChange.current=Date.now();
  setActive(index);
 },[]);

 useEffect(()=>{
  setItems(initialItems);
  setActive(index=>Math.min(index,Math.max(0,initialItems.length-1)));
 },[initialItems]);

 useEffect(()=>{
  const measure=()=>setScreen({width:window.innerWidth,height:window.innerHeight});
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const match=()=>setReducedMotion(motion.matches);
  const visibility=()=>setPageVisible(!document.hidden);
  measure();match();visibility();
  window.addEventListener("resize",measure);
  document.addEventListener("visibilitychange",visibility);
  motion.addEventListener("change",match);
  return()=>{
   window.removeEventListener("resize",measure);
   document.removeEventListener("visibilitychange",visibility);
   motion.removeEventListener("change",match);
  };
 },[]);

 // CMS publications update an already-open gallery without a deploy or browser reload.
 useEffect(()=>{
  let alive=true,busy=false;
  async function refresh(){
   if(!alive||busy||document.hidden)return;
   busy=true;
   try{
    const latest=await readLatestGallery();
    if(!alive)return;
    setItems(previous=>JSON.stringify(previous)===JSON.stringify(latest)?previous:latest);
    setActive(index=>Math.min(index,Math.max(0,latest.length-1)));
    setOpenIndex(index=>index===null?null:latest.length?Math.min(index,latest.length-1):null);
   }catch(error){console.warn("Não foi possível atualizar a galeria.",error);}
   finally{busy=false;}
  }
  const focus=()=>void refresh();
  const onStorage=(event:StorageEvent)=>{if(isSitePublishStorageEvent(event))void refresh();};
  const onVisibility=()=>{if(!document.hidden)void refresh();};
  void refresh();
  window.addEventListener("focus",focus);
  window.addEventListener("storage",onStorage);
  window.addEventListener(SITE_PUBLISHED_EVENT,focus);
  document.addEventListener("visibilitychange",onVisibility);
  const interval=window.setInterval(focus,60000);
  return()=>{
   alive=false;window.clearInterval(interval);
   window.removeEventListener("focus",focus);
   window.removeEventListener("storage",onStorage);
   window.removeEventListener(SITE_PUBLISHED_EVENT,focus);
   document.removeEventListener("visibilitychange",onVisibility);
  };
 },[]);

 useEffect(()=>{
  if(!stageRef.current)return;
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.28});
  observer.observe(stageRef.current);
  return()=>observer.disconnect();
 },[count>0]);

 useEffect(()=>{
  if(count<2||!playing||hovering||!visible||!pageVisible||reducedMotion||openIndex!==null)return;
  const interval=window.setInterval(()=>{
   if(Date.now()-lastManualChange.current<6900)return;
   setActive(index=>(index+1)%count);
  },AUTOPLAY_MS);
  return()=>window.clearInterval(interval);
 },[count,playing,hovering,visible,pageVisible,reducedMotion,openIndex]);

 useEffect(()=>{
  if(openIndex===null)return;
  closeButtonRef.current?.focus({preventScroll:true});
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape")setOpenIndex(null);
   if(event.key==="Tab"){
    const controls=dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
    if(!controls||controls.length===0)return;
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
   }
   if(event.key==="ArrowRight"){event.preventDefault();setOpenIndex(index=>index===null?0:(index+1)%count);}
   if(event.key==="ArrowLeft"){event.preventDefault();setOpenIndex(index=>index===null?0:(index-1+count)%count);}
  };
  window.addEventListener("keydown",onKey);
  return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey);};
 },[openIndex,count]);

 const visibleCards=useMemo(()=>{
  return items.map((item,index)=>({item,index,offset:offsetFor(index,shownIndex,count)}))
   .filter(card=>Math.abs(card.offset)<=2);
 },[items,shownIndex,count]);

 function rememberRatio(id:string,event:React.SyntheticEvent<HTMLImageElement>){
  const image=event.currentTarget;
  const ratio=image.naturalWidth/image.naturalHeight;
  if(!Number.isFinite(ratio)||ratio<.25||ratio>4)return;
  setRatios(previous=>Math.abs((previous[id]||0)-ratio)<.01?previous:{...previous,[id]:ratio});
 }
 function cardStyle(item:GalleryPhoto,offset:number):CSSProperties{
  const ratio=ratios[item.id]||.77;
  const compact=screen.width<700;
  const maxHeight=Math.min(screen.height*(compact?.60:.68),680);
  const maxWidth=Math.min(compact?screen.width*.89:screen.width*.60,860);
  const width=Math.min(maxWidth,maxHeight*ratio);
  const height=width/ratio;
  const abs=Math.abs(offset);
  const shift=abs===0?0:Math.sign(offset)*Math.min(screen.width*(compact?.31:.24),300)*(abs===1?1:1.68);
  return {
   width:width+"px",height:height+"px",
   zIndex:10-abs,
   opacity:abs===2?.48:abs===1?.83:1,
   "--rotor-x":shift+"px",
   "--rotor-y":(abs===0?0:abs===1?19:39)+"px",
   "--rotor-z":(-abs*112)+"px",
   "--rotor-ry":(-Math.sign(offset)*(abs===1?32:51))+"deg",
   "--rotor-scale":abs===0?1:abs===1?.80:.59
  } as CSSProperties;
 }
 function onDown(event:PointerEvent<HTMLDivElement>,ref:React.MutableRefObject<Gesture|null>){
  if(event.pointerType==="mouse"&&event.button!==0)return;
  ref.current={x:event.clientX,y:event.clientY,id:event.pointerId};
 }
 function onUp(event:PointerEvent<HTMLDivElement>,ref:React.MutableRefObject<Gesture|null>,onSwipe:(direction:number)=>void){
  const start=ref.current;ref.current=null;
  if(!start||start.id!==event.pointerId)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.abs(dx)>SWIPE_THRESHOLD&&Math.abs(dx)>Math.abs(dy)*1.15){
   suppressClickUntil.current=Date.now()+450;
   onSwipe(dx<0?1:-1);
  }
 }
 function openPhoto(){
  if(Date.now()<suppressClickUntil.current)return;
  lastManualChange.current=Date.now();
  setOpenIndex(shownIndex);
 }
 function tilt(event:PointerEvent<HTMLButtonElement>){
  if(event.pointerType!=="mouse")return;
  const rect=event.currentTarget.getBoundingClientRect();
  const x=(event.clientX-rect.left)/rect.width-.5;
  const y=(event.clientY-rect.top)/rect.height-.5;
  event.currentTarget.style.setProperty("--tilt-x",(-y*4).toFixed(2)+"deg");
  event.currentTarget.style.setProperty("--tilt-y",(x*5).toFixed(2)+"deg");
  event.currentTarget.style.setProperty("--shine-x",((x+.5)*100).toFixed(1)+"%");
 }
 function resetTilt(event:PointerEvent<HTMLButtonElement>){
  event.currentTarget.style.setProperty("--tilt-x","0deg");
  event.currentTarget.style.setProperty("--tilt-y","0deg");
  event.currentTarget.style.setProperty("--shine-x","32%");
 }

 if(!count)return <section className="gallery-rotor-empty" role="status">Nossa galeria está sendo preparada.</section>;

 const current=items[shownIndex];
 return <section className="gallery-rotor" aria-label="Portfólio fotográfico do Sabor com Amor">
  <header className="gallery-rotor-heading">
   <span className="gallery-rotor-eyebrow">NOSSO ACERVO</span>
   <h1>Detalhes que <em>ficam na memória.</em></h1>
   <p>Um pouco do carinho que colocamos em cada celebração.</p>
  </header>
  <div ref={stageRef} className="gallery-rotor-stage" role="region"
   aria-roledescription="carrossel" aria-label="Fotografias de eventos"
   tabIndex={0} onPointerEnter={event=>{if(event.pointerType==="mouse")setHovering(true);}}
   onPointerLeave={event=>{if(event.pointerType==="mouse")setHovering(false);}}
   onPointerDown={event=>onDown(event,gesture)}
   onPointerUp={event=>onUp(event,gesture,direction=>advance(direction))}
   onPointerCancel={()=>{gesture.current=null;}}
   onKeyDown={event=>{
    if(event.key==="ArrowLeft"){event.preventDefault();advance(-1);}
    if(event.key==="ArrowRight"){event.preventDefault();advance(1);}
   }}>
   <div className="gallery-rotor-halo" aria-hidden="true"/>
   <div className="gallery-rotor-ground" aria-hidden="true"/>
   <div className="gallery-rotor-perspective">
    {visibleCards.map(({item,index,offset})=><button
     key={item.id} type="button" className={"gallery-rotor-card "+(offset===0?"is-current":"is-side")}
     style={cardStyle(item,offset)}
     aria-label={offset===0?"Ampliar fotografia "+(shownIndex+1):"Ir para fotografia "+(index+1)}
     aria-current={offset===0?"true":undefined}
     tabIndex={offset===0||Math.abs(offset)===1?0:-1}
     onClick={()=>{
      if(Date.now()<suppressClickUntil.current)return;
      if(offset===0)openPhoto();else choose(index);
     }}
     onPointerMove={offset===0?tilt:undefined}
     onPointerLeave={offset===0?resetTilt:undefined}>
     <span className="gallery-rotor-surface">
      <span className="gallery-rotor-image-box">
       <img src={item.src} alt={offset===0?item.alt:""} draggable={false}
        decoding="async" loading={Math.abs(offset)<2?"eager":"lazy"}
        fetchPriority={offset===0?"high":"auto"}
        onLoad={event=>rememberRatio(item.id,event)}
        style={{objectFit:item.fit_mode,objectPosition:item.focus_x+"% "+item.focus_y+"%",
         transform:"scale("+item.zoom+")"}}/>
      </span>
      <span className="gallery-rotor-gloss" aria-hidden="true"/>
      {offset===0&&<span className="gallery-rotor-enlarge" aria-hidden="true"><Maximize2 size={18}/></span>}
     </span>
     {offset===0&&<img className="gallery-rotor-reflection" src={item.src} alt=""
      aria-hidden="true" draggable={false} decoding="async" loading="lazy"/>}
    </button>)}
   </div>
  </div>
  <nav className="gallery-rotor-navigation" aria-label="Navegação da galeria">
   <button type="button" className="gallery-rotor-arrow" disabled={count<2}
    aria-label="Fotografia anterior" onClick={()=>advance(-1)}><ArrowLeft size={20}/></button>
   <div className="gallery-rotor-progress" aria-live={playing?"off":"polite"} aria-atomic="true">
    <span className="gallery-rotor-current-number">{formatNumber(shownIndex+1)}</span>
    <span className="gallery-rotor-track" aria-hidden="true"><span
     style={{width:((shownIndex+1)/count)*100+"%"}}/></span>
    <span>{formatNumber(count)}</span>
   </div>
   <button type="button" className="gallery-rotor-arrow" disabled={count<2}
    aria-label="Próxima fotografia" onClick={()=>advance(1)}><ArrowRight size={20}/></button>
   <button type="button" className="gallery-rotor-autoplay"
    aria-label={reducedMotion?"Movimento reduzido ativado":playing?"Pausar movimento automático":"Retomar movimento automático"}
    disabled={reducedMotion||count<2} aria-pressed={!playing} onClick={()=>{lastManualChange.current=Date.now();setPlaying(x=>!x);}}>
    {playing?<Pause size={16}/>:<Play size={16}/>}
   </button>
  </nav>
  <p className="gallery-rotor-help">Deslize para explorar · Toque na foto para ampliar</p>

  {fullscreenItem&&<div ref={dialogRef} className="gallery-rotor-lightbox" role="dialog" aria-modal="true"
   aria-label="Fotografia ampliada" tabIndex={-1} onPointerDown={event=>onDown(event,lightboxGesture)}
   onPointerUp={event=>onUp(event,lightboxGesture,direction=>{
    if(!count)return;
    setOpenIndex(index=>index===null?0:(index+direction+count)%count);
   })}
   onPointerCancel={()=>{lightboxGesture.current=null;}}>
   <button ref={closeButtonRef} type="button" className="gallery-rotor-close" aria-label="Fechar fotografia ampliada"
    onClick={()=>setOpenIndex(null)}><X size={24}/></button>
   <div className="gallery-rotor-lightbox-frame" onClick={event=>{
    if(event.target===event.currentTarget)setOpenIndex(null);
   }}>
    <img key={fullscreenItem.id} src={fullscreenItem.src} alt={fullscreenItem.alt}
     decoding="async" draggable={false} style={{objectPosition:fullscreenItem.focus_x+"% "+fullscreenItem.focus_y+"%"}}/>
   </div>
   {count>1&&<div className="gallery-rotor-lightbox-footer">
    <button type="button" aria-label="Fotografia anterior" onClick={()=>setOpenIndex(index=>((index??0)-1+count)%count)}><ArrowLeft/></button>
    <span>{formatNumber((openIndex??0)+1)} / {formatNumber(count)}</span>
    <button type="button" aria-label="Próxima fotografia" onClick={()=>setOpenIndex(index=>((index??0)+1)%count)}><ArrowRight/></button>
   </div>}
  </div>}
 </section>;
}
