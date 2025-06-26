import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export interface ProjectData {
  tipo: { value: string; label: string; multiplier: number };
  complexidade: { value: string; label: string; multiplier: number };
  equipe: { value: string; label: string; multiplier: number };
  prazo: { value: string; label: string; multiplier: number };
  banco: { value: string; label: string; multiplier: number };
}

export async function generateProjectEstimate(projectData: ProjectData): Promise<{
  estimate: number;
  reasoning: string;
  suggestions: string[];
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Como especialista em precificação de projetos de desenvolvimento de software, analise os seguintes dados:

Tipo de Projeto: ${projectData.tipo.label}
Complexidade: ${projectData.complexidade.label}
Equipe: ${projectData.equipe.label}
Prazo: ${projectData.prazo.label}
Banco de Dados: ${projectData.banco.label}

Por favor, forneça:
1. Uma estimativa de preço em reais (R$) baseada no mercado brasileiro
2. Justificativa técnica para o valor
3. 3 sugestões para otimizar o projeto

Considere fatores como:
- Complexidade técnica
- Tempo de desenvolvimento
- Tamanho da equipe
- Urgência do prazo
- Infraestrutura necessária
- Mercado brasileiro de desenvolvimento

Formato de resposta:
ESTIMATIVA: R$ [valor]
JUSTIFICATIVA: [explicação detalhada]
SUGESTÕES:
- [sugestão 1]
- [sugestão 2]
- [sugestão 3]
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse da resposta
    const estimateMatch = text.match(/ESTIMATIVA:\s*R\$\s*([\d.,]+)/);
    const justificativaMatch = text.match(/JUSTIFICATIVA:\s*([\s\S]*?)(?=SUGESTÕES:|$)/);
    const sugestoesMatch = text.match(/SUGESTÕES:\s*((?:- .*(?:\n|$))*)/);

    const estimate = estimateMatch 
      ? parseInt(estimateMatch[1].replace(/[.,]/g, '')) 
      : calculateFallbackEstimate(projectData);

    const reasoning = justificativaMatch 
      ? justificativaMatch[1].trim() 
      : 'Estimativa baseada em análise de mercado e complexidade técnica.';

    const suggestions = sugestoesMatch
      ? sugestoesMatch[1].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.trim().substring(1).trim())
      : [
          'Considere dividir o projeto em fases menores',
          'Utilize frameworks e bibliotecas consolidadas',
          'Mantenha comunicação constante com o cliente'
        ];

    return {
      estimate,
      reasoning,
      suggestions
    };
  } catch (error) {
    console.error('Erro ao gerar estimativa:', error);
    
    // Fallback em caso de erro
    return {
      estimate: calculateFallbackEstimate(projectData),
      reasoning: 'Estimativa calculada com base em parâmetros técnicos padrão do mercado brasileiro.',
      suggestions: [
        'Defina bem o escopo antes de começar',
        'Use metodologias ágeis para melhor controle',
        'Considere custos de hospedagem e manutenção'
      ]
    };
  }
}

function calculateFallbackEstimate(projectData: ProjectData): number {
  const baseValue = 2500;
  const multiplier = 
    projectData.tipo.multiplier *
    projectData.complexidade.multiplier *
    projectData.equipe.multiplier *
    projectData.prazo.multiplier *
    projectData.banco.multiplier;
  
  return Math.round(baseValue * multiplier);
}

export async function chatWithDevinho(
  message: string, 
  context: string[], 
  projectData?: ProjectData
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  let contextPrompt = '';
  if (context.includes('regional')) {
    contextPrompt += 'Considere valores do mercado brasileiro de desenvolvimento. ';
  }
  if (context.includes('figma')) {
    contextPrompt += 'O usuário mencionou ter designs/mockups prontos. ';
  }
  if (context.includes('site')) {
    contextPrompt += 'O usuário tem sites de referência como exemplo. ';
  }
  if (context.includes('doc')) {
    contextPrompt += 'O usuário tem documentação técnica disponível. ';
  }

  let projectContext = '';
  if (projectData) {
    projectContext = `
Dados do projeto atual:
- Tipo: ${projectData.tipo.label}
- Complexidade: ${projectData.complexidade.label}
- Equipe: ${projectData.equipe.label}
- Prazo: ${projectData.prazo.label}
- Banco: ${projectData.banco.label}
`;
  }

  const prompt = `
Você é o Devinho, um assistente especializado em precificação de projetos de desenvolvimento de software no Brasil. 
Seja amigável, técnico quando necessário, e sempre pense em valores justos para desenvolvedores brasileiros.

${contextPrompt}
${projectContext}

Pergunta do usuário: ${message}

Responda de forma clara e objetiva, sempre considerando o contexto brasileiro de desenvolvimento.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro no chat:', error);
    return 'Desculpe, tive um problema técnico. Tente reformular sua pergunta ou entre em contato mais tarde.';
  }
}
