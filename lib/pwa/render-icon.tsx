import {ImageResponse} from "next/og";

/** Self-contained PNG icon; no remote images, cookies, or storage privileges. */
export function renderPwaIcon(size:192|512,maskable=false):ImageResponse{
 const heartSide=Math.round(size*(maskable?.37:.48));
 const topBorder=Math.round(size*(maskable?.065:.07));
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
   background:"#583c30",position:"relative"}}>
   <div style={{width:size-topBorder*2,height:size-topBorder*2,
    border:"2px solid rgba(246,239,229,.28)",
    borderRadius:Math.round(size*.19),display:"flex",alignItems:"center",justifyContent:"center"}}>
    <svg xmlns="http://www.w3.org/2000/svg" width={heartSide} height={heartSide} viewBox="0 0 64 64">
     <path d="M9 27C9 13 25 9 32 20C39 9 55 13 55 27C55 41 32 55 32 55S9 41 9 27Z"
      fill="none" stroke="#F6EFE5" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
     <path d="M19 10C23 8 28 8 32 11C36 8 41 8 45 10"
      fill="none" stroke="#E5B696" strokeWidth="2.6" strokeLinecap="round"/>
     <path d="M21 27C23 22 27 20 32 24" fill="none" stroke="#E5B696" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
   </div>
  </div>,{width:size,height:size,headers:{"Cache-Control":"public, max-age=86400"}}
 );
}
