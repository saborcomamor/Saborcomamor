"use client";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
type Album = {id:string;title:string;slug:string;category:string;is_published:boolean};
const categories=["pratos","eventos","buffets","bastidores"];
export function AdminAlbums(){
  const [albums,setAlbums]=useState<Album[]>([]);const [title,setTitle]=useState("");
  const [category,setCategory]=useState("eventos");const [message,setMessage]=useState("");const [pending,setPending]=useState(false);
  async function reload(){const client=getSupabaseBrowser();if(!client)return;
    const {data,error}=await client.from("albums").select("id,title,slug,category,is_published").order("created_at",{ascending:false});
    if(error){setMessage("Não foi possível carregar os álbuns.");return;}
    setAlbums((data??[]) as Album[]);
  }
  useEffect(()=>{void reload();},[]);
  async function create(e:FormEvent){e.preventDefault();const client=getSupabaseBrowser();if(!client)return;
    if(title.trim().length<2)return;setPending(true);setMessage("");
    const slug=`album-${crypto.randomUUID()}`;
    const {error}=await client.from("albums").insert({title:title.trim(),slug,category,is_published:false});
    if(error)setMessage("Não foi possível criar o álbum.");else {setTitle("");setMessage("Álbum criado como rascunho.");await reload();}
    setPending(false);
  }
  async function toggle(item:Album){const client=getSupabaseBrowser();if(!client)return;
    const {error}=await client.from("albums").update({is_published:!item.is_published}).eq("id",item.id);
    if(error)setMessage("Não foi possível alterar a publicação.");else await reload();
  }
  return <section className="admin-panel" aria-labelledby="albums-title"><h2 id="albums-title">Álbuns de eventos</h2>
    <form onSubmit={create} className="admin-form"><label>Título<input value={title} maxLength={180} required onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Casamento de outubro"/></label>
    <label>Categoria<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
    <button disabled={pending} type="submit">Criar álbum</button></form>
    {message&&<p role="status">{message}</p>}
    <ul className="admin-list">{albums.map(a=><li key={a.id}><div><strong>{a.title}</strong><small>{a.category} · {a.is_published?"Publicado":"Rascunho"}</small></div><button type="button" onClick={()=>toggle(a)}>{a.is_published?"Retirar do ar":"Publicar álbum"}</button></li>)}</ul>
  </section>;
}
