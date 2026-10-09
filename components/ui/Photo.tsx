import Image from "next/image";
import type { SitePhoto } from "@/lib/photos";
export function Photo({ image, className = "", priority = false, sizes = "(max-width: 640px) 90vw, 45vw" }:{image:SitePhoto;className?:string;priority?:boolean;sizes?:string}) {
 return <div className={`photo-frame ${className}`}><Image src={image.src} alt={image.alt} fill priority={priority} sizes={sizes} className="photo-image"/></div>;
}
