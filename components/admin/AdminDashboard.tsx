"use client";
import {useCallback,useEffect,useState} from "react";
import {Images,LayoutTemplate,Grid2X2,Menu,LogOut,ExternalLink} from "lucide-react";
import {AdminSignIn} from "./AdminSignIn";
import {AdminPhotos} from "./AdminPhotos";
import {AdminSiteMedia} from "./AdminSiteMedia";
import {AdminGallery} from "./AdminGallery";
import {AdminServices} from "./AdminServices";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
type Tab="site"|"photos"|"gallery"|"more";
const tabs=[{id:"site" as const,label:"Site",Icon:LayoutTemplate},
 {id:"photos" as const,label:"Fotos",Icon:Images},
 {id:"gallery" as const,label:"Galeria",Icon:Grid2X2},
 {id:"more" as const,label:"Mais",Icon:Menu}];
export function AdminDashboard(){
 const [status,setStatus]=useState<"loading"|"guest"|"admin"|"config">("loading");
 const [tab,setTab]=useState<Tab>("site");
 const check=useCallback(async()=>{
  const client=getSupabaseBrowser();if(!client){setStatus("config");return;}
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user){setStatus("guest");return;}
  const auth=await client.rpc("is_site_admin");
  if(auth.error||auth.data!==true){await client.auth.signOut();setStatus("guest");return;}
  setStatus("admin");
 },[]);
 useEffect(()=>{void check();},[check]);
 async function logout(){const client=getSupabaseBrowser();await client?.auth.signOut();setStatus("guest");}
 return <div className="app-admin-root">
  {status==="loading"&&<p className="app-loading" role="status">Verificando acesso…</p>}
  {status==="config"&&<p className="app-loading" role="alert">A conexão do Supabase não está configurada.</p>}
  {status==="guest"&&<div className="app-signin"><AdminSignIn onSuccess={check}/></div>}
  {status==="admin"&&<>
    <header className="app-admin-top">
      <div><small>BUFFET</small><strong>Sabor <em>com</em> Amor</strong></div>
      <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Abrir site"><ExternalLink size={18}/></a>
    </header>
    <div className="app-admin-content">
      {tab==="site"&&<AdminSiteMedia/>}
      {tab==="photos"&&<AdminPhotos onEditSite={()=>setTab("site")}/>}
      {tab==="gallery"&&<AdminGallery/>}
      {tab==="more"&&<section className="app-page">
        <div className="app-page-top"><h2>Mais</h2></div>
        <AdminServices/>
        <button type="button" className="app-logout" onClick={()=>void logout()}><LogOut size={18}/> Sair do painel</button>
      </section>}
    </div>
    <nav className="app-admin-tabs" aria-label="Navegação do painel">
      {tabs.map(({id,label,Icon})=><button type="button" key={id} onClick={()=>{setTab(id);window.scrollTo({top:0,behavior:"instant"});}}
        aria-current={tab===id?"page":undefined} className={tab===id?"active":""}>
        <Icon size={21} strokeWidth={tab===id?2.3:1.8}/><span>{label}</span>
      </button>)}
    </nav>
  </>}
 </div>;
}
