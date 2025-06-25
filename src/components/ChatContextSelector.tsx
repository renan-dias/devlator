import React, { useState, useEffect } from "react";

export type ChatContextOption = {
  label: string;
  value: string;
  description?: string;
};

export const CONTEXT_OPTIONS: ChatContextOption[] = [
  { label: "Captura do Figma", value: "figma", description: "Inclui uma captura do Figma no contexto." },
  { label: "Site de exemplo", value: "site", description: "Inclui um site de referência no contexto." },
  { label: "Documentação", value: "doc", description: "Inclui documentação relevante no contexto." },
  { label: "Contexto regional", value: "regional", description: "Usa localização para ajudar a estipular valor." },
];

export default function ChatContextSelector({ selected, onChange }: {
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {CONTEXT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded-lg border text-sm transition-all backdrop-blur bg-white/10 dark:bg-black/20 border-white/20 shadow hover:bg-white/20 dark:hover:bg-black/30 ${selected.includes(opt.value) ? "ring-2 ring-blue-400" : ""}`}
          title={opt.description}
          onClick={() => toggle(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
