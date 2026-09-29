"use client";
import Link from "next/link";
import { useState } from "react";
import { FaArrowRight, FaMapMarkerAlt, FaUserTie } from "react-icons/fa";
import { REGIONS, SENIORITY, formatBRL, type Region, type Seniority } from "@/lib/market-data";
import { marketRateFor, type Profile } from "@/lib/estimator";

interface Props {
  initial: Profile;
  onSubmit: (profile: Profile) => void;
  submitLabel?: string;
}

export default function ProfileStep({ initial, onSubmit, submitLabel = "Continuar para o projeto" }: Props) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [rateInput, setRateInput] = useState(initial.customRate ? String(initial.customRate) : "");
  const [taxInput, setTaxInput] = useState(String(Math.round(initial.taxRate * 1000) / 10));
  const market = marketRateFor(profile);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(rateInput.replace(",", "."));
    const tax = Number(taxInput.replace(",", "."));
    onSubmit({
      ...profile,
      customRate: rate > 0 ? rate : null,
      taxRate: Number.isFinite(tax) ? Math.min(50, Math.max(0, tax)) / 100 : profile.taxRate,
    });
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="eyebrow">Passo 1 · Seu perfil</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Quem vai desenvolver?</h1>
        <p className="mt-2 text-muted">Usamos isso para definir o valor-hora de referência. Fica salvo no seu navegador para as próximas vezes.</p>
      </div>

      <fieldset>
        <legend className="mb-3 flex items-center gap-2 font-semibold">
          <FaUserTie className="text-purple" aria-hidden /> Senioridade
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(SENIORITY) as [Seniority, (typeof SENIORITY)[Seniority]][]).map(([key, s]) => {
            const selected = profile.seniority === key;
            return (
              <label
                key={key}
                className={`card cursor-pointer p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple ${
                  selected ? "!border-purple bg-purple/10" : "hover:border-purple/40"
                }`}
              >
                <input
                  type="radio"
                  name="seniority"
                  value={key}
                  checked={selected}
                  onChange={() => setProfile((p) => ({ ...p, seniority: key }))}
                  className="sr-only"
                />
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{s.label}</span>
                  <span className="font-mono text-sm text-green">{formatBRL(s.rate.typical)}/h</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{s.description}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 flex items-center gap-2 font-semibold">
          <FaMapMarkerAlt className="text-purple" aria-hidden /> Onde estão seus clientes?
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(REGIONS) as [Region, (typeof REGIONS)[Region]][]).map(([key, r]) => {
            const selected = profile.region === key;
            return (
              <label
                key={key}
                title={r.description}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple ${
                  selected ? "border-purple bg-purple/15 text-fg" : "border-line bg-panel text-muted hover:text-fg"
                }`}
              >
                <input
                  type="radio"
                  name="region"
                  value={key}
                  checked={selected}
                  onChange={() => setProfile((p) => ({ ...p, region: key }))}
                  className="sr-only"
                />
                {r.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <label htmlFor="rate" className="label">Seu valor-hora (opcional)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle">R$</span>
            <input
              id="rate"
              inputMode="decimal"
              className="input pl-11 font-mono"
              placeholder={String(market.typical)}
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value.replace(/[^\d.,]/g, ""))}
              aria-describedby="rate-help"
            />
          </div>
          <p id="rate-help" className="mt-2 text-xs text-subtle">
            Mercado para seu perfil: {formatBRL(market.min)}–{formatBRL(market.max)}/h. Em branco, usamos {formatBRL(market.typical)}.{" "}
            <Link href="/valor-hora" className="text-purple underline-offset-2 hover:underline">Calcular o meu</Link>
          </p>
        </div>
        <div className="card p-5">
          <label htmlFor="tax" className="label">Impostos sobre a nota (%)</label>
          <div className="relative">
            <input
              id="tax"
              inputMode="decimal"
              className="input pr-10 font-mono"
              value={taxInput}
              onChange={(e) => setTaxInput(e.target.value.replace(/[^\d.,]/g, ""))}
              aria-describedby="tax-help"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-subtle">%</span>
          </div>
          <p id="tax-help" className="mt-2 text-xs text-subtle">Simples Nacional (Anexo III) começa em 6%. Use 0 se não emite nota.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary w-full text-base sm:w-auto">
          {submitLabel} <FaArrowRight aria-hidden />
        </button>
      </div>
    </form>
  );
}
