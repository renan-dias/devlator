"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FaCheckCircle,
  FaComments,
  FaCopy,
  FaExclamationTriangle,
  FaFileExport,
  FaLightbulb,
  FaPen,
  FaRedo,
  FaRobot,
  FaSyncAlt,
} from "react-icons/fa";
import MarketBar from "./MarketBar";
import ExportModal from "./ExportModal";
import AiCostsSection from "./AiCostsSection";
import HostingReport from "@/components/HostingReport";
import { defaultHostingSelection, type HostingSelection } from "@/lib/hosting-data";
import type { AiSetup } from "@/lib/ai-tools";
import { useModal } from "@/components/Modal";
import { describeAnswers, type MarketPosition, type Profile } from "@/lib/estimator";
import { RECURRING_COSTS, REGIONS, SENIORITY, formatBRL } from "@/lib/market-data";
import { proposalText } from "@/lib/export";
import type { EstimateRecord } from "@/lib/storage";

interface Props {
  record: EstimateRecord;
  analysisLoading: boolean;
  onProfileChange: (profile: Profile) => void;
  onAiChange: (ai: AiSetup) => void;
  onHostingChange: (hosting: HostingSelection) => void;
  onRename: (name: string) => void;
  onEditQuestion: (questionId: string) => void;
  onRefreshAnalysis: () => void;
  onRestart: () => void;
  onOpenChat: () => void;
}

const VERDICT: Record<MarketPosition, { text: string; className: string }> = {
  below: { text: "Abaixo do mercado", className: "bg-orange/15 text-orange border-orange/40" },
  within: { text: "Dentro da faixa de mercado", className: "bg-green/15 text-green border-green/40" },
  above: { text: "Acima do mercado", className: "bg-pink/15 text-pink border-pink/40" },
};

const pct = (n: number) => `${n > 0 ? "+" : ""}${Math.round(n * 100)}%`;

