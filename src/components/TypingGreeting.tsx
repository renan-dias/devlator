"use client";
import { useEffect, useState } from "react";

const LINES = [
  `const preco = horas * valorHora;`,
  `if (escopo.indefinido) cobrarPorSprint();`,
  `git commit -m "orçamento enviado"`,
  `await devlator.compararComMercado();`,
  `// TODO: parar de cobrar barato`,
  `npm run proposta -- --com-impostos`,
];

export default function TypingGreeting() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    const line = LINES[index];
    if (text.length < line.length) {
      const t = setTimeout(() => setText(line.slice(0, text.length + 1)), 45);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setText("");
      setIndex((i) => (i + 1) % LINES.length);
    }, 2200);
    return () => clearTimeout(t);
  }, [text, index]);

  return (
    <div className="card inline-flex max-w-full items-center gap-3 overflow-hidden px-4 py-2.5 font-mono text-xs sm:text-sm" aria-hidden>
      <span className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green/80" />
      </span>
      <span className="truncate text-green">
        <span className="text-subtle">$ </span>
        {text}
        <span className="animate-blink text-fg">▍</span>
      </span>
    </div>
  );
}
