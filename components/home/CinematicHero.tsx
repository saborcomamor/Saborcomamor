"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {photo} from "@/lib/photos";
import {Photo} from "@/components/ui/Photo";
const frames=[photo("p01"),photo("p02"),photo("p10")];
export function CinematicHero(){
 const [active,setActive]=useState(0);
 useEffect(()=>{
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const timer=window.setInterval(()=>setActive(i=>(i+1)%frames.length),8000);
  return()=>clearInterval(timer);
 },[]);
 return <section className="cinematic-hero" aria-label="Buffet Sabor com Amor">
  <div className="hero-slides" aria-hidden="true">{frames.map((item,i)=><div className={"hero-slide "+(active===i?"is-active":"")} key={item.id}>
    <Photo slot={"home.hero."+String(i+1).padStart(2,"0")} image={item} priority={i===0} sizes="100vw"/>
  </div>)}</div>
  <div className="hero-overlay"/>
  <div className="hero-main container">
   <span className="hero-kicker">BUFFET SABOR COM AMOR</span>
   <h1>Celebrar tem <em>sabor de carinho.</em></h1>
   <p>Comida feita com cuidado. Momentos vividos por inteiro.</p>
   <Link className="hero-cta" href="/orcamento">Vamos celebrar? <ArrowUpRight size={20}/></Link>
  </div>
  <a className="hero-scroll-simple" href="#boas-vindas" aria-label="Descer para conhecer o Buffet Sabor com Amor"><span/></a>
 </section>;
}
