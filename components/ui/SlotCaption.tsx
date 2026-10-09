"use client";
import {useSiteMedia} from "@/lib/cms/media";

/** Texto associado à posição visual, não ao arquivo do banco de fotos. */
export function SlotCaption({slot,fallback,className=""}:{slot:string;fallback:string;className?:string}){
  const media=useSiteMedia();
  const assignment=media[slot];
  const caption=assignment?assignment.label:fallback;
  if(!caption.trim())return null;
  return <h3 className={className}>{caption}</h3>;
}
