"use client";
import { useState } from "react";
import type { SitePhoto } from "@/lib/photos";
import { Photo } from "./Photo";
import { Lightbox } from "./Lightbox";
export function PhotoGrid({items}:{items:SitePhoto[]}){
 const [active,setActive]=useState<number|null>(null);
 return <><div className="photo-grid">{items.map((item,index)=><button type="button" key={item.id} className={`photo-grid-cell photo-grid-cell-${index%7}`} onClick={()=>setActive(index)} aria-label={`Ampliar: ${item.alt}`}><Photo image={item}/><span>{item.label}</span></button>)}</div><Lightbox items={items} index={active} onClose={()=>setActive(null)} onNavigate={setActive}/></>
}
