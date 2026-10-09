import type {Metadata,Viewport} from "next";
import "./globals.css";
import {SiteMediaProvider} from "@/lib/cms/media";
import {SiteChrome} from "@/components/ui/SiteChrome";
import {getPublishedMediaAssignments} from "@/lib/cms/public";
import {getBusinessProfile,getVisualSettings} from "@/lib/public-dynamic";
const metadataBase:Metadata={
 title:{default:"Sabor com Amor | Buffet em Telêmaco Borba",template:"%s | Sabor com Amor"},
 description:"Buffet completo e serviço de cozinha para celebrar com o sabor e o carinho de uma refeição em família, em Telêmaco Borba e região.",
 robots:{index:true,follow:true}
};
export async function generateMetadata():Promise<Metadata>{
 const visual=await getVisualSettings();
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const path=visual.favicon_path;
 const custom=base&&/^favicons\/[a-z0-9-]+\.png$/.test(path)
   ?base+"/storage/v1/object/public/sabor-identidade/"+path+"?v="+encodeURIComponent(visual.favicon_version)
   :"/icon.svg";
 return {...metadataBase,icons:{icon:[{url:custom,type:custom.endsWith(".svg")?"image/svg+xml":"image/png"}]}};
}
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#F6EFE5"};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 const [media,profile,visual]=await Promise.all([getPublishedMediaAssignments(),getBusinessProfile(),getVisualSettings()]);
 return <html lang="pt-BR"><body>
  <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
  <SiteMediaProvider items={media}>
   <SiteChrome profile={profile} visual={visual}>{children}</SiteChrome>
  </SiteMediaProvider>
 </body></html>;
}
