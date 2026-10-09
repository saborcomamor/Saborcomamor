export const site = {
  brand: "Sabor com Amor",
  city: "Telêmaco Borba, PR",
  slogan: "O sabor que reúne. O carinho que fica.",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
};
export const nav = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/galeria", label: "Galeria" },
  { href: "/nossa-historia", label: "Nossa história" },
  { href: "/orcamento", label: "Orçamento" },
];
export function waUrl(message: string) {
  return site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}` : null;
}
