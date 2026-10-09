"use client";
import {useRef,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,ArrowUpRight} from "lucide-react";
import {Photo} from "@/components/ui/Photo";
import {photo} from "@/lib/photos";
import {useSiteMedia,resolveSitePhoto} from "@/lib/cms/media";
const events=[photo("p09"),photo("p03"),photo("p07"),photo("p10"),photo("p12"),photo("p01")];
/** File-drawer interaction adapted from Vivi Tseng (MIT), CodePen JoEBvya.
 * Uses only photographs assigned to the Home event section. */
export function CurvedEventGallery(){
 const track=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(2);
 const media=useSiteMedia();
 const slides=events.map((item,i)=>resolveSitePhoto(media,"home.event-carousel."+String(i+1).padStart(2,"0"),item));
 function select(index:number){
  const next=Math.max(0,Math.min(slides.length-1,index));
  setActive(next);
  const el=track.current?.children.item(next) as HTMLElement|null;
  el?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
 }
 return <section className="section curved-events">
  <div className="container">
   <span className="eyebrow">MOMENTOS ESPECIAIS</span>
   <h2>Uma festa passa.<br/><em>As lembranças ficam.</em></h2>
   <p>Comemorações merecem ser vividas com calma — inclusive por quem está organizando tudo.</p>
  </div>
  <div className="curved-window">
   <div className="curved-track" ref={track} role="region" aria-label="Momentos do buffet" tabIndex={0}>
    {slides.map((item,i)=><button key={item.id+"-"+i} type="button"
     className={"curved-event drawer-photo "+(i===active?"active":"")}
     aria-pressed={i===active} aria-label={"Destacar fotografia "+(i+1)}
     style={{"--turn":(active-i)*12+"deg"} as React.CSSProperties}
     onClick={()=>select(i)}>
     <Photo slot={"home.event-carousel."+String(i+1).padStart(2,"0")} image={item}/>
     {item.label&&<span>{item.label}</span>}
    </button>)}
   </div>
  </div>
  <div className="container curved-bottom">
   <div className="carousel-controls">
    <button onClick={()=>select(active-1)} aria-label="Ver eventos anteriores"><ArrowLeft/></button>
    <button onClick={()=>select(active+1)} aria-label="Ver próximos eventos"><ArrowRight/></button>
   </div>
   <Link className="simple-link" href="/galeria">Explore a galeria <ArrowUpRight size={18}/></Link>
  </div>
 </section>;
}
