import { NextRequest, NextResponse } from 'next/server';

interface ProjectDataValue {
  label: string;
  value: string;
  multiplier: number;
  description?: string;
}

interface ProjectData {
  [key: string]: ProjectDataValue;
}

// Tabela de valores base por categoria (valores de mercado brasileiro 2024)
const BASE_VALUES = {
  // Tipo de projeto
  tipo_landing: { base: 1500, complexity: 1.0, description: "Landing page simples" },
  tipo_website: { base: 3500, complexity: 1.2, description: "Website institucional" },
  tipo_blog: { base: 2500, complexity: 1.1, description: "Blog/CMS básico" },
  tipo_webapp: { base: 8000, complexity: 2.0, description: "Aplicação web completa" },
  tipo_mobile: { base: 12000, complexity: 2.5, description: "App mobile nativo" },
  tipo_ecommerce: { base: 15000, complexity: 3.0, description: "E-commerce completo" },
  tipo_sistema: { base: 25000, complexity: 4.0, description: "Sistema empresarial" },
  tipo_api: { base: 6000, complexity: 1.8, description: "API/Backend" },

  // Escopo
  escopo_micro: { multiplier: 0.3, weeks: 1 },
  escopo_pequeno: { multiplier: 0.6, weeks: 2 },
  escopo_medio: { multiplier: 1.0, weeks: 4 },
  escopo_grande: { multiplier: 1.8, weeks: 8 },
  escopo_muito_grande: { multiplier: 3.0, weeks: 16 },

  // Design
  design_pronto: { multiplier: 0.7, description: "Design já fornecido" },
  design_template: { multiplier: 0.9, description: "Template/framework" },
  design_simples: { multiplier: 1.0, description: "Design simples" },
  design_customizado: { multiplier: 1.5, description: "Design customizado" },
  design_complexo: { multiplier: 2.2, description: "Design complexo/animações" },

  // Funcionalidades
  func_basicas: { multiplier: 0.8, description: "Funcionalidades básicas" },
  func_intermediarias: { multiplier: 1.2, description: "Funcionalidades intermediárias" },
  func_avancadas: { multiplier: 1.8, description: "Funcionalidades avançadas" },
  func_complexas: { multiplier: 2.5, description: "Funcionalidades muito complexas" },

  // Tecnologia
  tech_simples: { multiplier: 0.9, description: "Stack simples" },
  tech_moderna: { multiplier: 1.1, description: "Stack moderna" },
  tech_especializada: { multiplier: 1.4, description: "Tecnologias especializadas" },
  tech_cutting_edge: { multiplier: 1.8, description: "Tecnologias de ponta" },

  // Prazo
  prazo_flexivel: { multiplier: 0.8, description: "Prazo flexível" },
  prazo_normal: { multiplier: 1.0, description: "Prazo normal" },
  prazo_apertado: { multiplier: 1.3, description: "Prazo apertado" },
  prazo_urgente: { multiplier: 1.8, description: "Urgente" },

  // Equipe
  equipe_freelancer: { multiplier: 0.7, description: "Freelancer solo" },
  equipe_pequena: { multiplier: 1.0, description: "Equipe pequena (2-3)" },
  equipe_media: { multiplier: 1.3, description: "Equipe média (4-6)" },
  equipe_grande: { multiplier: 1.8, description: "Equipe grande (7+)" },

  // Qualidade
  qual_basica: { multiplier: 0.8, description: "Qualidade básica" },
  qual_profissional: { multiplier: 1.0, description: "Qualidade profissional" },
  qual_premium: { multiplier: 1.4, description: "Qualidade premium" },
  qual_enterprise: { multiplier: 2.0, description: "Nível enterprise" }
};

function calculateOfflineEstimate(projectData: ProjectData): {
  estimate: number;
  breakdown: string[];
  reasoning: string;
  suggestions: string[];
} {
  console.log("🔄 Calculando estimativa offline - IA indisponível");
  
  let basePrice = 2500; // Valor mínimo
  let totalMultiplier = 1;
  let complexityScore = 1;
  const breakdown: string[] = [];
  
  // Analisar cada resposta e aplicar valores correspondentes
  Object.entries(projectData).forEach(([questionKey, answer]) => {
    const lookupKey = `${questionKey}_${answer.value}`;
    const valueData = BASE_VALUES[lookupKey as keyof typeof BASE_VALUES] as any;
    
    if (valueData) {
      if (valueData.base) {
        // É um tipo de projeto (define valor base)
        basePrice = valueData.base;
        complexityScore = valueData.complexity || 1;
        breakdown.push(`Tipo: ${answer.label} - Base R$ ${basePrice.toLocaleString('pt-BR')}`);
      } else if (valueData.multiplier) {
        // É um modificador
        totalMultiplier *= valueData.multiplier;
        breakdown.push(`${answer.label}: ${valueData.multiplier}x ${valueData.description ? '(' + valueData.description + ')' : ''}`);
      }
    } else {
      // Fallback usando multiplier original da resposta
      if (answer.multiplier && answer.multiplier !== 1) {
        totalMultiplier *= answer.multiplier;
        breakdown.push(`${answer.label}: ${answer.multiplier}x (valor configurado)`);
      }
    }
  });

  // Calcular preço final
  const finalPrice = Math.round(basePrice * totalMultiplier * complexityScore);
  
  // Garantir valor mínimo realista
  const minRealistic = 800;
  const adjustedPrice = Math.max(finalPrice, minRealistic);
  
  breakdown.push(`Cálculo final: R$ ${basePrice.toLocaleString('pt-BR')} × ${totalMultiplier.toFixed(2)} × ${complexityScore} = R$ ${adjustedPrice.toLocaleString('pt-BR')}`);

  const reasoning = `Estimativa calculada com base em valores reais do mercado brasileiro 2024/2025. 
    Valor base de R$ ${basePrice.toLocaleString('pt-BR')} ajustado por fatores de complexidade (${complexityScore}x) 
    e especificações técnicas (${totalMultiplier.toFixed(2)}x). 
    Resultado: R$ ${adjustedPrice.toLocaleString('pt-BR')} considerando padrões de qualidade profissional.`;

  const suggestions = [
    "Defina escopo detalhado para evitar mudanças custosas durante desenvolvimento",
    "Considere desenvolvimento em fases para diluir investimento inicial",
    "Avalie uso de templates/frameworks para reduzir tempo e custo",
    "Planeje testes e homologação para garantir qualidade final",
    "Reserve 15-20% do orçamento para imprevistos e ajustes finais"
  ];

  return {
    estimate: adjustedPrice,
    breakdown,
    reasoning,
    suggestions
  };
}

