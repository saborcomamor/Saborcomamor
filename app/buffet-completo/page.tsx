import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceBenefits } from "@/components/services/ServiceBenefits";
import { FullBuffetIntro } from "@/components/services/FullBuffetIntro";
import { FullBuffetGallery } from "@/components/services/FullBuffetGallery";
import { ServiceCallout } from "@/components/services/ServiceCallout";
import { photo } from "@/lib/photos";
export const metadata: Metadata={title:"Buffet completo",description:"Contrate o Sabor com Amor para planejar a compra de ingredientes e preparar a refeição do seu evento."};
export default function BuffetPage(){return <><PageHero eyebrow="NOSSOS SERVIÇOS / 01" title="Você vive a festa. A gente cuida do sabor." description="Para quem quer aproveitar cada conversa, cada sorriso e cada momento do encontro." image={photo("p01")}/><FullBuffetIntro/><ServiceBenefits items={[{number:"01",heading:"Uma boa conversa primeiro",body:"Entendemos o tipo de evento, a quantidade de convidados e suas preferências."},{number:"02",heading:"Tudo combinado com cuidado",body:"Definimos cardápio, ingredientes e estrutura de atendimento conforme a proposta."},{number:"03",heading:"Uma refeição para reunir",body:"A comida é preparada para que você aproveite o encontro com tranquilidade."}]}/><FullBuffetGallery/><ServiceCallout service="buffet" title="Vamos preparar seu evento juntos?" body="Conte o que está imaginando. Será um prazer conversar sobre os detalhes."/></>}
