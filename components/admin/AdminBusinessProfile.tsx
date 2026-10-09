"use client";
import {useEffect,useState,type FormEvent} from "react";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
import {type BusinessProfile,defaultBusiness} from "@/lib/public-dynamic";
const fields:[
 keyof BusinessProfile,string,string
][]=[
 ["business_name","Nome do negócio","text"],
 ["whatsapp","WhatsApp com DDD","tel"],
 ["telephone","Telefone alternativo","tel"],
 ["email","E-mail","email"],
 ["city","Cidade / região","text"],
 ["address","Endereço (opcional)","text"],
 ["hours","Horário de atendimento","text"],
 ["instagram","Link do Instagram","url"],
 ["facebook","Link do Facebook","url"]
];
export function AdminBusinessProfile(){
 const [profile,setProfile]=useState<BusinessProfile>(defaultBusiness);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  const client=getSupabaseBrowser();
  if(!client){setLoading(false);setMessage("Conexão indisponível.");return;}
  client.from("business_profile").select("business_name,city,whatsapp,telephone,email,address,hours,instagram,facebook").eq("id",1).maybeSingle()
   .then(({data,error})=>{if(data)setProfile({...defaultBusiness,...data});if(error)setMessage("Não foi possível carregar as informações.");setLoading(false);});
 },[]);
 async function submit(e:FormEvent){
  e.preventDefault();
  const client=getSupabaseBrowser();if(!client)return;
  const whatsapp=profile.whatsapp.replace(/\D/g,"");
  if(whatsapp&& (whatsapp.length<10||whatsapp.length>15)){setMessage("Informe o WhatsApp com DDD.");return;}
  setSaving(true);setMessage("");
  const payload={...profile,whatsapp};
  const {error}=await client.from("business_profile").upsert({id:1,...payload},{onConflict:"id"});
  setSaving(false);
  if(error){setMessage("Não foi possível salvar. Verifique os campos.");return;}
  setProfile(payload);setMessage("Informações salvas. Atualize o site público para conferir.");
 }
 return <section className="app-business" aria-labelledby="admin-business-title">
  <h3 id="admin-business-title">Informações do negócio</h3>
  {loading?<p>Carregando…</p>:<form onSubmit={submit} className="app-business-form">
    {fields.map(([key,label,type])=><label key={key}>{label}
      <input type={type} value={profile[key]} maxLength={key==="address"?250:180}
        required={key==="business_name"||key==="city"}
        placeholder={key==="whatsapp"?"Ex.: 41999999999":""}
        onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/>
    </label>)}
    <button type="submit" className="app-primary" disabled={saving}>{saving?"Salvando…":"Salvar informações"}</button>
  </form>}
  {message&&<p className="app-feedback" role="status">{message}</p>}
 </section>;
}
