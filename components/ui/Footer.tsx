"use client";
import Link from "next/link";
import {ArrowUpRight,Heart} from "lucide-react";
import {nav} from "@/lib/site";
import {useBusinessProfile} from "@/lib/business-client";
function safeExternal(value:string){
 try{const uri=new URL(value);return uri.protocol==="https:"?uri.href:null;}catch{return null;}
}
export function Footer(){
 const business=useBusinessProfile();
 const insta=safeExternal(business.instagram),facebook=safeExternal(business.facebook);
 return <footer className="site-footer">
  <div className="footer-inner">
   <div><span className="eyebrow">FEITO PARA ACOLHER</span><div className="footer-logo">{business.business_name==="Sabor com Amor"?<>Sabor <em>com</em> Amor</>:business.business_name}</div>
    <p>Da nossa cozinha para as suas melhores lembranças.</p>
    <p>{business.city}</p>
    {business.email&&<p><a href={"mailto:"+business.email}>{business.email}</a></p>}
    {business.telephone&&<p><a href={"tel:"+business.telephone.replace(/[^0-9+]/g,"")}>{business.telephone}</a></p>}
    {business.whatsapp&&<p><a href={"https://wa.me/"+business.whatsapp}>Converse com a gente no WhatsApp ↗</a></p>}
    {business.address&&<p>{business.address}</p>}
    {business.hours&&<p>{business.hours}</p>}
    {(insta||facebook)&&<div className="footer-social">{insta&&<a href={insta} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}{facebook&&<a href={facebook} target="_blank" rel="noopener noreferrer">Facebook ↗</a>}</div>}
   </div>
   <nav aria-label="Links de rodapé">{nav.map(n=><Link key={n.href} href={n.href}>{n.label}<ArrowUpRight size={14}/></Link>)}</nav>
   <div className="footer-legal"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link><Link href="/cookies">Cookies</Link></div>
  </div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Sabor com Amor.</span><span>Feito com <Heart size={13} fill="currentColor"/> carinho.</span></div>
  <div className="footer-credit">Desenvolvido por <a href="https://nobron.com.br" target="_blank" rel="noopener noreferrer" aria-label="Site de Marcela Queji (abre em nova aba)">Marcela Queji</a></div>
 </footer>;
}
