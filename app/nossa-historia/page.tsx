import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { StoryProfile } from "@/components/story/StoryProfile";
import { photo } from "@/lib/photos";
export const metadata:Metadata={title:"Nossa história",description:"Conheça o começo da história da Marli e do Buffet Sabor com Amor."};
export default function StoryPage(){return <><PageHero eyebrow="NOSSA HISTÓRIA" title="A cozinha sempre foi um lugar de encontro." description="Uma história que começou em família e encontrou um jeito de acolher ainda mais pessoas." image={photo("p04")} slot="story.hero.01"/><StoryProfile/></>}
