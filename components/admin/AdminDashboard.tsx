"use client";
import { useCallback, useEffect, useState } from "react";
import { AdminSignIn } from "./AdminSignIn";
import { AdminAlbums } from "./AdminAlbums";
import { AdminPhotos } from "./AdminPhotos";
import { AdminServices } from "./AdminServices";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Panel = "albums" | "photos" | "services";
export function AdminDashboard() {
  const [status,setStatus]=useState<"loading"|"guest"|"admin"|"config">("loading");
  const [tab,setTab]=useState<Panel>("albums");
  const check = useCallback(async () => {
    const client=getSupabaseBrowser(); if(!client){setStatus("config");return;}
    const {data:{user},error}=await client.auth.getUser();
    if(error||!user){setStatus("guest");return;}
    const {data,error:roleError}=await client.rpc("is_site_admin");
    if(roleError||data!==true){await client.auth.signOut();setStatus("guest");return;}
    setStatus("admin");
  },[]);
  useEffect(()=>{void check();},[check]);
  async function logout(){const client=getSupabaseBrowser();await client?.auth.signOut();setStatus("guest");}
  return <div className="admin-shell container">
    {status==="loading"&&<p aria-live="polite">Verificando permissão de acesso…</p>}
    {status==="config"&&<p role="alert">O acesso administrativo aguarda a configuração pública do Supabase.</p>}
    {status==="guest"&&<AdminSignIn onSuccess={check}/>}
    {status==="admin"&&<>
      <div className="admin-heading"><div><p className="eyebrow">PAINEL PRIVADO</p><h1>Nosso acervo</h1></div><button type="button" onClick={logout}>Sair</button></div>
      <nav className="admin-tabs" aria-label="Gestão do site">
        <button aria-current={tab==="albums"?"page":undefined} onClick={()=>setTab("albums")}>Álbuns</button>
        <button aria-current={tab==="photos"?"page":undefined} onClick={()=>setTab("photos")}>Fotografias</button>
        <button aria-current={tab==="services"?"page":undefined} onClick={()=>setTab("services")}>Serviços</button>
      </nav>
      {tab==="albums"&&<AdminAlbums/>}
      {tab==="photos"&&<AdminPhotos/>}
      {tab==="services"&&<AdminServices/>}
    </>}
  </div>;
}
