"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { photo } from "@/lib/photos";
const cards=[
 {key:"buffet",n:"01",title:"Buffet completo",summary:"Você vive a festa. Nós cuidamos do sabor.",href:"/buffet-completo",image:photo("p01")},
 {key:"cozinha",n:"02",title:"Serviço de cozinha",summary:"Você organiza a ocasião. Nós preparamos a refeição.",href:"/servico-de-cozinha",image:photo("p08")}
];
export function ExpandableServices(){const [active,setActive]=useState("buffet");return <section className="section service-choice" id="servicos"><div className="container"><span className="eyebrow">COMO PODEMOS AJUDAR?</span><h2>Seu evento, <em>do seu jeito.</em></h2><p>Escolha a forma de receber o Sabor com Amor que mais combina com o seu momento.</p><div className="service-panels">{cards.map(c=><article key={c.key} className={`service-panel ${active===c.key?"selected":""}`}><button type="button" onClick={()=>setActive(c.key)} aria-pressed={active===c.key} aria-label={`Ver ${c.title}`} className="service-select"><Photo image={c.image}/><span className="service-panel-shade"/><span className="service-panel-copy"><span>{c.n} · UM JEITO DE CELEBRAR</span><strong>{c.title}</strong>{active===c.key&&<span className="service-panel-summary">{c.summary}</span>}</span></button>{active===c.key&&<Link className="service-panel-link" href={c.href}>Saiba como funciona <ArrowUpRight size={19}/></Link>}</article>)}</div></div></section>}
