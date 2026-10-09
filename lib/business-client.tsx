"use client";
import {createContext,useContext,type ReactNode} from "react";
import {type BusinessProfile,defaultBusiness} from "./public-dynamic";
const BusinessContext=createContext<BusinessProfile>(defaultBusiness);
export function BusinessProvider({profile,children}:{profile:BusinessProfile;children:ReactNode}){
 return <BusinessContext.Provider value={profile}>{children}</BusinessContext.Provider>;
}
export function useBusinessProfile(){return useContext(BusinessContext);}
