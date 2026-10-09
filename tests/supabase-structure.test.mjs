import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const base=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,base),"utf8");
test("Supabase tem migrações distintas e proteção de publicação",()=>{
 for(const id of ["202610090001_sabor_com_amor_core.sql","202610090002_harden_public_api.sql","202610090003_register_private_originals.sql"])
  assert.ok(existsSync(new URL(`supabase/migrations/${id}`,base)));
 const core=read("supabase/migrations/202610090001_sabor_com_amor_core.sql");
 assert.match(core,/ENABLE ROW LEVEL SECURITY/);
 assert.match(core,/check_photo_publication/);
 assert.match(core,/check_testimonial_publication/);
 assert.match(core,/sabor-originais/);
 assert.match(core,/sabor-publicadas/);
 const harden=read("supabase/migrations/202610090002_harden_public_api.sql");
 assert.match(harden,/REVOKE EXECUTE ON FUNCTION public\.approve_photo_rights\(uuid,text\) FROM anon/);
});
test("painel é modular, não cria usuário nem usa segredo de serviço",()=>{
 for(const n of ["AdminDashboard","AdminSignIn","PhotoUploader","AdminPhotos","AdminGallery","AdminSiteMedia","AdminServices"])
  assert.ok(existsSync(new URL(`components/admin/${n}.tsx`,base)),n);
 const ts=read("lib/supabase/browser.ts");
 assert.ok(ts.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"));
 assert.ok(!ts.includes("service_role"));
 assert.match(read("components/admin/AdminDashboard.tsx"),/rpc\("is_site_admin"\)/);
 assert.ok(!read("components/admin/AdminSignIn.tsx").includes("signUp"));
});
test("next/image e CSP aceitam apenas Storage autorizado",()=>{
 const cfg=read("next.config.ts");
 assert.match(cfg,/\/storage\/v1\/object\/public\/\*\*/);
 assert.match(cfg,/connect-src/);
});
