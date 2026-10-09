"use client";
import {useEffect,useState,type ReactNode} from "react";
import {SiteMediaProvider,type MediaAssignments} from "@/lib/cms/media";
import {BusinessProvider} from "@/lib/business-client";
import {VisualProvider} from "@/lib/visual-client";
import {ServicesProvider,type PublishedServices} from "@/lib/cms/services-context";
import type {BusinessProfile,VisualSettings} from "@/lib/public-dynamic";
import {readLatestSiteContent} from "@/lib/cms/browser-public";
import {SITE_PUBLISHED_EVENT,isSitePublishStorageEvent} from "@/lib/cms/site-published";
type Props={
 media:MediaAssignments;profile:BusinessProfile;visual:VisualSettings;services:PublishedServices;children:ReactNode
};
/** A Next.js shared layout stays mounted on client navigation. Refresh the data without redeploy. */
export function LivePublicContent({media,profile,visual,services,children}:Props){
 const [state,setState]=useState({media,profile,visual,services});
 useEffect(()=>setState({media,profile,visual,services}),[media,profile,visual,services]);
 useEffect(()=>{
  let alive=true;
  let busy=false;
  let queued=false;
  async function refresh(){
   if(!alive||document.visibilityState==="hidden")return;
   if(busy){queued=true;return;}
   busy=true;
   try{
    const latest=await readLatestSiteContent();
    if(alive)setState(latest);
   }catch(error){
    // The server-rendered content remains visible during intermittent network problems.
    console.warn("Não foi possível atualizar o conteúdo público",error);
   }finally{
    busy=false;
    if(queued){queued=false;void refresh();}
   }
  }
  const onVisibility=()=>{if(document.visibilityState==="visible")void refresh();};
  const onStorage=(event:StorageEvent)=>{if(isSitePublishStorageEvent(event))void refresh();};
  const onFocus=()=>void refresh();
  void refresh();
  document.addEventListener("visibilitychange",onVisibility);
  window.addEventListener("focus",onFocus);
  window.addEventListener("pageshow",onFocus);
  window.addEventListener("storage",onStorage);
  window.addEventListener(SITE_PUBLISHED_EVENT,onFocus);
  const timer=window.setInterval(()=>void refresh(),60000);
  return()=>{
   alive=false;clearInterval(timer);
   document.removeEventListener("visibilitychange",onVisibility);
   window.removeEventListener("focus",onFocus);
   window.removeEventListener("pageshow",onFocus);
   window.removeEventListener("storage",onStorage);
   window.removeEventListener(SITE_PUBLISHED_EVENT,onFocus);
  };
 },[]);

 useEffect(()=>{
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const {favicon_path:fp,favicon_version:v}=state.visual;
  const active=base&&/^favicons\/[a-z0-9-]+\.png$/.test(fp)
   ?base+"/storage/v1/object/public/sabor-identidade/"+fp+"?v="+encodeURIComponent(v)
   :"/default-favicon.svg";
  const link=document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if(link&&link.href!==new URL(active,window.location.href).href){
   link.href=active;
   link.type=fp?"image/png":"image/svg+xml";
  }
 },[state.visual]);
 return <SiteMediaProvider items={state.media}>
  <BusinessProvider profile={state.profile}>
   <VisualProvider value={state.visual}><ServicesProvider services={state.services}>{children}</ServicesProvider></VisualProvider>
  </BusinessProvider>
 </SiteMediaProvider>;
}
