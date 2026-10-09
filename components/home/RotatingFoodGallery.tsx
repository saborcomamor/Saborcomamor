"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft,ChevronRight,ArrowUpRight } from "lucide-react";
import { photo } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";
const dishes=[photo("p02"),photo("p05"),photo("p06"),photo("p11"),photo("p13"),photo("p14"),photo("p16")];
export function RotatingFoodGallery(){
 const [current,setCurrent]=useState(0);const n=dishes.length;let x=0;
 function distance(i:number){return (i-current+n)%n>n/2?(i-current+n)%n-n:(i-current+n)%n}
 return <section className="section rotating-gallery" aria-label="Galeria circular de pratos"><div className="container"><div className="rotating-head"><span className="eyebrow">SABORES QUE ACOLHEM</span><h2>Tem comida que é <em>abraço.</em></h2><p>Um pouquinho da beleza que existe nos detalhes de uma boa refeição.</p></div><div className="rotating-stage" onTouchStart={e=>{x=e.touches[0].clientX}} onTouchEnd={e=>{const delta=e.changedTouches[0].clientX-x;if(Math.abs(delta)>35)setCurrent(v=>(v+(delta<0?1:-1)+n)%n)}} role="group" aria-roledescription="carrossel" aria-label="Fotos dos pratos, deslize para navegar">{dishes.map((item,i)=>{const d=distance(i);const hidden=Math.abs(d)>2;return <button key={item.id} className={`rotating-card ${d===0?"is-front":""}`} onClick={()=>setCurrent(i)} tabIndex={hidden?-1:0} aria-hidden={hidden} aria-label={`${item.label}, foto ${i+1} de ${n}`} style={{transform:`translate(-50%, -50%) translateX(${d*62}%) translateZ(${-Math.abs(d)*120}px) rotateY(${-d*23}deg) scale(${1-Math.abs(d)*.13})`,opacity:hidden?0:1,zIndex:10-Math.abs(d)}}><Photo image={item}/></button>})}</div><div className="carousel-controls"><button aria-label="Anterior" onClick={()=>setCurrent(v=>(v-1+n)%n)}><ChevronLeft/></button><span>{String(current+1).padStart(2,"0")} / {String(n).padStart(2,"0")}</span><button aria-label="Próxima" onClick={()=>setCurrent(v=>(v+1)%n)}><ChevronRight/></button></div><Link className="simple-link" href="/galeria">Veja mais fotografias <ArrowUpRight size={18}/></Link></div></section>;
}
