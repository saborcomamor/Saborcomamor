import type { Metadata, Viewport } from "next";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { site } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Sabor com Amor | Buffet em Telêmaco Borba", template: "%s | Sabor com Amor" },
  description: "Buffet completo e serviço de cozinha para celebrar com o sabor e o carinho de uma refeição em família, em Telêmaco Borba e região.",
  robots: { index: false, follow: false }, // site em desenvolvimento; revisar antes da publicação
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F6EFE5" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="pt-BR"><body><a href="#conteudo" className="skip-link">Pular para o conteúdo</a><Header/><main id="conteudo">{children}</main><Footer/></body></html>;
}
