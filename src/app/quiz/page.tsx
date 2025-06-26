'use client';
import { useState } from "react";
import ProjectQuiz from "@/components/ProjectQuiz";
import EstimativaTable, { Estimativa } from "@/components/EstimativaTable";

export default function QuizPage() {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null);
  const [estimativas, setEstimativas] = useState<Estimativa[] | null>(null);

  async function gerarEstimativas(respostas: Record<string, string>) {
    // Chamada à GeminiAPI simulada (substitua por fetch real se necessário)
    // Aqui você pode usar a chave de API e enviar as respostas para a IA
    // Exemplo de resposta mockada:
    setEstimativas([
      { categoria: "Complexidade", descricao: respostas.nivel, valor: respostas.nivel === "Avançado" ? "R$ 8.000" : respostas.nivel === "Intermediário" ? "R$ 5.000" : "R$ 2.500" },
      { categoria: "Equipe", descricao: respostas.equipe, valor: respostas.equipe === "Sim, equipe grande" ? "R$ 3.000" : respostas.equipe === "Sim, pequena equipe" ? "R$ 1.500" : "R$ 0" },
      { categoria: "Hospedagem", descricao: respostas.hospedagem, valor: respostas.hospedagem === "Sim" ? "R$ 0" : "R$ 500" },
      { categoria: "Escopo", descricao: respostas.escopo, valor: respostas.escopo === "Sim" ? "R$ 0" : "R$ 1.000" },
      { categoria: "Dúvidas", descricao: respostas.duvidas, valor: respostas.duvidas === "Sim, muitas" ? "R$ 1.000" : respostas.duvidas === "Algumas" ? "R$ 500" : "R$ 0" },
    ]);
  }

  return (
    <section className="w-full max-w-xl mx-auto p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-8">
      <h1 className="text-2xl font-bold text-[#bd93f9] mb-4 text-center">Quiz de Estimativa</h1>
      {!quizAnswers ? (
        <ProjectQuiz onFinish={setQuizAnswers} />
      ) : (
        <>
          <section className="w-full max-w-2xl mx-auto p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-[#bd93f9] mb-4">Respostas do Quiz</h2>
            <ul className="space-y-2 w-full max-w-md">
              {Object.entries(quizAnswers).map(([key, value]) => (
                <li key={key} className="flex justify-between border-b border-[#44475a] pb-1">
                  <span className="capitalize">{key}</span>
                  <span className="font-semibold">{value}</span>
                </li>
              ))}
            </ul>
            <button
              className="mt-6 px-6 py-2 rounded-lg bg-[#bd93f9] text-[#282a36] font-bold shadow hover:bg-[#ff79c6] transition-all"
              onClick={() => gerarEstimativas(quizAnswers)}
            >
              Gerar Estimativas
            </button>
          </section>
          {estimativas && <EstimativaTable estimativas={estimativas} />}
        </>
      )}
    </section>
  );
}
