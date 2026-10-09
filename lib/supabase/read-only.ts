import {createClient} from "@supabase/supabase-js";
/** Public, read-only Supabase REST client. The public key is not a secret.
 * For Next.js, keep these reads uncacheable so edits in the CMS reach visitors. */
export function getPublicDatabase(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 return createClient(url,key,{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
  global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store"})}
 });
}
