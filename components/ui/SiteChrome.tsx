"use client";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import {Header} from "@/components/ui/Header";
import {Footer} from "@/components/ui/Footer";
import {InstallAppPrompt} from "@/components/pwa/InstallAppPrompt";
import {LivePublicContent} from "@/components/ui/LivePublicContent";
import type {BusinessProfile,VisualSettings} from "@/lib/public-dynamic";
import type {MediaAssignments} from "@/lib/cms/media";
import type {PublishedServices} from "@/lib/cms/services-context";
export function SiteChrome({children,profile,visual,media,services}:{children:ReactNode;
 profile:BusinessProfile;visual:VisualSettings;media:MediaAssignments;services:PublishedServices}){
 const admin=usePathname().startsWith("/admin");
 if(admin)return <main id="conteudo" className="app-admin-main">{children}</main>;
 return <LivePublicContent media={media} profile={profile} visual={visual} services={services}>
  <Header/><main id="conteudo">{children}</main><Footer/><InstallAppPrompt/>
 </LivePublicContent>;
}
