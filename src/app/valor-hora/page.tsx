import type { Metadata } from "next";
import RateCalculator from "@/components/RateCalculator";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Calculadora de valor-hora para programador freelancer",
  description:
    "Descubra quanto cobrar por hora como desenvolvedor PJ ou freelancer: considera renda desejada, custos, impostos, férias e 13º, e compara com a média de júnior, pleno e sênior.",
  alternates: { canonical: "/valor-hora" },
  openGraph: { url: "/valor-hora" },
};

export default function ValorHoraPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Como calcular o valor-hora de um desenvolvedor freelancer",
          inLanguage: "pt-BR",
          url: `${SITE.url}/valor-hora`,
          step: [
            { "@type": "HowToStep", text: "Defina quanto quer receber por mês, líquido." },
            { "@type": "HowToStep", text: "Some os custos mensais do trabalho e a reserva de 13º e férias." },
            { "@type": "HowToStep", text: "Divida o total anual, acrescido dos impostos, pelas horas faturáveis do ano." },
          ],
        }}
      />
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow">Ferramenta</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Quanto cobrar por hora?</h1>
        <p className="mt-3 text-muted">
          Calcule o valor-hora que paga suas contas, seus impostos e suas férias — e veja onde ele fica frente ao mercado brasileiro.
        </p>
      </div>
      <RateCalculator />
      <section className="mt-12 max-w-3xl space-y-3 text-sm text-muted">
        <h2 className="text-lg font-semibold text-fg">Como o cálculo funciona</h2>
        <p>
          Somamos sua renda desejada, os custos do trabalho e (opcionalmente) a reserva de 13º e férias ao longo de 12 meses. Esse total é
          acrescido dos impostos e dividido pelas horas que você realmente consegue faturar no ano — descontando férias e cerca de duas semanas de
          feriados.
        </p>
        <p>
          Poucos freelancers faturam 8 horas por dia: reuniões, propostas, e-mails e estudo consomem tempo. Por isso o padrão é 6h faturáveis.
        </p>
      </section>
    </>
  );
}
