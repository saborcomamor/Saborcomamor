"use client";
import {useCallback,useEffect,useRef,useState,type PointerEvent} from "react";
import {ArrowUpRight,ArrowRight} from "lucide-react";
import type {IntroFrame} from "@/lib/public-dynamic";
type Stage="photos"|"original"|null;
type Gesture={startX:number;startY:number;pointerId:number};
export function SplashIntro({frames}:{frames:IntroFrame[]}){
 const [stage,setStage]=useState<Stage>(null);
 const [active,setActive]=useState(0);
 const [drag,setDrag]=useState(0);
 const [leaving,setLeaving]=useState<null|number>(null);
 const pointer=useRef<Gesture|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const busy=useRef(false);
 const finish=useCallback(()=>{
  try{sessionStorage.setItem("sabor-intro-v3-complete","1");}catch{}
  setStage(null);
 },[]);
 useEffect(()=>{
  try{if(sessionStorage.getItem("sabor-intro-v3-complete"))return;}catch{}
  setStage(frames.length?"photos":"original");
 },[frames.length]);
 useEffect(()=>{
  if(!stage)return;
  const before=document.body.style.overflow;
  document.body.style.overflow="hidden";
  return()=>{document.body.style.overflow=before;};
 },[stage]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{
  if(stage!=="original")return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const id=setTimeout(finish,reduced?650:2050);
  return()=>clearTimeout(id);
 },[stage,finish]);
 const advance=useCallback((direction:number)=>{
  if(stage!=="photos"||busy.current)return;
  busy.current=true;
  setLeaving(direction);
  setDrag(0);
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  timer.current=setTimeout(()=>{
   if(active>=frames.length-1)setStage("original");
   else setActive(i=>i+1);
   setLeaving(null);
   busy.current=false;
  },reduced?120:640);
 },[stage,active,frames.length]);
 function down(e:PointerEvent<HTMLDivElement>){
  if(stage!=="photos"||busy.current||pointer.current)return;
  pointer.current={startX:e.clientX,startY:e.clientY,pointerId:e.pointerId};
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function move(e:PointerEvent<HTMLDivElement>){
  const point=pointer.current;
  if(!point||point.pointerId!==e.pointerId||busy.current)return;
  const dx=e.clientX-point.startX,dy=e.clientY-point.startY;
  if(Math.abs(dx)>Math.abs(dy))setDrag(Math.max(-window.innerWidth,Math.min(window.innerWidth,dx)));
 }
 function up(e:PointerEvent<HTMLDivElement>){
  const point=pointer.current;
  if(!point||point.pointerId!==e.pointerId)return;
  pointer.current=null;
  const dx=e.clientX-point.startX;
  if(Math.abs(dx)>=Math.min(110,window.innerWidth*.18))advance(dx<0?-1:1);
  else setDrag(0);
 }
 if(stage===null)return null;
 if(stage==="original")return <div className="splash-intro splash-intro-second" role="dialog" aria-modal="true" aria-label="Bem-vindo ao Sabor com Amor">
  <div className="splash-shimmer"/><span className="splash-kicker">UMA HISTÓRIA FEITA DE CARINHO</span>
  <span className="splash-brand">Sabor <em>com</em> Amor</span><span className="splash-heart">✦</span>
  <button type="button" onClick={finish}>Entrar no site <ArrowUpRight size={16}/></button>
 </div>;
 const current=frames[active],next=frames[active+1];
 return <div className="photo-intro" role="dialog" aria-modal="true" tabIndex={0}
  aria-label="Arraste cada fotografia para o lado. Use as setas do teclado para avançar."
  onPointerDown={down} onPointerMove={move} onPointerUp={up}
  onPointerCancel={()=>{pointer.current=null;setDrag(0);}}
  onKeyDown={e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"||e.key==="Enter"){
   e.preventDefault();advance(e.key==="ArrowRight"?1:-1);
  }}}>
  {next&&<div className="photo-intro-layer photo-intro-next" aria-hidden="true">
   <img src={next.src} alt="" draggable={false}/></div>}
  <div className={"photo-intro-layer photo-intro-current"+(leaving!==null?" is-leaving":"")}
    style={{"--drag-x":drag+"px","--exit-dir":leaving===-1?"-120vw":"120vw"} as React.CSSProperties}>
   <img key={current.id} src={current.src} alt={current.alt} draggable={false}
     fetchPriority={active===0?"high":"auto"}/>
  </div>
  <div className="photo-intro-shade"/>
  <span className="photo-intro-brand">Sabor <em>com</em> Amor</span>
  <div className="photo-intro-gesture" aria-hidden="true">
   <ArrowRight size={24}/><span>Arraste para o lado</span>
  </div>
  <span className="sr-only" aria-live="polite">Fotografia {active+1} de {frames.length}</span>
 </div>;
}
