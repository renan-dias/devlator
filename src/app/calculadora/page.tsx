'use client';
import { useState, useEffect } from "react";
import { FaRocket, FaCode, FaUsers, FaClock, FaDatabase, FaMobile, FaDesktop, FaCloud, FaServer, FaShieldAlt, FaCog, FaGraduationCap, FaMoneyBillWave, FaChartLine } from "react-icons/fa";

interface QuestionOption {
  value: string;
  label: string;
  multiplier: number;
  description?: string;
}

interface Question {
  id: string;
  question: string;
  icon: JSX.Element;
  options: QuestionOption[];
  condition?: (answers: Record<string, any>) => boolean;
  category: string;
}

const QUESTIONS: Question[] = [
  // Básicas - Sempre aparecem
  {
    id: "tipo",
    question: "Que tipo de projeto você quer desenvolver?",
    icon: <FaCode className="text-[#bd93f9]" />,
    category: "Básica",
    options: [
      { value: "website", label: "Website/Landing Page", multiplier: 1, description: "Site institucional ou página de venda" },
      { value: "webapp", label: "Aplicação Web Completa", multiplier: 2.5, description: "Sistema web com autenticação e funcionalidades" },
      { value: "mobile", label: "App Mobile", multiplier: 3, description: "Aplicativo para iOS/Android" },
      { value: "ecommerce", label: "E-commerce", multiplier: 4, description: "Loja virtual completa" },
      { value: "sistema", label: "Sistema Complexo", multiplier: 5, description: "ERP, CRM ou sistema empresarial" }
    ]
  },
  {
    id: "complexidade",
    question: "Qual a complexidade das funcionalidades?",
    icon: <FaRocket className="text-[#50fa7b]" />,
    category: "Básica",
    options: [
      { value: "simples", label: "Simples (CRUD básico)", multiplier: 1, description: "Operações básicas de dados" },
      { value: "media", label: "Média (Integrações, APIs)", multiplier: 1.8, description: "APIs externas, pagamentos" },
      { value: "complexa", label: "Complexa (IA, Machine Learning)", multiplier: 3, description: "Inteligência artificial, análise de dados" },
      { value: "muito_complexa", label: "Muito Complexa (Blockchain, IoT)", multiplier: 4.5, description: "Tecnologias emergentes" }
    ]
  },

  // Equipe e Experiência
  {
    id: "equipe",
    question: "Quantas pessoas trabalharão no projeto?",
    icon: <FaUsers className="text-[#ffb86c]" />,
    category: "Equipe",
    options: [
      { value: "solo", label: "Só eu", multiplier: 1, description: "Desenvolvedor solo" },
      { value: "dupla", label: "2-3 pessoas", multiplier: 0.8, description: "Pequena equipe" },
      { value: "equipe", label: "4-6 pessoas", multiplier: 0.6, description: "Equipe média" },
      { value: "grande", label: "Mais de 6 pessoas", multiplier: 0.4, description: "Equipe grande" }
    ]
  },
  {
    id: "experiencia",
    question: "Qual seu nível de experiência com as tecnologias do projeto?",
    icon: <FaGraduationCap className="text-[#f1fa8c]" />,
    category: "Equipe",
    options: [
      { value: "iniciante", label: "Iniciante", multiplier: 2, description: "Primeiro projeto com essas tecnologias" },
      { value: "intermediario", label: "Intermediário", multiplier: 1.5, description: "Alguma experiência prévia" },
      { value: "avancado", label: "Avançado", multiplier: 1, description: "Muita experiência" },
      { value: "especialista", label: "Especialista", multiplier: 0.8, description: "Expert na tecnologia" }
    ]
  },

  // Prazo e Urgência
  {
    id: "prazo",
    question: "Qual o prazo para entrega?",
    icon: <FaClock className="text-[#ff79c6]" />,
    category: "Prazo",
    options: [
      { value: "urgente", label: "Muito urgente (1-2 semanas)", multiplier: 3, description: "Trabalho 24/7, stress alto" },
      { value: "rapido", label: "Rápido (1 mês)", multiplier: 1.8, description: "Ritmo acelerado" },
      { value: "normal", label: "Normal (2-3 meses)", multiplier: 1, description: "Desenvolvimento saudável" },
      { value: "flexivel", label: "Flexível (mais de 3 meses)", multiplier: 0.8, description: "Sem pressa" }
    ]
  },

  // Tecnologia - Condicionais
  {
    id: "banco",
    question: "Que tipo de banco de dados será usado?",
    icon: <FaDatabase className="text-[#8be9fd]" />,
    category: "Tecnologia",
    condition: (answers) => answers.tipo?.value !== "website",
    options: [
      { value: "simples", label: "Arquivo local/JSON", multiplier: 0.5, description: "Dados simples" },
      { value: "sql", label: "Banco SQL (MySQL, PostgreSQL)", multiplier: 1, description: "Banco relacional" },
      { value: "nosql", label: "NoSQL (MongoDB, Firebase)", multiplier: 1.2, description: "Banco não-relacional" },
      { value: "multiplo", label: "Múltiplos bancos", multiplier: 1.8, description: "Arquitetura complexa" }
    ]
  },
  {
    id: "plataforma",
    question: "Em quais plataformas o app será disponibilizado?",
    icon: <FaMobile className="text-[#ff79c6]" />,
    category: "Tecnologia",
    condition: (answers) => answers.tipo?.value === "mobile",
    options: [
      { value: "android", label: "Apenas Android", multiplier: 1, description: "Uma plataforma" },
      { value: "ios", label: "Apenas iOS", multiplier: 1.2, description: "Plataforma Apple" },
      { value: "ambos", label: "Android + iOS", multiplier: 1.8, description: "Multiplataforma" },
      { value: "hibrido", label: "App Híbrido", multiplier: 1.3, description: "React Native, Flutter" }
    ]
  },

  // Infraestrutura
  {
    id: "hospedagem",
    question: "Onde o projeto será hospedado?",
    icon: <FaCloud className="text-[#8be9fd]" />,
    category: "Infraestrutura",
    condition: (answers) => answers.tipo?.value !== "mobile",
    options: [
      { value: "compartilhada", label: "Hospedagem compartilhada", multiplier: 0.8, description: "Básica e barata" },
      { value: "vps", label: "VPS/Cloud básico", multiplier: 1, description: "Servidor virtual" },
      { value: "aws", label: "AWS/Azure/GCP", multiplier: 1.5, description: "Cloud profissional" },
      { value: "kubernetes", label: "Kubernetes/Docker", multiplier: 2, description: "Infraestrutura avançada" }
    ]
  },
  {
    id: "seguranca",
    question: "Qual o nível de segurança necessário?",
    icon: <FaShieldAlt className="text-[#50fa7b]" />,
    category: "Infraestrutura",
    condition: (answers) => answers.tipo?.value === "webapp" || answers.tipo?.value === "sistema" || answers.tipo?.value === "ecommerce",
    options: [
      { value: "basica", label: "Segurança básica", multiplier: 1, description: "HTTPS, autenticação simples" },
      { value: "media", label: "Segurança média", multiplier: 1.5, description: "2FA, criptografia" },
      { value: "alta", label: "Segurança alta", multiplier: 2.5, description: "Auditoria, compliance" },
      { value: "militar", label: "Nível militar", multiplier: 4, description: "Máxima segurança" }
    ]
  },

  // E-commerce específico
  {
    id: "pagamento",
    question: "Quais métodos de pagamento serão integrados?",
    icon: <FaMoneyBillWave className="text-[#f1fa8c]" />,
    category: "E-commerce",
    condition: (answers) => answers.tipo?.value === "ecommerce",
    options: [
      { value: "basico", label: "Cartão + PIX", multiplier: 1, description: "Pagamentos básicos" },
      { value: "completo", label: "Múltiplos métodos", multiplier: 1.8, description: "Boleto, carteiras digitais" },
      { value: "internacional", label: "Pagamentos internacionais", multiplier: 2.5, description: "PayPal, Stripe global" },
      { value: "crypto", label: "Inclui criptomoedas", multiplier: 3, description: "Bitcoin, Ethereum" }
    ]
  },

  // Manutenção
  {
    id: "manutencao",
    question: "Você fará a manutenção do projeto?",
    icon: <FaCog className="text-[#ffb86c]" />,
    category: "Manutenção",
    options: [
      { value: "nao", label: "Não, só desenvolvimento", multiplier: 1, description: "Entrega e tchau" },
      { value: "basica", label: "Manutenção básica (3 meses)", multiplier: 1.2, description: "Suporte inicial" },
      { value: "completa", label: "Manutenção completa (1 ano)", multiplier: 1.8, description: "Suporte extenso" },
      { value: "permanente", label: "Manutenção permanente", multiplier: 2.5, description: "Parceria de longo prazo" }
    ]
  }
];

