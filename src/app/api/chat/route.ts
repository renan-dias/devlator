import { NextRequest, NextResponse } from "next/server";
import { callGemini, hasGeminiKey, type GeminiMessage } from "@/lib/gemini";
import { estimateContextText, marketReferenceText } from "@/lib/prompt-context";
import type { ChatContext } from "@/lib/storage";

interface ChatRequest {
  message: string;
  history?: Array<{ role: "user" | "bot"; content: string }>;
  project?: ChatContext | null;
  extras?: {
    regional?: { city: string; state: string };
    site?: { url: string; content: string };
    docs?: Array<{ name: string; text?: string }>;
    figmaImage?: string;
  };
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

  if (!hasGeminiKey()) {
    return NextResponse.json({
      reply:
        "O chat com IA não está configurado neste servidor (falta a variável GEMINI_API_KEY). A calculadora continua funcionando normalmente — ela não depende da IA.",
      offline: true,
    });
  }

  const contextBlocks: string[] = [marketReferenceText()];
  if (body.project?.result) {
    contextBlocks.push(`O usuário veio da calculadora com esta estimativa:\n${estimateContextText(body.project.answers, body.project.result)}`);
  }
  if (body.extras?.regional) {
    contextBlocks.push(`Localização aproximada do usuário: ${body.extras.regional.city}, ${body.extras.regional.state}. Ajuste valores ao mercado regional.`);
  }
  if (body.extras?.site) {
    contextBlocks.push(`Site de referência enviado (${body.extras.site.url}):\n${body.extras.site.content.slice(0, 3000)}`);
  }
  if (body.extras?.docs?.length) {
    const docs = body.extras.docs
      .slice(0, 5)
      .map((d) => `### ${d.name}\n${d.text ? d.text.slice(0, 12000) : "(conteúdo não legível; peça trechos ao usuário se precisar)"}`)
      .join("\n\n");
    contextBlocks.push(`Documentos de requisitos enviados pelo usuário:\n${docs}`);
  }

  const system = `Você é o Devinho, assistente do Devlator especializado em precificação de projetos de software no Brasil.
Seja direto, técnico e justo com o desenvolvedor. Use valores em R$, explique o raciocínio (horas × valor-hora, riscos, mercado) e cite as referências abaixo quando falar de preço.
Formate com parágrafos curtos e listas com "- ". Use **negrito** para números importantes. Não use tabelas.

${contextBlocks.join("\n\n")}`;

  const history: GeminiMessage[] = (body.history ?? []).slice(-12).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content.slice(0, 4000) }],
  }));

  const userParts: GeminiMessage["parts"] = [{ text: message.slice(0, 4000) }];
  const image = body.extras?.figmaImage;
  const match = image?.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/);
  if (match && match[2].length * 0.75 <= MAX_IMAGE_BYTES) {
    userParts.push({ inline_data: { mime_type: match[1], data: match[2] } });
  }

  try {
    const reply = await callGemini([...history, { role: "user", parts: userParts }], {
      system,
      temperature: 0.6,
      maxOutputTokens: 2048,
    });
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Erro no chat:", error);
    return NextResponse.json(
      { error: "Não consegui falar com a IA agora. Tente novamente em instantes." },
      { status: 502 },
    );
  }
}
