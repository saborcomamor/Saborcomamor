"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight, Download } from "lucide-react";
import { nav } from "@/lib/site";
import {useBusinessProfile} from "@/lib/business-client";
export function Header(){
 const business=useBusinessProfile();
 const [open,setOpen]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null); const menuRoot=useRef<HTMLElement>(null);
 const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{
   const onScroll=()=>setScrolled(window.scrollY>24);
   onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll);
 },[]);
 useEffect(()=>{
   document.body.classList.toggle("menu-open",open);
   if(!open) return ()=>document.body.classList.remove("menu-open");
   const first=menuRoot.current?.querySelector<HTMLAnchorElement>("a"); first?.focus();
   function onKey(event:KeyboardEvent){
     if(event.key==="Escape"){setOpen(false);menuButton.current?.focus();return}
     if(event.key!=="Tab")return;
     const anchors=Array.from(menuRoot.current?.querySelectorAll<HTMLElement>("a,button")||[]);
     if(!anchors.length)return;
     const first=anchors[0],last=anchors[anchors.length-1];
     if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
     if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
   }
   document.addEventListener("keydown",onKey);
   return ()=>{document.body.classList.remove("menu-open");document.removeEventListener("keydown",onKey)};
 },[open]);
 return <header className={`site-header ${scrolled?"is-scrolled":""}`}>
  <div className="header-inner"><Link href="/" className="wordmark" onClick={()=>setOpen(false)} aria-label={business.business_name+", voltar ao início"}><span className="wordmark-small">BUFFET</span><strong>{business.business_name==="Sabor com Amor"?<>Sabor <em>com</em> Amor</>:business.business_name}</strong><span className="wordmark-rule"/></Link>
  <nav className="desktop-nav" aria-label="Navegação principal">{nav.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
  <Link href="/orcamento" className="header-quote">Fale com a gente <ArrowUpRight size={16}/></Link>
  <button ref={menuButton} aria-label={open?"Fechar menu":"Abrir menu"} aria-expanded={open} aria-controls="mobile-menu" className="menu-trigger" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button></div>
  <nav ref={menuRoot} id="mobile-menu" className={`mobile-nav ${open?"is-open":""}`} aria-label="Menu para celular" aria-hidden={!open}>
   <span className="eyebrow">BEM-VINDO AO SABOR COM AMOR</span>
   {nav.map((item,i)=><Link tabIndex={open?0:-1} style={{transitionDelay:`${i*55}ms`}} key={item.href} href={item.href} onClick={()=>setOpen(false)}>{item.label}<ArrowUpRight size={20}/></Link>)}
   <button type="button" className="mobile-nav-install" tabIndex={open?0:-1}
    onClick={()=>{setOpen(false);window.dispatchEvent(new Event("sabor-show-install"));}}>
    Instalar aplicativo <Download size={20}/>
   </button>
   <p>Com carinho, de Telêmaco Borba.</p>
  </nav>
 </header>
}
