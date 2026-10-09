"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { photo } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";
const frames=[photo("p01"),photo("p02"),photo("p10")];
export function CinematicHero(){
 const [active,setActive]=useState(0);
 useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const t=window.setInterval(()=>setActive(v=>(v+1)%frames.length),5500);return()=>clearInterval(t)},[]);
 return <section className="cinematic-hero" aria-label="Bem-vindo ao Buffet Sabor com Amor"><div className="hero-slides" aria-hidden="true">{frames.map((item,i)=><div key={item.id} className={`hero-slide ${i===active?"is-active":""}`}><Photo slot={"home.hero."+String(i+1).padStart(2,"0")} image={item} priority={i===0} sizes="100vw"/></div>)}</div><div className="hero-overlay"/>
 <div className="hero-main container"><div className="hero-ornament"><span>✦</span> Da nossa cozinha para sua história</div><h1>O sabor que <em>reúne.</em><br/>O carinho que <em>fica.</em></h1><p>Tem celebrações que ficam na memória. E sabores que fazem a gente lembrar de cada abraço.</p><div className="hero-actions"><Link href="/orcamento" className="button button-cream">Conte sobre seu evento <ArrowUpRight size={18}/></Link><Link href="/servicos" className="text-link-light">Conheça nossos serviços</Link></div></div>
 <a className="hero-scroll" href="#boas-vindas" aria-label="Rolar para conhecer"><span>DESLIZE PARA DESCOBRIR</span><ArrowDown size={19}/></a><div className="hero-indicators" aria-label="Fotografias em destaque">{frames.map((p,i)=><button key={p.id} onClick={()=>setActive(i)} aria-label={`Ver fotografia ${i+1}`} aria-current={i===active?"true":undefined}/>)}</div>
 </section>;
}
