"use client";
import { useState } from "react";
import type { SitePhoto } from "@/lib/photos";
import { Photo } from "./Photo";
import {useSiteMedia,resolveSitePhoto} from "@/lib/cms/media";
import { Lightbox } from "./Lightbox";
export function PhotoGrid({items,slotPrefix}:{items:SitePhoto[];slotPrefix?:string}){
 const media=useSiteMedia();
 const shown=slotPrefix?items.map((item,index)=>resolveSitePhoto(media,slotPrefix+"."+String(index+1).padStart(2,"0"),item)):items;
 const [active,setActive]=useState<number|null>(null);
 return <><div className="photo-grid">{shown.map((item,index)=><button type="button" key={item.id} className={`photo-grid-cell photo-grid-cell-${index%7}`} onClick={()=>setActive(index)} aria-label={`Ampliar: ${item.alt}`}><Photo image={item}/><span>{item.label}</span></button>)}</div><Lightbox items={shown} index={active} onClose={()=>setActive(null)} onNavigate={setActive}/></>
}
