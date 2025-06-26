'use client';
import TypingGreeting from "@/components/TypingGreeting";

export default function LandingPage() {
  return (
    <section className="w-full max-w-2xl mx-auto p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-8 flex flex-col items-center">
      <TypingGreeting />
      <h1 className="text-4xl font-bold text-[#bd93f9] mt-6 mb-2 text-center">Devlator</h1>
      <p className="text-lg text-[#f8f8f2] mb-4 text-center">Calculadora para DEVs com experiência de IDE, IA e visual moderno.</p>
      <p className="text-base text-[#f1fa8c] text-center">Navegue pelo menu acima para começar!</p>
    </section>
  );
}
