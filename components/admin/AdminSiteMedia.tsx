"use client";
import {useEffect,useMemo,useState} from "react";
import {MEDIA_SLOTS, type MediaSlot} from "@/lib/cms/slots";
import {photo} from "@/lib/photos";
import {mediaSlotPresentation} from "@/lib/cms/slot-presentation";
import {getSupabaseBrowser} from "@/lib/supabase/browser";

type MediaRow={slot_key:string;photo_id:string;alt_text:string;caption:string;published_storage_path:string};
type PhotoRow={id:string;album_id:string|null;alt_text:string;caption:string;published_storage_path:string|null;is_published:boolean};
type AlbumRow={id:string;title:string};
const PAGES=[
 {id:"home",name:"Página inicial",path:"/"},
 {id:"services",name:"Nossos serviços",path:"/servicos"},
 {id:"buffet",name:"Buffet completo",path:"/buffet-completo"},
 {id:"kitchen",name:"Serviço de cozinha",path:"/servico-de-cozinha"},
 {id:"story",name:"Nossa história",path:"/nossa-historia"},
 {id:"gallery",name:"Galeria",path:"/galeria"},
];
const project="https://zjhdnsjkfurflhgtauot.supabase.co";
function storageUrl(path:string|null){
  const host=process.env.NEXT_PUBLIC_SUPABASE_URL||project;
  return path ? host+"/storage/v1/object/public/sabor-publicadas/"+path.split("/").map(encodeURIComponent).join("/") : "";
}
export function AdminSiteMedia(){
 const [page,setPage]=useState("home");
 const [section,setSection]=useState("Abertura / Hero");
 const [assigned,setAssigned]=useState<MediaRow[]>([]);
 const [library,setLibrary]=useState<PhotoRow[]>([]);
 const [albums,setAlbums]=useState<AlbumRow[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState("");
 const [selectedSlot,setSelectedSlot]=useState<string|null>(null);
 const [search,setSearch]=useState("");
 const [albumFilter,setAlbumFilter]=useState("");
 const [feedback,setFeedback]=useState("");
 const [choice,setChoice]=useState<string|null>(null);
 const [caption,setCaption]=useState("");
 const slots=useMemo(()=>MEDIA_SLOTS.filter(s=>s.page===page),[page]);
 const sections=useMemo(()=>Array.from(new Set(slots.map(s=>s.section))),[slots]);
 const visible=slots.filter(s=>s.section===section);
 const photoById=useMemo(()=>new Map(library.map(p=>[p.id,p])),[library]);
 const assignments=useMemo(()=>new Map(assigned.map(p=>[p.slot_key,p])),[assigned]);
 const selected=MEDIA_SLOTS.find(s=>s.key===selectedSlot);
 const chosen=choice?photoById.get(choice):undefined;
 const filtered=library.filter(p=>!!p.published_storage_path && (!albumFilter||p.album_id===albumFilter) && (!search||(
    p.alt_text+" "+p.caption+" "+(albums.find(a=>a.id===p.album_id)?.title||"")
  ).toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))));
 const current=PAGES.find(p=>p.id===page);
 const changedCount=(keys:string[])=>keys.filter(key=>assignments.has(key)).length;
 async function load(){
  const client=getSupabaseBrowser();if(!client){setFeedback("Supabase não configurado.");setLoading(false);return;}
  const [slotsResult,photoResult,albumResult]=await Promise.all([
    client.from("site_media_slots").select("slot_key,photo_id,alt_text,caption,published_storage_path"),
    client.from("photos").select("id,album_id,alt_text,caption,published_storage_path,is_published").order("created_at",{ascending:false}),
    client.from("albums").select("id,title").order("created_at",{ascending:false})
  ]);
  if(slotsResult.error||photoResult.error||albumResult.error){
    setFeedback("Não foi possível carregar as imagens. Confira sua sessão e tente atualizar.");
  }else{
    setAssigned((slotsResult.data||[]) as MediaRow[]);
    setLibrary((photoResult.data||[]) as PhotoRow[]);
    setAlbums((albumResult.data||[]) as AlbumRow[]);
  }
  setLoading(false);
 }
 useEffect(()=>{void load();},[]);
 function openPicker(slot:MediaSlot){
  const previous=assignments.get(slot.key);
  setSelectedSlot(slot.key);setChoice(previous?.photo_id??null);
  setCaption(previous?.caption??"");setSearch("");setAlbumFilter("");setFeedback("");
 }
 async function saveSelection(){
  if(!selectedSlot||!choice)return;
  const client=getSupabaseBrowser();if(!client)return;
  setBusy(selectedSlot);setFeedback("");
  const {error}=await client.rpc("set_site_media_slot",{p_slot_key:selectedSlot,p_photo_id:choice,p_caption:caption.trim()});
  if(error){setFeedback("Não foi possível aplicar a foto. Confira se ela terminou de ser enviada e possui autorização registrada.");}
  else{
    setFeedback("Fotografia e texto desta posição salvos. Atualize a página do site para conferir.");
    setSelectedSlot(null);setChoice(null);
    await load();
  }
  setBusy("");
 }
 async function restore(slot:MediaSlot){
  const client=getSupabaseBrowser();if(!client)return;
  setBusy(slot.key);setFeedback("");
  const {error}=await client.rpc("clear_site_media_slot",{p_slot_key:slot.key});
  if(error)setFeedback("Não foi possível restaurar a imagem padrão.");
  else{setFeedback("Fotografia e texto original restaurados. Atualize a página do site para conferir.");await load();}
  setBusy("");
 }
 function choosePage(id:string){
   setPage(id);
   const s=MEDIA_SLOTS.find(item=>item.page===id);
   setSection(s?.section||"");
   setSelectedSlot(null);setFeedback("");
 }
 if(loading)return <section className="admin-panel"><p aria-live="polite">Abrindo o editor visual das páginas…</p></section>;
 return <section className="cms-shell" aria-labelledby="cms-title">
  <div className="cms-heading"><p className="eyebrow">GERENCIADOR DO SITE</p><h2 id="cms-title">Cada foto no seu lugar.</h2>
  <p>Escolha a página, depois a seção. Você verá exatamente qual imagem está sendo editada. Seu banco de fotos é separado da galeria pública.</p></div>
  <div className="cms-summary"><strong>{MEDIA_SLOTS.length}</strong><span>posições do site</span><strong>{assigned.length}</strong><span>já substituídas</span><strong>{MEDIA_SLOTS.length-assigned.length}</strong><span>ainda com imagens ilustrativas</span></div>
  <nav className="cms-pages" aria-label="Escolher página">{PAGES.map(p=><button type="button" aria-pressed={page===p.id}
   className={page===p.id?"cms-active":""} onClick={()=>choosePage(p.id)} key={p.id}>{p.name} <small>({changedCount(MEDIA_SLOTS.filter(s=>s.page===p.id).map(s=>s.key))}/{MEDIA_SLOTS.filter(s=>s.page===p.id).length})</small></button>)}</nav>
  <div className="cms-where"><div><span>VOCÊ ESTÁ EDITANDO</span><h3>{current?.name}</h3></div>
   <a href={current?.path||"/"} target="_blank" rel="noopener noreferrer">Ver esta página ↗</a></div>
  <label className="cms-section-selector">Qual parte da página?
   <select value={section} onChange={e=>setSection(e.target.value)}>
    {sections.map(s=><option key={s} value={s}>{s} · {changedCount(slots.filter(x=>x.section===s).map(x=>x.key))}/{slots.filter(x=>x.section===s).length} substituídas</option>)}
   </select>
  </label>
  <p className="cms-help">As fotos abaixo estão na ordem em que aparecem nesta seção. Alterar uma posição não afeta as outras.</p>
  <div className="cms-slots">
  {visible.map(slot=>{
    const assignment=assignments.get(slot.key);
    const fallback=photo(slot.fallback);
    const presentation=mediaSlotPresentation(slot);
    const visibleCaption=assignment?assignment.caption:presentation.originalText;
    return <article className="cms-slot" key={slot.key}>
     <div className="cms-slot-header"><div><span className="cms-position">{slot.label}</span><small>{slot.section}</small></div>
      <span className={assignment?"cms-status changed":"cms-status"}>{assignment?"Personalizada":"Foto ilustrativa"}</span></div>
     <div className="cms-slot-images">
      <div><span>IMAGEM ILUSTRATIVA ORIGINAL</span><div className="cms-preview-frame"><img src={fallback.src} alt={fallback.alt} loading="lazy"/>{presentation.overlay&&presentation.originalText&&<b className="cms-image-text">{presentation.originalText}</b>}</div></div>
      <div><span>IMAGEM ESCOLHIDA PARA O SITE</span><div className="cms-preview-frame"><img src={assignment?storageUrl(assignment.published_storage_path):fallback.src} alt={assignment?.alt_text||fallback.alt} loading="lazy"/>{presentation.overlay&&visibleCaption&&<b className="cms-image-text">{visibleCaption}</b>}</div></div>
     </div>
     {presentation.overlay?<p className="cms-current-copy"><strong>Texto visível na foto:</strong> {visibleCaption?"“"+visibleCaption+"”":"Sem texto"}. Você pode alterar ou ocultar ao trocar a fotografia.</p>:<p className="cms-current-copy">{presentation.explanatoryText}</p>}
     <div className="cms-actions"><button type="button" onClick={()=>openPicker(slot)}>Trocar fotografia</button>
      {assignment&&<button type="button" className="cms-restore" onClick={()=>void restore(slot)} disabled={busy===slot.key}>Restaurar original</button>}
     </div>
    </article>;
  })}
  </div>
  {feedback&&<p className="cms-feedback" role="status">{feedback}</p>}
  <div className="cms-explanation"><strong>O que muda quando você salva?</strong>
   <p>Somente a posição selecionada. As demais fotos, carrosséis e animações continuam iguais. Para adicionar fotografias ao banco, use a aba <b>Banco de fotos</b>. Para exibi-las na galeria, marque essa opção no cadastro de fotografias.</p>
  </div>
  {selected&&<div className="cms-dialog-backdrop" role="presentation" onClick={e=>{if(e.target===e.currentTarget)setSelectedSlot(null);}}>
   <div className="cms-dialog" role="dialog" aria-modal="true" aria-labelledby="cms-picker-title">
    <div className="cms-dialog-header"><div><p className="eyebrow">TROCAR FOTOGRAFIA</p><h3 id="cms-picker-title">{selected.label}</h3><p>{PAGES.find(p=>p.id===selected.page)?.name} → {selected.section}</p></div>
     <button type="button" className="cms-close" onClick={()=>setSelectedSlot(null)} aria-label="Fechar seletor">×</button></div>
    <div className="cms-dialog-tools">
     <label>Buscar fotos<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Prato, evento, legenda…"/></label>
     <label>Filtrar por álbum<select value={albumFilter} onChange={e=>setAlbumFilter(e.target.value)}>
      <option value="">Todos os álbuns</option>{albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}
     </select></label>
    </div>
    {library.length===0&&<p className="cms-empty">O banco de fotos ainda está vazio. Vá à aba Banco de fotos e envie suas fotografias autorizadas.</p>}
    {filtered.length===0&&library.length>0&&<p className="cms-empty">Nenhuma foto encontrada com esses filtros. Verifique se os arquivos foram enviados por completo.</p>}
    <div className="cms-library" aria-label="Escolher fotografia do banco">{filtered.map(item=>
     <button key={item.id} type="button" className={choice===item.id?"cms-library-choice selected":"cms-library-choice"}
      aria-pressed={choice===item.id} onClick={()=>{setChoice(item.id);setCaption(item.id===assignments.get(selected.key)?.photo_id?assignments.get(selected.key)?.caption??"":"");}}>
      <img src={storageUrl(item.published_storage_path)} alt={item.alt_text} loading="lazy"/>
      <span>{item.caption||item.alt_text}</span><small>{albums.find(a=>a.id===item.album_id)?.title||"Sem álbum"} · {item.is_published?"Na galeria":"Só no banco"}</small>
     </button>
    )}</div>
    <div className="cms-editor-guidance" role="note"><strong>O que aparece com essa foto?</strong><p>{mediaSlotPresentation(selected).explanatoryText}</p>
      {mediaSlotPresentation(selected).overlay&&<label>Texto sobre a nova fotografia (opcional, até 160 caracteres)
        <input value={caption} maxLength={160} onChange={e=>setCaption(e.target.value)} placeholder="Deixe em branco para não mostrar texto na foto"/>
      </label>}
      <p><b>Ao salvar:</b> somente {selected.label.toLowerCase()} da seção {selected.section} será alterada.</p>
    </div>
    {chosen&&<div className="cms-selected"><div className="cms-selected-preview"><img src={storageUrl(chosen.published_storage_path)} alt={chosen.alt_text}/>{mediaSlotPresentation(selected).overlay&&caption.trim()&&<b>{caption}</b>}</div><p><b>Prévia da fotografia selecionada</b><span>{mediaSlotPresentation(selected).overlay?caption.trim()||"Sem texto sobre a imagem":"Sem legenda sobre a foto"} · {chosen.alt_text}</span></p></div>}
    <div className="cms-dialog-footer"><button type="button" className="cms-cancel" onClick={()=>setSelectedSlot(null)}>Cancelar</button>
     <button type="button" disabled={!choice||!!busy} onClick={()=>void saveSelection()}>{busy?"Salvando…":"Usar nesta posição"}</button></div>
    {feedback&&<p className="cms-feedback" role="alert">{feedback}</p>}
   </div>
  </div>}
 </section>;
}
