'use client';
import ChatHistory from "@/components/ChatHistory";

export default function HistoricoPage() {
  return (
    <section className="w-full max-w-2xl mx-auto p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-8">
      <h1 className="text-2xl font-bold text-[#bd93f9] mb-4 text-center">Histórico de Conversas</h1>
      <ChatHistory />
      <div className="text-xs text-[#f1fa8c] mt-4 text-center">Aqui ficam salvas suas conversas anteriores com o Devinho.</div>
    </section>
  );
}
