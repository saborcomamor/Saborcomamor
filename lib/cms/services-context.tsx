"use client";
import {createContext,useContext,type ReactNode} from "react";
export type PublicService={code:string;title:string;summary:string};
export type PublishedServices=Record<string,PublicService>;
const ServiceContext=createContext<PublishedServices>({});
export function ServicesProvider({services,children}:{services:PublishedServices;children:ReactNode}){
 return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}
export function usePublishedServices(){return useContext(ServiceContext);}
