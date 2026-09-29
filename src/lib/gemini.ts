/**
 * Cliente Gemini — use APENAS em código de servidor (rotas de API).
 * A chave nunca deve chegar ao navegador.
 */

const DEFAULT_MODEL = "gemini-2.5-flash";

export const hasGeminiKey = () => Boolean(process.env.GEMINI_API_KEY);

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiPart[];
}

interface CallOptions {
  system?: string;
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

export async function callGemini(contents: GeminiMessage[], options: CallOptions = {}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não configurada");

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 25000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        ...(options.system && { system_instruction: { parts: [{ text: options.system }] } }),
        generationConfig: {
          temperature: options.temperature ?? 0.5,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
          ...(options.json && { responseMimeType: "application/json" }),
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini ${response.status}: ${body.slice(0, 300)}`);
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: GeminiPart) => p.text ?? "")
      .join("");
    if (!text) throw new Error("Resposta vazia do Gemini");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}
