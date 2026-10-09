"use client";
import Image from "next/image";
import type { SitePhoto } from "@/lib/photos";
import { useSiteMedia, resolveSitePhoto } from "@/lib/cms/media";
export function Photo({ image, className = "", priority = false, sizes = "(max-width: 640px) 90vw, 45vw",slot }:{image:SitePhoto;className?:string;priority?:boolean;sizes?:string;slot?:string}) {
 const effective=resolveSitePhoto(useSiteMedia(),slot,image);
 return <div className={`photo-frame ${className}`}><Image src={effective.src} alt={effective.alt} fill priority={priority} sizes={sizes} className="photo-image"/></div>;
}
