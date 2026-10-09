import { z } from "zod";
export const serviceLabels = {buffet:"Buffet completo",cozinha:"Somente preparo da refeição",coquetel:"Coquetel completo",utensilios:"Aluguel de utensílios"} as const;
export type Service = keyof typeof serviceLabels;
export const quoteSchema=z.object({
 services:z.array(z.enum(["buffet","cozinha","coquetel","utensilios"])).min(1),
 name:z.string().trim().min(2).max(100),
 phone:z.string().trim().min(10).max(25),
 guests:z.union([z.coerce.number<number>().int().min(1).max(100000),z.literal("indefinido")]),
 date:z.string().max(10).optional(),
 city:z.string().trim().max(100).optional(),
});
export type Quote=z.infer<typeof quoteSchema>;
export function formatQuote(input:Quote){
 return ["Olá! Gostaria de conversar sobre um orçamento com o Buffet Sabor com Amor. 🤎","",
 `Nome: ${input.name}`,`WhatsApp: ${input.phone}`,
 `Serviços: ${input.services.map(s=>serviceLabels[s]).join(", ")}`,
 `Data: ${input.date||"Ainda não definida"}`,
 `Local: ${input.city||"Ainda não definido"}`,
 `Convidados: ${input.guests==="indefinido"?"Ainda não definido":input.guests}`,
 ...(input.services.includes("utensilios")?["Gostaria também de consultar os utensílios disponíveis."]:[])
 ].join("\n");
}
