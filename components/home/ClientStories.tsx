import {Reveal} from "@/components/ui/Reveal";
export function ClientStories(){
 return <section className="section keepsakes-section" aria-label="O que realmente importa">
  <div className="container keepsakes-inner">
   <Reveal><span className="eyebrow">O QUE REALMENTE IMPORTA</span></Reveal>
   <div className="keepsakes-poem">
    <Reveal from="bottom"><p className="keepsakes-line">Que a mesa seja farta.</p></Reveal>
    <Reveal from="bottom" delay={.25}><p className="keepsakes-line">Que os encontros sejam leves.</p></Reveal>
    <Reveal from="bottom" delay={.5}><p className="keepsakes-line is-final">Que as memórias sejam bonitas.</p></Reveal>
   </div>
   <Reveal from="bottom" delay={.65}><p className="keepsakes-subtitle">Porque o melhor de uma festa é estar perto de quem a gente ama.</p></Reveal>
  </div>
 </section>;
}
