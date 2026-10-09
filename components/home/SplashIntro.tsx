"use client";
import { useEffect, useState } from "react";
export function SplashIntro(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { if(reduce||sessionStorage.getItem("sabor-intro-shown"))return;sessionStorage.setItem("sabor-intro-shown","1");setVisible(true); }
  catch { if(reduce)return;setVisible(true); }
  const timer=window.setTimeout(()=>setVisible(false),1900);return()=>window.clearTimeout(timer);
 },[]);
 if(!visible)return null;
 return <div className="splash-intro" aria-label="Bem-vindo ao Sabor com Amor"><div className="splash-shimmer"/><span className="splash-kicker">UMA HISTÓRIA FEITA DE CARINHO</span><span className="splash-brand">Sabor <em>com</em> Amor</span><span className="splash-heart">✦</span><button onClick={()=>setVisible(false)}>Pular introdução</button></div>;
}
