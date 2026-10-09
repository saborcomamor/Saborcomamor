import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceBenefits } from "@/components/services/ServiceBenefits";
import { CookingIntro } from "@/components/services/CookingIntro";
import { CookingGallery } from "@/components/services/CookingGallery";
import { ServiceCallout } from "@/components/services/ServiceCallout";
import { photo } from "@/lib/photos";
export const metadata: Metadata={title:"Serviço de cozinha",description:"Você fornece os ingredientes e o Sabor com Amor prepara a refeição no local do evento."};
export default function CookingPage(){return <><PageHero eyebrow="NOSSOS SERVIÇOS / 02" title="Você prepara a ocasião. A gente prepara a comida." description="Para quem prefere organizar a compra e contar com mãos cuidadosas na cozinha." image={photo("p08")} slot="kitchen.hero.01"/><CookingIntro/><ServiceBenefits items={[{number:"01",heading:"Você conta como será o encontro",body:"Ajustamos o cardápio, a data, o número de convidados e o formato da refeição."},{number:"02",heading:"Alinhamos o que será necessário",body:"Combinamos ingredientes, equipamentos, horário de acesso e estrutura do local."},{number:"03",heading:"Nossa equipe cuida do preparo",body:"A execução segue o escopo acertado para que a refeição faça parte das boas lembranças."}]}/><CookingGallery/><ServiceCallout service="cozinha" title="Já está planejando uma comemoração?" body="Conte pra gente sobre o local, os ingredientes e o que deseja preparar."/></>}
