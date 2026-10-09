import {ImageResponse} from "next/og";

/** Minimal cream installation icon to avoid a giant dark badge on Android startup.
 * The system splash itself is native Android behavior for an installed PWA. */
export function renderPwaIcon(size:192|512,maskable=false):ImageResponse{
 const heartSide=Math.round(size*(maskable?.19:.22));
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
   background:"#F6EFE5",position:"relative"}}>
    <svg xmlns="http://www.w3.org/2000/svg" width={heartSide} height={heartSide} viewBox="0 0 64 64">
     <path d="M9 27C9 13 25 9 32 20C39 9 55 13 55 27C55 41 32 55 32 55S9 41 9 27Z"
      fill="none" stroke="#583C30" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
     <path d="M19 10C23 8 28 8 32 11C36 8 41 8 45 10"
      fill="none" stroke="#E5B696" strokeWidth="2.6" strokeLinecap="round"/>
     <path d="M21 27C23 22 27 20 32 24" fill="none" stroke="#E5B696" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  </div>,{width:size,height:size,headers:{"Cache-Control":"public, max-age=86400"}}
 );
}
