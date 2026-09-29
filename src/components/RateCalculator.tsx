"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import MarketBar from "@/components/calculator/MarketBar";
import { DEFAULT_PROFILE, type Profile } from "@/lib/estimator";
import { DEFAULT_TAX_RATE, SENIORITY, formatBRL, type Seniority } from "@/lib/market-data";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

interface Inputs {
  income: number;
  costs: number;
  taxPct: number;
  hoursPerDay: number;
  daysPerWeek: number;
  vacationWeeks: number;
  reserve: boolean;
  compare: Seniority;
}

const DEFAULTS: Inputs = {
  income: 8000,
  costs: 900,
  taxPct: DEFAULT_TAX_RATE * 100,
  hoursPerDay: 6,
  daysPerWeek: 5,
  vacationWeeks: 4,
  reserve: true,
  compare: "pleno",
};

/** Semanas perdidas com feriados nacionais (~10 dias úteis). */
const HOLIDAY_WEEKS = 2;

function computeRate(i: Inputs) {
  const reserve = i.reserve ? i.income * (1 + 1 / 3) : 0; // 13º + 1/3 de férias
  const annualNet = i.income * 12 + reserve + i.costs * 12;
  const annualGross = annualNet / (1 - Math.min(0.5, i.taxPct / 100));
  const weeks = Math.max(1, 52 - i.vacationWeeks - HOLIDAY_WEEKS);
  const billableHours = i.hoursPerDay * i.daysPerWeek * weeks;
  const rate = annualGross / billableHours;
  return {
    rate: Math.ceil(rate / 5) * 5,
    annualGross,
    billableHours,
    monthlyGross: annualGross / 12,
  };
}

