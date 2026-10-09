"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
type Service = {code:string;title:string;summary:string;is_published:boolean};
export function AdminServices(){const [items,setItems]=useState<Service[]>([]);const [message,setMessage]=useState("");
 async function load(){const client=getSupabaseBrowser();if(!client)return;
 const {data,error}=await client.from("services").select("code,title,summary,is_published").order("sort_order");
 if(error)setMessage("Não foi possível carregar os serviços.");else setItems((data??[]) as Service[]);}
 useEffect(()=>{void load();},[]);
 async function save(item:Service){const client=getSupabaseBrowser();if(!client)return;
 const {error}=await client.from("services").update({summary:item.summary,is_published:item.is_published}).eq("code",item.code);
 setMessage(error?"Não foi possível salvar.":"Serviço atualizado.");if(!error)await load();}
 return <section className="admin-panel" aria-labelledby="services-title"><h2 id="services-title">Modalidades de contratação</h2>
 <p>Revise os textos antes de publicar. O conteúdo visual das páginas permanece separado do cadastro.</p>
 {items.map(item=><div className="admin-service" key={item.code}><h3>{item.title}</h3>
 <label>Apresentação<textarea rows={3} value={item.summary} onChange={e=>setItems(items.map(v=>v.code===item.code?{...v,summary:e.target.value}:v))}/></label>
 <label className="admin-check"><input type="checkbox" checked={item.is_published} onChange={e=>setItems(items.map(v=>v.code===item.code?{...v,is_published:e.target.checked}:v))}/> Publicar informações deste serviço</label>
 <button type="button" onClick={()=>save(item)}>Salvar serviço</button></div>)}{message&&<p role="status">{message}</p>}</section>;
}
