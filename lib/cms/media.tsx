"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { SitePhoto } from "@/lib/photos";
export type MediaAssignment = { photo_id: string; src: string; alt: string; label: string };
export type MediaAssignments = Record<string,MediaAssignment>;
const Context = createContext<MediaAssignments>({});
export function SiteMediaProvider({items,children}:{items:MediaAssignments;children:ReactNode}) {
  return <Context.Provider value={items}>{children}</Context.Provider>;
}
export function useSiteMedia(){return useContext(Context);}
export function resolveSitePhoto(items:MediaAssignments, slot:string|undefined, fallback:SitePhoto):SitePhoto {
  if(!slot) return fallback;
  const match=items[slot];
  return match ? { ...fallback, id:slot, src:match.src, alt:match.alt, label:match.label } : fallback;
}
