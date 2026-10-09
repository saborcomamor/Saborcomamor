"use client";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import {Header} from "@/components/ui/Header";
import {Footer} from "@/components/ui/Footer";
import {BusinessProvider} from "@/lib/business-client";
import type {BusinessProfile,VisualSettings} from "@/lib/public-dynamic";
import {VisualProvider} from "@/lib/visual-client";
export function SiteChrome({children,profile,visual}:{children:ReactNode;profile:BusinessProfile;visual:VisualSettings}){
 const admin=usePathname().startsWith("/admin");
 if(admin)return <main id="conteudo" className="app-admin-main">{children}</main>;
 return <BusinessProvider profile={profile}><VisualProvider value={visual}><Header/><main id="conteudo">{children}</main><Footer/></VisualProvider></BusinessProvider>;
}
