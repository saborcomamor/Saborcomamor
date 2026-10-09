# Contrato de arquitetura modular

- Um `page.tsx` por tela/rota.
- Um `.tsx` por seção.
- Uma rotina `*.motion.ts` por efeito complexo.
- Componentes reutilizáveis em `components/ui`.
- APIs e validação em `app/api` e `lib/validation`.
- Banco, autorização, uploads e configurações de segurança fora do client bundle.
- TypeScript strict, testes e feature flags.
- Somente código revisado pode alcançar produção.

Consulte `Sabor_com_Amor_Guia_Mestre.pdf` para o contexto completo.
