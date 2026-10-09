import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function ServiceCallout({service,title,body}:{service:"buffet"|"cozinha";title:string;body:string}){return <section className="service-callout"><div className="container"><span className="eyebrow">PRÓXIMO PASSO</span><h2>{title}</h2><p>{body}</p><Link className="button button-dark" href={`/orcamento?servico=${service}`}>Solicitar orçamento <ArrowUpRight size={18}/></Link></div></section>}