export default function CalculadoraPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [estimate, setEstimate] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [marketValidation, setMarketValidation] = useState<string>('');
  const [applicableQuestions, setApplicableQuestions] = useState<Question[]>([]);

  // Calcular quais perguntas são aplicáveis baseadas nas respostas atuais
  useEffect(() => {
    const applicable = QUESTIONS.filter(question => 
      !question.condition || question.condition(answers)
    );
    setApplicableQuestions(applicable);
  }, [answers]);

  const handleAnswer = (answer: QuestionOption) => {
    const currentQuestion = applicableQuestions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Recalcular perguntas aplicáveis após a resposta
    const newApplicable = QUESTIONS.filter(question => 
      !question.condition || question.condition(newAnswers)
    );

    if (currentQuestionIndex < newApplicable.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
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
      setMarketValidation(result.marketValidation);
      
      // Salvar no histórico local
      const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        answers: finalAnswers,
        estimate: result.estimate,
        reasoning: result.reasoning,
        suggestions: result.suggestions,
        marketValidation: result.marketValidation
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('devlator-history') || '[]');
      localStorage.setItem('devlator-history', JSON.stringify([historyItem, ...existingHistory]));
      
    } catch (error) {
      console.error('Erro ao calcular estimativa:', error);
      // Fallback calculation mais sofisticado
      const baseValue = 3000;
      let finalMultiplier = 1;
      
      Object.values(finalAnswers).forEach((answer: any) => {
        finalMultiplier *= answer.multiplier;
      });
      
      const fallbackEstimate = Math.round(baseValue * finalMultiplier);
      setEstimate(fallbackEstimate);
      setAiReasoning('Estimativa calculada com base em parâmetros técnicos e experiência de mercado. Valores podem variar conforme região e especialização.');
      setMarketValidation('Valor alinhado com práticas do mercado brasileiro. Projetos similares variam entre 70% a 130% dependendo da complexidade e região.');
      setAiSuggestions([
        'Defina bem o escopo antes de começar o desenvolvimento',
        'Use metodologias ágeis para melhor controle do projeto',
        'Considere custos de hospedagem e manutenção no orçamento',
        'Mantenha documentação atualizada durante o desenvolvimento',
        'Planeje testes desde o início do projeto'
      ]);
    } finally {
      setIsCalculating(false);
    }
  };

  const resetCalculator = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEstimate(null);
    setIsCalculating(false);
    setAiReasoning('');
    setAiSuggestions([]);
    setMarketValidation('');
    setApplicableQuestions([]);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Remover a última resposta
      const currentQuestion = applicableQuestions[currentQuestionIndex];
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
    }
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
            const question = QUESTIONS.find((q: Question) => q.id === key);
            return (
              <div key={key} className="flex justify-between items-center bg-[#282a36]/50 p-3 rounded">
                <span className="text-[#f8f8f2]">{question?.question}</span>
                <span className="text-[#50fa7b] font-semibold">{value.label}</span>
              </div>
            );
          })}
        </div>

        {aiReasoning && (
          <div className="bg-[#282a36]/50 p-4 rounded-xl mb-4">
            <h3 className="text-lg font-bold text-[#8be9fd] mb-2">Análise Técnica:</h3>
            <p className="text-[#f8f8f2] text-sm leading-relaxed">{aiReasoning}</p>
          </div>
        )}

        {marketValidation && (
          <div className="bg-[#282a36]/50 p-4 rounded-xl mb-4">
            <h3 className="text-lg font-bold text-[#f1fa8c] mb-2">Validação de Mercado:</h3>
            <p className="text-[#f8f8f2] text-sm leading-relaxed">{marketValidation}</p>
          </div>
        )}

        {aiSuggestions.length > 0 && (
          <div className="bg-[#282a36]/50 p-4 rounded-xl mb-6">
            <h3 className="text-lg font-bold text-[#50fa7b] mb-2">Sugestões para Otimização:</h3>
            <ul className="space-y-2">
              {aiSuggestions.map((suggestion, i) => (
                <li key={i} className="text-[#f8f8f2] text-sm flex items-start gap-3">
                  <span className="text-[#50fa7b] mt-1">→</span>
                  <span>{suggestion}</span>
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
          <button 
            onClick={() => window.location.href = '/chat'}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all text-sm md:text-base"
          >
            Conversar com Devinho
          </button>
          <button 
            onClick={() => {
              const projectName = prompt('Nome do projeto:');
              const developerName = prompt('Seu nome/empresa:');
              if (projectName && developerName) {
                exportContract(projectName, developerName);
              }
            }}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#ffb86c] text-[#282a36] font-bold rounded-lg hover:bg-[#f1fa8c] transition-all text-sm md:text-base"
          >
            Exportar Contrato
          </button>
        </div>
      </section>
    );
  }

  if (applicableQuestions.length === 0) {
    return (
      <section className="w-full max-w-xl mx-auto p-4 md:p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8 text-center">
        <div className="animate-spin w-12 h-12 md:w-16 md:h-16 border-4 border-[#bd93f9] border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl md:text-2xl font-bold text-[#bd93f9]">Carregando perguntas...</h2>
      </section>
    );
  }

  const currentQuestion = applicableQuestions[currentQuestionIndex];

  return (
    <section className="w-full max-w-xl mx-auto p-4 md:p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs md:text-sm text-[#f1fa8c]">
            Pergunta {currentQuestionIndex + 1} de {applicableQuestions.length}
          </span>
          <div className="flex space-x-1">
            {applicableQuestions.map((_: Question, i: number) => (
              <div 
                key={i} 
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${i <= currentQuestionIndex ? 'bg-[#50fa7b]' : 'bg-[#6272a4]'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <span className="text-xs text-[#8be9fd] bg-[#282a36] px-2 py-1 rounded">
            {currentQuestion.category}
          </span>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold text-[#bd93f9] mb-4 flex items-center gap-3">
          {currentQuestion.icon}
          <span className="hidden sm:inline">Calculadora de Preço IA</span>
          <span className="sm:hidden">Calculadora IA</span>
        </h1>
        
        <h2 className="text-base md:text-xl text-[#f8f8f2] mb-6">{currentQuestion.question}</h2>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option: QuestionOption) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option)}
            className="w-full p-3 md:p-4 text-left bg-[#282a36] hover:bg-[#6272a4] rounded-lg border border-[#44475a] transition-all hover:border-[#bd93f9] group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-sm md:text-base text-[#f8f8f2] group-hover:text-[#bd93f9] transition-colors block">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-[#6272a4] mt-1 block">
                    {option.description}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#f1fa8c] ml-2">
                {option.multiplier}x
              </span>
            </div>
          </button>
        ))}
      </div>

      {currentQuestionIndex > 0 && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={goToPreviousQuestion}
            className="px-4 py-2 text-sm bg-[#6272a4] text-[#f8f8f2] rounded-lg hover:bg-[#44475a] transition-all"
          >
            ← Voltar
          </button>
        </div>
      )}
    </section>
  );
}
