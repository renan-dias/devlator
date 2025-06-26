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
              Quiz dinâmico que adapta perguntas baseado nas suas respostas
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#50fa7b]">→</span>
              Perguntas sobre tecnologia, infraestrutura e ambiente de produção
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#50fa7b]">→</span>
              IA analisa complexidade e gera estimativas com validação de mercado
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#50fa7b]">→</span>
              Exportação de contrato de serviço com todos os detalhes
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
          <h2 className="text-xl font-bold text-[#8be9fd] mb-3">Funcionalidades</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#f1fa8c] mb-2">Calculadora IA</h3>
              <ul className="text-sm space-y-1">
                <li>• Quiz dinâmico e adaptativo</li>
                <li>• Perguntas condicionais</li>
                <li>• Análise de complexidade técnica</li>
                <li>• Estimativa de infraestrutura</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f1fa8c] mb-2">Análise Avançada</h3>
              <ul className="text-sm space-y-1">
                <li>• Validação de preço de mercado</li>
                <li>• Sugestões de otimização</li>
                <li>• Justificativa técnica detalhada</li>
                <li>• Exportação de contrato</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[#282a36]/50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-[#ffb86c] mb-3">Objetivo</h2>
          <p className="leading-relaxed">
            Ajudar desenvolvedores brasileiros a precificar seus projetos de forma justa e profissional, 
            considerando a realidade do mercado nacional e fornecendo ferramentas para negociação transparente.
            A ferramenta busca valorizar o trabalho do desenvolvedor e educar sobre precificação adequada.
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
