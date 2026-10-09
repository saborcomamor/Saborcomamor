import type { MediaSlot } from "./slots";
import { photo } from "@/lib/photos";

const storyTitles = [
  "Começou em família", "Cresceu com dedicação", "E segue reunindo pessoas"
];

/** Textos que aparecem sobre as fotografias, não legendas do banco de fotos. */
export function mediaSlotPresentation(slot: MediaSlot) {
  if (slot.key.startsWith("home.event-carousel.")) {
    return {
      overlay: true,
      originalText: photo(slot.fallback).label,
      explanatoryText: "Este carrossel mostra um texto sobre cada foto. Ao trocar a imagem, a frase antiga deixa de aparecer. Você pode escrever outra ou deixar sem texto.",
    };
  }
  if (slot.key.startsWith("home.story-stack.")) {
    const index = Number(slot.key.split(".").at(-1)) - 1;
    return {
      overlay: true,
      originalText: storyTitles[index] || "",
      explanatoryText: "Essa pilha de fotos também tem um título sobre a imagem. Você pode trocar a frase ou ocultá-la ao selecionar uma foto nova.",
    };
  }
  const fixed: Record<string, string> = {
    "home.hero": "O sabor que reúne. O carinho que fica. (título da seção, não da fotografia)",
    "home.welcome": "Receber bem é uma forma de carinho. (título da seção)",
    "home.services": "Buffet completo / Serviço de cozinha (identificação do serviço, permanece fixa)",
    "home.serving": "Buffet à vontade, Serviço à francesa, Finger food ou Coquetel (nome do serviço)",
    "home.final": "Vamos colocar carinho no seu próximo evento? (texto da seção)",
    "story.profile": "Prazer, Marli. (título da apresentação)",
    "services.cards": "Buffet completo / Serviço de cozinha (nome dos serviços)",
  };
  const group = slot.key.split(".").slice(0, -1).join(".");
  const fixedText = fixed[group] || "";
  return {
    overlay: false,
    originalText: "",
    explanatoryText: fixedText
      ? "Há um texto fixo nesta seção: " + fixedText + ". A troca da foto não altera esse texto."
      : "Esta posição não tem legenda fixa sobre a fotografia. A troca altera somente a imagem.",
  };
}
