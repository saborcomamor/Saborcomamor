"use client";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
export function AdminSignIn({onSuccess}:{onSuccess:()=>Promise<void>}) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [message,setMessage]=useState(""); const [pending,setPending]=useState(false);
  async function submit(e:FormEvent) {
    e.preventDefault(); const client=getSupabaseBrowser(); if(!client) {setMessage("Configuração de autenticação indisponível.");return;}
    setPending(true);setMessage("");
    try {
      const {error}=await client.auth.signInWithPassword({email:email.trim(),password});
      if(error) {setMessage("Não foi possível entrar. Confira suas credenciais.");return;}
      await onSuccess();
    } finally {setPending(false);setPassword("");}
  }
  return <form className="admin-signin admin-panel" onSubmit={submit}>
    <p className="eyebrow">ACESSO RESTRITO</p><h1>Painel Sabor com Amor</h1>
    <p>Área exclusiva da equipe autorizada.</p>
    <label htmlFor="admin-email">E-mail</label>
    <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} />
    <label htmlFor="admin-password">Senha</label>
    <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} />
    {message&&<p role="alert">{message}</p>}
    <button disabled={pending} type="submit">{pending?"Verificando…":"Entrar no painel"}</button>
  </form>;
}
