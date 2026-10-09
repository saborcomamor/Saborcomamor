import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { photo } from "@/lib/photos";
import { Photo } from "@/components/ui/Photo";
import { SectionHeading } from "@/components/ui/SectionHeading";
const story=[{id:"p04",number:"01",title:"Começou em família"},{id:"p08",number:"02",title:"Cresceu com dedicação"},{id:"p07",number:"03",title:"E segue reunindo pessoas"}];
export function StoryCardStack(){return <section className="section story-stack-section"><div className="container"><SectionHeading eyebrow="NOSSA ESSÊNCIA" title={<>Toda receita carrega <em>uma história.</em></>} description="O Sabor com Amor nasceu do prazer de cozinhar para quem está perto. E esse carinho continua presente em cada novo encontro."/><div className="story-stacks">{story.map((item,i)=><article key={item.id} className="story-stack-card" style={{top:`${110+i*20}px`,transform:`rotate(${(i-1)*1.8}deg)`}}><Photo slot={"home.story-stack."+String(i+1).padStart(2,"0")} image={photo(item.id)}/><div className="story-stack-shade"/><span>{item.number} / NOSSA HISTÓRIA</span><h3>{item.title}</h3></article>)}</div><div className="story-stack-ending"><p>Uma trajetória construída entre temperos, encontros e boas lembranças.</p><Link className="simple-link" href="/nossa-historia">Conheça nossa história <ArrowUpRight size={18}/></Link></div></div></section>}
