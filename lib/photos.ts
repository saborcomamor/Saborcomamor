/** Imagens ilustrativas temporárias da Unsplash. Substituir por acervo autorizado antes do lançamento. */
export type PhotoCategory = "Pratos" | "Eventos" | "Buffets" | "Bastidores";
export type SitePhoto = { id: string; src: string; alt: string; category: PhotoCategory; label: string; width?: number; height?: number };
const url = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1500&q=85`;
export const photos: SitePhoto[] = [
  { id: "p01", src: url("photo-1555244162-803834f70033"), alt: "Mesa de buffet com pratos variados", category: "Buffets", label: "Mesa preparada" },
  { id: "p02", src: url("photo-1504674900247-0877df9cc836"), alt: "Refeição servida em uma mesa", category: "Pratos", label: "Comida feita com carinho" },
  { id: "p03", src: url("photo-1517248135467-4c7edcad34c4"), alt: "Ambiente de celebração com mesas", category: "Eventos", label: "Cada detalhe importa" },
  { id: "p04", src: url("photo-1498837167922-ddd27525d352"), alt: "Ingredientes frescos durante preparo", category: "Bastidores", label: "Cuidado no preparo" },
  { id: "p05", src: url("photo-1558030006-450675393462"), alt: "Prato de carne servido em travessa", category: "Pratos", label: "Sabores para compartilhar" },
  { id: "p06", src: url("photo-1512621776951-a57141f2eefd"), alt: "Salada colorida com ingredientes frescos", category: "Pratos", label: "Leveza e sabor" },
  { id: "p07", src: url("photo-1528605248644-14dd04022da1"), alt: "Pessoas reunidas em uma comemoração", category: "Eventos", label: "Reunir faz bem" },
  { id: "p08", src: url("photo-1556911220-bff31c812dba"), alt: "Cozinha equipada e organizada", category: "Bastidores", label: "Tudo começa na cozinha" },
  { id: "p09", src: url("photo-1508424757105-b6d5ad9329d0"), alt: "Mesa decorada para celebração", category: "Eventos", label: "Datas que ficam na memória" },
  { id: "p10", src: url("photo-1414235077428-338989a2e8c0"), alt: "Jantar em mesa elegante", category: "Buffets", label: "Receber com carinho" },
  { id: "p11", src: url("photo-1476224203421-9ac39bcb3327"), alt: "Refeição artesanal em prato", category: "Pratos", label: "Feito para apreciar" },
  { id: "p12", src: url("photo-1552566626-52f8b828add9"), alt: "Ambiente preparado para receber pessoas", category: "Buffets", label: "Mesa posta" },
  { id: "p13", src: url("photo-1565958011703-44f9829ba187"), alt: "Bolo de celebração com frutas", category: "Pratos", label: "Um doce momento" },
  { id: "p14", src: url("photo-1547592180-85f173990554"), alt: "Refeição colorida preparada para servir", category: "Pratos", label: "Sabores frescos" },
  { id: "p15", src: url("photo-1490645935967-10de6ba17061"), alt: "Ingredientes naturais em uma mesa", category: "Bastidores", label: "Escolhas especiais" },
  { id: "p16", src: url("photo-1543353071-873f17a7a088"), alt: "Mesa com comida preparada para refeição", category: "Buffets", label: "Um convite para reunir" },
];
export const photo = (id: string) => photos.find(p => p.id === id) || photos[0];
