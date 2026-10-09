"use client";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Album={id:string;title:string;is_published:boolean};
type PhotoRow={id:string;alt_text:string;is_published:boolean;published_storage_path:string|null};
const allowed=["image/jpeg","image/png","image/webp","image/avif"];

async function optimisePhoto(file:File):Promise<Blob>{
  const bitmap=await createImageBitmap(file);
  try {
    const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const webp=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",0.82));
    if(!webp||webp.type!=="image/webp")throw new Error("WebP export unavailable");
    if(webp.size>3145728)throw new Error("Optimized image too large");
    return webp;
  } finally {bitmap.close();}
}
async function sha256(blob:Blob){
  const buffer=await blob.arrayBuffer();
  const digest=await crypto.subtle.digest("SHA-256",buffer);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
export function AdminPhotos(){
  const [albums,setAlbums]=useState<Album[]>([]);
  const [items,setItems]=useState<PhotoRow[]>([]);
  const [albumId,setAlbumId]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [alt,setAlt]=useState("");
  const [caption,setCaption]=useState("");
  const [proof,setProof]=useState("");
  const [publish,setPublish]=useState(false);
  const [pending,setPending]=useState(false);
  const [message,setMessage]=useState("");
  async function load(){const client=getSupabaseBrowser();if(!client)return;
    const [ar,pr]=await Promise.all([
      client.from("albums").select("id,title,is_published").order("created_at",{ascending:false}),
      client.from("photos").select("id,alt_text,is_published,published_storage_path").order("created_at",{ascending:false}),
    ]);
    if(ar.error||pr.error){setMessage("Não foi possível consultar as imagens.");return;}
    setAlbums((ar.data??[]) as Album[]);setItems((pr.data??[]) as PhotoRow[]);
  }
  useEffect(()=>{void load();},[]);
  async function submit(e:FormEvent){
    e.preventDefault();const client=getSupabaseBrowser();if(!client||!file)return;
    setMessage("");
    if(!allowed.includes(file.type)||file.size>15728640){setMessage("Envie JPG, PNG, WebP ou AVIF de até 15 MB.");return;}
    if(alt.trim().length<3||proof.trim().length<3){setMessage("Informe uma descrição e a referência de autorização.");return;}
    setPending(true);
    try {
      const optimised=await optimisePhoto(file);
      const hash=await sha256(optimised);
      const id=crypto.randomUUID();
      const publicPath=`${id}.webp`;
      const extension=file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g,"")||"original";
      const originalPath=`${id}/original.${extension}`;
      const created=await client.from("photos").insert({
        id,album_id:albumId||null,published_storage_path:publicPath,
        asset_sha256:hash,alt_text:alt.trim(),caption:caption.trim(),is_published:false,
      });
      if(created.error)throw new Error("Não foi possível criar o registro da fotografia.");
      const original=await client.storage.from("sabor-originais").upload(originalPath,file,{contentType:file.type,upsert:false});
      if(original.error)throw new Error("Original não enviado; a foto permanece em rascunho.");
      const linked=await client.rpc("register_photo_original",{p_photo_id:id,p_storage_path:originalPath});
      if(linked.error)throw new Error("Original enviado, mas o vínculo interno não foi salvo.");
      const approved=await client.rpc("approve_photo_rights",{p_photo_id:id,p_evidence_reference:proof.trim()});
      if(approved.error)throw new Error("Original salvo, mas a verificação documental não foi registrada.");
      const published=await client.storage.from("sabor-publicadas").upload(publicPath,optimised,{contentType:"image/webp",upsert:false});
      if(published.error)throw new Error("Original salvo, mas não foi possível preparar a versão pública.");
      if(publish){
        const activated=await client.from("photos").update({is_published:true}).eq("id",id);
        if(activated.error)throw new Error("Imagem preparada, mas permanece como rascunho.");
      }
      setMessage(publish?"Foto autorizada e publicada. Se pertence a um álbum rascunho, só aparecerá quando o álbum for publicado.":"Foto autorizada e salva como rascunho.");
      setFile(null);setAlt("");setCaption("");setProof("");setPublish(false);
      const input=document.getElementById("admin-photo-file") as HTMLInputElement|null;
      if(input)input.value="";
      await load();
    } catch(err){setMessage(err instanceof Error?err.message:"Falha ao enviar a fotografia.");}
    finally{setPending(false);}
  }
  async function unpublish(item:PhotoRow){const client=getSupabaseBrowser();if(!client)return;
    const {error}=await client.from("photos").update({is_published:false}).eq("id",item.id);
    setMessage(error?"Não foi possível retirar a fotografia do ar.":"Fotografia retirada da galeria.");
    if(!error)await load();
  }
  return <section className="admin-panel" aria-labelledby="photos-title">
    <h2 id="photos-title">Fotografias e autorizações</h2>
    <p>Somente publique fotografias autorizadas. A referência do documento fica protegida no banco interno e não aparece na galeria.</p>
    <form onSubmit={submit} className="admin-form">
      <label>Imagem original (até 15 MB)
        <input id="admin-photo-file" type="file" required accept={allowed.join(",")} onChange={e=>setFile(e.target.files?.[0]??null)}/>
      </label>
      <label>Álbum
        <select value={albumId} onChange={e=>setAlbumId(e.target.value)}><option value="">Sem álbum</option>{albums.map(a=><option value={a.id} key={a.id}>{a.title}{a.is_published?"":" (rascunho)"}</option>)}</select>
      </label>
      <label>Descrição acessível da fotografia<input required minLength={3} maxLength={250} value={alt} onChange={e=>setAlt(e.target.value)}/></label>
      <label>Legenda opcional<input maxLength={180} value={caption} onChange={e=>setCaption(e.target.value)}/></label>
      <label>Referência da autorização de uso (documento ou registro interno)
        <input required minLength={3} maxLength={400} value={proof} onChange={e=>setProof(e.target.value)} placeholder="Ex.: autorização assinada registrada em 08/10/2026"/>
      </label>
      <label className="admin-check"><input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)}/> Publicar após registrar a autorização</label>
      <button type="submit" disabled={pending||!file}>{pending?"Preparando e enviando…":"Cadastrar fotografia"}</button>
    </form>
    {message&&<p role="status" aria-live="polite">{message}</p>}
    <ul className="admin-list">{items.map(item=><li key={item.id}><div><strong>{item.alt_text}</strong><small>{item.is_published?"Publicada":"Rascunho"}</small></div>{item.is_published&&<button type="button" onClick={()=>unpublish(item)}>Retirar do ar</button>}</li>)}</ul>
  </section>;
}
