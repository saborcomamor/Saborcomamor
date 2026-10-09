import { PhotoGrid } from "@/components/ui/PhotoGrid";
import { photos } from "@/lib/photos";
export function FullBuffetGallery(){return <section className="section container"><div className="section-heading"><span className="eyebrow">INSPIRAÇÕES PARA A SUA FESTA</span><h2>Bom é ver a mesa <em>cheia de carinho.</em></h2></div><PhotoGrid items={photos.filter(p=>["Buffets","Pratos"].includes(p.category)).slice(0,8)}/></section>}
