import type { Metadata } from "next";
import Link from "next/link";
import { MARKET_SOURCES, MARKET_UPDATED_AT, PROJECT_TYPES, REGIONS, SENIORITY, formatBRL } from "@/lib/market-data";
import { AI_PRICES_UPDATED_AT, AI_SOURCES } from "@/lib/ai-tools";
import { HOSTING_SOURCES, HOSTING_UPDATED_AT } from "@/lib/hosting-data";

export const metadata: Metadata = {
  title: "Metodologia e fontes",
  description:
    "Como o Devlator calcula o preço de um projeto de software: horas por tipo de projeto, valor-hora por senioridade e região, contingência, urgência, impostos e fontes de mercado.",
  alternates: { canonical: "/sobre" },
  openGraph: { url: "/sobre" },
};

const STEPS = [
  ["Horas-base", "Cada tipo de projeto tem um volume típico de horas para um escopo padrão feito por um dev pleno (ex.: landing page 16h, aplicação web 220h). O tamanho do escopo escala esse número."],
  ["Funcionalidades", "Login, integrações, banco de dados, pagamentos, CMS e infraestrutura somam horas fixas. Design, complexidade, testes, segurança e experiência somam percentuais — uma única vez, sem multiplicar fatores em cadeia."],
  ["Equipe", "Mais pessoas reduzem o prazo, mas adicionam horas de coordenação (8% a 22%)."],
  ["Valor-hora", "Usamos o seu valor-hora ou a média de mercado da sua senioridade, ajustada pela região dos seus clientes."],
  ["Risco e urgência", "Uma reserva de contingência (5% a 35%) cobre escopo indefinido. Prazos apertados recebem adicional de urgência (10% a 50%)."],
  ["Ferramentas de IA (opcional)", "Se você usa IA para programar, as assinaturas (Copilot, Cursor, Claude, ChatGPT, Lovable, Bolt, v0, Replit) entram pelo período do projeto. Planos em dólar usam o câmbio do dia e IOF de 3,5%. Você escolhe repassar ao cliente ou absorver, e pode ajustar o efeito da IA nas horas — que começa em 0% porque os estudos divergem."],
  ["Impostos", "O preço final é bruto: o valor líquido é dividido por (1 − alíquota), para que você receba o que planejou depois da nota fiscal."],
  ["Comparação", "O resultado é posicionado nas faixas públicas de preço do tipo de projeto e o seu valor-hora nas faixas do seu perfil."],
];

export default function SobrePage() {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="eyebrow">Metodologia</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Como o Devlator calcula</h1>
      <p className="mt-4 text-lg text-muted">
        O preço é resultado de um modelo aberto de <strong className="text-fg">horas × valor-hora</strong>, ajustado por risco, urgência e impostos. A IA
        não define o número — ela só comenta, aponta riscos e responde dúvidas.
      </p>

      <ol className="mt-10 space-y-4">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="card flex gap-4 p-5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-purple/15 font-mono text-sm text-purple">{i + 1}</span>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="card mt-8 p-5 font-mono text-sm text-muted">
        preço = [(horas-base × escopo + horas fixas) × (1 + ajustes) × (1 + coordenação) × (1 − efeito da IA) × valor-hora × (1 + urgência) × (1 + contingência) + ferramentas de IA repassadas] ÷ (1 − impostos)
      </div>

      <h2 className="mt-12 text-2xl font-bold">Parâmetros atuais</h2>
      <p className="mt-2 text-sm text-subtle">Revisados em {MARKET_UPDATED_AT}.</p>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <caption className="sr-only">Horas-base e faixas de mercado por tipo de projeto</caption>
          <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Tipo</th>
              <th scope="col" className="px-4 py-3 font-medium">Horas-base</th>
              <th scope="col" className="px-4 py-3 font-medium">Faixa de mercado</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(PROJECT_TYPES).map((t) => (
              <tr key={t.label} className="border-b border-line/60 last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-medium">{t.label}</th>
                <td className="px-4 py-3 font-mono">{t.baseHours}h</td>
                <td className="px-4 py-3 font-mono text-muted">{formatBRL(t.market.min)} – {formatBRL(t.market.max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-semibold">Valor-hora por senioridade</h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {Object.values(SENIORITY).map((s) => (
              <li key={s.label} className="flex justify-between gap-2">
                <span className="text-muted">{s.label}</span>
                <span className="font-mono">{formatBRL(s.rate.min)}–{formatBRL(s.rate.max)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-subtle">
            Derivado das médias CLT (júnior {formatBRL(SENIORITY.junior.cltMonthly!)}, pleno {formatBRL(SENIORITY.pleno.cltMonthly!)}, sênior{" "}
            {formatBRL(SENIORITY.senior.cltMonthly!)}) × 1,4 (PJ) × 1,6 (horas não faturáveis), cruzado com faixas publicadas.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Ajuste regional</h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {Object.values(REGIONS).map((r) => (
              <li key={r.label} className="flex justify-between gap-2">
                <span className="text-muted">{r.label}</span>
                <span className="font-mono">{r.factor}×</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-12 text-2xl font-bold">Fontes</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {MARKET_SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan underline-offset-2 hover:underline">
              {s.label}
            </a>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 font-semibold">Ferramentas de IA — preços de {AI_PRICES_UPDATED_AT}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {AI_SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan underline-offset-2 hover:underline">{s.label}</a>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 font-semibold">Hospedagem — preços de {HOSTING_UPDATED_AT}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {HOSTING_SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan underline-offset-2 hover:underline">{s.label}</a>
          </li>
        ))}
      </ul>

      <div className="card mt-12 p-6">
        <h2 className="font-semibold">Limitações</h2>
        <p className="mt-2 text-sm text-muted">
          Nenhuma calculadora substitui a análise de requisitos. Use o resultado como ponto de partida para a proposta, ajuste pelo seu histórico
          real de horas e revise os parâmetros quando o mercado mudar. Encontrou um número desatualizado?{" "}
          <a href="https://github.com/renan-dias/devlator/issues" target="_blank" rel="noopener noreferrer" className="text-purple hover:underline">
            Abra uma issue
          </a>
          .
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/calculadora" className="btn-primary">Fazer uma estimativa</Link>
      </div>
    </article>
  );
}
