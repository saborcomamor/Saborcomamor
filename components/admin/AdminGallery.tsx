"use client";
import {useEffect,useMemo,useState} from "react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";

type Photo={id:string;alt_text:string;caption:string;album_id:string|null;is_published:boolean;published_storage_path:string|null};
type Album={id:string;title:string;is_published:boolean};
function imageUrl(path:string|null){
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
 return path&&base?base+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/"):null;
}
export function AdminGallery(){
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [albums,setAlbums]=useState<Album[]>([]);
 const [selected,setSelected]=useState<string[]>([]);
 const [filter,setFilter]=useState("all");
 const [albumFilter,setAlbumFilter]=useState("");
 const [query,setQuery]=useState("");
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const visible=useMemo(()=>photos.filter(p=>
   (filter==="all"||(filter==="shown"&&p.is_published)||(filter==="hidden"&&!p.is_published)) &&
   (!albumFilter||p.album_id===albumFilter) &&
   (!query||(p.alt_text+" "+p.caption).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")))
 ),[photos,filter,albumFilter,query]);
 const published=photos.filter(p=>p.is_published).length;
 async function refresh(){
   const client=getSupabaseBrowser();if(!client)return;
   const [a,b]=await Promise.all([
     client.from("photos").select("id,alt_text,caption,album_id,is_published,published_storage_path").order("created_at",{ascending:false}),
     client.from("albums").select("id,title,is_published")
   ]);
   if(a.error||b.error)setMessage("Não foi possível carregar as fotos.");
   else {setPhotos((a.data||[]) as Photo[]);setAlbums((b.data||[]) as Album[]);}
   setLoading(false);
 }
 useEffect(()=>{void refresh();},[]);
 function toggle(id:string){setSelected(prev=>prev.includes(id)?prev.filter(v=>v!==id):[...prev,id]);}
 async function setVisible(shouldShow:boolean,ids:string[]){
   if(!ids.length)return;
   setBusy(true);setMessage("");
   const client=getSupabaseBrowser();
   if(!client){setMessage("Conexão indisponível.");setBusy(false);return;}
   const {error}=await client.from("photos").update({is_published:shouldShow}).in("id",ids);
   if(error)setMessage("Não foi possível mudar a publicação. Confirme as autorizações das fotografias.");
   else {setMessage(ids.length+" foto(s) "+(shouldShow?"adicionada(s) à galeria.":"retirada(s) da galeria.")+" Isso não afeta as imagens configuradas em Editar o site.");setSelected([]);await refresh();}
   setBusy(false);
 }
 if(loading)return <section className="admin-panel"><p>Carregando galeria…</p></section>;
 return <section className="cms-shell cms-gallery-manager">
   <div className="cms-heading"><p className="eyebrow">GALERIA PÚBLICA</p><h2>Escolha o que mostrar.</h2>
     <p>Aqui você controla somente as imagens da página <b>Galeria</b>. Esconder uma foto daqui não remove seu arquivo do banco, nem altera fotos da Hero ou das animações.</p></div>
   <div className="cms-summary"><strong>{photos.length}</strong><span>fotos no banco</span><strong>{published}</strong><span>na galeria</span></div>
   <div className="cms-dialog-tools">
     <label>Mostrar<select value={filter} onChange={e=>{setFilter(e.target.value);setSelected([]);}}>
       <option value="all">Todas</option><option value="shown">Publicadas</option><option value="hidden">Só no banco</option>
     </select></label>
     <label>Álbum<select value={albumFilter} onChange={e=>{setAlbumFilter(e.target.value);setSelected([]);}}>
       <option value="">Todos os álbuns</option>{albums.map(a=><option value={a.id} key={a.id}>{a.title}</option>)}
     </select></label>
     <label>Buscar<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Descrição ou legenda"/></label>
   </div>
   <div className="cms-bulk-bar"><span>{selected.length} selecionada(s)</span>
     <button type="button" onClick={()=>setSelected(visible.map(p=>p.id))} disabled={busy}>Selecionar as visíveis</button>
     <button type="button" onClick={()=>setSelected([])} disabled={busy}>Limpar</button>
     <button type="button" onClick={()=>void setVisible(true,selected)} disabled={busy||!selected.length}>Mostrar na galeria</button>
     <button type="button" onClick={()=>void setVisible(false,selected)} disabled={busy||!selected.length} className="cms-hide">Retirar da galeria</button>
   </div>
   <div className="cms-gallery-grid">{visible.map(p=>{
    const album=albums.find(a=>a.id===p.album_id);
    const actuallyVisible=p.is_published && (!album||album.is_published);
    return <label className={"cms-gallery-photo "+(selected.includes(p.id)?"checked":"")} key={p.id}>
      <div className="cms-gallery-picture">{imageUrl(p.published_storage_path)?
       <img src={imageUrl(p.published_storage_path)!} alt={p.alt_text} loading="lazy"/>:<span>Imagem não disponível</span>}
       <input type="checkbox" disabled={busy} checked={selected.includes(p.id)} onChange={()=>toggle(p.id)} aria-label={"Selecionar "+p.alt_text}/>
      </div>
      <strong>{p.caption||p.alt_text}</strong>
      <small>{album?.title||"Sem álbum"} · {actuallyVisible?"Visível na galeria":p.is_published?"Álbum em rascunho":"Só no banco"}</small>
     </label>;
   })}</div>
   {visible.length===0&&<p className="cms-empty">Nenhuma foto corresponde aos filtros.</p>}
   {message&&<p role="status" className="cms-feedback">{message}</p>}
 </section>;
}
