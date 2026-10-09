"use client";
import {useEffect,useState} from "react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import type {VisualSettings} from "@/lib/public-dynamic";
const names:Record<VisualSettings["keepsakes_font"],string>={
 caveat:"Caveat — espontânea",
 dancing:"Dancing Script — delicada",
 allura:"Allura — caligrafia"
};
export function AdminVisualSettings(){
 const [font,setFont]=useState<VisualSettings["keepsakes_font"]>("caveat");
 const [saved,setSaved]=useState<VisualSettings["keepsakes_font"]>("caveat");
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [notice,setNotice]=useState("");
 useEffect(()=>{const db=getSupabaseBrowser();if(!db)return;
  db.from("visual_settings").select("keepsakes_font").eq("id",1).single().then(({data,error})=>{
    if(!error&&data){setFont(data.keepsakes_font);setSaved(data.keepsakes_font);}
    setLoading(false);
  });
 },[]);
 async function save(){
  const db=getSupabaseBrowser();if(!db)return;
  setBusy(true);setNotice("");
  const {error}=await db.from("visual_settings").update({keepsakes_font:font}).eq("id",1);
  setBusy(false);
  if(error){setNotice("Não foi possível salvar a fonte.");return;}
  setSaved(font);setNotice("Fonte publicada. Atualize a página inicial para conferir.");
 }
 return <section className="app-page app-visual-settings">
  <div className="app-page-top"><h2>Fonte do manifesto</h2></div>
  <p className="app-font-note">Aparece na seção “O que realmente importa”.</p>
  <div className="app-font-options">{(Object.keys(names) as VisualSettings["keepsakes_font"][]).map(key=>
   <button key={key} type="button" aria-pressed={font===key} className={"app-font-choice "+(font===key?"chosen":"")}
    onClick={()=>setFont(key)}>
    <span className={"app-font-sample sample-"+key}>Que as memórias sejam bonitas.</span>
    <small>{names[key]}</small>
   </button>)}</div>
  {!loading&&<button type="button" className="app-primary" onClick={()=>void save()} disabled={busy||font===saved}>
   {busy?"Salvando…":"Salvar fonte"}
  </button>}
  {notice&&<p className="app-feedback" role="status">{notice}</p>}
 </section>;
}
