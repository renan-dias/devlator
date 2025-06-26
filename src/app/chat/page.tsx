'use client';
import { useState, useEffect } from "react";
import ChatHistory, { addMessage, ChatMessage } from "@/components/ChatHistory";
import ChatContextSelector from "@/components/ChatContextSelector";
import { FaPaperPlane, FaRobot, FaCalculator, FaFilePdf, FaEye, FaExclamationTriangle } from "react-icons/fa";
import Modal, { useModal } from "@/components/Modal";

interface ProjectContext {
  projectData: any;
  estimate: number;
  reasoning: string;
  marketValidation: string;
  suggestions: string[];
}

interface ContextData {
  figma?: { image: string };
  site?: { url: string; content: string; analysis: string };
  doc?: { files: File[]; analysis?: string };
  regional?: { city: string; state: string; country: string; timezone: string };
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [showPricingView, setShowPricingView] = useState(false);
  const [canShowPricing, setCanShowPricing] = useState(false);
  const [contextData, setContextData] = useState<ContextData>({});
  const { isOpen: isErrorOpen, openModal: openError, closeModal: closeError } = useModal();
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleContextData = (type: string, data: any) => {
    // Tratar erros
    if (type === 'error') {
      showError(data.message);
      return;
    }

    setContextData(prev => ({
      ...prev,
      [type]: data
    }));

    // Adicionar contexto específico baseado no tipo
    if (!context.includes(type)) {
      setContext(prev => [...prev, type]);
    }

    // Criar mensagem automática para explicar o contexto adicionado
    let contextMessage = '';
    switch (type) {
      case 'figma':
        contextMessage = '🎨 Imagem do Figma carregada! Agora posso analisar seu design para dar sugestões mais precisas sobre complexidade visual e funcionalidades.';
        break;
      case 'site':
        contextMessage = `🌐 Site "${data.url}" analisado! Identifiquei características que podem servir de referência para sua precificação.`;
        break;
      case 'doc':
        contextMessage = `📄 ${data.files.length} documento(s) carregado(s)! Posso usar essas informações para entender melhor os requisitos do projeto.`;
        break;
      case 'regional':
        contextMessage = `📍 Localização identificada: ${data.city}, ${data.state}. Vou ajustar as sugestões de preço baseado no mercado regional.`;
        break;
    }

    if (contextMessage) {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'bot',
        content: contextMessage,
        timestamp: Date.now(),
        context: [type]
      };
      setMessages(prev => [...prev, botMessage]);
      addMessage(botMessage);
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    openError();
  };

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
      
      // Incluir dados de contexto adicional
      const fullContextData = {
        projectData: projectContext?.projectData,
        ...contextData
      };
      
      const response = await chatWithDevinho(enhancedMessage, context, fullContextData);
      
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
      showError('Desculpe, tive um problema técnico. Tente novamente em alguns instantes.');
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

