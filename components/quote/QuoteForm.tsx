"use client";
import { useState } from "react";
import { AlertCircle, ArrowUpRight, Check, Copy, MessageCircleHeart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { quoteSchema, formatQuote } from "@/lib/quote";
import { waUrl } from "@/lib/site";
import {useBusinessProfile} from "@/lib/business-client";
function FormInner(){
 const business=useBusinessProfile();
 const params=useSearchParams(); const selected=params.get("servico") === "cozinha"?"cozinha":"buffet";
 const [service,setService]=useState<"buffet"|"cozinha">(selected);
 const [event,setEvent]=useState("aniversario"); const [guests,setGuests]=useState("");
 const [date,setDate]=useState("");const [city,setCity]=useState("");const [message,setMessage]=useState("");
 const [error,setError]=useState(""); const [copy,setCopy]=useState("");
 function submit(e:React.FormEvent<HTMLFormElement>){
   e.preventDefault();setError("");setCopy("");
   const result=quoteSchema.safeParse({service,event,guests,date:date||undefined,city,message:message||undefined});
   if(!result.success){setError("Confira a quantidade de convidados e informe a cidade do evento.");return;}
   const text=formatQuote(result.data);
   const url=waUrl(text,business.whatsapp);
   if(!url){setCopy(text);return;}
   window.open(url,"_blank","noopener,noreferrer");
 }
 return <form className="quote-form" onSubmit={submit} noValidate>
  <fieldset className="quote-service"><legend>1. Como podemos participar?</legend><div className="quote-radio-row"><label className={service==="buffet"?"checked":""}><input type="radio" name="service" value="buffet" checked={service==="buffet"} onChange={()=>setService("buffet")}/><span>Buffet completo<small>A gente compra e prepara</small></span></label><label className={service==="cozinha"?"checked":""}><input type="radio" name="service" value="cozinha" checked={service==="cozinha"} onChange={()=>setService("cozinha")}/><span>Serviço de cozinha<small>Você fornece os ingredientes</small></span></label></div></fieldset>
  <div className="form-block"><h2>2. Conte um pouco da ocasião</h2><div className="form-field"><label htmlFor="quote-event">Qual será o evento?</label><select id="quote-event" value={event} onChange={e=>setEvent(e.target.value)}><option value="aniversario">Aniversário</option><option value="casamento">Casamento</option><option value="confraternizacao">Confraternização</option><option value="corporativo">Evento corporativo</option><option value="outro">Outro momento especial</option></select></div><div className="form-field"><label htmlFor="quote-guests">Quantas pessoas aproximadamente? *</label><input id="quote-guests" type="number" inputMode="numeric" min="1" max="100000" required placeholder="Ex.: 80" value={guests} onChange={e=>setGuests(e.target.value)}/></div><div className="form-field"><label htmlFor="quote-date">Data do evento <span>(se já souber)</span></label><input id="quote-date" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div><div className="form-field"><label htmlFor="quote-city">Cidade ou local do evento *</label><input id="quote-city" type="text" maxLength={100} required placeholder="Ex.: Telêmaco Borba" value={city} onChange={e=>setCity(e.target.value)}/></div><div className="form-field"><label htmlFor="quote-notes">Mais algum detalhe? <span>(opcional)</span></label><textarea id="quote-notes" rows={4} maxLength={1000} placeholder="Conte o que já imaginou para esse dia..." value={message} onChange={e=>setMessage(e.target.value)}/></div></div>
  <p className="quote-privacy">Ao continuar, você abrirá uma mensagem no WhatsApp, serviço externo, sem enviar informações ao servidor deste site. Confira os dados antes de enviar. <a href="/privacidade">Como cuidamos da privacidade</a>.</p>
  {error&&<p className="form-error" role="alert"><AlertCircle size={18}/>{error}</p>}
  {copy&&<div className="copy-fallback" role="status"><p>Seu pedido está pronto para compartilhar. Copie os detalhes abaixo.</p><pre>{copy}</pre><button type="button" className="button button-dark" onClick={async()=>{try{await navigator.clipboard.writeText(copy);setError("");}catch{setError("Não foi possível copiar automaticamente. Selecione o texto acima.")}}}><Copy size={18}/> Copiar mensagem</button></div>}
  <button className="button button-dark form-submit" type="submit">{business.whatsapp?<><MessageCircleHeart size={20}/> Conversar pelo WhatsApp</>:<><Check size={20}/> Preparar pedido</>} <ArrowUpRight size={17}/></button>
 </form>
}
export function QuoteForm(){return <Suspense fallback={<p>Preparando formulário…</p>}><FormInner/></Suspense>}
