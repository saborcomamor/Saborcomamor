"use client";
import {usePublishedServices} from "@/lib/cms/services-context";
export function CookingIntro(){const published=usePublishedServices();return <section className="service-intro container"><span className="eyebrow">NOSSO JEITO DE AJUDAR</span><h2>O seu planejamento. <em>O nosso preparo.</em></h2><p>{published["servico-de-cozinha"]?.summary||"Nesta modalidade, você fornece os ingredientes e a equipe prepara a refeição no local, conforme o combinado. Escopo, utensílios, estrutura e profissionais necessários devem ser confirmados antes da contratação."}</p></section>}
