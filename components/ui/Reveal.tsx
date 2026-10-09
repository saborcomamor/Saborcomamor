"use client";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
export function Reveal({ children, className = "", delay = 0, from = "bottom" }:{ children:ReactNode;className?:string;delay?:number;from?:"bottom"|"left"|"right"|"scale" }) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   let cleanup=()=>{};
   async function start(){
     const element=ref.current;
     if(!element) return;
     const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
     if(reduce) return;
     const { gsap }=await import("gsap");
     const { ScrollTrigger }=await import("gsap/ScrollTrigger");
     if(!ref.current) return;
     gsap.registerPlugin(ScrollTrigger);
     const offsets={bottom:{y:45,x:0,scale:1},left:{y:0,x:-35,scale:1},right:{y:0,x:35,scale:1},scale:{y:15,x:0,scale:.93}};
     const ctx=gsap.context(()=>gsap.fromTo(element,{autoAlpha:0,...offsets[from]},{autoAlpha:1,x:0,y:0,scale:1,duration:1,delay,ease:"power3.out",scrollTrigger:{trigger:element,start:"top 94%",once:true}}),element);
     cleanup=()=>ctx.revert();
   }
   void start(); return ()=>cleanup();
 },[delay,from]);
 return <div ref={ref} className={className}>{children}</div>;
}
