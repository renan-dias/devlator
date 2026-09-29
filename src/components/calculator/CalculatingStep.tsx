"use client";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";

const STAGES = [
  "Somando horas por funcionalidade",
  "Aplicando seu valor-hora e impostos",
  "Calculando prazo e contingência",
  "Comparando com a média do mercado",
  "Pedindo uma segunda opinião à IA",
];

export default function CalculatingStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 380);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-16 text-center" aria-live="polite" aria-busy="true">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-4 border-panel-2" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-green border-t-purple" />
        <span className="absolute inset-0 grid place-items-center font-mono text-lg font-bold text-fg">R$</span>
      </div>
      <h1 className="mt-8 text-2xl font-bold">Calculando sua estimativa…</h1>
      <ul className="mt-6 w-full space-y-2 text-left text-sm">
        {STAGES.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
              i < stage ? "text-muted" : i === stage ? "bg-panel text-fg" : "text-subtle/60"
            }`}
          >
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${i < stage ? "bg-green text-bg" : "border border-line"}`}>
              {i < stage ? <FaCheck aria-hidden /> : i === stage ? <span className="h-2 w-2 animate-pulse rounded-full bg-purple" /> : null}
            </span>
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
