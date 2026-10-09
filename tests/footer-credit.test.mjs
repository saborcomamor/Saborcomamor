import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("rodapé termina com crédito Marcela Queji, com link externo seguro",()=>{
 const component=read("components/ui/Footer.tsx");
 const css=read("styles/Footer.css");
 assert.match(component,/className="footer-credit"/);
 assert.match(component,/Desenvolvido por/);
 assert.match(component,/href="https:\/\/nobron\.com\.br"/);
 assert.match(component,/target="_blank"/);
 assert.match(component,/rel="noopener noreferrer"/);
 assert.match(component,/>Marcela Queji<\/a>/);
 assert.ok(component.indexOf('className="footer-credit"')>component.indexOf('className="footer-bottom"'));
 assert.match(css,/\.footer-credit\{/);
 assert.match(css,/\.footer-credit a:focus-visible/);
});
