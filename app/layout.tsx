import type { Metadata, Viewport } from "next";
import "./globals.css";
import {SiteMediaProvider} from "@/lib/cms/media";
import {SiteChrome} from "@/components/ui/SiteChrome";
import {getPublishedMediaAssignments} from "@/lib/cms/public";
export const metadata: Metadata = {
  title: { default: "Sabor com Amor | Buffet em Telêmaco Borba", template: "%s | Sabor com Amor" },
  description: "Buffet completo e serviço de cozinha para celebrar com o sabor e o carinho de uma refeição em família, em Telêmaco Borba e região.",
  robots: { index: false, follow: false }, // site em desenvolvimento; revisar antes da publicação
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F6EFE5" };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 const imageOverrides=await getPublishedMediaAssignments();
 return <html lang="pt-BR"><body><a href="#conteudo" className="skip-link">Pular para o conteúdo</a><SiteMediaProvider items={imageOverrides}><SiteChrome>{children}</SiteChrome></SiteMediaProvider></body></html>;
}
