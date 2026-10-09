/** Catálogo único de todas as posições de imagens editáveis do site. */
export type MediaSlot = { key:string; page:string; section:string; label:string; fallback:string };
export const MEDIA_SLOTS: MediaSlot[] = [
  {
    "key": "home.hero.01",
    "page": "home",
    "section": "Abertura / Hero",
    "label": "Foto principal 1 (abertura)",
    "fallback": "p01"
  },
  {
    "key": "home.hero.02",
    "page": "home",
    "section": "Abertura / Hero",
    "label": "Foto principal 2",
    "fallback": "p02"
  },
  {
    "key": "home.hero.03",
    "page": "home",
    "section": "Abertura / Hero",
    "label": "Foto principal 3",
    "fallback": "p10"
  },
  {
    "key": "home.welcome.01",
    "page": "home",
    "section": "Boas-vindas",
    "label": "Foto à esquerda",
    "fallback": "p06"
  },
  {
    "key": "home.welcome.02",
    "page": "home",
    "section": "Boas-vindas",
    "label": "Foto à direita",
    "fallback": "p07"
  },
  {
    "key": "home.welcome.03",
    "page": "home",
    "section": "Boas-vindas",
    "label": "Foto pequena sobreposta",
    "fallback": "p04"
  },
  {
    "key": "home.services.01",
    "page": "home",
    "section": "Nossos serviços",
    "label": "Card Buffet completo",
    "fallback": "p01"
  },
  {
    "key": "home.services.02",
    "page": "home",
    "section": "Nossos serviços",
    "label": "Card Serviço de cozinha",
    "fallback": "p08"
  },
  {
    "key": "home.food-carousel.01",
    "page": "home",
    "section": "Carrossel 3D de pratos",
    "label": "Fotografia 1",
    "fallback": "p02"
  },
  {
    "key": "home.food-carousel.02",
    "page": "home",
    "section": "Carrossel 3D de pratos",
    "label": "Fotografia 2",
    "fallback": "p05"
  },
  {
    "key": "home.food-carousel.03",
    "page": "home",
    "section": "Carrossel 3D de pratos",
    "label": "Fotografia 3",
    "fallback": "p06"
  },
  {
    "key": "home.food-carousel.04",
    "page": "home",
    "section": "Carrossel 3D de pratos",
    "label": "Fotografia 4",
    "fallback": "p11"
  },
  {
    "key": "home.food-carousel.05",
    "page": "home",
    "section": "Carrossel 3D de pratos",
    "label": "Fotografia 5",
    "fallback": "p13"
  },
  {
    "key": "home.food-carousel.06",
    "page": "home",
    "section": "Carrossel 3D de pratos",
    "label": "Fotografia 6",
    "fallback": "p14"
  },
  {
    "key": "home.food-carousel.07",
    "page": "home",
    "section": "Carrossel 3D de pratos",
    "label": "Fotografia 7",
    "fallback": "p16"
  },
  {
    "key": "home.story-stack.01",
    "page": "home",
    "section": "Pilha de fotografias / História",
    "label": "Fotografia 1",
    "fallback": "p04"
  },
  {
    "key": "home.story-stack.02",
    "page": "home",
    "section": "Pilha de fotografias / História",
    "label": "Fotografia 2",
    "fallback": "p08"
  },
  {
    "key": "home.story-stack.03",
    "page": "home",
    "section": "Pilha de fotografias / História",
    "label": "Fotografia 3",
    "fallback": "p07"
  },
  {
    "key": "home.event-carousel.01",
    "page": "home",
    "section": "Carrossel curvo de eventos",
    "label": "Fotografia 1",
    "fallback": "p09"
  },
  {
    "key": "home.event-carousel.02",
    "page": "home",
    "section": "Carrossel curvo de eventos",
    "label": "Fotografia 2",
    "fallback": "p03"
  },
  {
    "key": "home.event-carousel.03",
    "page": "home",
    "section": "Carrossel curvo de eventos",
    "label": "Fotografia 3",
    "fallback": "p07"
  },
  {
    "key": "home.event-carousel.04",
    "page": "home",
    "section": "Carrossel curvo de eventos",
    "label": "Fotografia 4",
    "fallback": "p10"
  },
  {
    "key": "home.event-carousel.05",
    "page": "home",
    "section": "Carrossel curvo de eventos",
    "label": "Fotografia 5",
    "fallback": "p12"
  },
  {
    "key": "home.event-carousel.06",
    "page": "home",
    "section": "Carrossel curvo de eventos",
    "label": "Fotografia 6",
    "fallback": "p01"
  },
  {
    "key": "home.serving.01",
    "page": "home",
    "section": "Jeitos de servir",
    "label": "Buffet à vontade",
    "fallback": "p01"
  },
  {
    "key": "home.serving.02",
    "page": "home",
    "section": "Jeitos de servir",
    "label": "Serviço à francesa",
    "fallback": "p10"
  },
  {
    "key": "home.serving.03",
    "page": "home",
    "section": "Jeitos de servir",
    "label": "Finger food",
    "fallback": "p11"
  },
  {
    "key": "home.serving.04",
    "page": "home",
    "section": "Jeitos de servir",
    "label": "Coquetel",
    "fallback": "p14"
  },
  {
    "key": "home.mosaic.01",
    "page": "home",
    "section": "Mosaico animado",
    "label": "Fotografia 1",
    "fallback": "p05"
  },
  {
    "key": "home.mosaic.02",
    "page": "home",
    "section": "Mosaico animado",
    "label": "Fotografia 2",
    "fallback": "p03"
  },
  {
    "key": "home.mosaic.03",
    "page": "home",
    "section": "Mosaico animado",
    "label": "Fotografia 3",
    "fallback": "p06"
  },
  {
    "key": "home.mosaic.04",
    "page": "home",
    "section": "Mosaico animado",
    "label": "Fotografia 4",
    "fallback": "p12"
  },
  {
    "key": "home.mosaic.05",
    "page": "home",
    "section": "Mosaico animado",
    "label": "Fotografia 5",
    "fallback": "p13"
  },
  {
    "key": "home.mosaic.06",
    "page": "home",
    "section": "Mosaico animado",
    "label": "Fotografia 6",
    "fallback": "p15"
  },
  {
    "key": "home.mosaic.07",
    "page": "home",
    "section": "Mosaico animado",
    "label": "Fotografia 7",
    "fallback": "p02"
  },
  {
    "key": "home.final.01",
    "page": "home",
    "section": "Convite final",
    "label": "Imagem de fundo da chamada final",
    "fallback": "p16"
  },
  {
    "key": "services.hero.01",
    "page": "services",
    "section": "Serviços / Hero",
    "label": "Imagem da abertura",
    "fallback": "p10"
  },
  {
    "key": "services.cards.01",
    "page": "services",
    "section": "Cards dos serviços",
    "label": "Buffet completo",
    "fallback": "p01"
  },
  {
    "key": "services.cards.02",
    "page": "services",
    "section": "Cards dos serviços",
    "label": "Serviço de cozinha",
    "fallback": "p08"
  },
  {
    "key": "buffet.hero.01",
    "page": "buffet",
    "section": "Buffet completo / Hero",
    "label": "Imagem da abertura",
    "fallback": "p01"
  },
  {
    "key": "buffet.gallery.01",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 1",
    "fallback": "p01"
  },
  {
    "key": "buffet.gallery.02",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 2",
    "fallback": "p02"
  },
  {
    "key": "buffet.gallery.03",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 3",
    "fallback": "p05"
  },
  {
    "key": "buffet.gallery.04",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 4",
    "fallback": "p06"
  },
  {
    "key": "buffet.gallery.05",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 5",
    "fallback": "p10"
  },
  {
    "key": "buffet.gallery.06",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 6",
    "fallback": "p11"
  },
  {
    "key": "buffet.gallery.07",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 7",
    "fallback": "p12"
  },
  {
    "key": "buffet.gallery.08",
    "page": "buffet",
    "section": "Buffet completo / Galeria",
    "label": "Fotografia 8",
    "fallback": "p13"
  },
  {
    "key": "kitchen.hero.01",
    "page": "kitchen",
    "section": "Serviço de cozinha / Hero",
    "label": "Imagem da abertura",
    "fallback": "p08"
  },
  {
    "key": "kitchen.gallery.01",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 1",
    "fallback": "p02"
  },
  {
    "key": "kitchen.gallery.02",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 2",
    "fallback": "p04"
  },
  {
    "key": "kitchen.gallery.03",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 3",
    "fallback": "p05"
  },
  {
    "key": "kitchen.gallery.04",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 4",
    "fallback": "p06"
  },
  {
    "key": "kitchen.gallery.05",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 5",
    "fallback": "p08"
  },
  {
    "key": "kitchen.gallery.06",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 6",
    "fallback": "p11"
  },
  {
    "key": "kitchen.gallery.07",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 7",
    "fallback": "p13"
  },
  {
    "key": "kitchen.gallery.08",
    "page": "kitchen",
    "section": "Serviço de cozinha / Galeria",
    "label": "Fotografia 8",
    "fallback": "p14"
  },
  {
    "key": "story.hero.01",
    "page": "story",
    "section": "Nossa história / Hero",
    "label": "Imagem da abertura",
    "fallback": "p04"
  },
  {
    "key": "story.profile.01",
    "page": "story",
    "section": "Nossa história / Marli",
    "label": "Foto da Marli",
    "fallback": "p08"
  },
  {
    "key": "gallery.hero.01",
    "page": "gallery",
    "section": "Galeria / Hero",
    "label": "Imagem da abertura",
    "fallback": "p03"
  }
];
export const mediaSlotByKey = new Map(MEDIA_SLOTS.map(slot => [slot.key,slot]));
