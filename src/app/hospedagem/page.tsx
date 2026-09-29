import type { Metadata } from "next";
import Link from "next/link";
import HostingComparison from "@/components/HostingComparison";
import JsonLd from "@/components/JsonLd";
import { HOSTING_PLANS, HOSTING_UPDATED_AT, PROVIDERS } from "@/lib/hosting-data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comparativo de hospedagem: Hostinger, Locaweb e HostGator",
  description:
    "Compare o custo real de hospedagem de sites e VPS na Hostinger, Locaweb e HostGator: preço promocional, pagamento adiantado, renovação e total em 1 a 4 anos.",
  alternates: { canonical: "/hospedagem" },
  openGraph: { url: "/hospedagem" },
};

export default function HospedagemPage() {
  const cheapestEntry = HOSTING_PLANS.filter((p) => p.category === "compartilhada" && p.tier === "entrada")
    .map((p) => Math.min(...p.offers.map((o) => o.promo)))
    .sort((a, b) => a - b)[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Planos de hospedagem comparados",
          url: `${SITE.url}/hospedagem`,
          itemListElement: HOSTING_PLANS.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: `${PROVIDERS[p.provider].name} ${p.name}`,
              description: p.specs,
              brand: { "@type": "Brand", name: PROVIDERS[p.provider].name },
              offers: {
                "@type": "Offer",
                priceCurrency: "BRL",
                price: Math.min(...p.offers.map((o) => o.promo)).toFixed(2),
                url: PROVIDERS[p.provider].url[p.category],
              },
            },
          })),
        }}
      />
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow">Atualizado em {HOSTING_UPDATED_AT}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Quanto custa hospedar de verdade?</h1>
        <p className="mt-3 text-muted">
          Os anúncios mostram preços a partir de R$ {cheapestEntry.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês, mas exigem pagar anos adiantados e
          renovam pelo preço cheio. Aqui você vê o total real em cada período.
        </p>
      </div>
      <HostingComparison />
      <section className="mt-12 max-w-3xl space-y-3 text-sm text-muted">
        <h2 className="text-lg font-semibold text-fg">Como ler o comparativo</h2>
        <p>
          <strong className="text-fg">Promoção</strong> é o preço mensal equivalente no primeiro ciclo. <strong className="text-fg">Pagamento adiantado</strong> é
          quanto você paga de uma vez para ter esse preço. Depois do ciclo, o plano renova automaticamente pelo valor da coluna{" "}
          <strong className="text-fg">Renovação</strong>.
        </p>
        <p>
          Hospedagem compartilhada atende sites e lojas em WordPress/PHP. Aplicações em Node.js, Python ou com processos em segundo plano costumam precisar de VPS.
          Quer saber quanto cobrar pelo projeto? <Link href="/calculadora" className="text-purple hover:underline">Use a calculadora</Link> — o comparativo aparece no
          final da estimativa e na proposta em PDF.
        </p>
      </section>
    </>
  );
}
