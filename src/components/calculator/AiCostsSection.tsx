"use client";
import { useEffect, useState } from "react";
import { FaPlus, FaRobot, FaSyncAlt, FaTrash } from "react-icons/fa";
import {
  AI_PRICES_UPDATED_AT,
  AI_SOURCES,
  AI_TOOL_KINDS,
  AI_TOOLS,
  FALLBACK_USD_BRL,
  IOF_RATE,
  defaultAiSetup,
  findAiTool,
  formatPlanPrice,
  type AiSetup,
  type AiToolKind,
} from "@/lib/ai-tools";
import { formatBRL } from "@/lib/market-data";
import type { EstimateResult } from "@/lib/estimator";

interface Fx {
  rate: number;
  date: string | null;
}

export async function fetchUsdBrl(): Promise<Fx> {
  try {
    const res = await fetch("/api/cambio", { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return { rate: Number(data.rate) || FALLBACK_USD_BRL, date: data.date ?? null };
  } catch {
    return { rate: FALLBACK_USD_BRL, date: null };
  }
}

const fmtRate = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : null;

interface Props {
  setup: AiSetup | null;
  result: EstimateResult;
  onChange: (setup: AiSetup) => void;
}

export default function AiCostsSection({ setup, result, onChange }: Props) {
  const [loadingFx, setLoadingFx] = useState(false);
  const enabled = !!setup?.enabled;
  const ai = result.ai;
  const autoMonths = Math.max(1, Math.ceil(result.timeline.weeks / 4.345));

  // Estimativas antigas (sem cotação registrada) buscam a cotação do dia uma vez.
  useEffect(() => {
    if (setup?.enabled && !setup.rateDate) refreshFx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup?.enabled]);

  const update = (patch: Partial<AiSetup>) => setup && onChange({ ...setup, ...patch });

  async function refreshFx() {
    if (!setup) return;
    setLoadingFx(true);
    const fx = await fetchUsdBrl();
    setLoadingFx(false);
    onChange({ ...setup, usdBrl: fx.rate, rateDate: fx.date });
  }

  const enable = async () => {
    setLoadingFx(true);
    const fx = await fetchUsdBrl();
    setLoadingFx(false);
    const base = setup && setup.tools.length ? setup : defaultAiSetup("agente", result.timeline.people, fx.rate, fx.date);
    onChange({ ...base, enabled: true, usdBrl: fx.rate, rateDate: fx.date });
  };

  const setTool = (i: number, toolId: string) => {
    if (!setup) return;
    const tool = findAiTool(toolId)!;
    const tools = setup.tools.map((t, j) => (j === i ? { ...t, toolId, planId: tool.plans[0].id } : t));
    update({ tools });
  };

  const kinds = Object.keys(AI_TOOL_KINDS) as AiToolKind[];

  return (
    <section className="card p-6" aria-labelledby="ia-custos">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="ia-custos" className="flex items-center gap-2 font-semibold">
            <FaRobot className="text-purple" aria-hidden /> Ferramentas de IA (vibecoding)
          </h2>
          <p className="mt-1 text-sm text-muted">Assinaturas usadas durante o projeto, convertidas para reais com câmbio e IOF quando cobradas em dólar.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <span className="text-muted">Usar IA neste projeto</span>
          <input
            type="checkbox"
            role="switch"
            checked={enabled}
            disabled={loadingFx}
            onChange={(e) => (e.target.checked ? enable() : setup && onChange({ ...setup, enabled: false }))}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-6 w-11 rounded-full bg-panel-2 transition peer-checked:bg-purple peer-focus-visible:ring-2 peer-focus-visible:ring-purple after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-fg after:transition peer-checked:after:translate-x-5"
          />
        </label>
      </div>

      {!enabled || !setup ? (
        <p className="mt-4 rounded-xl bg-bg-soft p-4 text-sm text-muted">
          Sem ferramentas de IA nesta estimativa. Ative se for usar Copilot, Cursor, Claude Code, ChatGPT/Codex, Lovable, Bolt, v0 ou Replit.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <ul className="space-y-3">
            {setup.tools.map((sel, i) => {
              const tool = findAiTool(sel.toolId);
              const plan = tool?.plans.find((p) => p.id === sel.planId);
              const line = ai?.cost.lines[i];
              return (
                <li
                  key={i}
                  className="grid grid-cols-2 items-end gap-2 rounded-xl bg-bg-soft/60 p-3 sm:grid-cols-[1.2fr_1.6fr_5.5rem_7rem_auto] sm:gap-3"
                >
                  <label className="col-span-2 sm:col-span-1">
                    <span className="label !mb-1 text-xs">Ferramenta</span>
                    <select className="input !py-2" value={sel.toolId} onChange={(e) => setTool(i, e.target.value)}>
                      {kinds.map((k) => (
                        <optgroup key={k} label={AI_TOOL_KINDS[k]}>
                          {AI_TOOLS.filter((t) => t.kind === k).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2 sm:col-span-1">
                    <span className="label !mb-1 text-xs">Plano</span>
                    <select
                      className="input !py-2"
                      value={sel.planId}
                      onChange={(e) => update({ tools: setup.tools.map((t, j) => (j === i ? { ...t, planId: e.target.value } : t)) })}
                    >
                      {tool?.plans.map((p) => <option key={p.id} value={p.id}>{p.label} — {formatPlanPrice(p)}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="label !mb-1 text-xs">Pessoas</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="input !py-2 font-mono"
                      value={plan?.perWorkspace ? 1 : sel.seats}
                      disabled={plan?.perWorkspace}
                      title={plan?.perWorkspace ? "Um plano cobre a equipe inteira" : undefined}
                      onChange={(e) =>
                        update({ tools: setup.tools.map((t, j) => (j === i ? { ...t, seats: Math.max(1, Number(e.target.value) || 1) } : t)) })
                      }
                    />
                  </label>
                  <div className="flex items-end justify-between gap-2 sm:contents">
                    <p className="pb-1 font-mono text-sm sm:text-right">
                      {line ? formatBRL(line.brlMonthly) : "—"}
                      <span className="text-xs text-subtle">/mês</span>
                      {plan?.currency === "USD" && <span className="block text-[11px] text-subtle">US$ {line?.amount} + câmbio{setup.includeIof ? " e IOF" : ""}</span>}
                    </p>
                    <button
                      onClick={() => update({ tools: setup.tools.filter((_, j) => j !== i) })}
                      className="btn-ghost !p-2 hover:!text-red"
                      aria-label={`Remover ${tool?.name ?? "ferramenta"}`}
                    >
                      <FaTrash aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => update({ tools: [...setup.tools, { toolId: "claude", planId: "pro", seats: Math.max(1, Math.ceil(result.timeline.people)) }] })}
            className="btn-secondary !py-2"
          >
            <FaPlus aria-hidden /> Adicionar ferramenta
          </button>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ai-months" className="label">Meses de uso</label>
              <input
                id="ai-months"
                type="number"
                min={1}
                max={60}
                className="input font-mono"
                placeholder={`${autoMonths} (prazo)`}
                value={setup.months ?? ""}
                onChange={(e) => update({ months: e.target.value ? Math.max(1, Number(e.target.value)) : null })}
              />
              <p className="mt-1 text-xs text-subtle">Em branco: acompanha o prazo ({autoMonths} {autoMonths === 1 ? "mês" : "meses"}).</p>
            </div>
            <div>
              <label htmlFor="ai-extra" className="label">Uso extra (US$/mês)</label>
              <input
                id="ai-extra"
                type="number"
                min={0}
                step={5}
                className="input font-mono"
                value={setup.extraUsdMonthly || ""}
                placeholder="0"
                onChange={(e) => update({ extraUsdMonthly: Math.max(0, Number(e.target.value) || 0) })}
              />
              <p className="mt-1 text-xs text-subtle">API paga por uso ou créditos além do plano.</p>
            </div>
            <div>
              <p className="label">Câmbio</p>
              <p className="font-mono text-sm">US$ 1 = R$ {fmtRate(setup.usdBrl)}</p>
              <p className="text-xs text-subtle">
                {setup.rateDate ? `AwesomeAPI, ${fmtDate(setup.rateDate)}` : "cotação padrão"}{" "}
                <button onClick={refreshFx} disabled={loadingFx} className="ml-1 inline-flex items-center gap-1 text-purple hover:underline">
                  <FaSyncAlt className={loadingFx ? "animate-spin" : ""} aria-hidden /> atualizar
                </button>
              </p>
              <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={setup.includeIof} onChange={(e) => update({ includeIof: e.target.checked })} className="accent-purple" />
                Incluir IOF de {(IOF_RATE * 100).toLocaleString("pt-BR")}% (cartão internacional)
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="ai-prod" className="label flex items-baseline justify-between">
              <span>Efeito da IA nas suas horas</span>
              <span className="font-mono text-fg">
                {setup.productivity === 0 ? "sem ajuste" : `${setup.productivity > 0 ? "−" : "+"}${Math.abs(Math.round(setup.productivity * 100))}% horas`}
              </span>
            </label>
            <input
              id="ai-prod"
              type="range"
              min={-30}
              max={50}
              step={5}
              value={Math.round(setup.productivity * 100)}
              onChange={(e) => update({ productivity: Number(e.target.value) / 100 })}
              className="w-full accent-purple"
            />
            <p className="mt-1 text-xs text-subtle">
              Começa sem ajuste porque os estudos divergem:{" "}
              <a href={AI_SOURCES.at(-2)!.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">devs experientes ficaram 19% mais lentos (METR, 2025)</a>, enquanto{" "}
              <a href={AI_SOURCES.at(-1)!.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">uma tarefa isolada foi 55,8% mais rápida (GitHub, 2023)</a>. Use seu histórico.
            </p>
          </div>

          <fieldset>
            <legend className="label">Quem paga as ferramentas?</legend>
            <div className="flex flex-wrap gap-2">
              {[
                [true, "Repassar ao cliente", "entra no preço, com impostos"],
                [false, "Eu absorvo", "sai do seu lucro"],
              ].map(([value, label, hint]) => (
                <label
                  key={String(value)}
                  className={`cursor-pointer rounded-xl border px-4 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple ${
                    setup.passThrough === value ? "border-purple bg-purple/15" : "border-line bg-panel text-muted hover:text-fg"
                  }`}
                >
                  <input type="radio" name="ai-pass" className="sr-only" checked={setup.passThrough === value} onChange={() => update({ passThrough: value as boolean })} />
                  {label as string} <span className="text-xs text-subtle">— {hint as string}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {ai && (
            <dl className="grid gap-3 rounded-xl bg-bg-soft p-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-subtle">Por mês</dt>
                <dd className="font-mono font-semibold">{formatBRL(ai.cost.brlMonthly)}</dd>
              </div>
              <div>
                <dt className="text-xs text-subtle">No projeto ({ai.cost.months} {ai.cost.months === 1 ? "mês" : "meses"})</dt>
                <dd className="font-mono font-semibold">{formatBRL(ai.cost.total)}</dd>
              </div>
              <div>
                <dt className="text-xs text-subtle">{ai.passThrough ? "Acréscimo no preço" : "Custo absorvido"}</dt>
                <dd className={`font-mono font-semibold ${ai.passThrough ? "text-green" : "text-orange"}`}>
                  {formatBRL(ai.passThrough ? ai.priceAddition : ai.cost.total)}
                </dd>
                {ai.passThrough && <dd className="text-[11px] text-subtle">inclui impostos da nota</dd>}
              </div>
              <div>
                <dt className="text-xs text-subtle">Horas</dt>
                <dd className="font-mono font-semibold">
                  {ai.hoursSaved === 0 ? "sem ajuste" : ai.hoursSaved > 0 ? `−${ai.hoursSaved}h` : `+${-ai.hoursSaved}h`}
                </dd>
              </div>
            </dl>
          )}

          <p className="text-xs text-subtle">
            Preços de planos mensais conferidos em {AI_PRICES_UPDATED_AT} nas páginas oficiais, acessadas do Brasil. ChatGPT, Claude e Lovable cobram em reais; os
            demais, em dólar.{" "}
            {AI_TOOLS.map((t, i) => (
              <span key={t.id}>
                {i > 0 && " · "}
                <a href={t.pricingUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-muted">{t.name}</a>
              </span>
            ))}
          </p>
        </div>
      )}
    </section>
  );
}
