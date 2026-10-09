"use client";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import {Header} from "@/components/ui/Header";
import {Footer} from "@/components/ui/Footer";
export function SiteChrome({children}:{children:ReactNode}){
 const admin=usePathname().startsWith("/admin");
 if(admin)return <main id="conteudo" className="app-admin-main">{children}</main>;
 return <><Header/><main id="conteudo">{children}</main><Footer/></>;
}
