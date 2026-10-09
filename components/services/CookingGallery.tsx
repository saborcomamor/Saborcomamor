import { PhotoGrid } from "@/components/ui/PhotoGrid";
import { photos } from "@/lib/photos";
export function CookingGallery(){return <section className="section container"><div className="section-heading"><span className="eyebrow">NOS BASTIDORES</span><h2>O carinho também acontece <em>na cozinha.</em></h2></div><PhotoGrid slotPrefix="kitchen.gallery" items={photos.filter(p=>["Bastidores","Pratos"].includes(p.category)).slice(0,8)}/></section>}
