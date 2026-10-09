import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceIndexList } from "@/components/services/ServiceIndexList";
import { photo } from "@/lib/photos";
export const metadata:Metadata={title:"Nossos serviços",description:"Escolha entre buffet completo e serviço de cozinha para a sua celebração."};
export default function ServicesPage(){return <><PageHero eyebrow="O QUE PODEMOS FAZER POR VOCÊ" title="Cada celebração tem seu jeito." description="Duas maneiras de levar o nosso carinho para o seu evento." image={photo("p10")}/><ServiceIndexList/></>}
