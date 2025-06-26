'use client';
import { useState } from "react";
import { FaRocket, FaCode, FaUsers, FaClock, FaDatabase, FaMobile, FaDesktop, FaCloud } from "react-icons/fa";

const QUESTION_SETS = [
  {
    id: "tipo",
    question: "Que tipo de projeto você quer desenvolver?",
    icon: <FaCode className="text-[#bd93f9]" />,
    options: [
      { value: "website", label: "Website/Landing Page", multiplier: 1 },
      { value: "webapp", label: "Aplicação Web Completa", multiplier: 2.5 },
      { value: "mobile", label: "App Mobile", multiplier: 3 },
      { value: "ecommerce", label: "E-commerce", multiplier: 4 },
      { value: "sistema", label: "Sistema Complexo", multiplier: 5 }
    ]
  },
  {
    id: "complexidade",
    question: "Qual a complexidade das funcionalidades?",
    icon: <FaRocket className="text-[#50fa7b]" />,
    options: [
      { value: "simples", label: "Simples (CRUD básico)", multiplier: 1 },
      { value: "media", label: "Média (Integrações, APIs)", multiplier: 1.8 },
      { value: "complexa", label: "Complexa (IA, Machine Learning)", multiplier: 3 },
      { value: "muito_complexa", label: "Muito Complexa (Blockchain, etc)", multiplier: 4.5 }
    ]
  },
  {
    id: "equipe",
    question: "Quantas pessoas trabalharão no projeto?",
    icon: <FaUsers className="text-[#ffb86c]" />,
    options: [
      { value: "solo", label: "Só eu", multiplier: 1 },
      { value: "dupla", label: "2-3 pessoas", multiplier: 0.8 },
      { value: "equipe", label: "4-6 pessoas", multiplier: 0.6 },
      { value: "grande", label: "Mais de 6 pessoas", multiplier: 0.4 }
    ]
  },
  {
    id: "prazo",
    question: "Qual o prazo para entrega?",
    icon: <FaClock className="text-[#ff79c6]" />,
    options: [
      { value: "urgente", label: "Muito urgente (1-2 semanas)", multiplier: 2 },
      { value: "rapido", label: "Rápido (1 mês)", multiplier: 1.5 },
      { value: "normal", label: "Normal (2-3 meses)", multiplier: 1 },
      { value: "flexivel", label: "Flexível (mais de 3 meses)", multiplier: 0.8 }
    ]
  },
  {
    id: "banco",
    question: "Que tipo de banco de dados será usado?",
    icon: <FaDatabase className="text-[#8be9fd]" />,
    options: [
      { value: "simples", label: "Arquivo local/JSON", multiplier: 0.5 },
      { value: "sql", label: "Banco SQL (MySQL, PostgreSQL)", multiplier: 1 },
      { value: "nosql", label: "NoSQL (MongoDB, Firebase)", multiplier: 1.2 },
      { value: "multiplo", label: "Múltiplos bancos", multiplier: 1.8 }
    ]
  }
];

