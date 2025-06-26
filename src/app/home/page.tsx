'use client';
import Link from "next/link";
import TypingGreeting from "@/components/TypingGreeting";
import { FaArrowRight, FaCode, FaRocket } from "react-icons/fa";

export default function HomePage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center bg-[#44475a]/40 rounded-2xl p-12 shadow-xl backdrop-blur border border-[#6272a4]/30">
        <TypingGreeting />
        <h1 className="text-5xl font-bold text-[#bd93f9] mt-8 mb-4">
          <FaCode className="inline mr-4" />
          Devlator
        </h1>
        <p className="text-xl text-[#f8f8f2] mb-6 max-w-2xl mx-auto leading-relaxed">
          Tem um projeto e quer estimar quanto cobrar? A Devlator está aqui para te ajudar!
        </p>
        <p className="text-lg text-[#f1fa8c] mb-8">
          Calculadora inteligente com IA para precificação de projetos de desenvolvimento.
        </p>
        <Link 
          href="/calculadora" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all shadow-lg"
        >
          <FaRocket />
          Começar Agora
          <FaArrowRight />
        </Link>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#44475a]/30 p-6 rounded-xl border border-[#6272a4]/20">
          <h3 className="text-lg font-bold text-[#bd93f9] mb-3">Calculadora IA</h3>
          <p className="text-[#f8f8f2]">Questionário inteligente que analisa seu projeto e sugere valores justos.</p>
        </div>
        <div className="bg-[#44475a]/30 p-6 rounded-xl border border-[#6272a4]/20">
          <h3 className="text-lg font-bold text-[#50fa7b] mb-3">Chat Devinho</h3>
          <p className="text-[#f8f8f2]">Converse com nossa IA sobre detalhes específicos do seu projeto.</p>
        </div>
        <div className="bg-[#44475a]/30 p-6 rounded-xl border border-[#6272a4]/20">
          <h3 className="text-lg font-bold text-[#ffb86c] mb-3">Histórico</h3>
          <p className="text-[#f8f8f2]">Salve e acompanhe todas as suas estimativas anteriores.</p>
        </div>
      </section>
    </div>
  );
}