  const generatePDF = async () => {
    if (!projectContext) return;

    try {
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      
      // Configurações
      pdf.setFont('helvetica');
      let yPosition = 20;
      const pageWidth = (pdf as any).internal.pageSize.width;
      const margin = 20;
      const lineHeight = 7;

      // Título
      pdf.setFontSize(18);
      pdf.setTextColor(189, 147, 249); // Cor roxa do tema
      pdf.text('RELATÓRIO DE PRECIFICAÇÃO - DEVLATOR', margin, yPosition);
      yPosition += lineHeight * 2;

      // Data e estimativa
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += lineHeight;
      
      pdf.setFontSize(16);
      pdf.setTextColor(80, 250, 123); // Verde do tema
      pdf.text(`Estimativa: R$ ${projectContext.estimate?.toLocaleString('pt-BR')}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Especificações do projeto
      pdf.setFontSize(14);
      pdf.setTextColor(189, 147, 249);
      pdf.text('ESPECIFICAÇÕES DO PROJETO:', margin, yPosition);
      yPosition += lineHeight;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      Object.entries(projectContext.projectData || {}).forEach(([key, value]: [string, any]) => {
        const text = `• ${key}: ${value.label || value}`;
        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
        pdf.text(lines, margin, yPosition);
        yPosition += lineHeight * lines.length;
      });
      yPosition += lineHeight;

      // Análise técnica
      pdf.setFontSize(14);
      pdf.setTextColor(189, 147, 249);
      pdf.text('ANÁLISE TÉCNICA:', margin, yPosition);
      yPosition += lineHeight;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const reasoningLines = pdf.splitTextToSize(projectContext.reasoning || 'Análise não disponível', pageWidth - margin * 2);
      pdf.text(reasoningLines, margin, yPosition);
      yPosition += lineHeight * reasoningLines.length + lineHeight;

      // Validação de mercado
      pdf.setFontSize(14);
      pdf.setTextColor(189, 147, 249);
      pdf.text('VALIDAÇÃO DE MERCADO:', margin, yPosition);
      yPosition += lineHeight;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const validationLines = pdf.splitTextToSize(projectContext.marketValidation || 'Validação não disponível', pageWidth - margin * 2);
      pdf.text(validationLines, margin, yPosition);
      yPosition += lineHeight * validationLines.length + lineHeight;

      // Sugestões
      pdf.setFontSize(14);
      pdf.setTextColor(189, 147, 249);
      pdf.text('SUGESTÕES DE OTIMIZAÇÃO:', margin, yPosition);
      yPosition += lineHeight;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      (projectContext.suggestions || []).forEach((suggestion: string, i: number) => {
        const text = `${i + 1}. ${suggestion}`;
        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
        pdf.text(lines, margin, yPosition);
        yPosition += lineHeight * lines.length;
      });

      // Nova página para conversas se necessário
      if (messages.length > 0) {
        pdf.addPage();
        yPosition = 20;

        pdf.setFontSize(14);
        pdf.setTextColor(189, 147, 249);
        pdf.text('CONVERSAS DO CHAT:', margin, yPosition);
        yPosition += lineHeight * 2;

        messages.forEach((msg) => {
          if (yPosition > 270) { // Nova página se necessário
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(10);
          pdf.setTextColor(80, 250, 123);
          pdf.text(msg.role === 'user' ? 'USUÁRIO:' : 'DEVINHO:', margin, yPosition);
          yPosition += lineHeight;

          pdf.setTextColor(0, 0, 0);
          const contentLines = pdf.splitTextToSize(msg.content, pageWidth - margin * 2);
          pdf.text(contentLines, margin, yPosition);
          yPosition += lineHeight * contentLines.length + lineHeight;
        });
      }

      // Rodapé
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Relatório gerado pelo Devlator - Calculadora para DEVs', margin, (pdf as any).internal.pageSize.height - 10);
        pdf.text(`https://devlator.com | Página ${i} de ${totalPages}`, pageWidth - margin - 50, (pdf as any).internal.pageSize.height - 10);
      }

      // Salvar
      pdf.save(`relatorio-precificacao-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback para texto simples
      const pdfContent = `
RELATÓRIO DE PRECIFICAÇÃO - DEVLATOR
===================================

Data: ${new Date().toLocaleDateString('pt-BR')}
Estimativa: R$ ${projectContext.estimate?.toLocaleString('pt-BR')}

ESPECIFICAÇÕES DO PROJETO:
${Object.entries(projectContext.projectData || {}).map(([key, value]: [string, any]) => 
  `• ${key}: ${value.label || value}`
).join('\n')}

ANÁLISE TÉCNICA:
${projectContext.reasoning || 'Análise não disponível'}

VALIDAÇÃO DE MERCADO:
${projectContext.marketValidation || 'Validação não disponível'}

SUGESTÕES DE OTIMIZAÇÃO:
${(projectContext.suggestions || []).map((suggestion: string, i: number) => 
  `${i + 1}. ${suggestion}`
).join('\n')}

---
Relatório gerado pelo Devlator - Calculadora para DEVs
https://devlator.com
`;

      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-precificacao-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  if (showPricingView && projectContext) {
    return (
      <section className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaCalculator className="text-xl md:text-2xl text-[#50fa7b]" />
            <h1 className="text-xl md:text-2xl font-bold text-[#bd93f9]">Precificação Detalhada</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generatePDF}
              className="px-4 py-2 bg-[#ff79c6] text-[#282a36] font-bold rounded-lg hover:bg-[#bd93f9] transition-all flex items-center gap-2 text-sm"
            >
              <FaFilePdf />
              Exportar PDF
            </button>
            <button
              onClick={() => setShowPricingView(false)}
              className="px-4 py-2 bg-[#6272a4] text-[#f8f8f2] font-bold rounded-lg hover:bg-[#44475a] transition-all text-sm"
            >
              Voltar ao Chat
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-[#282a36]/50 p-6 rounded-xl border border-[#6272a4]">
              <h3 className="text-lg font-bold text-[#50fa7b] mb-4">Estimativa Final</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#50fa7b] mb-2">
                  R$ {projectContext.estimate?.toLocaleString('pt-BR')}
                </div>
                <p className="text-[#f1fa8c] text-sm">Valor estimado para o projeto</p>
              </div>
            </div>

            <div className="bg-[#282a36]/50 p-6 rounded-xl border border-[#6272a4]">
              <h3 className="text-lg font-bold text-[#8be9fd] mb-4">Especificações</h3>
              <div className="space-y-2">
                {Object.entries(projectContext.projectData || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-[#f8f8f2] text-sm capitalize">{key}:</span>
                    <span className="text-[#f1fa8c] text-sm font-semibold">{value.label || value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#282a36]/50 p-6 rounded-xl border border-[#6272a4]">
              <h3 className="text-lg font-bold text-[#bd93f9] mb-4">Análise Técnica</h3>
              <p className="text-[#f8f8f2] text-sm leading-relaxed">
                {projectContext.reasoning || 'Análise não disponível'}
              </p>
            </div>

            <div className="bg-[#282a36]/50 p-6 rounded-xl border border-[#6272a4]">
              <h3 className="text-lg font-bold text-[#f1fa8c] mb-4">Validação de Mercado</h3>
              <p className="text-[#f8f8f2] text-sm leading-relaxed">
                {projectContext.marketValidation || 'Validação não disponível'}
              </p>
            </div>

            <div className="bg-[#282a36]/50 p-6 rounded-xl border border-[#6272a4]">
              <h3 className="text-lg font-bold text-[#50fa7b] mb-4">Sugestões</h3>
              <ul className="space-y-2">
                {(projectContext.suggestions || []).map((suggestion: string, i: number) => (
                  <li key={i} className="text-[#f8f8f2] text-sm flex items-start gap-2">
                    <span className="text-[#50fa7b]">→</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaRobot className="text-xl md:text-2xl text-[#50fa7b]" />
          <h1 className="text-xl md:text-2xl font-bold text-[#bd93f9]">Chat com Devinho</h1>
        </div>
        {projectContext && (
          <div className="flex items-center gap-2 bg-[#282a36] px-3 py-1 rounded-lg border border-[#6272a4]">
            <FaCalculator className="text-[#50fa7b] text-sm" />
            <span className="text-[#f1fa8c] text-xs">Contexto da calculadora carregado</span>
          </div>
        )}
      </div>
      
      <div className="bg-[#282a36]/50 rounded-xl p-3 md:p-4 mb-6 border border-[#44475a] h-64 md:h-96 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-[#6272a4] py-8">
            <FaRobot className="text-3xl md:text-4xl mx-auto mb-4 text-[#50fa7b]" />
            <p className="text-sm md:text-base">Olá! Sou o Devinho, seu assistente para precificação de projetos.</p>
            <p className="text-xs md:text-sm mt-2">
              {projectContext 
                ? "Vi que você veio da calculadora! Posso te ajudar a refinar sua estimativa." 
                : "Faça uma pergunta sobre seu projeto ou peça ajuda com estimativas!"
              }
            </p>
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

      <ChatContextSelector 
        selected={context} 
        onChange={setContext} 
        onContextData={handleContextData}
      />

      {canShowPricing && projectContext && (
        <div className="mb-4 p-4 bg-[#50fa7b]/10 border border-[#50fa7b]/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaEye className="text-[#50fa7b]" />
              <span className="text-[#50fa7b] font-semibold text-sm">Precificação pronta para visualização</span>
            </div>
            <button
              onClick={() => setShowPricingView(true)}
              className="px-4 py-2 bg-[#50fa7b] text-[#282a36] font-bold rounded-lg hover:bg-[#8be9fd] transition-all text-sm"
            >
              Mostrar Precificação
            </button>
          </div>
        </div>
      )}

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

      {/* Modal de Erro */}
      <Modal isOpen={isErrorOpen} onClose={closeError} title="Erro no Sistema">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-[#ff5555] text-xl mt-1" />
          <div>
            <p className="text-[#f8f8f2] mb-4">{errorMessage}</p>
            <button
              onClick={closeError}
              className="px-4 py-2 bg-[#6272a4] text-[#f8f8f2] rounded-lg hover:bg-[#44475a] transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
