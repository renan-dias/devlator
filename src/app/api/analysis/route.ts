import { NextRequest, NextResponse } from "next/server";
import { callGemini, hasGeminiKey } from "@/lib/gemini";
import { estimate, type Profile } from "@/lib/estimator";
import { estimateContextText, marketReferenceText } from "@/lib/prompt-context";
import type { Answers } from "@/lib/questions";
import type { AiAnalysis } from "@/lib/storage";
import type { AiSetup } from "@/lib/ai-tools";

/**
 * Recebe respostas + perfil, recalcula a estimativa no servidor (não confiamos no
 * número vindo do cliente) e pede à IA uma análise qualitativa. O preço em si é
 * sempre determinístico — a IA só comenta, sugere e aponta riscos.
 */
export async function POST(request: NextRequest) {
  let body: { answers?: Answers; profile?: Profile; ai?: AiSetup | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.answers?.tipo || !body.profile) {
    return NextResponse.json({ error: "Respostas incompletas" }, { status: 400 });
  }

  const result = estimate(body.answers, body.profile, body.ai);
  const offline: AiAnalysis = {
    source: "offline",
    summary: `Estimativa baseada em ${result.hours.likely}h a ${result.rate.value} R$/h, com ${Math.round(result.factors.contingency * 100)}% de contingência e comparada às faixas públicas de mercado.`,
    suggestions: result.insights,
    risks: [],
  };

  if (!hasGeminiKey()) return NextResponse.json(offline);

  const prompt = `Você é consultor sênior de precificação de software no Brasil. Analise a estimativa abaixo, calculada por um modelo de horas × valor-hora.

${marketReferenceText()}

${estimateContextText(body.answers, result)}

Responda em português do Brasil, em JSON com exatamente este formato:
{"summary": "2 a 4 frases avaliando se o preço é justo frente ao mercado e ao escopo, citando números", "suggestions": ["4 a 5 ações práticas e específicas para este projeto"], "risks": ["2 a 4 riscos concretos que podem estourar horas ou prazo"]}
Não invente um novo preço total; comente o calculado.`;

  try {
    const text = await callGemini([{ role: "user", parts: [{ text: prompt }] }], {
      json: true,
      temperature: 0.4,
      timeoutMs: 20000,
    });
    const parsed = JSON.parse(text) as Partial<AiAnalysis>;
    const toList = (v: unknown) => (Array.isArray(v) ? v.filter((s) => typeof s === "string").slice(0, 6) : []);
    const analysis: AiAnalysis = {
      source: "ai",
      summary: typeof parsed.summary === "string" ? parsed.summary : offline.summary,
      suggestions: toList(parsed.suggestions).length ? toList(parsed.suggestions) : offline.suggestions,
      risks: toList(parsed.risks),
    };
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Falha na análise com IA:", error);
    return NextResponse.json(offline);
  }
}
