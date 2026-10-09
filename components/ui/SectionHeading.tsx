import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
export function SectionHeading({ eyebrow, title, description, center=false, light=false }:{eyebrow:string;title:ReactNode;description?:string;center?:boolean;light?:boolean}) {
 return <Reveal className={`section-heading ${center?"is-centered":""} ${light?"is-light":""}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description&&<p>{description}</p>}</Reveal>;
}
