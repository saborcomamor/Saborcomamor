import type { Metadata, Viewport } from "next";
import "./globals.css";
import {SiteMediaProvider} from "@/lib/cms/media";
import {SiteChrome} from "@/components/ui/SiteChrome";
import {getPublishedMediaAssignments} from "@/lib/cms/public";
import {getBusinessProfile} from "@/lib/public-dynamic";
export const metadata: Metadata = {
  title: { default: "Sabor com Amor | Buffet em Telêmaco Borba", template: "%s | Sabor com Amor" },
  description: "Buffet completo e serviço de cozinha para celebrar com o sabor e o carinho de uma refeição em família, em Telêmaco Borba e região.",
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F6EFE5" };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 const [imageOverrides,businessProfile]=await Promise.all([getPublishedMediaAssignments(),getBusinessProfile()]);
 return <html lang="pt-BR"><body><a href="#conteudo" className="skip-link">Pular para o conteúdo</a><SiteMediaProvider items={imageOverrides}><SiteChrome profile={businessProfile}>{children}</SiteChrome></SiteMediaProvider></body></html>;
}
