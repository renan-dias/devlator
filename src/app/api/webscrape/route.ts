import { NextRequest, NextResponse } from "next/server";

const MAX_HTML = 1_500_000;

/** Bloqueia endereços internos para evitar SSRF. */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return true;
  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    return (
      a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)
    );
  }
  return !host.includes(".");
}

const stripTags = (s: string) =>
  s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export async function POST(request: NextRequest) {
  let url: URL;
  try {
    const body = await request.json();
    url = new URL(String(body.url).trim().match(/^https?:\/\//) ? String(body.url).trim() : `https://${String(body.url).trim()}`);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(url.protocol) || isBlockedHost(url.hostname)) {
    return NextResponse.json({ error: "Endereço não permitido" }, { status: 400 });
  }

  try {
    // Segue redirecionamentos manualmente, validando cada destino.
    let response: Response | null = null;
    for (let hop = 0; hop < 4; hop++) {
      response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DevlatorBot/1.0; +https://devlator.com)" },
        signal: AbortSignal.timeout(10000),
        redirect: "manual",
      });
      const location = response.headers.get("location");
      if (response.status < 300 || response.status >= 400 || !location) break;
      url = new URL(location, url);
      if (!["http:", "https:"].includes(url.protocol) || isBlockedHost(url.hostname)) {
        return NextResponse.json({ error: "Endereço não permitido" }, { status: 400 });
      }
    }
    if (!response) throw new Error("Sem resposta");

    if (!response.ok) {
      return NextResponse.json({ error: `O site respondeu ${response.status}` }, { status: 400 });
    }
    if (!(response.headers.get("content-type") ?? "").includes("text/html")) {
      return NextResponse.json({ error: "O endereço não é uma página HTML" }, { status: 400 });
    }

    const html = (await response.text()).slice(0, MAX_HTML);
    const pick = (re: RegExp) => stripTags(html.match(re)?.[1] ?? "");
    const all = (re: RegExp, limit: number) =>
      Array.from(html.matchAll(re)).map((m) => stripTags(m[1])).filter(Boolean).slice(0, limit);

    const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const h1 = all(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, 3);
    const h2 = all(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, 10);
    const paragraphs = all(/<p[^>]*>([\s\S]*?)<\/p>/gi, 8);
    const forms = (html.match(/<form/gi) ?? []).length;
    const links = (html.match(/<a\s/gi) ?? []).length;
    const scripts = (html.match(/<script/gi) ?? []).length;
    const tech = [
      /wp-content|wordpress/i.test(html) && "WordPress",
      /__next|_next\/static/i.test(html) && "Next.js",
      /shopify/i.test(html) && "Shopify",
      /vtex/i.test(html) && "VTEX",
      /nuxt/i.test(html) && "Nuxt",
      /react/i.test(html) && "React",
      /wix\.com/i.test(html) && "Wix",
    ].filter(Boolean);

    const content = [
      `Título: ${title}`,
      description && `Descrição: ${description}`,
      h1.length && `H1: ${h1.join(" | ")}`,
      h2.length && `Seções (H2): ${h2.join(" | ")}`,
      paragraphs.length && `Trechos: ${paragraphs.join(" ").slice(0, 1200)}`,
      `Estrutura: ${forms} formulário(s), ${links} links, ${scripts} scripts`,
      tech.length && `Tecnologias detectadas: ${tech.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({ success: true, data: { url: url.toString(), title, content } });
  } catch (error) {
    console.error("Erro no webscraping:", error);
    return NextResponse.json({ error: "Não foi possível acessar o site" }, { status: 502 });
  }
}
