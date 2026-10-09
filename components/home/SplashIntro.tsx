"use client";
import {useCallback,useEffect,useRef,useState,type CSSProperties,type PointerEvent} from "react";
import {ArrowRight} from "lucide-react";
import type {IntroFrame} from "@/lib/public-dynamic";

type Stage="photos"|null;
type Gesture={startX:number;startY:number;pointerId:number};
const PHOTO_STEP_MS=1700;
const PHOTO_ENTER_MS=1250;
const EXIT_STEP_MS=130;
const EXIT_MS=840;

/**
 * The photographs arrive automatically in the CMS order and remain stacked.
 * The visitor performs ONE gesture to sweep the stack away and immediately
 * reveal the real home page. No second/logo splash screen.
 */
export function SplashIntro({frames}:{frames:IntroFrame[]}){
 const [stage,setStage]=useState<Stage>(null);
 const [ready,setReady]=useState(false);
 const [drag,setDrag]=useState(0);
 const [dragging,setDragging]=useState(false);
 const [leaving,setLeaving]=useState<-1|1|null>(null);
 const [reducedMotion,setReducedMotion]=useState(false);
 const pointer=useRef<Gesture|null>(null);
 const focusTarget=useRef<HTMLDivElement>(null);
 const busy=useRef(false);
 const leaveTimer=useRef<number|null>(null);

 const finish=useCallback(()=>{
  try{sessionStorage.setItem("sabor-intro-v5-complete","1");}catch{}
  setStage(null);
 },[]);

 useEffect(()=>{
  try{
   const preview=new URLSearchParams(window.location.search).get("verEntrada")==="1";
   if(!preview&&sessionStorage.getItem("sabor-intro-v5-complete"))return;
  }catch{}
  setStage(frames.length?"photos":null);
 },[frames.length]);

 useEffect(()=>{
  if(stage!=="photos")return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  setReducedMotion(reduced);
  setReady(false);
  setDrag(0);
  setDragging(false);
  setLeaving(null);
  busy.current=false;
  // The final photograph must be fully visible before the gesture is enabled.
  const delay=reduced?90:(Math.max(0,frames.length-1)*PHOTO_STEP_MS+PHOTO_ENTER_MS+180);
  const timer=window.setTimeout(()=>setReady(true),delay);
  return()=>window.clearTimeout(timer);
 },[stage,frames.length]);

 useEffect(()=>{
  if(stage!=="photos")return;
  if(ready)focusTarget.current?.focus({preventScroll:true});
 },[stage,ready]);

 useEffect(()=>{
  if(!stage)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  return()=>{document.body.style.overflow=previous;};
 },[stage]);

 useEffect(()=>()=>{if(leaveTimer.current)window.clearTimeout(leaveTimer.current);},[]);

 const releaseStack=useCallback((direction:-1|1)=>{
  if(stage!=="photos"||!ready||busy.current)return;
  busy.current=true;
  pointer.current=null;
  setDragging(false);
  setLeaving(direction);
  // The front photo sweeps away first; every photo follows during this
  // single transition. No further gesture is necessary.
  const total=reducedMotion?140:EXIT_MS+(Math.max(0,frames.length-1)*EXIT_STEP_MS)+90;
  leaveTimer.current=window.setTimeout(()=>{
   finish();
  },total);
 },[stage,ready,reducedMotion,frames.length,finish]);

 function down(e:PointerEvent<HTMLDivElement>){
  if(stage!=="photos"||!ready||busy.current||pointer.current||e.button!==0)return;
  pointer.current={startX:e.clientX,startY:e.clientY,pointerId:e.pointerId};
  setDragging(true);
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function move(e:PointerEvent<HTMLDivElement>){
  const gesture=pointer.current;
  if(!gesture||gesture.pointerId!==e.pointerId||busy.current)return;
  const dx=e.clientX-gesture.startX;
  const dy=e.clientY-gesture.startY;
  if(Math.abs(dx)>=Math.abs(dy))setDrag(Math.max(-window.innerWidth,Math.min(window.innerWidth,dx)));
 }
 function up(e:PointerEvent<HTMLDivElement>){
  const gesture=pointer.current;
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  pointer.current=null;
  setDragging(false);
  const dx=e.clientX-gesture.startX;
  if(Math.abs(dx)>=Math.min(115,window.innerWidth*.18))releaseStack(dx<0?-1:1);
  else setDrag(0);
 }
 function cancel(){
  pointer.current=null;
  setDragging(false);
  if(!busy.current)setDrag(0);
 }

 if(stage===null)return null;
 return <div ref={focusTarget} className={"photo-intro"+(ready?" is-ready":"")} role="dialog" aria-modal="true" tabIndex={0}
  aria-label={ready?"Arraste a pilha de fotos uma única vez para o lado para abrir o site.":"Aguarde: as fotografias estão entrando uma sobre a outra."}
  onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}
  onKeyDown={e=>{
   if(ready&&(e.key==="ArrowLeft"||e.key==="ArrowRight"||e.key==="Enter")){
    e.preventDefault();releaseStack(e.key==="ArrowLeft"?-1:1);
   }
  }}>
  <div className={"photo-intro-stack"+(dragging?" is-dragging":"")+(leaving!==null?" is-leaving":"")}
   style={{"--drag-x":drag+"px","--exit-dir":leaving===-1?"-125vw":"125vw"} as CSSProperties}>
   {frames.map((frame,index)=><div key={frame.id} className="photo-intro-layer"
    style={{"--layer":index+1,"--enter-delay":index*PHOTO_STEP_MS+"ms",
      "--exit-delay":(frames.length-1-index)*EXIT_STEP_MS+"ms"} as CSSProperties}>
    <img src={frame.src} alt={frame.alt} draggable={false}
     loading="eager" decoding="async" fetchPriority={index===0?"high":"auto"}/>
   </div>)}
   <div className="photo-intro-shade" aria-hidden="true"/>
  </div>
  <span className={"photo-intro-brand"+(leaving!==null?" is-leaving":"")}>Sabor <em>com</em> Amor</span>
  <div className={"photo-intro-gesture"+(leaving!==null?" is-leaving":"")} aria-hidden="true">
   <ArrowRight size={24}/><span>Arraste para o lado</span>
  </div>
  <span className="sr-only" aria-live="polite">
   {ready?`${frames.length} fotografias empilhadas. Arraste uma vez para abrir.`:"Fotografias entrando automaticamente."}
  </span>
 </div>;
}
