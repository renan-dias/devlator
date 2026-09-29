"use client";
import { useEffect } from "react";
import {
  FaArrowLeft,
  FaBrain,
  FaClock,
  FaCloud,
  FaCode,
  FaDatabase,
  FaExclamationTriangle,
  FaFileAlt,
  FaGraduationCap,
  FaLayerGroup,
  FaMobileAlt,
  FaMoneyBillWave,
  FaPaintBrush,
  FaPlug,
  FaShieldAlt,
  FaShoppingCart,
  FaTachometerAlt,
  FaTools,
  FaUserLock,
  FaUsers,
  FaVial,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { describeEffect, type Question } from "@/lib/questions";

const ICONS: Record<string, IconType> = {
  tipo: FaCode,
  escopo: FaLayerGroup,
  design: FaPaintBrush,
  responsividade: FaMobileAlt,
  plataforma: FaMobileAlt,
  autenticacao: FaUserLock,
  complexidade: FaBrain,
  integracao: FaPlug,
  banco: FaDatabase,
  cms: FaFileAlt,
  pagamento: FaMoneyBillWave,
  produtos: FaShoppingCart,
  hospedagem: FaCloud,
  performance: FaTachometerAlt,
  seguranca: FaShieldAlt,
  testes: FaVial,
  documentacao: FaFileAlt,
  tecnologia: FaGraduationCap,
  experiencia: FaGraduationCap,
  equipe: FaUsers,
  dedicacao: FaClock,
  prazo: FaClock,
  flexibilidade_escopo: FaExclamationTriangle,
  manutencao: FaTools,
};

interface Props {
  question: Question;
  index: number;
  total: number;
  selected?: string;
  onAnswer: (value: string) => void;
  onBack?: () => void;
}

export default function QuestionStep({ question, index, total, selected, onAnswer, onBack }: Props) {
  const Icon = ICONS[question.id] ?? FaCode;
  const progress = Math.round((index / total) * 100);

  // Atalhos: 1–9 escolhem a opção, ← volta.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= question.options.length) {
        e.preventDefault();
        onAnswer(question.options[n - 1].value);
      } else if ((e.key === "ArrowLeft" || e.key === "Backspace") && onBack) {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, onAnswer, onBack]);

  return (
    <section className="mx-auto max-w-4xl" aria-labelledby="pergunta">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-mono text-muted">
            {String(index + 1).padStart(2, "0")} <span className="text-subtle">/ {String(total).padStart(2, "0")}</span>
          </span>
          <span className="chip">{question.category}</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-panel-2"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do questionário"
        >
          <div className="h-full rounded-full bg-gradient-to-r from-purple to-green transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div key={question.id} className="animate-fade-in">
        <div className="flex items-start gap-4">
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple/15 text-xl text-purple sm:grid">
            <Icon aria-hidden />
          </span>
          <div>
            <h1 id="pergunta" className="text-2xl font-bold tracking-tight sm:text-3xl">
              {question.question}
            </h1>
            {question.help && <p className="mt-2 text-muted">{question.help}</p>}
          </div>
        </div>

        <div role="radiogroup" aria-labelledby="pergunta" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {question.options.map((option, i) => {
            const isSelected = selected === option.value;
            const impact = describeEffect(option.effect);
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onAnswer(option.value)}
                className={`card group relative flex min-h-[112px] flex-col items-start p-5 text-left transition hover:-translate-y-0.5 hover:border-purple/60 hover:shadow-lg hover:shadow-purple/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
                  isSelected ? "!border-purple bg-purple/10" : ""
                }`}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="font-semibold group-hover:text-purple">{option.label}</span>
                  <kbd className="hidden rounded-md border border-line bg-bg-soft px-1.5 font-mono text-[11px] text-subtle sm:inline">{i + 1}</kbd>
                </span>
                {option.description && <span className="mt-1.5 text-sm text-muted">{option.description}</span>}
                {impact && <span className="mt-auto pt-3 font-mono text-[11px] text-cyan/90">{impact}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        {onBack ? (
          <button type="button" onClick={onBack} className="btn-ghost">
            <FaArrowLeft aria-hidden /> Voltar
          </button>
        ) : (
          <span />
        )}
        <p className="hidden text-xs text-subtle sm:block">Dica: use as teclas 1–{question.options.length} para responder</p>
      </div>
    </section>
  );
}
