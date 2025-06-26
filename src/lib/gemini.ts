import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export interface ProjectData {
  [key: string]: { value: string; label: string; multiplier: number; description?: string };
}

export async function generateProjectEstimate(projectData: ProjectData): Promise<{
  estimate: number;
  reasoning: string;
  suggestions: string[];
  marketValidation: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Criar descrição detalhada do projeto
  const projectDescription = Object.entries(projectData)
    .map(([key, value]) => `${key}: ${value.label}`)
    .join('\n');

  const prompt = `
Como especialista sênior em precificação de projetos de desenvolvimento de software no Brasil, analise os seguintes dados do projeto:

${projectDescription}

Por favor, forneça uma análise completa incluindo:

1. ESTIMATIVA DE PREÇO em reais (R$) baseada no mercado brasileiro atual (2024)
2. JUSTIFICATIVA TÉCNICA detalhada para o valor proposto
3. VALIDAÇÃO DE MERCADO comparando com preços praticados no Brasil
4. 5 SUGESTÕES práticas para otimizar o projeto

Considere fatores essenciais como:
- Complexidade técnica e arquitetural
- Tempo estimado de desenvolvimento
- Tamanho e experiência da equipe
- Urgência e pressão de prazo
- Infraestrutura e tecnologias necessárias
- Custos de manutenção e hospedagem
- Padrões de preço do mercado brasileiro
- Região (interior vs capitais)
- Perfil do cliente (startup vs empresa consolidada)

IMPORTANTE: 
- Valores devem estar alinhados com a realidade brasileira
- Considere tanto freelancers quanto agências
- Inclua análise de custo-benefício
- Seja realista com prazos e recursos

Formato de resposta OBRIGATÓRIO:
ESTIMATIVA: R$ [valor]
JUSTIFICATIVA: [explicação técnica detalhada de 2-3 parágrafos]
VALIDACAO_MERCADO: [análise comparativa com mercado brasileiro]
SUGESTOES:
- [sugestão 1]
- [sugestão 2] 
- [sugestão 3]
- [sugestão 4]
- [sugestão 5]
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse da resposta
    const estimateMatch = text.match(/ESTIMATIVA:\s*R\$\s*([\d.,]+)/);
    const justificativaMatch = text.match(/JUSTIFICATIVA:\s*([\s\S]*?)(?=VALIDACAO_MERCADO:|$)/);
    const validacaoMatch = text.match(/VALIDACAO_MERCADO:\s*([\s\S]*?)(?=SUGESTOES:|$)/);
    const sugestoesMatch = text.match(/SUGESTOES:\s*((?:- .*(?:\n|$))*)/);

    const estimate = estimateMatch 
      ? parseInt(estimateMatch[1].replace(/[.,]/g, '')) 
      : calculateFallbackEstimate(projectData);

    const reasoning = justificativaMatch 
      ? justificativaMatch[1].trim() 
      : 'Estimativa baseada em análise técnica detalhada considerando complexidade, prazo, equipe e padrões de mercado do desenvolvimento brasileiro. O valor reflete custos operacionais, margem de lucro adequada e qualidade esperada.';

    const marketValidation = validacaoMatch
      ? validacaoMatch[1].trim()
      : 'Valor compatível com a média praticada no mercado brasileiro. Projetos similares variam entre 70% a 130% deste valor dependendo da região e especialização da equipe.';

    const suggestions = sugestoesMatch
      ? sugestoesMatch[1].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.trim().substring(1).trim())
      : [
          'Divida o projeto em sprints/fases para facilitar pagamento e controle',
          'Utilize tecnologias consolidadas para reduzir riscos técnicos',
          'Mantenha comunicação constante e transparente com o cliente',
          'Documente bem o projeto para facilitar manutenção futura',
          'Considere um valor adicional (10-20%) para imprevistos e mudanças'
        ];

    return {
      estimate,
      reasoning,
      suggestions,
      marketValidation
    };
  } catch (error) {
    console.error('Erro ao gerar estimativa:', error);
    
    // Fallback em caso de erro
    return {
      estimate: calculateFallbackEstimate(projectData),
      reasoning: 'Estimativa calculada com base em parâmetros técnicos padrão e experiência de mercado brasileiro. Considera complexidade técnica, tempo de desenvolvimento e recursos necessários.',
      suggestions: [
        'Defina escopo detalhado antes de iniciar o desenvolvimento',
        'Use metodologias ágeis (Scrum/Kanban) para melhor controle',
        'Considere custos de hospedagem, domínio e certificados SSL',
        'Planeje tempo extra para testes e ajustes finais',
        'Estabeleça marcos de pagamento vinculados às entregas'
      ],
      marketValidation: 'Valor alinhado com práticas de mercado brasileiro. Projetos similares costumam variar de 70% a 130% deste valor dependendo da região, experiência da equipe e urgência do cliente.'
    };
  }
}

function calculateFallbackEstimate(projectData: ProjectData): number {
  const baseValue = 3500; // Valor base mais realista para o mercado brasileiro
  let multiplier = 1;
  
  // Aplicar multiplicadores de todas as respostas
  Object.values(projectData).forEach((answer) => {
    multiplier *= answer.multiplier;
  });
  
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
