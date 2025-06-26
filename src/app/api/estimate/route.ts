import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API Key não configurada');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Criar descrição detalhada do projeto
    const projectDescription = Object.entries(projectData)
      .map(([key, value]: [string, any]) => `${key}: ${value.label}`)
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

    return NextResponse.json({
      estimate,
      reasoning,
      suggestions,
      marketValidation
    });

  } catch (error) {
    console.error('Erro ao gerar estimativa:', error);
    
    // Obter dados do request para fallback
    const projectData = await request.json();
    const fallbackEstimate = calculateFallbackEstimate(projectData);
    
    return NextResponse.json({
      estimate: fallbackEstimate,
      reasoning: 'Estimativa calculada com base em parâmetros técnicos padrão e experiência de mercado brasileiro. Considera complexidade técnica, tempo de desenvolvimento e recursos necessários.',
      suggestions: [
        'Defina escopo detalhado antes de iniciar o desenvolvimento',
        'Use metodologias ágeis (Scrum/Kanban) para melhor controle',
        'Considere custos de hospedagem, domínio e certificados SSL',
        'Planeje tempo extra para testes e ajustes finais',
        'Estabeleça marcos de pagamento vinculados às entregas'
      ],
      marketValidation: 'Valor alinhado com práticas de mercado brasileiro. Projetos similares costumam variar de 70% a 130% deste valor dependendo da região, experiência da equipe e urgência do cliente.'
    });
  }
}

function calculateFallbackEstimate(projectData: any): number {
  const baseValue = 1500; // Valor base mais realista para o mercado brasileiro
  let multiplier = 1;
  
  Object.values(projectData).forEach((answer: any) => {
    if (answer && answer.multiplier) {
      multiplier *= answer.multiplier;
    }
  });
  
  return Math.round(baseValue * multiplier);
}
