"use client";
import {createContext,useContext,type ReactNode} from "react";
import {type VisualSettings,defaultVisual} from "./public-dynamic";
const VisualContext=createContext<VisualSettings>(defaultVisual);
export function VisualProvider({value,children}:{value:VisualSettings;children:ReactNode}){
 return <VisualContext.Provider value={value}>{children}</VisualContext.Provider>;
}
export const useVisualSettings=()=>useContext(VisualContext);