export default function RateCalculator() {
  const router = useRouter();
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setInputs({ ...DEFAULTS, ...readJSON<Partial<Inputs>>(STORAGE_KEYS.rateCalc, {}) });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeJSON(STORAGE_KEYS.rateCalc, inputs);
  }, [inputs, loaded]);

  const out = useMemo(() => computeRate(inputs), [inputs]);
  const market = SENIORITY[inputs.compare].rate;
  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setApplied(false);
    setInputs((i) => ({ ...i, [key]: value }));
  };

  const useInCalculator = () => {
    const profile = { ...DEFAULT_PROFILE, ...readJSON<Partial<Profile>>(STORAGE_KEYS.profile, {}) };
    writeJSON(STORAGE_KEYS.profile, {
      ...profile,
      seniority: inputs.compare,
      customRate: out.rate,
      taxRate: inputs.taxPct / 100,
    } satisfies Profile);
    setApplied(true);
    router.push("/calculadora");
  };

  const num = (key: keyof Inputs, label: string, opts: { prefix?: string; suffix?: string; min?: number; max?: number; step?: number; help?: string }) => (
    <div>
      <label htmlFor={`rc-${key}`} className="label">{label}</label>
      <div className="relative">
        {opts.prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle">{opts.prefix}</span>}
        <input
          id={`rc-${key}`}
          type="number"
          inputMode="decimal"
          min={opts.min ?? 0}
          max={opts.max}
          step={opts.step ?? 1}
          value={inputs[key] as number}
          onChange={(e) => set(key, Math.max(opts.min ?? 0, Number(e.target.value) || 0) as never)}
          className={`input font-mono ${opts.prefix ? "pl-11" : ""} ${opts.suffix ? "pr-14" : ""}`}
          aria-describedby={opts.help ? `rc-${key}-help` : undefined}
        />
        {opts.suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-subtle">{opts.suffix}</span>}
      </div>
      {opts.help && <p id={`rc-${key}-help`} className="mt-1.5 text-xs text-subtle">{opts.help}</p>}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <form className="card space-y-5 p-6" onSubmit={(e) => e.preventDefault()} aria-label="Dados para calcular o valor-hora">
        {num("income", "Quanto quer receber por mês (líquido)", { prefix: "R$", step: 100, help: "O que sobra para você depois de impostos e custos." })}
        {num("costs", "Custos mensais do trabalho", { prefix: "R$", step: 50, help: "Contador, INSS, plano de saúde, equipamento, softwares, internet, coworking." })}
        <div className="grid grid-cols-2 gap-4">
          {num("taxPct", "Impostos", { suffix: "%", max: 50, step: 0.5 })}
          {num("vacationWeeks", "Férias por ano", { suffix: "sem.", max: 12 })}
          {num("hoursPerDay", "Horas faturáveis/dia", { suffix: "h", max: 16, step: 0.5, help: "Descontando e-mails, reuniões e prospecção." })}
          {num("daysPerWeek", "Dias por semana", { suffix: "dias", max: 7 })}
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-bg-soft p-4">
          <input type="checkbox" checked={inputs.reserve} onChange={(e) => set("reserve", e.target.checked)} className="mt-1 h-4 w-4 accent-purple" />
          <span>
            <span className="block text-sm font-medium">Reservar 13º e 1/3 de férias</span>
            <span className="text-xs text-subtle">Como PJ ninguém paga isso por você.</span>
          </span>
        </label>
        <p className="text-xs text-subtle">Seus dados ficam salvos só neste navegador.</p>
      </form>

      <div className="space-y-6">
        <section className="card relative overflow-hidden p-6 sm:p-8" aria-live="polite">
          <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-purple/15 blur-3xl" />
          <p className="relative text-sm text-muted">Seu valor-hora mínimo</p>
          <p className="relative mt-1 font-mono text-5xl font-bold text-green sm:text-6xl">
            {formatBRL(out.rate)}<span className="text-xl font-normal text-muted">/h</span>
          </p>
          <dl className="relative mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-bg-soft/80 p-3">
              <dt className="text-xs text-subtle">Faturamento mensal</dt>
              <dd className="font-mono font-semibold">{formatBRL(out.monthlyGross)}</dd>
            </div>
            <div className="rounded-xl bg-bg-soft/80 p-3">
              <dt className="text-xs text-subtle">Horas faturáveis/ano</dt>
              <dd className="font-mono font-semibold">{Math.round(out.billableHours)}h</dd>
            </div>
            <div className="rounded-xl bg-bg-soft/80 p-3">
              <dt className="text-xs text-subtle">Diária (8h)</dt>
              <dd className="font-mono font-semibold">{formatBRL(out.rate * 8)}</dd>
            </div>
            <div className="rounded-xl bg-bg-soft/80 p-3">
              <dt className="text-xs text-subtle">Faturamento anual</dt>
              <dd className="font-mono font-semibold">{formatBRL(out.annualGross)}</dd>
            </div>
          </dl>
          <button onClick={useInCalculator} className="btn-primary relative mt-6 w-full">
            {applied ? <FaCheckCircle aria-hidden /> : null} Usar {formatBRL(out.rate)}/h na calculadora <FaArrowRight aria-hidden />
          </button>
        </section>

        <section className="card p-6" aria-labelledby="rc-mercado">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="rc-mercado" className="font-semibold">Comparar com o mercado</h2>
            <select
              aria-label="Senioridade para comparar"
              className="input !w-auto !py-2 text-sm"
              value={inputs.compare}
              onChange={(e) => set("compare", e.target.value as Seniority)}
            >
              {Object.entries(SENIORITY).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </select>
          </div>
          <div className="mt-6">
            <MarketBar label="Seu valor-hora" range={market} value={out.rate} suffix="/h" />
          </div>
          <p className="mt-3 text-sm text-muted">
            {out.rate < market.min
              ? `Abaixo da faixa de ${SENIORITY[inputs.compare].label.toLowerCase()} (${formatBRL(market.min)}–${formatBRL(market.max)}/h). Você provavelmente pode cobrar mais.`
              : out.rate > market.max
                ? `Acima da faixa de ${SENIORITY[inputs.compare].label.toLowerCase()}. Para sustentar esse valor, mire em nichos, clientes maiores ou internacionais.`
                : `Dentro da faixa de ${SENIORITY[inputs.compare].label.toLowerCase()} (média ${formatBRL(market.typical)}/h).`}
          </p>
        </section>
      </div>
    </div>
  );
}
