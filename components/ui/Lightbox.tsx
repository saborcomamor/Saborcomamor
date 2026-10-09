"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { SitePhoto } from "@/lib/photos";
export function useLightbox() { const [index,setIndex]=useState<number|null>(null); return { index,setIndex }; }
export function Lightbox({ items, index, onClose, onNavigate,hideCount=false }:{items:SitePhoto[];index:number|null;onClose:()=>void;onNavigate:(index:number)=>void;hideCount?:boolean}){
 const dialog=useRef<HTMLDivElement>(null); const close=useCallback(onClose,[onClose]);
 useEffect(()=>{
  if(index===null)return;
  const old=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const prev=document.body.style.overflow;document.body.style.overflow="hidden";dialog.current?.focus();
  const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")close();if(e.key==="ArrowRight")onNavigate((index+1)%items.length);if(e.key==="ArrowLeft")onNavigate((index-1+items.length)%items.length);if(e.key==="Tab"){const focusable=dialog.current?.querySelectorAll<HTMLElement>("button");if(!focusable?.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
  document.addEventListener("keydown",onKey);return()=>{document.body.style.overflow=prev;document.removeEventListener("keydown",onKey);old?.focus()};
 },[index,items.length,close,onNavigate]);
 if(index===null||!items[index])return null;
 return <div className="lightbox" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="lightbox-dialog" role="dialog" aria-modal="true" aria-label={`Foto ${index+1} de ${items.length}`} tabIndex={-1} ref={dialog}><button className="lightbox-close" onClick={close} aria-label="Fechar fotografia"><X/></button><div className="lightbox-image"><Image alt={items[index].alt} src={items[index].src} fill sizes="95vw"/></div><div className="lightbox-controls"><button aria-label="Foto anterior" onClick={()=>onNavigate((index-1+items.length)%items.length)}><ChevronLeft/></button>{!hideCount&&<span>{index+1} / {items.length}</span>}<button aria-label="Próxima foto" onClick={()=>onNavigate((index+1)%items.length)}><ChevronRight/></button></div></div></div>
}
