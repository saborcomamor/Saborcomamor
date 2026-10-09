"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft,ArrowRight,ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { photo } from "@/lib/photos";
const events=[photo("p09"),photo("p03"),photo("p07"),photo("p10"),photo("p12"),photo("p01")];
export function CurvedEventGallery(){const ref=useRef<HTMLDivElement>(null);function move(dir:number){ref.current?.scrollBy({left:dir*285,behavior:"smooth"})}return <section className="section curved-events"><div className="container"><span className="eyebrow">MOMENTOS ESPECIAIS</span><h2>Uma festa passa.<br/><em>As lembranças ficam.</em></h2><p>Comemorações merecem ser vividas com calma — inclusive por quem está organizando tudo.</p></div><div className="curved-window"><div className="curved-track" ref={ref} role="region" aria-label="Fotografias de eventos" tabIndex={0}>{events.map((item,i)=><div key={item.id} className="curved-event" style={{"--turn":`${(i%5-2)*-7}deg`} as React.CSSProperties}><Photo slot={"home.event-carousel."+String(i+1).padStart(2,"0")} image={item}/><span>{item.label}</span></div>)}</div></div><div className="container curved-bottom"><div className="carousel-controls"><button onClick={()=>move(-1)} aria-label="Ver eventos anteriores"><ArrowLeft/></button><button onClick={()=>move(1)} aria-label="Ver próximos eventos"><ArrowRight/></button></div><Link className="simple-link" href="/galeria">Explore a galeria <ArrowUpRight size={18}/></Link></div></section>}
