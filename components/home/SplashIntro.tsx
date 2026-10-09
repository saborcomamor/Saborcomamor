"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowRight,ArrowUpRight} from "lucide-react";
import type {IntroFrame} from "@/lib/public-dynamic";
type Stage="photos"|"original"|null;
export function SplashIntro({frames}:{frames:IntroFrame[]}){
 const [stage,setStage]=useState<Stage>(null);
 const [top,setTop]=useState(0);
 const x=useRef<number|null>(null);
 const gesture=useRef<HTMLButtonElement>(null);
 const finish=()=>{
  try{sessionStorage.setItem("sabor-intro-v2-complete","1");}catch{}
  setStage(null);
 };
 useEffect(()=>{
  try{if(sessionStorage.getItem("sabor-intro-v2-complete"))return;}catch{}
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced){setStage("original");return;}
  setTop(0);setStage(frames.length?"photos":"original");
 },[frames.length]);
 useEffect(()=>{
  if(!stage)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  return()=>{document.body.style.overflow=previous;};
 },[stage]);
 useEffect(()=>{
  if(stage!=="photos"||top>=frames.length-1)return;
  const timer=window.setTimeout(()=>setTop(i=>i+1),580);
  return()=>window.clearTimeout(timer);
 },[stage,top,frames.length]);
 const ready=stage==="photos"&&top===frames.length-1;
 useEffect(()=>{
  if(ready)gesture.current?.focus({preventScroll:true});
 },[ready]);
 useEffect(()=>{
  if(stage!=="original")return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timer=window.setTimeout(finish,reduced?650:2050);
  return()=>window.clearTimeout(timer);
 },[stage]);
 if(stage===null)return null;
 if(stage==="original")return <div className="splash-intro splash-intro-second" role="dialog" aria-modal="true" aria-label="Bem-vindo ao Sabor com Amor">
  <div className="splash-shimmer"/><span className="splash-kicker">UMA HISTÓRIA FEITA DE CARINHO</span>
  <span className="splash-brand">Sabor <em>com</em> Amor</span><span className="splash-heart">✦</span>
  <button type="button" onClick={finish}>Entrar no site <ArrowUpRight size={16}/></button>
 </div>;
 function advance(){if(ready)setStage("original");}
 return <div className="photo-intro" role="dialog" aria-modal="true" aria-label="Fotografias do Buffet Sabor com Amor"
  onPointerDown={e=>{x.current=e.clientX;}}
  onPointerUp={e=>{if(x.current!==null&&Math.abs(e.clientX-x.current)>52)advance();x.current=null;}}
  onPointerCancel={()=>{x.current=null;}}>
  <div className="photo-intro-stack" aria-hidden="true">
   {frames.slice(0,top+1).map((f,i)=><div className={"photo-intro-layer "+(i===top?(ready?"is-top is-ready":"is-top"):"")} key={f.id}>
    {/* Imagens otimizadas com direito de uso conferido no CMS. */}
    <img src={f.src} alt="" draggable={false} fetchPriority={i===0?"high":"auto"}/>
   </div>)}
  </div>
  <div className="photo-intro-shade"/>
  <span className="photo-intro-brand">Sabor <em>com</em> Amor</span>
  {ready?<div className="photo-intro-gesture">
   <button ref={gesture} type="button" className="photo-intro-swipe" aria-label="Arraste a fotografia para o lado ou toque para continuar"
     onPointerDown={e=>{x.current=e.clientX;}}
     onPointerUp={e=>{if(x.current!==null&&Math.abs(e.clientX-x.current)>52)advance();x.current=null;}}
     onKeyDown={e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();advance();}}}
     onClick={advance}><span className="photo-intro-direction"><ArrowRight size={22}/></span><span>Arraste para abrir</span></button>
   <p>Deslize a fotografia para o lado</p>
  </div>:<span className="photo-intro-loading">Momentos que ficam na memória…</span>}
  <button type="button" className="photo-intro-skip" onClick={()=>setStage("original")}>Continuar</button>
 </div>;
}
