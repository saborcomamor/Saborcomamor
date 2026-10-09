"use client";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import {Header} from "@/components/ui/Header";
import {Footer} from "@/components/ui/Footer";
import {BusinessProvider} from "@/lib/business-client";
import type {BusinessProfile} from "@/lib/public-dynamic";
export function SiteChrome({children,profile}:{children:ReactNode;profile:BusinessProfile}){
 const admin=usePathname().startsWith("/admin");
 if(admin)return <main id="conteudo" className="app-admin-main">{children}</main>;
 return <BusinessProvider profile={profile}><Header/><main id="conteudo">{children}</main><Footer/></BusinessProvider>;
}
