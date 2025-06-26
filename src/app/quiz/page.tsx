'use client';
import Link from 'next/link';

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#282a36] to-[#1a1a2e] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8be9fd] mb-4">
            Quiz de Precificação
          </h1>
          <p className="text-[#f8f8f2] text-lg">
            Em desenvolvimento... Em breve!
          </p>
        </div>
        
        <div className="text-center">
          <Link 
            href="/calculadora"
            className="inline-block bg-[#50fa7b] text-[#282a36] px-6 py-3 rounded-lg font-semibold hover:bg-[#50fa7b]/90 transition-all"
          >
            Ir para Calculadora
          </Link>
        </div>
      </div>
    </div>
  );
}
