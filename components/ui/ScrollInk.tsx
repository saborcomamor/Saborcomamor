"use client";
import {useEffect,useRef,type ReactNode} from "react";
/** Gradual reveal linked to the scroll position; no animation for reduced motion. */
export function ScrollInk({children,className=""}:{children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let active=true;let dispose=()=>{};
  (async()=>{
   const [{gsap},{ScrollTrigger}]=await Promise.all([import("gsap"),import("gsap/ScrollTrigger")]);
   if(!active||!ref.current)return;
   gsap.registerPlugin(ScrollTrigger);
   const animation=gsap.fromTo(el,{opacity:.12,filter:"blur(9px)",y:30},{
    opacity:1,filter:"blur(0px)",y:0,ease:"none",
    scrollTrigger:{trigger:el,start:"top 95%",end:"top 59%",scrub:.55}
   });
   dispose=()=>{animation.scrollTrigger?.kill();animation.kill();};
  })();
  return()=>{active=false;dispose();};
 },[]);
 return <div ref={ref} className={className}>{children}</div>;
}