async function calculateAIEstimate(projectData: ProjectData): Promise<{
  estimate: number;
  reasoning: string;
  suggestions: string[];
  marketValidation: string;
}> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  // Criar descrição detalhada do projeto
  const projectDescription = Object.entries(projectData)
    .map(([key, value]: [string, ProjectDataValue]) => `${key}: ${value.label}`)
    .join('\n');

  const prompt = `Como especialista sênior em precificação de projetos de desenvolvimento de software no Brasil, analise:

${projectDescription}

IMPORTANTE: Considere valores realistas do mercado brasileiro 2024/2025:
- Landing pages: R$ 800 - R$ 3.000
- Sites institucionais: R$ 2.000 - R$ 8.000  
- E-commerce básico: R$ 5.000 - R$ 25.000
- Apps mobile: R$ 8.000 - R$ 50.000
- Sistemas complexos: R$ 15.000 - R$ 100.000+

Forneça resposta no formato exato:
ESTIMATIVA: R$ [valor_numerico]
JUSTIFICATIVA: [explicação técnica de 2-3 linhas]
VALIDACAO_MERCADO: [análise comparativa com mercado brasileiro]
SUGESTOES:
- [sugestão 1]
- [sugestão 2]
- [sugestão 3]
- [sugestão 4]
- [sugestão 5]`;

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse da resposta
  const estimateMatch = text.match(/ESTIMATIVA:\s*R\$\s*([\d.,]+)/);
  const justificativaMatch = text.match(/JUSTIFICATIVA:\s*([\s\S]*?)(?=VALIDACAO_MERCADO:|$)/);
  const validacaoMatch = text.match(/VALIDACAO_MERCADO:\s*([\s\S]*?)(?=SUGESTOES:|$)/);
  const sugestoesMatch = text.match(/SUGESTOES:\s*((?:- .*(?:\n|$))*)/);

  const estimate = estimateMatch 
    ? parseInt(estimateMatch[1].replace(/[.,]/g, '')) 
    : 0;

  const reasoning = justificativaMatch 
    ? justificativaMatch[1].trim() 
    : '';

  const marketValidation = validacaoMatch
    ? validacaoMatch[1].trim()
    : '';

  const suggestions = sugestoesMatch
    ? sugestoesMatch[1].split('\n').filter((s: string) => s.trim().startsWith('-')).map((s: string) => s.trim().substring(1).trim())
    : [];

  return { estimate, reasoning, suggestions, marketValidation };
}

export async function POST(request: NextRequest) {
  try {
    const projectData: ProjectData = await request.json();
    
    console.log("📊 Iniciando cálculo de estimativa...", Object.keys(projectData));

    // Tentar usar IA primeiro
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("🤖 Tentando cálculo com IA Gemini...");
        const aiResult = await calculateAIEstimate(projectData);
        
        if (aiResult.estimate > 0) {
          console.log("✅ Estimativa IA calculada:", aiResult.estimate);
          return NextResponse.json({
            estimate: aiResult.estimate,
            reasoning: aiResult.reasoning,
            suggestions: aiResult.suggestions,
            marketValidation: aiResult.marketValidation,
            source: 'ai'
          });
        } else {
          throw new Error('IA retornou estimativa inválida');
        }
      } catch (aiError) {
        console.log("❌ Erro na IA, usando cálculo offline:", aiError);
      }
    } else {
      console.log("⚠️ GEMINI_API_KEY não configurada, usando cálculo offline");
    }

    // Fallback para cálculo offline
    const offlineResult = calculateOfflineEstimate(projectData);
    
    return NextResponse.json({
      estimate: offlineResult.estimate,
      reasoning: offlineResult.reasoning,
      suggestions: offlineResult.suggestions,
      breakdown: offlineResult.breakdown,
      marketValidation: `Valor compatível com a média praticada no mercado brasileiro. 
        Projetos similares variam entre R$ ${Math.round(offlineResult.estimate * 0.7).toLocaleString('pt-BR')} 
        a R$ ${Math.round(offlineResult.estimate * 1.3).toLocaleString('pt-BR')} dependendo da região e especialização da equipe.`,
      source: 'offline'
    });

  } catch (error) {
    console.error('❌ Erro geral na API de estimativa:', error);
    
    // Fallback de emergência
    return NextResponse.json({
      estimate: 5000,
      reasoning: 'Estimativa padrão aplicada devido a erro no sistema. Recomendamos nova análise com dados mais específicos.',
      suggestions: [
        'Refaça a estimativa com dados mais detalhados',
        'Considere consultar um especialista para projetos complexos',
        'Valide requisitos antes de iniciar desenvolvimento',
        'Planeje fases de entrega para reduzir riscos',
        'Reserve orçamento adicional para imprevistos'
      ],
      marketValidation: 'Valor padrão baseado em projetos similares no mercado brasileiro.',
      source: 'fallback'
    });
  }
}

