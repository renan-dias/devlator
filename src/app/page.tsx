import Link from "next/link";
import {
  FaArrowRight,
  FaBalanceScale,
  FaChartLine,
  FaClock,
  FaFileExport,
  FaLock,
  FaRobot,
} from "react-icons/fa";
import TypingGreeting from "@/components/TypingGreeting";
import JsonLd from "@/components/JsonLd";
import { MARKET_SOURCES, MARKET_UPDATED_AT, PROJECT_TYPES, SENIORITY, formatBRL } from "@/lib/market-data";
import { DEFAULT_PROFILE, estimate } from "@/lib/estimator";
import { SITE } from "@/lib/site";

/** Exemplo real calculado pelo mesmo motor da calculadora. */
const EXAMPLE = estimate(
  {
    tipo: "webapp", escopo: "medio", design: "simples", responsividade: "basica", autenticacao: "simples",
    complexidade: "intermediario", integracao: "poucas", banco: "relacional", hospedagem: "cloud_basico",
    performance: "boa", seguranca: "lgpd", testes: "basicos", documentacao: "tecnica", tecnologia: "domino",
    experiencia: "intermediaria", equipe: "solo", dedicacao: "full_time", prazo: "normal",
    flexibilidade_escopo: "pequenas", manutencao: "garantia",
  },
  DEFAULT_PROFILE,
);
const examplePos = (v: number) => {
  const { min, max } = EXAMPLE.market.range;
  return `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`;
};

const FAQ = [
  {
    q: "Quanto cobrar por um site ou sistema como freelancer?",
    a: "Estime as horas do projeto, multiplique pelo seu valor-hora e some uma reserva para riscos e os impostos. O Devlator faz essa conta a partir de perguntas sobre escopo, design, integrações, prazo e equipe, e compara o resultado com as faixas praticadas no mercado brasileiro.",
  },
  {
    q: "Qual o valor-hora médio de um programador no Brasil?",
    a: `Como freelancer ou PJ, a média fica perto de ${formatBRL(SENIORITY.junior.rate.typical)}/h para júnior, ${formatBRL(SENIORITY.pleno.rate.typical)}/h para pleno e ${formatBRL(SENIORITY.senior.rate.typical)}/h para sênior nas capitais. No interior os valores costumam ser ~15% menores, e em SP/RJ ~15% maiores.`,
  },
  {
    q: "De onde vêm os valores de mercado?",
    a: `De pesquisas salariais (Código Fonte TV) e tabelas públicas de preço de agências e freelancers, revisadas em ${MARKET_UPDATED_AT}. As fontes estão listadas na página de metodologia.`,
  },
  {
    q: "Preciso criar conta? Meus dados ficam salvos?",
    a: "Não precisa de conta. Seu perfil, rascunhos e histórico de estimativas ficam salvos apenas no seu navegador (localStorage). Nada é enviado a um banco de dados.",
  },
  {
    q: "A estimativa depende de IA?",
    a: "Não. O preço é calculado por um modelo transparente de horas × valor-hora, que funciona até offline. A IA (Gemini) é opcional e só comenta a estimativa, aponta riscos e responde dúvidas no chat.",
  },
];

const FEATURES = [
  { icon: FaClock, title: "Horas, não chute", text: "Cada resposta soma horas ou percentuais visíveis. Você vê exatamente de onde veio cada real." },
  { icon: FaBalanceScale, title: "Comparado ao mercado", text: "Seu preço e seu valor-hora são posicionados contra faixas reais de agências e freelancers." },
  { icon: FaChartLine, title: "Prazo realista", text: "Calcula semanas de trabalho pela sua dedicação e equipe, e avisa quando o prazo do cliente não fecha." },
  { icon: FaRobot, title: "Análise com IA", text: "O Devinho revisa a estimativa, aponta riscos e ajuda a negociar — com contexto do seu projeto." },
  { icon: FaFileExport, title: "Proposta pronta", text: "Exporte um resumo em PDF ou texto com escopo, fases, prazo e condições de pagamento." },
  { icon: FaLock, title: "Privado por padrão", text: "Sem cadastro. Perfil e histórico ficam só no seu navegador." },
];

