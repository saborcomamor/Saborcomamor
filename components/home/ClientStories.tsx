"use client";
import {ScrollInk} from "@/components/ui/ScrollInk";
import {useVisualSettings} from "@/lib/visual-client";
export function ClientStories(){
 const visual=useVisualSettings();
 return <section className={"section keepsakes-section keepsakes-font-"+visual.keepsakes_font} aria-label="O que realmente importa">
  <div className="container keepsakes-inner">
   <span className="eyebrow">O QUE REALMENTE IMPORTA</span>
   <div className="keepsakes-poem">
    <ScrollInk><p className="keepsakes-line">Que a mesa seja farta.</p></ScrollInk>
    <ScrollInk><p className="keepsakes-line">Que os encontros sejam leves.</p></ScrollInk>
    <ScrollInk><p className="keepsakes-line is-final">Que as memórias sejam bonitas.</p></ScrollInk>
   </div>
   <ScrollInk className="keepsakes-copy">
    <p className="keepsakes-subtitle" aria-label="Porque o melhor de uma festa é estar perto de quem a gente ama.">
     <span>Porque o melhor de uma festa</span>
     <span>é estar perto de quem a gente ama.</span>
    </p>
   </ScrollInk>
  </div>
 </section>;
}
