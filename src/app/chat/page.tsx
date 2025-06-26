'use client';
import { useState, useEffect } from "react";
import ChatHistory, { addMessage, ChatMessage } from "@/components/ChatHistory";
import ChatContextSelector from "@/components/ChatContextSelector";
import { FaPaperPlane, FaRobot, FaCalculator, FaFilePdf, FaEye } from "react-icons/fa";

interface ProjectContext {
  projectData: any;
  estimate: number;
  reasoning: string;
  marketValidation: string;
  suggestions: string[];
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [showPricingView, setShowPricingView] = useState(false);
  const [canShowPricing, setCanShowPricing] = useState(false);

  useEffect(() => {
    // Carregar mensagens do localStorage
    const loadMessages = () => {
      if (typeof window !== 'undefined') {
        try {
          const data = localStorage.getItem('devlator-chat-history');
          return data ? JSON.parse(data) : [];
        } catch {
          return [];
        }
      }
      return [];
    };
    setMessages(loadMessages());

    // Verificar se há contexto da calculadora
    if (typeof window !== 'undefined') {
      const contextData = localStorage.getItem('devlator-chat-context');
      if (contextData) {
        try {
          const parsedContext = JSON.parse(contextData);
          setProjectContext(parsedContext);
          setContext(['calculadora']); // Adicionar contexto automaticamente
        } catch (error) {
          console.error('Erro ao carregar contexto:', error);
        }
      }
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      context: [...context]
    };

    // Adicionar mensagem do usuário
    setMessages(prev => [...prev, userMessage]);
    addMessage(userMessage);
    
    setInput('');
    setIsLoading(true);

    try {
      const { chatWithDevinho } = await import('@/lib/gemini');
      
      // Incluir contexto da calculadora se disponível
      let enhancedMessage = input.trim();
      if (projectContext) {
        enhancedMessage += `\n\nContexto do projeto da calculadora:
        Estimativa atual: R$ ${projectContext.estimate?.toLocaleString('pt-BR')}
        Dados do projeto: ${JSON.stringify(projectContext.projectData, null, 2)}`;
      }
      
      const response = await chatWithDevinho(enhancedMessage, context, projectContext?.projectData);
      
      // Detectar se a IA coletou informações suficientes para gerar precificação
      const hasEnoughInfo = response.toLowerCase().includes('precificação') || 
                           response.toLowerCase().includes('estimativa') ||
                           response.toLowerCase().includes('orçamento') ||
                           (messages.length > 3 && projectContext);
      
      if (hasEnoughInfo && !canShowPricing) {
        setCanShowPricing(true);
      }
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response,
        timestamp: Date.now(),
        context: []
      };

      setMessages(prev => [...prev, botMessage]);
      addMessage(botMessage);
    } catch (error) {
      console.error('Erro no chat:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Desculpe, tive um problema técnico. Tente novamente em alguns instantes.',
        timestamp: Date.now(),
        context: []
      };
      
      setMessages(prev => [...prev, errorMessage]);
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8">
      <div className="flex items-center gap-3 mb-6">
        <FaRobot className="text-xl md:text-2xl text-[#50fa7b]" />
        <h1 className="text-xl md:text-2xl font-bold text-[#bd93f9]">Chat com Devinho</h1>
      </div>
      
      <div className="bg-[#282a36]/50 rounded-xl p-3 md:p-4 mb-6 border border-[#44475a] h-64 md:h-96 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-[#6272a4] py-8">
            <FaRobot className="text-3xl md:text-4xl mx-auto mb-4 text-[#50fa7b]" />
            <p className="text-sm md:text-base">Olá! Sou o Devinho, seu assistente para precificação de projetos.</p>
            <p className="text-xs md:text-sm mt-2">Faça uma pergunta sobre seu projeto ou peça ajuda com estimativas!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`my-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 md:px-4 py-2 md:py-3 rounded-lg max-w-[85%] md:max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-[#bd93f9] text-[#282a36]' 
                : 'bg-[#44475a] text-[#f8f8f2] border border-[#6272a4]'
            }`}>
              <div className="whitespace-pre-wrap text-xs md:text-sm">{msg.content}</div>
              {msg.context && msg.context.length > 0 && (
                <div className="mt-2 text-xs opacity-75">
                  Contexto: {msg.context.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start my-3">
            <div className="bg-[#44475a] text-[#f8f8f2] px-3 md:px-4 py-2 md:py-3 rounded-lg border border-[#6272a4]">
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-[#50fa7b] border-t-transparent rounded-full"></div>
                Devinho está pensando...
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatContextSelector selected={context} onChange={setContext} />

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua pergunta sobre precificação de projetos..."
          className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-[#282a36] border border-[#44475a] rounded-lg text-[#f8f8f2] placeholder-[#6272a4] resize-none focus:outline-none focus:border-[#bd93f9] focus:ring-1 focus:ring-[#bd93f9] text-sm md:text-base"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="px-4 md:px-6 py-2 md:py-3 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <FaPaperPlane className="text-xs md:text-sm" />
          Enviar
        </button>
      </div>
    </section>
  );
}
