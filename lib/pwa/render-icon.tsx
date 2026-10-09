import {ImageResponse} from "next/og";

/**
 * Android automatically shows this installed app icon on launch.
 * Use the same light color as its system background, with only a subtle
 * wordmark: no extra coffee-colored disc or illustrative heart splash.
 * PWA stays installable; the OS-managed brief startup screen still exists.
 */
export function renderPwaIcon(size:192|512,maskable=false):ImageResponse{
 const fontSize=Math.round(size*(maskable?.118:.133));
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
   justifyContent:"center",background:"#F6EFE5"}}>
   <div style={{display:"flex",flexDirection:"column",alignItems:"center",
    justifyContent:"center",gap:Math.round(size*.013),color:"#583C30"}}>
    <div style={{fontFamily:"Georgia,serif",fontSize:fontSize+6,lineHeight:1.05,
     letterSpacing:"-1px"}}>Sabor</div>
    <div style={{fontFamily:"Georgia,serif",fontSize:fontSize,lineHeight:1.08,
     fontStyle:"italic",letterSpacing:"-1px"}}>com Amor</div>
    <div style={{height:Math.max(1,Math.round(size*.004)),width:Math.round(size*.27),
     background:"#B87655",marginTop:Math.round(size*.025)}}/>
   </div>
  </div>,{width:size,height:size,headers:{"Cache-Control":"public, max-age=86400"}}
 );
}