export default function ResultView({
  record,
  analysisLoading,
  onProfileChange,
  onAiChange,
  onHostingChange,
  onRename,
  onEditQuestion,
  onRefreshAnalysis,
  onRestart,
  onOpenChat,
}: Props) {
  const { result: r, profile, analysis } = record;
  const exportModal = useModal();
  const [copied, setCopied] = useState(false);
  const verdict = VERDICT[r.market.position];
  const rateVerdict = VERDICT[r.rateComparison.position];
  const sliderMin = Math.max(20, Math.round((r.rate.market.min * 0.5) / 5) * 5);
  const sliderMax = Math.round((r.rate.market.max * 1.6) / 5) * 5;
  const maxPhase = Math.max(1, ...r.phases.map((p) => p.value));
  const hosting = record.hosting ?? defaultHostingSelection(r.projectType, record.answers.hospedagem);
  const answerList = describeAnswers(record.answers);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(
        proposalText(record, { projectName: record.name, developerName: "—" }),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível (http ou permissão negada)
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Estimativa · {r.projectLabel}</p>
          <label className="group mt-2 flex items-center gap-2">
            <span className="sr-only">Nome da estimativa</span>
            <input
              defaultValue={record.name}
              onBlur={(e) => e.target.value.trim() && onRename(e.target.value.trim())}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-full min-w-0 truncate rounded-lg bg-transparent text-2xl font-bold tracking-tight outline-none ring-purple/40 focus:bg-panel focus:px-2 focus:ring-2 sm:text-3xl"
            />
            <FaPen className="shrink-0 text-sm text-subtle group-hover:text-purple" aria-hidden />
          </label>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <button onClick={exportModal.openModal} className="btn-primary">
            <FaFileExport aria-hidden /> Exportar proposta
          </button>
          <button onClick={onOpenChat} className="btn-secondary">
            <FaComments aria-hidden /> Refinar no chat
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Preço */}
        <section className="card relative overflow-hidden p-6 sm:p-8" aria-labelledby="preco">
          <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="preco" className="text-sm text-muted">Preço recomendado</h2>
              <span className={`chip ${verdict.className}`}>{verdict.text}</span>
            </div>
            <p className="mt-2 font-mono text-5xl font-bold tracking-tight text-green sm:text-6xl">{formatBRL(r.price.recommended)}</p>
            <p className="mt-2 text-muted">
              Faixa: <span className="font-mono text-fg">{formatBRL(r.price.min)}</span> a{" "}
              <span className="font-mono text-fg">{formatBRL(r.price.max)}</span>
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Horas", `${r.hours.likely}h`, `${r.hours.min}–${r.hours.max}h`],
                ["Valor-hora", formatBRL(r.rate.value), r.rate.isCustom ? "definido por você" : "média do perfil"],
                ["Prazo", `${r.timeline.weeks} sem.`, `${r.timeline.people} pessoa${r.timeline.people > 1 ? "s" : ""} · ${r.timeline.weeklyHours}h/sem`],
                ["Impostos", `${Math.round(r.factors.taxRate * 100)}%`, "já inclusos"],
              ].map(([label, value, hint]) => (
                <div key={label} className="rounded-xl bg-bg-soft/80 p-3">
                  <dt className="text-xs text-subtle">{label}</dt>
                  <dd className="mt-0.5 font-mono text-lg font-semibold">{value}</dd>
                  <dd className="text-[11px] text-subtle">{hint}</dd>
                </div>
              ))}
            </dl>

            {!r.timeline.feasible && r.timeline.deadlineWeeks && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-orange/40 bg-orange/10 p-3 text-sm text-orange">
                <FaExclamationTriangle className="mt-0.5 shrink-0" aria-hidden />
                O prazo pedido ({r.timeline.deadlineWeeks} semanas) é menor que o necessário ({r.timeline.weeks} semanas). Negocie prazo, escopo ou aumente a equipe.
              </p>
            )}

            <details className="mt-6 text-sm">
              <summary className="cursor-pointer text-muted hover:text-fg">Como chegamos nesse valor?</summary>
              <div className="mt-3 space-y-1.5 rounded-xl bg-bg-soft p-4 font-mono text-xs text-muted">
                <p>horas-base: {r.factors.baseHours}h <span className="text-subtle">({r.projectLabel} × escopo {r.factors.scope})</span></p>
                <p>+ funcionalidades: {r.factors.fixedHours}h</p>
                <p>× ajustes de complexidade: {pct(r.factors.pct)}</p>
                {r.factors.overhead > 0 && <p>× coordenação da equipe: {pct(r.factors.overhead)}</p>}
                {r.ai && r.ai.productivity !== 0 && <p>× efeito da IA nas horas: {pct(-r.ai.productivity)}</p>}
                <p className="text-fg">= {r.hours.likely}h × {formatBRL(r.rate.value)}/h</p>
                {r.factors.urgency > 0 && <p>× urgência: {pct(r.factors.urgency)}</p>}
                <p>× contingência de escopo: {pct(r.factors.contingency)}</p>
                {r.ai?.passThrough && r.ai.cost.total > 0 && <p>+ ferramentas de IA: {formatBRL(r.ai.cost.total)}</p>}
                <p>÷ (1 − impostos {Math.round(r.factors.taxRate * 100)}%)</p>
                <p className="text-green">= {formatBRL(r.price.recommended)}</p>
              </div>
            </details>
          </div>
        </section>

        {/* Simulador */}
        <section className="card no-print p-6" aria-labelledby="simular">
          <h2 id="simular" className="font-semibold">E se eu cobrar…</h2>
          <p className="mt-1 text-sm text-muted">Ajuste e veja o preço mudar na hora. Fica salvo como seu padrão.</p>

          <label htmlFor="rate-slider" className="label mt-5 flex items-baseline justify-between">
            <span>Valor-hora</span>
            <span className="font-mono text-lg text-fg">{formatBRL(r.rate.value)}/h</span>
          </label>
          <input
            id="rate-slider"
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={5}
            value={Math.min(sliderMax, Math.max(sliderMin, r.rate.value))}
            onChange={(e) => onProfileChange({ ...profile, customRate: Number(e.target.value) })}
            className="w-full accent-purple"
          />
          <div className="flex justify-between text-[11px] text-subtle">
            <span>{formatBRL(sliderMin)}</span>
            <span>{formatBRL(sliderMax)}</span>
          </div>
          {r.rate.isCustom && (
            <button onClick={() => onProfileChange({ ...profile, customRate: null })} className="mt-2 text-xs text-purple hover:underline">
              Voltar à média de mercado ({formatBRL(r.rate.market.typical)}/h)
            </button>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sim-seniority" className="label">Senioridade</label>
              <select
                id="sim-seniority"
                className="input !py-2"
                value={profile.seniority}
                onChange={(e) => onProfileChange({ ...profile, seniority: e.target.value as Profile["seniority"] })}
              >
                {Object.entries(SENIORITY).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sim-region" className="label">Região</label>
              <select
                id="sim-region"
                className="input !py-2"
                value={profile.region}
                onChange={(e) => onProfileChange({ ...profile, region: e.target.value as Profile["region"] })}
              >
                {Object.entries(REGIONS).map(([k, reg]) => <option key={k} value={k}>{reg.label}</option>)}
              </select>
            </div>
          </div>
          <label htmlFor="sim-tax" className="label mt-4 flex justify-between">
            <span>Impostos</span>
            <span className="font-mono text-fg">{Math.round(profile.taxRate * 100)}%</span>
          </label>
          <input
            id="sim-tax"
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={profile.taxRate * 100}
            onChange={(e) => onProfileChange({ ...profile, taxRate: Number(e.target.value) / 100 })}
            className="w-full accent-purple"
          />
        </section>
      </div>

      {/* Mercado */}
      <section className="card p-6" aria-labelledby="mercado">
        <h2 id="mercado" className="font-semibold">Comparação com o mercado</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-muted">Preço de {r.projectLabel.toLowerCase()}</p>
              <p className="text-sm">
                <span className="font-mono">{pct(r.market.diffFromTypical)}</span>{" "}
                <span className="text-subtle">vs. típico ({formatBRL(r.market.range.typical)})</span>
              </p>
            </div>
            <div className="mt-3">
              <MarketBar label="Seu preço" range={r.market.range} value={r.price.recommended} own={{ min: r.price.min, max: r.price.max }} />
            </div>
            <p className="mt-3 text-xs text-subtle">{r.market.note}</p>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-muted">
                Valor-hora · {SENIORITY[profile.seniority].label}, {REGIONS[profile.region].label.toLowerCase()}
              </p>
              <span className={`chip ${rateVerdict.className}`}>{rateVerdict.text.replace(" da faixa de mercado", "")}</span>
            </div>
            <div className="mt-3">
              <MarketBar label="Seu valor-hora" range={r.rate.market} value={r.rate.value} suffix="/h" />
            </div>
            <p className="mt-3 text-xs text-subtle">
              Faixa de freelancer/PJ derivada das médias salariais de 2025/2026 e ajustada pela região.{" "}
              <Link href="/sobre" className="underline underline-offset-2">Metodologia</Link>
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fases */}
        <section className="card p-6" aria-labelledby="fases">
          <h2 id="fases" className="font-semibold">Distribuição por fase</h2>
          <ul className="mt-5 space-y-4">
            {r.phases.map((p) => (
              <li key={p.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span>{p.label}</span>
                  <span className="font-mono text-muted">
                    {p.hours > 0 && `${p.hours}h · `}<span className="text-fg">{formatBRL(p.value)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-panel-2">
                  <div
                    className={`h-full rounded-full ${p.id === "ai" ? "bg-gradient-to-r from-pink to-orange" : "bg-gradient-to-r from-purple to-cyan"}`}
                    style={{ width: `${(p.value / maxPhase) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Recorrentes */}
        <section className="card p-6" aria-labelledby="recorrentes">
          <h2 id="recorrentes" className="font-semibold">Depois da entrega</h2>
          {r.maintenance ? (
            <div className="mt-4 rounded-xl border border-green/30 bg-green/10 p-4">
              <p className="text-sm text-muted">Manutenção mensal ({r.maintenance.hours}h/mês)</p>
              <p className="font-mono text-2xl font-bold text-green">{formatBRL(r.maintenance.monthly)}<span className="text-sm font-normal text-muted">/mês</span></p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Sem manutenção contratada. Um plano de 8h/mês sairia por ~{formatBRL(Math.round((8 * r.rate.value) / (1 - r.factors.taxRate) / 10) * 10)}/mês.
            </p>
          )}
          <p className="mt-5 text-sm font-medium">
            Custos de terceiros (repassar ao cliente) ·{" "}
            <a href="#hospedagem" className="font-normal text-purple hover:underline">comparar hospedagens</a>
          </p>
          <ul className="mt-2 divide-y divide-line/60 text-sm">
            {RECURRING_COSTS.map((c) => (
              <li key={c.label} className="flex justify-between gap-3 py-2">
                <span className="text-muted">{c.label}</span>
                <span className="text-right font-mono text-xs">{c.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AiCostsSection setup={record.ai ?? null} result={r} onChange={onAiChange} />

      {/* Análise */}
      <section className="card p-6" aria-labelledby="analise" aria-busy={analysisLoading}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="analise" className="flex items-center gap-2 font-semibold">
            <FaRobot className="text-purple" aria-hidden /> Análise e recomendações
          </h2>
          <div className="flex items-center gap-2">
            {analysis && (
              <span className="chip">{analysis.source === "ai" ? "Gerada por IA (Gemini)" : "Regras do Devlator"}</span>
            )}
            <button onClick={onRefreshAnalysis} disabled={analysisLoading} className="btn-ghost no-print !px-3 !py-1.5 text-xs">
              <FaSyncAlt className={analysisLoading ? "animate-spin" : ""} aria-hidden /> Atualizar
            </button>
          </div>
        </div>

        {analysisLoading && !analysis ? (
          <div className="mt-4 space-y-2">
            {[80, 95, 70].map((w) => <div key={w} className="h-3 animate-pulse rounded bg-panel-2" style={{ width: `${w}%` }} />)}
          </div>
        ) : analysis ? (
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="leading-relaxed text-muted">{analysis.summary}</p>
              <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold">
                <FaLightbulb className="text-yellow" aria-hidden /> Sugestões
              </h3>
              <ul className="mt-2 space-y-2">
                {analysis.suggestions.map((s) => (
                  <li key={s} className="flex gap-2 text-sm">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-green" aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            {analysis.risks.length > 0 && (
              <div className="rounded-xl bg-bg-soft p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <FaExclamationTriangle className="text-orange" aria-hidden /> Riscos a considerar
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-muted">
                  {analysis.risks.map((s) => <li key={s}>• {s}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {r.insights.map((s) => (
              <li key={s} className="flex gap-2 text-sm">
                <FaCheckCircle className="mt-0.5 shrink-0 text-green" aria-hidden />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Respostas */}
      <section className="card p-6" aria-labelledby="respostas">
        <h2 id="respostas" className="font-semibold">Suas respostas</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {answerList.map((a) => (
            <li key={a.question}>
              <button
                onClick={() => onEditQuestion(a.id)}
                className="group flex w-full items-center justify-between gap-3 rounded-xl bg-bg-soft/70 px-4 py-3 text-left transition hover:bg-panel-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs text-subtle">{a.question}</span>
                  <span className="text-sm">{a.answer}</span>
                </span>
                <FaPen className="shrink-0 text-xs text-subtle group-hover:text-purple" aria-label="Editar" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <HostingReport selection={hosting} onChange={onHostingChange} projectType={r.projectType} />

      <div className="no-print flex flex-col gap-3 sm:flex-row">
        <button onClick={onRestart} className="btn-secondary">
          <FaRedo aria-hidden /> Nova estimativa
        </button>
        <button onClick={copySummary} className="btn-secondary">
          <FaCopy aria-hidden /> {copied ? "Copiado!" : "Copiar resumo"}
        </button>
        <Link href="/historico" className="btn-ghost">Ver histórico</Link>
      </div>

      <ExportModal record={record} isOpen={exportModal.isOpen} onClose={exportModal.closeModal} />
    </div>
  );
}
