"use client";
import {useState,Suspense} from "react";
import {AlertCircle,ArrowUpRight,Check,Copy,MessageCircleHeart} from "lucide-react";
import {useSearchParams} from "next/navigation";
import {quoteSchema,formatQuote,serviceLabels,type Service} from "@/lib/quote";
import {waUrl} from "@/lib/site";
import {useBusinessProfile} from "@/lib/business-client";
const options: {id:Service;description:string}[]=[
 {id:"buffet",description:"Cuidamos dos ingredientes, preparo e serviço durante o evento."},
 {id:"cozinha",description:"Você fornece os ingredientes e nós preparamos a refeição no local, sem serviço de mesa."},
 {id:"coquetel",description:"Salgadinhos e delícias para receber seus convidados."},
 {id:"utensilios",description:"Consulte os itens disponíveis para locação pelo WhatsApp."}
];
function FormInner(){
 const business=useBusinessProfile();const params=useSearchParams();
 const initial:Service=params.get("servico")==="cozinha"?"cozinha":"buffet";
 const [services,setServices]=useState<Service[]>([initial]);
 const [date,setDate]=useState("");const [dateUnknown,setDateUnknown]=useState(false);
 const [city,setCity]=useState("");const [cityUnknown,setCityUnknown]=useState(false);
 const [guests,setGuests]=useState("");const [guestsUnknown,setGuestsUnknown]=useState(false);
 const [name,setName]=useState("");const [phone,setPhone]=useState("");
 const [error,setError]=useState("");const [copy,setCopy]=useState("");
 function toggle(s:Service){setServices(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);}
 function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setCopy("");
  const digits=phone.replace(/\D/g,"");
  if(!services.length){setError("Selecione pelo menos um serviço.");return;}
  if(name.trim().length<2||digits.length<10||digits.length>13){setError("Informe seu nome e um WhatsApp válido com DDD.");return;}
  if(!guestsUnknown&&(!guests||Number(guests)<1)){setError("Informe a quantidade de convidados ou marque que ainda não sabe.");return;}
  const result=quoteSchema.safeParse({services,name,phone,guests:guestsUnknown?"indefinido":guests,date:dateUnknown?undefined:date||undefined,city:cityUnknown?undefined:city||undefined});
  if(!result.success){setError("Confira os dados informados.");return;}
  const message=formatQuote(result.data);const url=waUrl(message,business.whatsapp);
  if(!url){setCopy(message);return;}window.open(url,"_blank","noopener,noreferrer");
 }
 return <form className="quote-form" onSubmit={submit} noValidate>
  <fieldset className="quote-service"><legend>O que você precisa?</legend>
   <div className="quote-radio-row">{options.map(option=><label key={option.id} className={services.includes(option.id)?"checked":""}>
    <input type="checkbox" checked={services.includes(option.id)} onChange={()=>toggle(option.id)}/>
    <span>{serviceLabels[option.id]}<small>{option.description}</small></span>
   </label>)}</div>
   {services.includes("utensilios")&&<p className="quote-privacy">Os utensílios disponíveis serão informados pela nossa equipe no WhatsApp.</p>}
  </fieldset>
  <div className="form-block"><h2>Quando e onde?</h2>
   <div className="form-field"><label htmlFor="quote-date">Data do evento</label>
    {!dateUnknown&&<input id="quote-date" type="date" value={date} onChange={e=>setDate(e.target.value)}/>}
    <label className="quote-optional"><input type="checkbox" checked={dateUnknown} onChange={e=>{setDateUnknown(e.target.checked);if(e.target.checked)setDate("");}}/> Ainda não tenho uma data definida</label>
   </div>
   <div className="form-field"><label htmlFor="quote-city">Cidade ou local do evento</label>
    {!cityUnknown&&<input id="quote-city" type="text" maxLength={100} placeholder="Ex.: Telêmaco Borba" value={city} onChange={e=>setCity(e.target.value)}/>}
    <label className="quote-optional"><input type="checkbox" checked={cityUnknown} onChange={e=>{setCityUnknown(e.target.checked);if(e.target.checked)setCity("");}}/> Ainda não defini o local</label>
   </div>
  </div>
  <div className="form-block"><h2>Quantas pessoas?</h2>
   <div className="form-field"><label htmlFor="quote-guests">Número aproximado de convidados</label>
    {!guestsUnknown&&<input id="quote-guests" type="number" inputMode="numeric" min="1" max="100000" placeholder="Ex.: 100" value={guests} onChange={e=>setGuests(e.target.value)}/>}
    <label className="quote-optional"><input type="checkbox" checked={guestsUnknown} onChange={e=>{setGuestsUnknown(e.target.checked);if(e.target.checked)setGuests("");}}/> Ainda não sei</label>
   </div>
  </div>
  <div className="form-block"><h2>Vamos conversar?</h2>
   <div className="form-field"><label htmlFor="quote-name">Seu nome *</label><input id="quote-name" type="text" maxLength={100} autoComplete="name" required placeholder="Como podemos chamar você?" value={name} onChange={e=>setName(e.target.value)}/></div>
   <div className="form-field"><label htmlFor="quote-phone">Seu WhatsApp com DDD *</label><input id="quote-phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="(00) 00000-0000" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
  </div>
  <p className="quote-privacy">Ao continuar, você abrirá uma mensagem no WhatsApp, serviço externo, sem enviar informações ao servidor deste site. Confira os dados antes de enviar. <a href="/privacidade">Como cuidamos da privacidade</a>.</p>
  {error&&<p className="form-error" role="alert"><AlertCircle size={18}/>{error}</p>}
  {copy&&<div className="copy-fallback" role="status"><p>Seu pedido está pronto para compartilhar. Copie os detalhes abaixo.</p><pre>{copy}</pre><button type="button" className="button button-dark" onClick={async()=>{try{await navigator.clipboard.writeText(copy);setError("");}catch{setError("Não foi possível copiar automaticamente. Selecione o texto acima.")}}}><Copy size={18}/> Copiar mensagem</button></div>}
  <button className="button button-dark form-submit" type="submit">{business.whatsapp?<><MessageCircleHeart size={20}/> Conversar pelo WhatsApp</>:<><Check size={20}/> Preparar pedido</>} <ArrowUpRight size={17}/></button>
 </form>;
}
export function QuoteForm(){return <Suspense fallback={<p>Preparando formulário…</p>}><FormInner/></Suspense>}
