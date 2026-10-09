import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { photo } from "@/lib/photos";
export function WarmWelcome(){return <section id="boas-vindas" className="section welcome-section"><div className="container"><SectionHeading eyebrow="SEJA BEM-VINDO" title={<>Receber bem é uma <em>forma de carinho.</em></>} description="Sabe aquela alegria de reunir quem a gente ama ao redor da mesa? É essa sensação que queremos levar para cada celebração."/><div className="welcome-composition"><Reveal from="left" className="welcome-photo-a"><Photo image={photo("p06")}/></Reveal><Reveal from="right" delay={.15} className="welcome-photo-b"><Photo image={photo("p07")}/></Reveal><Reveal from="scale" delay={.2} className="welcome-photo-c"><Photo image={photo("p04")}/></Reveal><div className="welcome-handwritten">Uma mesa cheia de histórias.<span>✳</span></div></div></div></section>}
