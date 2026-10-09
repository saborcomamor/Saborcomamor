"use client";
import {getSupabaseBrowser} from "@/lib/supabase/browser";
/** Rebuild a public derivative from the original PRIVATE upload; no upscaling. */
export async function makeQualityWebp(input:Blob,maxSide=3000){
 const bitmap=await createImageBitmap(input);
 try{
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  let width=Math.max(1,Math.round(bitmap.width*scale));
  let height=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement("canvas");
  const encode=async()=>{
   canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext("2d");
   if(!ctx)throw new Error("Seu navegador não permite preparar a imagem.");
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
   ctx.drawImage(bitmap,0,0,width,height);
   let blob:Blob|null=null;
   for(const q of [.95,.91,.87,.82,.76]){
    blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",q));
    if(blob&&blob.type==="image/webp"&&blob.size<=3*1024*1024)return blob;
   }
   return blob;
  };
  for(let round=0;round<4;round++){
   const blob=await encode();
   if(blob?.type==="image/webp"&&blob.size<=3*1024*1024)
    return {blob,width,height,originalWidth:bitmap.width,originalHeight:bitmap.height};
   width=Math.round(width*.82);height=Math.round(height*.82);
  }
  throw new Error("Foto muito grande para publicação. Tente outra imagem.");
 }finally{bitmap.close();}
}
export async function improvePhotoQuality(photoId:string){
 const db=getSupabaseBrowser();if(!db)throw new Error("Sem conexão.");
 const {data:privatePath,error:lookupError}=await db.rpc("get_photo_original_path",{p_photo_id:photoId});
 if(lookupError||!privatePath)throw new Error("Original privado indisponível.");
 const {data:original,error:downloadError}=await db.storage.from("sabor-originais").download(privatePath);
 if(downloadError||!original)throw new Error("Não foi possível abrir o original.");
 const file=await makeQualityWebp(original,3000);
 const dest=photoId+"/gallery-"+crypto.randomUUID()+".webp";
 const {error:uploadError}=await db.storage.from("sabor-publicadas").upload(dest,file.blob,{
  contentType:"image/webp",cacheControl:"31536000",upsert:false
 });
 if(uploadError)throw new Error("Falha ao carregar a imagem de alta qualidade.");
 const {error:saveError}=await db.rpc("register_highres_photo",{
  p_photo_id:photoId,p_path:dest,p_width:file.width,p_height:file.height
 });
 if(saveError)throw new Error("Imagem enviada, mas não foi possível vincular a nova versão.");
 return {width:file.width,height:file.height,originalWidth:file.originalWidth,originalHeight:file.originalHeight};
}