export default function HomePage() {
  const types = Object.values(PROJECT_TYPES);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              inLanguage: "pt-BR",
              offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
              author: { "@type": "Person", name: SITE.author },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />

      {/* Hero */}
      <section className="relative grid items-center gap-10 py-8 md:grid-cols-[1.15fr_1fr] md:py-16">
        <div>
          <TypingGreeting />
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Saiba <span className="bg-gradient-to-r from-purple via-pink to-orange bg-clip-text text-transparent">quanto cobrar</span> pelo seu próximo projeto.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            A calculadora de preço para devs brasileiros: estima horas, valor-hora, prazo e impostos — e compara com a média do mercado para sites, apps, e-commerces e sistemas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/calculadora" className="btn-primary text-base">
              Calcular meu projeto <FaArrowRight aria-hidden />
            </Link>
            <Link href="/valor-hora" className="btn-secondary text-base">
              Descobrir meu valor-hora
            </Link>
          </div>
          <p className="mt-4 text-xs text-subtle">Grátis · sem cadastro · leva ~2 minutos</p>
        </div>

        {/* Preview da estimativa */}
        <div className="relative">
          <div aria-hidden className="absolute -inset-6 -z-10 animate-float rounded-full bg-purple/20 blur-3xl" />
          <div className="card p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Exemplo</span>
              <span className="chip">Aplicação web · pleno</span>
            </div>
            <p className="mt-4 text-sm text-muted">Preço recomendado</p>
            <p className="font-mono text-4xl font-bold text-green">{formatBRL(EXAMPLE.price.recommended)}</p>
            <p className="mt-1 text-sm text-muted">
              faixa {formatBRL(EXAMPLE.price.min)} – {formatBRL(EXAMPLE.price.max)}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                [`${EXAMPLE.hours.likely}h`, "horas"],
                [formatBRL(EXAMPLE.rate.value), "por hora"],
                [`${EXAMPLE.timeline.weeks} sem.`, "prazo"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-bg-soft p-3">
                  <p className="font-mono font-semibold">{v}</p>
                  <p className="text-xs text-subtle">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-subtle">
                <span>Mercado {formatBRL(EXAMPLE.market.range.min, true)}</span>
                <span>{formatBRL(EXAMPLE.market.range.max, true)}</span>
              </div>
              <div className="relative mt-2 h-2 rounded-full bg-gradient-to-r from-cyan/40 via-green/50 to-orange/40">
                <span
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-green"
                  style={{ left: examplePos(EXAMPLE.price.recommended) }}
                />
              </div>
              <p className="mt-2 text-xs text-green">
                {EXAMPLE.market.position === "within" ? "Dentro da faixa de mercado" : EXAMPLE.market.position === "below" ? "Abaixo do mercado" : "Acima do mercado"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="recursos" className="py-12">
        <p className="eyebrow">Por que usar</p>
        <h2 id="recursos" className="mt-2 text-3xl font-bold tracking-tight">Precificação com método, não com achismo</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 transition hover:border-purple/50">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple/15 text-purple">
                <Icon aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabela de mercado */}
      <section aria-labelledby="tabela" className="py-12">
        <p className="eyebrow">Referência {MARKET_UPDATED_AT}</p>
        <h2 id="tabela" className="mt-2 text-3xl font-bold tracking-tight">Quanto custa desenvolver software no Brasil</h2>
        <p className="mt-3 max-w-3xl text-muted">
          Faixas praticadas por freelancers e agências. O valor típico é o ponto médio mais comum; o seu depende de escopo, prazo e experiência.
        </p>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Faixas de preço por tipo de projeto</caption>
            <thead className="border-b border-line text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Projeto</th>
                <th scope="col" className="px-5 py-3 font-medium">A partir de</th>
                <th scope="col" className="px-5 py-3 font-medium">Típico</th>
                <th scope="col" className="px-5 py-3 font-medium">Até</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.label} className="border-b border-line/60 last:border-0">
                  <th scope="row" className="px-5 py-3 font-medium">{t.label}</th>
                  <td className="px-5 py-3 font-mono text-muted">{formatBRL(t.market.min)}</td>
                  <td className="px-5 py-3 font-mono text-green">{formatBRL(t.market.typical)}</td>
                  <td className="px-5 py-3 font-mono text-muted">{formatBRL(t.market.max)}+</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-10 text-xl font-semibold">Valor-hora de desenvolvedores (freelancer/PJ, capitais)</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.values(SENIORITY).map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-1 font-mono text-2xl font-bold">{formatBRL(s.rate.typical)}<span className="text-sm font-normal text-subtle">/h</span></p>
              <p className="text-xs text-subtle">{formatBRL(s.rate.min)} – {formatBRL(s.rate.max)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-subtle">
          Fontes:{" "}
          {MARKET_SOURCES.slice(0, 4).map((s, i) => (
            <span key={s.url}>
              {i > 0 && " · "}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-muted">
                {s.label.split(" — ")[1] ?? s.label}
              </a>
            </span>
          ))}{" "}
          · <Link href="/sobre" className="underline underline-offset-2 hover:text-muted">ver metodologia completa</Link>
        </p>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="py-12">
        <p className="eyebrow">Dúvidas</p>
        <h2 id="faq" className="mt-2 text-3xl font-bold tracking-tight">Perguntas frequentes</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-5 open:border-purple/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-purple transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card mt-8 flex flex-col items-center gap-4 bg-gradient-to-br from-purple/15 to-green/10 p-10 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Pare de cobrar no escuro.</h2>
        <p className="max-w-xl text-muted">Responda algumas perguntas e saia com um preço defendível, um prazo realista e argumentos de mercado para negociar.</p>
        <Link href="/calculadora" className="btn-primary text-base">
          Começar agora <FaArrowRight aria-hidden />
        </Link>
      </section>
    </>
  );
}
