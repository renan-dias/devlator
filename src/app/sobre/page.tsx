'use client';
import { FaCode, FaRocket, FaBrain } from "react-icons/fa";

export default function SobrePage() {
  return (
    <section className="w-full max-w-3xl mx-auto p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-8">
      <h1 className="text-3xl font-bold text-[#bd93f9] mb-6 flex items-center gap-3">
        <FaCode />
        Sobre o Devlator
      </h1>
      
      <div className="space-y-6 text-[#f8f8f2]">
        <div className="bg-[#282a36]/50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-[#50fa7b] mb-3 flex items-center gap-2">
            <FaRocket />
            O que é o Devlator?
          </h2>
          <p className="leading-relaxed">
            O <span className="text-[#50fa7b] font-semibold">Devlator</span> é uma calculadora inteligente para desenvolvedores que precisam estimar quanto cobrar por seus projetos. 
            Com design inspirado em IDEs como VS Code e tema Dracula, oferece uma experiência familiar para devs.
          </p>
        </div>

        <div className="bg-[#282a36]/50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-[#bd93f9] mb-3 flex items-center gap-2">
            <FaBrain />
            Como funciona?
          </h2>
          <ul className="space-y-2 text-[#f8f8f2]">
            <li className="flex items-center gap-2">
              <span className="text-[#50fa7b]">→</span>
              Questionário inteligente sobre tipo, complexidade e prazo do projeto
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#50fa7b]">→</span>
              Análise baseada em IA para gerar estimativas precisas
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#50fa7b]">→</span>
              Chat com Devinho para esclarecer dúvidas específicas
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#50fa7b]">→</span>
              Histórico salvo localmente para acompanhar seus projetos
            </li>
          </ul>
        </div>

        <div className="bg-[#282a36]/50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-[#ffb86c] mb-3">Objetivo</h2>
          <p className="leading-relaxed">
            Ajudar desenvolvedores, especialmente iniciantes, a precificar seus projetos de forma justa e profissional, 
            evitando cobrar muito pouco ou muito além do mercado.
          </p>
        </div>

        <div className="text-center pt-4 border-t border-[#44475a]">
          <p className="text-[#f1fa8c] text-sm">
            Desenvolvido por <span className="font-semibold">Renan Dias</span> • Projeto educacional
          </p>
          <p className="text-[#6272a4] text-xs mt-1">
            Tem um projeto e quer estimar quanto cobrar? A Devlator está aqui para te ajudar!
          </p>
        </div>
      </div>
    </section>
  );
}
