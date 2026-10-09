import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { photo } from "@/lib/photos";
const ids=["p05","p03","p06","p12","p13","p15","p02"];
export function LivingPhotoMosaic(){return <section className="section photo-mosaic-section"><div className="container"><SectionHeading eyebrow="NOSSO OLHAR" title={<>O carinho mora <em>nos detalhes.</em></>} description="Da escolha dos ingredientes à mesa preparada, há beleza em cada pedacinho de uma celebração."/><div className="living-mosaic">{ids.map((id,i)=><Reveal key={id} className={`mosaic-tile mosaic-tile-${i+1}`} from={i%2?"scale":"bottom"} delay={i*.045}><Photo image={photo(id)}/></Reveal>)}</div></div></section>}
