import { test } from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
test("não há endpoints de armazenamento ou painel falso no estágio público",()=>{
 assert.ok(!read("components/quote/QuoteForm.tsx").includes("fetch("));
 assert.ok(!read("components/quote/QuoteForm.tsx").includes("localStorage"));
 assert.ok(read("docs/SEGURANCA.md").includes("Sem contas de usuário"));
});
test("política distingue mensagem de WhatsApp de armazenamento",()=>{
 assert.ok(read("app/privacidade/page.tsx").includes("não são armazenadas no servidor"));
 assert.ok(read("app/cookies/page.tsx").includes("sessão"));
});
test("cabecalhos de segurança existem e CSP não permite origens de script externas",()=>{
 const config=read("next.config.ts");
 for(const header of ["Content-Security-Policy","X-Content-Type-Options","Strict-Transport-Security","Referrer-Policy","X-Frame-Options"]) assert.ok(config.includes(header));
 assert.ok(config.includes("script-src 'self'"));
});
test("o telefone é opcional, não há número inventado ou segredo fixo",()=>{
 const site=read("lib/site.ts");const env=read(".env.example");
 assert.ok(site.includes("NEXT_PUBLIC_WHATSAPP_NUMBER"));
 assert.match(env,/NEXT_PUBLIC_WHATSAPP_NUMBER=\s*\n/);
});
