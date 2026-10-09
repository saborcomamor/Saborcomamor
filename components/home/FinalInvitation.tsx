import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { photo } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";
export function FinalInvitation(){return <section className="final-invitation"><Photo image={photo("p16")} className="final-invitation-bg" sizes="100vw"/><div className="final-invitation-shade"/><div className="container final-invitation-content"><span className="eyebrow">A GENTE VAI ADORAR FAZER PARTE</span><h2>Vamos colocar carinho no seu <em>próximo evento?</em></h2><p>Conta pra gente o que você está planejando. Vai ser uma alegria conversar com você.</p><Link href="/orcamento" className="button button-cream">Vamos conversar <ArrowUpRight size={19}/></Link></div></section>}
