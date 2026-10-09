"use client";
import type {GalleryPhoto} from "@/lib/gallery-types";
/**
 * Tilted miniature navigation, adapted from the interaction pattern in Vivi Tseng's
 * MIT-licensed "tilted carousel", https://codepen.io/vii120/pen/VYmmdMK.
 * No remote assets and no extra photographs beyond the published selection.
 */
export function GalleryTiltedPicker({items,active,onChoose}:{
 items:GalleryPhoto[];active:number;onChoose:(index:number)=>void;
}){
 return <div className="gallery-tilted-dock" role="region" aria-label="Selecionar fotografia">
  {items.map((item,index)=>{
   const offset=Math.max(-3,Math.min(3,index-active));
   return <button key={item.id} type="button" aria-label={"Abrir fotografia "+(index+1)}
     aria-current={index===active?"true":undefined}
     className={"gallery-tilted-card "+(index===active?"active":"")}
     style={{"--card-angle":(-offset*10)+"deg"} as React.CSSProperties}
     onClick={()=>onChoose(index)}>
     <img src={item.src} alt="" loading="lazy" decoding="async"/>
   </button>;
  })}
 </div>;
}
