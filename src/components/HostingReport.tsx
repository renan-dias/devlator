"use client";
import { FaCrown, FaExclamationTriangle, FaServer } from "react-icons/fa";
import {
  HOSTING_UPDATED_AT,
  PROVIDERS,
  compareHosting,
  type HostingCategory,
  type HostingSelection,
} from "@/lib/hosting-data";
import { PROJECT_TYPES, formatBRL, type ProjectType } from "@/lib/market-data";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

const CATEGORY_LABEL: Record<HostingCategory, string> = { compartilhada: "Hospedagem de sites", vps: "Servidor VPS" };

interface Props {
  selection: HostingSelection;
  onChange: (selection: HostingSelection) => void;
  projectType?: ProjectType;
  /** id do título, para links âncora */
  headingId?: string;
}

export default function HostingReport({ selection, onChange, projectType, headingId = "hospedagem" }: Props) {
  const { category, horizonYears } = selection;
  const months = horizonYears * 12;
  const tiers = compareHosting(category, horizonYears);
  const needsServer = projectType && ["webapp", "saas", "sistema", "api", "mobile"].includes(projectType);

  return (
    <section className="card p-6" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id={headingId} className="flex items-center gap-2 font-semibold">
            <FaServer className="text-purple" aria-hidden /> Relatório de hospedagem: Hostinger × Locaweb × HostGator
          </h2>
          <p className="mt-1 text-sm text-muted">
            Custo real em {horizonYears} {horizonYears === 1 ? "ano" : "anos"}, somando o ciclo promocional pago adiantado e as renovações pelo preço cheio.
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Tipo de hospedagem" className="inline-flex rounded-xl border border-line bg-bg-soft p-1">
            {(["compartilhada", "vps"] as HostingCategory[]).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => onChange({ ...selection, category: c })}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${category === c ? "bg-panel-2 text-fg" : "text-muted hover:text-fg"}`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            Período
            <select
              className="input !w-auto !py-1.5"
              value={horizonYears}
              onChange={(e) => onChange({ ...selection, horizonYears: Number(e.target.value) })}
            >
              {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{y} {y === 1 ? "ano" : "anos"}</option>)}
            </select>
          </label>
        </div>
      </div>

      {projectType && (
        <p className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${needsServer && category === "compartilhada" ? "border border-orange/40 bg-orange/10 text-orange" : "bg-bg-soft text-muted"}`}>
          {needsServer && category === "compartilhada" && <FaExclamationTriangle className="mt-0.5 shrink-0" aria-hidden />}
          {needsServer
            ? category === "compartilhada"
              ? `${PROJECT_TYPES[projectType].label} normalmente precisa de servidor próprio (Node.js, Python, filas, WebSockets). Hospedagem compartilhada é pensada para sites PHP/WordPress — prefira VPS.`
              : `Para ${PROJECT_TYPES[projectType].label.toLowerCase()}, uma VPS dá controle do servidor (Node.js, Python, banco, filas). Some o custo de administrar o servidor ou uma plataforma gerenciada.`
            : `Para ${PROJECT_TYPES[projectType].label.toLowerCase()}, a hospedagem compartilhada costuma bastar e já inclui e-mail, SSL e WordPress.`}
        </p>
      )}

      <div className="mt-6 space-y-8">
        {tiers.map(({ tier, label, quotes, cheapest }) => (
          <div key={tier}>
            <h3 className="text-sm font-semibold">{label}</h3>
            {/* Celular: cartões com o total em destaque */}
            <ul className="mt-3 space-y-3 md:hidden">
              {quotes.map((q) => {
                const best = q === cheapest;
                const cycleTotal = q.offer.promoTotal ?? q.offer.promo * q.offer.cycleMonths;
                return (
                  <li key={q.plan.id} className={`rounded-xl border p-4 ${best ? "border-green/40 bg-green/5" : "border-line bg-bg-soft/60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a href={PROVIDERS[q.plan.provider].url[category]} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-purple">
                          {PROVIDERS[q.plan.provider].name} · {q.plan.name}
                        </a>
                        <p className="text-xs text-subtle">{q.plan.specs}</p>
                      </div>
                      {best && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green/15 px-2 py-0.5 text-[11px] font-medium text-green">
                          <FaCrown aria-hidden /> mais barato
                        </span>
                      )}
                    </div>
                    <p className={`mt-3 font-mono text-xl font-bold ${best ? "text-green" : ""}`}>
                      {fmt(q.total)} <span className="text-xs font-normal text-subtle">em {horizonYears} {horizonYears === 1 ? "ano" : "anos"}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {fmt(q.offer.promo)}/mês — paga {fmt(cycleTotal)} por {q.offer.cycleMonths} meses
                      {q.offer.cycleMonths > months && ` (${q.offer.cycleMonths - months} além do período)`}
                    </p>
                    <p className="text-xs text-orange">
                      Renova por {fmt(q.offer.renewal)}/mês (+{Math.round(q.renewalJump * 100)}%)
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-sm">
                <caption className="sr-only">{label}: comparação de custo em {horizonYears} anos</caption>
                <thead className="text-left text-xs text-subtle">
                  <tr>
                    <th scope="col" className="pb-2 font-medium">Plano</th>
                    <th scope="col" className="pb-2 font-medium">Promoção</th>
                    <th scope="col" className="pb-2 font-medium">Pagamento adiantado</th>
                    <th scope="col" className="pb-2 font-medium">Renovação</th>
                    <th scope="col" className="pb-2 text-right font-medium">Total em {horizonYears} {horizonYears === 1 ? "ano" : "anos"}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => {
                    const best = q === cheapest;
                    const cycleTotal = q.offer.promoTotal ?? q.offer.promo * q.offer.cycleMonths;
                    return (
                      <tr key={q.plan.id} className={`border-t border-line/60 ${best ? "bg-green/5" : ""}`}>
                        <th scope="row" className="py-3 pr-3 text-left font-normal">
                          <a href={PROVIDERS[q.plan.provider].url[category]} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-purple">
                            {PROVIDERS[q.plan.provider].name} · {q.plan.name}
                          </a>
                          {best && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green/15 px-2 py-0.5 text-[11px] font-medium text-green">
                              <FaCrown aria-hidden /> mais barato
                            </span>
                          )}
                          <span className="block text-xs text-subtle">{q.plan.specs}</span>
                        </th>
                        <td className="py-3 pr-3 font-mono">{fmt(q.offer.promo)}<span className="text-xs text-subtle">/mês</span></td>
                        <td className="py-3 pr-3">
                          <span className="font-mono">{fmt(cycleTotal)}</span>
                          <span className="block text-xs text-subtle">{q.offer.cycleMonths} meses</span>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="font-mono">{fmt(q.offer.renewal)}</span>
                          <span className="text-xs text-subtle">/mês</span>
                          <span className="block text-xs text-orange">+{Math.round(q.renewalJump * 100)}% após {q.offer.cycleMonths} meses</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`font-mono font-semibold ${best ? "text-green" : ""}`}>{fmt(q.total)}</span>
                          <span className="block text-xs text-subtle">
                            {q.offer.cycleMonths > months
                              ? `cobre ${q.offer.cycleMonths} meses (${q.offer.cycleMonths - months} além do período)`
                              : `≈ ${fmt(q.effectiveMonthly)}/mês`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-bg-soft p-4 text-sm">
        <p className="font-semibold">Resumo para {horizonYears} {horizonYears === 1 ? "ano" : "anos"}</p>
        <ul className="mt-2 space-y-1 text-muted">
          {tiers.map(({ label, cheapest }) => (
            <li key={label}>
              <span className="text-fg">{label}:</span> {PROVIDERS[cheapest.plan.provider].name} {cheapest.plan.name} — {formatBRL(cheapest.total)} no período
              {cheapest.offer.cycleMonths > months && ` (exige pagar ${cheapest.offer.cycleMonths} meses adiantados)`}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-subtle">
          Promoções exigem pagamento integral e antecipado e valem só no primeiro ciclo; a renovação é cobrada pelo preço cheio. Para a Locaweb, que oferece 12, 24 e
          48 meses, usamos o ciclo mais barato para o período. Não inclui domínio após o primeiro ano nem impostos de nota.
        </p>
      </div>

      <p className="mt-4 text-xs text-subtle">
        Preços coletados em {HOSTING_UPDATED_AT} nas páginas e carrinhos oficiais:{" "}
        {(Object.keys(PROVIDERS) as (keyof typeof PROVIDERS)[]).map((p, i) => (
          <span key={p}>
            {i > 0 && " · "}
            <a href={PROVIDERS[p].url[category]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-muted">
              {PROVIDERS[p].name}
            </a>
          </span>
        ))}
        . Promoções mudam com frequência — confira antes de fechar.
      </p>
    </section>
  );
}
