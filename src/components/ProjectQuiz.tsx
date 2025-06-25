import React, { useState } from "react";
import { FaUserGraduate, FaUsers, FaServer, FaProjectDiagram, FaQuestionCircle } from "react-icons/fa";

export type QuizAnswer = {
  question: string;
  answer: string;
  icon: React.ReactNode;
};

const QUESTIONS = [
  {
    key: "nivel",
    question: "Qual seu nível de experiência como DEV?",
    icon: <FaUserGraduate className="inline mr-2 text-blue-500" />,
    options: ["Iniciante", "Intermediário", "Avançado"],
  },
  {
    key: "equipe",
    question: "Você tem mais pessoas na equipe?",
    icon: <FaUsers className="inline mr-2 text-green-500" />,
    options: ["Não, só eu", "Sim, pequena equipe", "Sim, equipe grande"],
  },
  {
    key: "escopo",
    question: "O escopo do projeto está bem definido?",
    icon: <FaProjectDiagram className="inline mr-2 text-purple-500" />,
    options: ["Sim", "Mais ou menos", "Não"],
  },
  {
    key: "hospedagem",
    question: "Já possui hospedagem ou infraestrutura?",
    icon: <FaServer className="inline mr-2 text-orange-500" />,
    options: ["Sim", "Não", "Ainda não sei"],
  },
  {
    key: "duvidas",
    question: "Tem dúvidas ou pontos críticos?",
    icon: <FaQuestionCircle className="inline mr-2 text-pink-500" />,
    options: ["Sim, muitas", "Algumas", "Poucas ou nenhuma"],
  },
];

export default function ProjectQuiz({ onFinish }: { onFinish: (answers: Record<string, string>) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (option: string) => {
    const key = QUESTIONS[step].key;
    setAnswers((prev) => ({ ...prev, [key]: option }));
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onFinish({ ...answers, [key]: option });
    }
  };

  const q = QUESTIONS[step];

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 dark:bg-black/20 rounded-2xl p-8 shadow-xl backdrop-blur border border-white/20 animate-fade-in">
      <div className="mb-6 text-xl font-semibold flex items-center gap-2">
        {q.icon}
        {q.question}
      </div>
      <div className="flex flex-col gap-4">
        {q.options.map((opt) => (
          <button
            key={opt}
            className="px-4 py-2 rounded-lg border border-white/20 bg-white/20 dark:bg-black/30 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-all text-base font-medium shadow"
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-6 text-xs text-gray-400 text-center">
        Pergunta {step + 1} de {QUESTIONS.length}
      </div>
    </div>
  );
}
