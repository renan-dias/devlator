import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ProjectData {
  [key: string]: { value: string; label: string; multiplier: number; description?: string };
}

export async function generateProjectEstimate(projectData: ProjectData): Promise<{
  estimate: number;
  reasoning: string;
  suggestions: string[];
  marketValidation: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  const baseValue = 2500; // Valor base aumentado para o mercado brasileiro
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
  contextData?: any
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let contextPrompt = '';
  let detailedContext = '';
  let specificInstructions = '';
  
  // Contexto regional - mais detalhado
  if (context.includes('regional') && contextData?.regional) {
    const { city, state } = contextData.regional;
    contextPrompt += `Analise preços específicos para o mercado de ${city}, ${state}. `;
    
    // Ajustes regionais específicos
    const isCapital = ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Belo Horizonte', 'Salvador', 'Fortaleza', 'Curitiba', 'Porto Alegre', 'Recife', 'Goiânia'].includes(city);
    const priceModifier = isCapital ? 1.0 : 0.75; // Interior tem preços ~25% menores
    
    detailedContext += `\n🏙️ ANÁLISE REGIONAL:
- Localização: ${city}, ${state}
- Tipo de mercado: ${isCapital ? 'Capital/Grande centro' : 'Interior'}
- Ajuste de preço: ${isCapital ? 'Preços padrão de mercado' : 'Redução de ~25% vs capitais'}
- Concorrência: ${isCapital ? 'Alta (muitos devs)' : 'Baixa/Média (menos concorrência)'}
- Custo de vida: ${isCapital ? 'Alto' : 'Médio/Baixo'}\n`;
    
    specificInstructions += `\n✅ INSTRUÇÕES REGIONAIS:
- ${isCapital ? 'Use valores de mercado padrão (R$ 50-150/hora)' : 'Reduza valores em 20-30% (R$ 35-100/hora)'}
- Considere que ${isCapital ? 'clientes têm mais budget' : 'clientes são mais sensíveis ao preço'}
- ${isCapital ? 'Enfatize qualidade e especialização' : 'Enfatize custo-benefício e economia'}`;
  }
  
  // Contexto Figma - análise visual detalhada
  if (context.includes('figma') && contextData?.figma) {
    contextPrompt += 'ANÁLISE DE DESIGN: O usuário enviou capturas do Figma. ';
    detailedContext += `\n🎨 DESIGN FIGMA CARREGADO:
- Imagem do design disponível para análise
- Foque em: complexidade visual, número de telas, componentes, animações
- Avalie: responsividade necessária, interações, estados diferentes\n`;
    
    specificInstructions += `\n✅ INSTRUÇÕES PARA FIGMA:
- Analise a complexidade visual (simples/média/alta)
- Conte aproximadamente quantas telas/componentes vê
- Identifique funcionalidades: formulários, listas, gráficos, mapas, etc.
- Estime tempo de implementação baseado no design
- Considere: Design simples (+0%), Médio (+25%), Complexo (+50%)`;
  }
  
  // Contexto Site - comparação funcional
  if (context.includes('site') && contextData?.site) {
    const { url, analysis } = contextData.site;
    contextPrompt += `SITE DE REFERÊNCIA: Analisando "${url}" como base. `;
    detailedContext += `\n🌐 SITE DE REFERÊNCIA:
- URL: ${url}
- Status: Site analisado com sucesso
- Use para comparação de funcionalidades e complexidade\n`;
    
    specificInstructions += `\n✅ INSTRUÇÕES PARA SITE:
- Compare funcionalidades do site de referência
- Identifique: e-commerce, blog, dashboard, formulários, etc.
- Estime complexidade similar/menor/maior que a referência
- Considere tecnologias necessárias para reproduzir funcionalidades
- Use como base para argumentar preços (ex: "sites similares custam X")`;
  }
  
  // Contexto Documentação - especificações técnicas
  if (context.includes('doc') && contextData?.doc) {
    const fileCount = contextData.doc.files?.length || 0;
    contextPrompt += `DOCUMENTAÇÃO TÉCNICA: ${fileCount} arquivo(s) de especificação. `;
    detailedContext += `\n📄 DOCUMENTAÇÃO DISPONÍVEL:
- Quantidade: ${fileCount} arquivo(s)
- Tipos: PDFs, docs, especificações técnicas
- Use para entender escopo detalhado do projeto\n`;
    
    specificInstructions += `\n✅ INSTRUÇÕES PARA DOCUMENTAÇÃO:
- Base suas respostas nas especificações fornecidas
- Se mencionarem tecnologias específicas, considere na precificação
- Documente bem = menos mudanças = preço mais justo
- Especificações detalhadas = estimativa mais precisa
- Considere complexidade baseada nos requisitos documentados`;
  }

  // Contexto do projeto da calculadora
  let projectContext = '';
  if (contextData?.projectData) {
    const projectData = contextData.projectData;
    projectContext = `\n💼 PROJETO DA CALCULADORA:
- Tipo: ${projectData.tipo?.label || 'Não especificado'}
- Complexidade: ${projectData.complexidade?.label || 'Não especificado'}
- Equipe: ${projectData.equipe?.label || 'Não especificado'}
- Prazo: ${projectData.prazo?.label || 'Não especificado'}
- Banco de dados: ${projectData.banco?.label || 'Não especificado'}
`;
  }

  const prompt = `
🤖 DEVINHO - Assistente de Precificação de Software

Você é o Devinho, especialista em precificação de projetos de desenvolvimento no Brasil.
Seja amigável, técnico e sempre justo com valores para desenvolvedores brasileiros.

${contextPrompt}

📊 DADOS DISPONÍVEIS:
${detailedContext}
${projectContext}

❓ PERGUNTA DO USUÁRIO: 
${message}

${specificInstructions}

🎯 DIRETRIZES GERAIS:
- Use valores em reais (R$) sempre
- Considere mercado brasileiro 2024
- Seja transparente sobre cálculos
- Sugira melhorias quando possível
- Se detectar informações suficientes, ofereça precificação detalhada
- Valores hora: Junior (R$25-50), Pleno (R$50-100), Senior (R$100-200)
- Projetos pequenos: R$2.000-15.000, médios: R$15.000-50.000, grandes: R$50.000+

📝 FORMATO DE RESPOSTA:
- Seja conversacional e amigável
- Use emojis para destacar pontos importantes
- Explique o raciocínio por trás dos valores
- Dê exemplos práticos quando relevante
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
