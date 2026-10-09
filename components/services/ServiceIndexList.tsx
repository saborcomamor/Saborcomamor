import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { photo } from "@/lib/photos";
const services=[{n:"01",name:"Buffet completo",sub:"Você aproveita a celebração. Nós cuidamos do sabor.",desc:"O Sabor com Amor organiza a compra dos ingredientes e prepara a refeição conforme o cardápio e o serviço combinados.",src:"p01",href:"/buffet-completo"},{n:"02",name:"Serviço de cozinha",sub:"Você organiza a ocasião. A gente prepara a comida.",desc:"Você fornece os ingredientes e nossa equipe realiza o preparo no local, conforme o planejamento acertado.",src:"p08",href:"/servico-de-cozinha"}];
export function ServiceIndexList(){return <section className="section service-page-list container">{services.map(s=><article className="service-page-card" key={s.n}><Photo image={photo(s.src)}/><div><span className="eyebrow">MODALIDADE {s.n}</span><h2>{s.name}</h2><h3>{s.sub}</h3><p>{s.desc}</p><Link className="simple-link" href={s.href}>Saiba como funciona <ArrowUpRight size={18}/></Link></div></article>)}</section>}
