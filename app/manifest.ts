import type {MetadataRoute} from "next";

/**
 * A genuine standalone PWA manifest, separate from the editable browser favicon.
 * The 192/512 PNG install icons are available to Chromium independently of CMS data.
 */
export default function manifest():MetadataRoute.Manifest{
 return {
  id:"/",
  name:"Buffet Sabor com Amor",
  short_name:"Sabor com Amor",
  description:"Um carinho em cada celebração. Buffet e serviço de cozinha em Telêmaco Borba, PR.",
  lang:"pt-BR",
  start_url:"/?origem=aplicativo",
  scope:"/",
  display:"standalone",
  background_color:"#F6EFE5",
  theme_color:"#583C30",
  categories:["food","lifestyle"],
  icons:[
   {src:"/pwa-icon-192.png?v=2",sizes:"192x192",type:"image/png",purpose:"any"},
   {src:"/pwa-icon-512.png?v=2",sizes:"512x512",type:"image/png",purpose:"any"},
   {src:"/pwa-icon-maskable.png?v=2",sizes:"512x512",type:"image/png",purpose:"maskable"}
  ]
 };
}
