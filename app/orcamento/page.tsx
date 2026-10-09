import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { QuoteIntro } from "@/components/quote/QuoteIntro";
export const metadata:Metadata={title:"Orçamento",description:"Conte sobre seu evento e prepare uma mensagem personalizada para conversar com o Buffet Sabor com Amor."};
export default function QuotePage(){return <section className="quote-page"><div className="container quote-layout"><QuoteIntro/><QuoteForm/></div></section>}
