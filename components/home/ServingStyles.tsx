"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { photo } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";
const styles=[
 {title:"Buffet à vontade",description:"Um jeito descontraído de servir, para que cada pessoa monte seu prato e aproveite a ocasião.",image:photo("p01")},
 {title:"Serviço à francesa",description:"Um serviço de mesa mais formal, combinado conforme a organização e estrutura do evento.",image:photo("p10")},
 {title:"Finger food",description:"Pequenas porções para eventos com circulação e encontros mais informais.",image:photo("p11")},
 {title:"Coquetel",description:"Uma apresentação leve e prática para receber os convidados com atenção aos detalhes.",image:photo("p14")}
];
export function ServingStyles(){const [open,setOpen]=useState(0);return <section className="section serving-section"><div className="container"><div><span className="eyebrow">CADA CELEBRAÇÃO É ÚNICA</span><h2>O jeito de servir também faz <em>parte da festa.</em></h2><p>Algumas formas de apresentar e servir a comida. A disponibilidade de cada modalidade é confirmada no orçamento.</p></div><div className="serving-layout"><div className="serving-accordion">{styles.map((s,i)=><div key={s.title} className={`serving-item ${open===i?"is-open":""}`}><button onClick={()=>setOpen(i)} aria-expanded={open===i} aria-controls={`serving-desc-${i}`}><span>0{i+1}.</span><strong>{s.title}</strong>{open===i?<Minus size={20}/>:<Plus size={20}/>}</button><div id={`serving-desc-${i}`} hidden={open!==i}><p>{s.description}</p></div></div>)}</div><div className="serving-image"><Photo slot={"home.serving."+String(open+1).padStart(2,"0")} image={styles[open].image}/></div></div></div></section>}
