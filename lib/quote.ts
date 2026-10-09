import { z } from "zod";
export const quoteSchema = z.object({
  service: z.enum(["buffet", "cozinha"]),
  event: z.enum(["aniversario", "casamento", "confraternizacao", "corporativo", "outro"]),
  guests: z.coerce.number<number>().int().min(1).max(100000),
  date: z.string().max(10).optional(),
  city: z.string().trim().min(2).max(100),
  message: z.string().trim().max(1000).optional(),
});
export type Quote = z.infer<typeof quoteSchema>;
export const eventLabels: Record<Quote["event"],string> = {
  aniversario:"Aniversário", casamento:"Casamento", confraternizacao:"Confraternização",
  corporativo:"Evento corporativo", outro:"Outro evento"
};
export function formatQuote(input: Quote) {
  return ["Olá! Gostaria de um orçamento do Sabor com Amor. 💛", "",
    `Serviço: ${input.service === "buffet" ? "Buffet completo" : "Somente serviço de cozinha"}`,
    `Evento: ${eventLabels[input.event]}`, `Convidados: ${input.guests}`,
    `Data: ${input.date || "A definir"}`, `Cidade/local: ${input.city}`,
    `Observações: ${input.message || "Nenhuma"}`].join("\n");
}
