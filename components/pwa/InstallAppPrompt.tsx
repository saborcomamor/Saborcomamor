"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import {Download,ExternalLink,MoreVertical,Share2,Smartphone,X} from "lucide-react";

type InstallChoice={outcome:"accepted"|"dismissed";platform?:string};
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<InstallChoice>};
type NavigatorIOS=Navigator&{standalone?:boolean};
const DISMISS_UNTIL="sabor-pwa-offer-dismiss-until";
const INSTALL_UI_EVENT="sabor-show-install";
const DISMISS_MS=14*24*60*60*1000;

function runningAsApp(){
 return window.matchMedia("(display-mode: standalone)").matches||
  window.matchMedia("(display-mode: fullscreen)").matches||
  (navigator as NavigatorIOS).standalone===true;
}
function browserKind(){
 const ua=navigator.userAgent;
 const ios=/iPad|iPhone|iPod/i.test(ua);
 const android=/Android/i.test(ua);
 const embedded=/(Instagram|FBAN|FBAV|FB_IAB|Messenger|Line\/|TikTok|Twitter|GSA\/|\bwv\b)/i.test(ua);
 return {ios,android,embedded,mobile:ios||android};
}
function dismissedRecently(){
 try{return Number(window.localStorage.getItem(DISMISS_UNTIL)||0)>Date.now();}
 catch{return false;}
}
function rememberDismissal(){
 try{window.localStorage.setItem(DISMISS_UNTIL,String(Date.now()+DISMISS_MS));}catch{}
}
function welcomeSequenceActive(){
 return !!document.querySelector(".photo-intro,.splash-intro-second:not(.photo-intro-underlay)");
}

export function InstallAppPrompt(){
 const [visible,setVisible]=useState(false);
 const [available,setAvailable]=useState<InstallEvent|null>(null);
 const [installed,setInstalled]=useState(false);
 const [help,setHelp]=useState(false);
 const [pending,setPending]=useState(false);
 const [copied,setCopied]=useState(false);
 const [kind,setKind]=useState({ios:false,android:false,embedded:false,mobile:false});
 const wantsToShow=useRef(false);
 const ref=useRef<HTMLElement>(null);

 const dismiss=useCallback(()=>{
  setVisible(false);setHelp(false);rememberDismissal();
 },[]);

 useEffect(()=>{
  const detected=browserKind();
  setKind(detected);
  setInstalled(runningAsApp());
  if("serviceWorker" in navigator && window.isSecureContext){
   navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(error=>{
    console.warn("Não foi possível registrar o modo offline do aplicativo.",error);
   });
  }
  const onInstall=(event:Event)=>{
   const installEvent=event as InstallEvent;
   installEvent.preventDefault();
   setAvailable(installEvent);
   if(!dismissedRecently()&&!runningAsApp())wantsToShow.current=true;
  };
  const onInstalled=()=>{
   setInstalled(true);setAvailable(null);setVisible(false);
   try{window.localStorage.removeItem(DISMISS_UNTIL);}catch{}
  };
  const manualOpen=()=>{
   if(runningAsApp())return;
   wantsToShow.current=true;
   setHelp(false);
   setVisible(true);
  };
  window.addEventListener("beforeinstallprompt",onInstall);
  window.addEventListener("appinstalled",onInstalled);
  window.addEventListener(INSTALL_UI_EVENT,manualOpen);
  // Show our own explanatory card at first eligible visit. Native prompt itself
  // must only run after a real button click, never automatically.
  const delay=window.setTimeout(()=>{
   if(!runningAsApp()&&!dismissedRecently()&&detected.mobile)wantsToShow.current=true;
  },1600);
  const poll=window.setInterval(()=>{
   if(wantsToShow.current && !runningAsApp() && !welcomeSequenceActive() && !document.hidden){
    wantsToShow.current=false;
    setVisible(true);
   }
  },550);
  return()=>{
   window.clearTimeout(delay);window.clearInterval(poll);
   window.removeEventListener("beforeinstallprompt",onInstall);
   window.removeEventListener("appinstalled",onInstalled);
   window.removeEventListener(INSTALL_UI_EVENT,manualOpen);
  };
 },[]);

 useEffect(()=>{
  if(!visible)return;
  function escape(event:KeyboardEvent){if(event.key==="Escape")dismiss();}
  document.addEventListener("keydown",escape);
  return()=>document.removeEventListener("keydown",escape);
 },[visible,dismiss]);

 async function requestInstall(){
  if(!available){
   setHelp(true);
   return;
  }
  // The native prompt must be invoked synchronously in this user gesture.
  const prompt=available;
  setAvailable(null);
  setPending(true);
  try{
   await prompt.prompt();
   const choice=await prompt.userChoice;
   if(choice.outcome==="accepted"){
    setVisible(false);
   }else{
    dismiss();
   }
  }catch(error){
   console.warn("Este navegador não permitiu abrir a instalação.",error);
   setHelp(true);
  }finally{
   setPending(false);
  }
 }
 async function copyLink(){
  try{
   await navigator.clipboard.writeText(window.location.origin+"/");
   setCopied(true);
  }catch{
   setCopied(false);
  }
 }
 if(installed||!visible)return null;

 const manualTitle=kind.embedded?"Abra o link no Chrome":kind.ios?"Instale pelo Safari":"Instale pelo navegador";
 return <aside ref={ref} className="pwa-install-card" role="dialog" aria-modal="false"
  aria-labelledby="pwa-install-title" aria-describedby="pwa-install-description">
  <div className="pwa-install-top">
   <img className="pwa-install-appicon" src="/pwa-icon-192.png?v=2" alt="Ícone do Sabor com Amor"/>
   <div className="pwa-install-title-group">
    <span className="pwa-install-eyebrow">UM CONVITE ESPECIAL</span>
    <h2 id="pwa-install-title">Sabor com Amor <em>no seu celular.</em></h2>
   </div>
   <button type="button" className="pwa-install-close" aria-label="Agora não" onClick={dismiss}><X size={19}/></button>
  </div>
  <p id="pwa-install-description">
   Tenha nossas fotos, serviços e novidades sempre por perto, com um ícone na tela inicial.
  </p>
  <div className="pwa-install-buttons">
   <button type="button" className="pwa-install-primary" disabled={pending}
    onClick={()=>void requestInstall()}>
    {available?<Download size={18}/>:<Smartphone size={18}/>}
    {pending?"Aguarde…":available?"Instalar aplicativo":"Como instalar"}
   </button>
   <button type="button" className="pwa-install-later" onClick={dismiss}>Agora não</button>
  </div>
  {help&&<div className="pwa-install-help" role="status">
   <strong>{manualTitle}</strong>
   {kind.embedded?
    <p>Toque no menu do aplicativo em que abriu o link e escolha <b>Abrir no navegador</b> ou <b>Abrir no Chrome</b>. No Chrome, use <b>⋮ → Instalar app</b>.</p>:
    kind.ios?<p>No <b>Safari</b>, toque em <b>Compartilhar <Share2 size={14}/></b>, depois em <b>Adicionar à Tela de Início</b>.</p>:
    <p>No <b>Chrome</b>, toque em <b><MoreVertical size={14}/> → Instalar aplicativo</b> (ou <b>Adicionar à tela inicial</b>, conforme a versão). Se a opção não aparecer, abra o link diretamente no Chrome.</p>}
   {kind.embedded&&<button type="button" onClick={()=>void copyLink()}>
    <ExternalLink size={15}/>{copied?"Link copiado":"Copiar link para abrir no Chrome"}
   </button>}
  </div>}
 </aside>;
}
