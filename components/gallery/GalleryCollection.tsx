"use client";
import { useMemo, useState } from "react";
import { PhotoGrid } from "@/components/ui/PhotoGrid";
import { photos, type SitePhoto } from "@/lib/photos";
const filters=["Tudo","Pratos","Buffets","Eventos","Bastidores"] as const;
export function GalleryCollection({ items: initialPhotos = photos }:{items?:SitePhoto[]}){const [filter,setFilter]=useState<(typeof filters)[number]>("Tudo");const items=useMemo(()=>filter==="Tudo"?initialPhotos:initialPhotos.filter(p=>p.category===filter),[filter,initialPhotos]);return <section className="section gallery-collection container"><div className="gallery-filters" aria-label="Filtrar fotografias">{filters.map(f=><button type="button" key={f} onClick={()=>setFilter(f)} aria-pressed={filter===f} className={filter===f?"active":""}>{f}</button>)}</div><p className="gallery-count" aria-live="polite">{items.length} fotografias • toque para ampliar</p><PhotoGrid items={items}/></section>}
