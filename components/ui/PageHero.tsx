import { Photo } from "./Photo";
import type { SitePhoto } from "@/lib/photos";
import { Reveal } from "./Reveal";
export function PageHero({eyebrow,title,description,image}:{eyebrow:string;title:string;description:string;image:SitePhoto;slot?:string}){
 return <section className="page-hero"><Photo slot={slot} image={image} className="page-hero-image" priority sizes="100vw"/><div className="page-hero-shade"/><div className="page-hero-copy container"><Reveal><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></Reveal></div></section>
}