export default function CalculadoraPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [estimate, setEstimate] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleAnswer = (answer: any) => {
    const newAnswers = { ...answers, [QUESTION_SETS[currentQuestion].id]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTION_SETS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateEstimate(newAnswers);
    }
  };

  const calculateEstimate = async (finalAnswers: Record<string, any>) => {
    setIsCalculating(true);
    
    try {
      const { generateProjectEstimate } = await import('@/lib/gemini');
      const result = await generateProjectEstimate(finalAnswers as any);
      setEstimate(result.estimate);
      setAiReasoning(result.reasoning);
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error('Erro ao calcular estimativa:', error);
      // Fallback calculation
      const baseValue = 2000;
      let finalMultiplier = 1;
      
      Object.values(finalAnswers).forEach((answer: any) => {
        finalMultiplier *= answer.multiplier;
      });
      
      const fallbackEstimate = Math.round(baseValue * finalMultiplier);
      setEstimate(fallbackEstimate);
      setAiReasoning('Estimativa calculada com base em parâmetros técnicos padrão.');
      setAiSuggestions([
        'Defina bem o escopo antes de começar',
        'Use metodologias ágeis para melhor controle',
        'Considere custos de hospedagem e manutenção'
      ]);
    } finally {
      setIsCalculating(false);
    }
  };

  const resetCalculator = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setEstimate(null);
    setIsCalculating(false);
    setAiReasoning('');
    setAiSuggestions([]);
  };

  if (isCalculating) {
    return (
      <section className="w-full max-w-xl mx-auto p-4 md:p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8 text-center">
        <div className="animate-spin w-12 h-12 md:w-16 md:h-16 border-4 border-[#bd93f9] border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl md:text-2xl font-bold text-[#bd93f9]">Calculando com IA...</h2>
        <p className="text-[#f1fa8c] mt-2 text-sm md:text-base">Analisando seu projeto e gerando estimativa personalizada</p>
      </section>
    );
  }

  if (estimate !== null) {
    return (
      <section className="w-full max-w-2xl mx-auto p-4 md:p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#50fa7b] mb-6 text-center">Estimativa Calculada</h2>
        <div className="bg-[#282a36] rounded-xl p-6 md:p-8 border border-[#6272a4] text-center mb-6">
          <div className="text-3xl md:text-5xl font-bold text-[#50fa7b] mb-2">
            R$ {estimate.toLocaleString('pt-BR')}
          </div>
          <p className="text-[#f1fa8c] text-sm md:text-base">Valor estimado para seu projeto</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-bold text-[#bd93f9]">Resumo das Respostas:</h3>
          {Object.entries(answers).map(([key, value]: [string, any]) => {
            const question = QUESTION_SETS.find(q => q.id === key);
            return (
              <div key={key} className="flex justify-between items-center bg-[#282a36]/50 p-3 rounded">
                <span className="text-[#f8f8f2]">{question?.question}</span>
                <span className="text-[#50fa7b] font-semibold">{value.label}</span>
              </div>
            );
          })}
        </div>

        {aiReasoning && (
          <div className="bg-[#282a36]/50 p-4 rounded-xl mb-6">
            <h3 className="text-lg font-bold text-[#8be9fd] mb-2">Análise da IA:</h3>
            <p className="text-[#f8f8f2] text-sm leading-relaxed">{aiReasoning}</p>
          </div>
        )}

        {aiSuggestions.length > 0 && (
          <div className="bg-[#282a36]/50 p-4 rounded-xl mb-6">
            <h3 className="text-lg font-bold text-[#f1fa8c] mb-2">Sugestões:</h3>
            <ul className="space-y-1">
              {aiSuggestions.map((suggestion, i) => (
                <li key={i} className="text-[#f8f8f2] text-sm flex items-center gap-2">
                  <span className="text-[#50fa7b]">→</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={resetCalculator}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#bd93f9] text-[#282a36] font-bold rounded-lg hover:bg-[#ff79c6] transition-all text-sm md:text-base"
          >
            Calcular Novamente
          </button>
          <button className="px-4 md:px-6 py-2 md:py-3 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all text-sm md:text-base">
            Conversar com Devinho
          </button>
        </div>
      </section>
    );
  }

  const question = QUESTION_SETS[currentQuestion];

  return (
    <section className="w-full max-w-xl mx-auto p-4 md:p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs md:text-sm text-[#f1fa8c]">
            Pergunta {currentQuestion + 1} de {QUESTION_SETS.length}
          </span>
          <div className="flex space-x-1">
            {QUESTION_SETS.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${i <= currentQuestion ? 'bg-[#50fa7b]' : 'bg-[#6272a4]'}`}
              />
            ))}
          </div>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold text-[#bd93f9] mb-4 flex items-center gap-3">
          {question.icon}
          <span className="hidden sm:inline">Calculadora de Preço IA</span>
          <span className="sm:hidden">Calculadora IA</span>
        </h1>
        
        <h2 className="text-base md:text-xl text-[#f8f8f2] mb-6">{question.question}</h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option)}
            className="w-full p-3 md:p-4 text-left bg-[#282a36] hover:bg-[#6272a4] rounded-lg border border-[#44475a] transition-all hover:border-[#bd93f9] group"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-base text-[#f8f8f2] group-hover:text-[#bd93f9] transition-colors">
                {option.label}
              </span>
              <span className="text-xs text-[#f1fa8c]">
                {option.multiplier}x
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
