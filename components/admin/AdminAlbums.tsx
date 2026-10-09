"use client";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
type Album = {id:string;title:string;slug:string;category:string;is_published:boolean};
const categories=[
  {id:"pratos",label:"Pratos preparados"},
  {id:"eventos",label:"Eventos e comemorações"},
  {id:"buffets",label:"Mesas de buffet"},
  {id:"bastidores",label:"Equipe e bastidores"},
];
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
    if(error)setMessage("Não foi possível criar o álbum.");else {setTitle("");setMessage("Álbum criado! Agora toque em Fotografias para adicionar várias imagens. Quando estiver pronto, publique o álbum.");await reload();}
    setPending(false);
  }
  async function toggle(item:Album){const client=getSupabaseBrowser();if(!client)return;
    const {error}=await client.from("albums").update({is_published:!item.is_published}).eq("id",item.id);
    if(error)setMessage("Não foi possível alterar a publicação.");else await reload();
  }
  return <section className="admin-panel" aria-labelledby="albums-title"><h2 id="albums-title">Organize por álbuns</h2>
    <p>Um álbum é uma pasta para juntar fotos relacionadas: por exemplo, <b>Casamento de Ana e Pedro</b>, <b>Feijoada especial</b> ou <b>Equipe na cozinha</b>. Crie aqui e depois vá à aba <b>Fotografias</b> para selecionar várias fotos de uma vez.</p>
    <form onSubmit={create} className="admin-form"><label>Título<input value={title} maxLength={180} required onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Casamento de outubro"/></label>
    <label>Onde essas fotos se encaixam no site?
      <select value={category} onChange={e=>setCategory(e.target.value)}>
        {categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
    </label>
    <p className="admin-field-hint">Selecione uma categoria para o álbum inteiro. Você poderá adicionar quantas fotos quiser depois.</p>
    <button disabled={pending} type="submit">Criar álbum</button></form>
    {message&&<p role="status">{message}</p>}
    <ul className="admin-list">{albums.map(a=><li key={a.id}><div><strong>{a.title}</strong><small>{categories.find(c=>c.id===a.category)?.label??a.category} · {a.is_published?"Publicado":"Rascunho"}</small></div><button type="button" onClick={()=>toggle(a)}>{a.is_published?"Retirar do ar":"Publicar álbum"}</button></li>)}</ul>
  </section>;
}
