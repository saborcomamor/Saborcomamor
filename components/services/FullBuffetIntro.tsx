"use client";
import {usePublishedServices} from "@/lib/cms/services-context";
export function FullBuffetIntro(){const published=usePublishedServices();return <section className="service-intro container"><span className="eyebrow">COMO FUNCIONA</span><h2>Uma preocupação a menos. <em>Mais tempo para viver.</em></h2><p>{published["buffet-completo"]?.summary||"Com o buffet completo, a equipe cuida da compra dos ingredientes e do preparo, de acordo com o cardápio e as condições definidos para o evento."}</p></section>}
